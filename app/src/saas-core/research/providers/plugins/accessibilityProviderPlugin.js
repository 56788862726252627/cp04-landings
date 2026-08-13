// Paso 17 — accessibilityProvider: proveedor REAL (tercer proveedor real
// del sistema multiproveedor, tras publicWebsiteFetcher y seoProvider).
//
// Contrato (Fase 2 del enunciado):
//  - id: "accessibilityProvider" · version: 2 (1 fue el stub de Paso 14)
//  - capacidades: dimensión accessibility, categoría "accessibility"
//  - entrada aceptada: `{ pages: [{url, body, ...}], profileId? }` —
//    NUNCA `{urls}` (eso es el contrato de un proveedor que SÍ hace
//    red). Sin `pages`, no hay nada que analizar: `status: "skipped"`,
//    nunca inventa evidencia.
//  - tipos de evidencia: `sourceType: "accessibility_analysis_derived"`
//    (Paso 17, evidenceSchema.js) — DERIVADA de contenido ya recopilado.
//  - categorías: "accessibility"
//  - salud: siempre saludable — analizador puro, sin dependencias
//    externas (ninguna API, ninguna credencial, ningún navegador).
//  - timeout: análisis síncrono/CPU-bound sobre HTML ya en memoria — el
//    puente lo ejecuta vía runProviderPipeline, heredando
//    individualTimeoutMs/globalTimeoutMs como cualquier otro proveedor.
//  - dependencia de publicWebsiteFetcher: análisis puro sobre su salida
//    (orchestratorProviderBridge.js lo alimenta con las páginas ya
//    recopiladas EN LA MISMA ejecución) — nunca importa
//    node:http/node:https/node:dns, nunca instala/usa Playwright ni
//    ningún navegador automatizado, nunca ejecuta JavaScript remoto.
//  - necesita red: NO. `credentialsNeeded: []`.
//  - nivel de cobertura automática: PARCIAL Y EXPLÍCITO — cada hallazgo
//    declara `checkType: "automatic"|"partial"|"manual"`; los de tipo
//    "manual" nunca se completan por software, quedan como revisión
//    pendiente (ver a11yAnalyzer.js). Este proveedor NUNCA declara
//    conformidad WCAG total ni sustituye una auditoría humana completa.

import { defineResearchProvider, defineProviderCapabilities, defineProviderResult, defineProviderHealth } from "../core/providerTypes.js";
import { analyzeAccessibilityForPages } from "../accessibility/a11yAnalyzer.js";
import { buildEvidenceFromA11yFindings } from "../accessibility/a11yEvidence.js";
import { computeA11yScoreBreakdown } from "../accessibility/a11yScoring.js";
import { buildA11yRecommendations } from "../accessibility/a11yRecommendations.js";

export const ACCESSIBILITY_PROVIDER_ID = "accessibilityProvider";
export const ACCESSIBILITY_PROVIDER_VERSION = 2;

export const PROVIDER = defineResearchProvider({
  id: ACCESSIBILITY_PROVIDER_ID,
  version: ACCESSIBILITY_PROVIDER_VERSION,
  status: "real",
  priority: 20, // tras publicWebsiteFetcher (10) y seoProvider (15): analiza lo mismo ya recopilado
  capabilities: defineProviderCapabilities({ dimensions: ["accessibility"], categories: ["accessibility"] }),
  credentialsNeeded: [],
  limitations: [
    "Analiza ÚNICAMENTE páginas ya recopiladas (por publicWebsiteFetcher, una fixture o un servidor local) — nunca descarga nada por su cuenta.",
    "No usa navegador automatizado ni Playwright, no ejecuta JavaScript remoto, no usa APIs externas.",
    "Comprobaciones de tipo 'manual' (navegación real por teclado, subtítulos de vídeo, mensajes de error dinámicos, dependencia exclusiva del color, validación ARIA normativa completa) NUNCA se completan automáticamente — quedan como revisión pendiente explícita.",
    "No declara conformidad WCAG 2.2 total ni sustituye una auditoría de accesibilidad humana completa: es un análisis automático orientativo, con cobertura parcial y declarada.",
  ],
  async collect(input = {}) {
    const startedAt = Date.now();
    const pages = Array.isArray(input.pages) ? input.pages : [];
    if (pages.length === 0) {
      return defineProviderResult({ providerId: ACCESSIBILITY_PROVIDER_ID, status: "skipped", durationMs: Date.now() - startedAt, metadata: { reason: "sin páginas recopiladas que analizar (requiere publicWebsiteFetcher, fixture o servidor local previo)" } });
    }

    const profileId = input.profileId ?? null;
    let findings;
    try {
      findings = analyzeAccessibilityForPages(pages, { profileId });
    } catch (err) {
      return defineProviderResult({ providerId: ACCESSIBILITY_PROVIDER_ID, status: "failed", errors: [{ message: err.message }], durationMs: Date.now() - startedAt });
    }

    const evidence = buildEvidenceFromA11yFindings(findings, { sourceProviderId: input.sourceProviderId ?? "publicWebsiteFetcher", profileId });
    const criticalCount = findings.filter((f) => f.severity === "critical").length;
    const manualReviewCount = findings.filter((f) => f.checkType === "manual").length;
    const scoreBreakdown = computeA11yScoreBreakdown(evidence);
    const recommendations = buildA11yRecommendations(findings, { profileId });

    return defineProviderResult({
      providerId: ACCESSIBILITY_PROVIDER_ID,
      status: "success",
      evidence,
      durationMs: Date.now() - startedAt,
      metadata: { pagesAnalyzed: pages.length, findingsCount: findings.length, criticalFindings: criticalCount, manualReviewCount, profileId, scoreBreakdown, recommendations },
    });
  },
  async healthCheck() {
    return defineProviderHealth({ healthy: true, mode: "real-offline-analyzer", message: "analizador puro sobre HTML ya recopilado; no requiere red, navegador ni credenciales; siempre disponible; cobertura automática parcial y declarada." });
  },
});
