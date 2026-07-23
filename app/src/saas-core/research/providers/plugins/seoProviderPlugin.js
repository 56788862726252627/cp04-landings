// Paso 16 — seoProvider: proveedor REAL (segundo proveedor real del
// sistema multiproveedor, tras publicWebsiteFetcher de Paso 13).
//
// Contrato (Fase 2 del enunciado):
//  - id: "seoProvider" · version: 2 (1 fue el stub de Paso 14)
//  - capacidades: dimensiones seoTechnical/seoContent/seoLocal, categoría "seo"
//  - entrada aceptada: `{ pages: [{url, httpStatus, body, headers?, robotsTxt?, redirectChain?}], profileId? }`
//    — NUNCA `{ urls }` (eso es el contrato de un proveedor que SÍ hace
//    red; ver providers/publicWebsiteFetcher.js). Sin `pages`, no hay
//    nada que analizar: `status: "skipped"`, nunca inventa evidencia.
//  - tipos de evidencia: `sourceType: "seo_analysis_derived"` (Paso 16,
//    evidenceSchema.js) — DERIVADA de contenido ya recopilado, nunca de
//    una descarga propia.
//  - categorías: "seo"
//  - salud: `healthCheck()` siempre saludable — es un analizador puro,
//    sin dependencias externas (ninguna API, ninguna credencial).
//  - timeout: análisis síncrono/CPU-bound sobre HTML ya en memoria — no
//    hay E/S que temporizar; `runProviderPipeline` (Paso 14/15) sigue
//    pudiendo aplicarle `individualTimeoutMs` como cualquier proveedor.
//  - dependencia de publicWebsiteFetcher: análisis puro sobre su salida
//    (`orchestratorProviderBridge.js`, Paso 16, lo alimenta con las
//    páginas ya recopiladas EN LA MISMA ejecución) — NUNCA descarga nada
//    por su cuenta (no importa `node:http`/`node:https`/`node:dns`).
//  - necesita red: NO. `credentialsNeeded: []`.
//  - estado: "real" (no stub) — pero solo produce evidencia cuando recibe
//    `pages` ya recopiladas; sin ellas, no inventa nada.

import { defineResearchProvider, defineProviderCapabilities, defineProviderResult, defineProviderHealth } from "../core/providerTypes.js";
import { analyzeSeoForPages } from "../seo/seoAnalyzer.js";
import { buildEvidenceFromSeoFindings } from "../seo/seoEvidence.js";
import { computeSeoScoreBreakdown } from "../seo/seoScoring.js";
import { buildSeoRecommendations } from "../seo/seoRecommendations.js";

export const SEO_PROVIDER_ID = "seoProvider";
export const SEO_PROVIDER_VERSION = 2;

export const PROVIDER = defineResearchProvider({
  id: SEO_PROVIDER_ID,
  version: SEO_PROVIDER_VERSION,
  status: "real",
  priority: 15, // justo detrás de publicWebsiteFetcher (10): analiza lo que este recopila
  capabilities: defineProviderCapabilities({ dimensions: ["seoTechnical", "seoContent", "seoLocal"], categories: ["seo"] }),
  credentialsNeeded: [],
  limitations: [
    "Analiza ÚNICAMENTE páginas ya recopiladas (por publicWebsiteFetcher, una fixture o un servidor local) — nunca descarga nada por su cuenta.",
    "No calcula Core Web Vitals ni puntuaciones tipo Lighthouse (responsabilidad de otro proveedor).",
    "Enlaces rotos solo se declaran comprobados si apuntan a otra página YA recopilada en el mismo lote.",
    "El peso de imágenes individuales no se evalúa (no descarga recursos de imagen).",
    "La adecuación a un tipo Schema.org por perfil es una heurística preliminar, nunca una validación oficial (Google Rich Results Test).",
  ],
  async collect(input = {}) {
    const startedAt = Date.now();
    const pages = Array.isArray(input.pages) ? input.pages : [];
    if (pages.length === 0) {
      return defineProviderResult({ providerId: SEO_PROVIDER_ID, status: "skipped", durationMs: Date.now() - startedAt, metadata: { reason: "sin páginas recopiladas que analizar (requiere publicWebsiteFetcher, fixture o servidor local previo)" } });
    }

    const profileId = input.profileId ?? null;
    let findings;
    try {
      findings = analyzeSeoForPages(pages, { profileId });
    } catch (err) {
      return defineProviderResult({ providerId: SEO_PROVIDER_ID, status: "failed", errors: [{ message: err.message }], durationMs: Date.now() - startedAt });
    }

    const evidence = buildEvidenceFromSeoFindings(findings, { sourceProviderId: input.sourceProviderId ?? "publicWebsiteFetcher", profileId });
    const criticalCount = findings.filter((f) => f.severity === "critical").length;
    const scoreBreakdown = computeSeoScoreBreakdown(evidence);
    const recommendations = buildSeoRecommendations(findings, { profileId });

    return defineProviderResult({
      providerId: SEO_PROVIDER_ID,
      status: "success",
      evidence,
      durationMs: Date.now() - startedAt,
      metadata: { pagesAnalyzed: pages.length, findingsCount: findings.length, criticalFindings: criticalCount, profileId, scoreBreakdown, recommendations },
    });
  },
  async healthCheck() {
    return defineProviderHealth({ healthy: true, mode: "real-offline-analyzer", message: "analizador puro sobre HTML ya recopilado; no requiere red ni credenciales; siempre disponible." });
  },
});
