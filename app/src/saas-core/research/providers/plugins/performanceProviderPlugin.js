// Paso 18 — performanceProvider: proveedor REAL (cuarto proveedor real
// del sistema multiproveedor, tras publicWebsiteFetcher, seoProvider y
// accessibilityProvider).
//
// Contrato (Fase 2 del enunciado):
//  - id: "performanceProvider" · version: 2 (1 fue el stub de Paso 14)
//  - capacidades: dimensión performance, categoría "technicalQuality"
//  - entrada aceptada: `{ pages: [{url, body, headers?, timing?,
//    httpVersion?, redirectChain?, byteSize?}], profileId? }` — NUNCA
//    `{urls}`. Sin `pages`, no hay nada que analizar: `status:
//    "skipped"`, nunca inventa evidencia.
//  - tipos de evidencia: `sourceType: "performance_analysis_derived"`
//    (Paso 18, evidenceSchema.js) — DERIVADA de datos ya recopilados.
//  - categorías: "technicalQuality"
//  - salud: siempre saludable — analizador puro, sin dependencias
//    externas (ninguna API, ninguna credencial, ningún navegador).
//  - timeout: análisis síncrono/CPU-bound sobre datos ya en memoria — el
//    puente lo ejecuta vía runProviderPipeline, heredando
//    individualTimeoutMs/globalTimeoutMs como cualquier otro proveedor.
//  - dependencia de publicWebsiteFetcher: análisis puro sobre su salida
//    (timing REAL medido durante la petición, cabeceras de ESA
//    respuesta, HTML ya descargado) — nunca importa
//    node:http/node:https/node:dns, nunca instala/usa Playwright ni
//    ningún navegador, nunca descarga recursos referenciados
//    (scripts/imágenes/CSS/fuentes) por su cuenta.
//  - necesita red: NO. `credentialsNeeded: []`.
//  - alcance: análisis ESTÁTICO de lo declarado en el HTML + timing/
//    cabeceras reales de la petición del documento — NUNCA Core Web
//    Vitals (LCP/CLS/INP/FCP), NUNCA coste de ejecución de JavaScript,
//    NUNCA CSS no utilizado (todos requieren un navegador real).
//  - diferencias respecto a Lighthouse: Lighthouse ejecuta la página en
//    Chrome headless y mide métricas de campo/laboratorio reales; este
//    proveedor solo analiza el documento ya descargado por
//    publicWebsiteFetcher, sin ejecutar nada — ver
//    docs/paso-18-real-performance-provider/01-....md para el detalle
//    completo.
//  - limitaciones: ver `limitations` más abajo.

import { defineResearchProvider, defineProviderCapabilities, defineProviderResult, defineProviderHealth } from "../core/providerTypes.js";
import { analyzePerformanceForPages } from "../performance/perfAnalyzer.js";
import { buildEvidenceFromPerfFindings } from "../performance/perfEvidence.js";
import { computePerfScoreBreakdown } from "../performance/perfScoring.js";
import { buildPerfRecommendations } from "../performance/perfRecommendations.js";

export const PERFORMANCE_PROVIDER_ID = "performanceProvider";
export const PERFORMANCE_PROVIDER_VERSION = 2;

export const PROVIDER = defineResearchProvider({
  id: PERFORMANCE_PROVIDER_ID,
  version: PERFORMANCE_PROVIDER_VERSION,
  status: "real",
  priority: 25, // tras publicWebsiteFetcher (10), seoProvider (15) y accessibilityProvider (20)
  capabilities: defineProviderCapabilities({ dimensions: ["performance"], categories: ["technicalQuality"] }),
  credentialsNeeded: [],
  limitations: [
    "Analiza ÚNICAMENTE datos ya recopilados por publicWebsiteFetcher (timing real de la petición, cabeceras de la respuesta, HTML descargado) — nunca descarga recursos referenciados (scripts/imágenes/CSS/fuentes) por su cuenta.",
    "No usa navegador automatizado ni Playwright, no lanza Chrome, no ejecuta JavaScript remoto, no usa Lighthouse ni PageSpeed Insights ni ninguna API externa.",
    "NUNCA calcula ni declara Core Web Vitals (LCP/CLS/INP/FCP): requieren medición en un navegador real.",
    "El coste de ejecución de JavaScript y el CSS no utilizado quedan explícitamente como 'requiere prueba de navegador' — nunca se estiman.",
    "El estado de compresión real (gzip/br) no es determinable con certeza: publicWebsiteFetcher solicita 'Accept-Encoding: identity' deliberadamente (diseño de seguridad de Paso 13), así que la respuesta observada nunca refleja cómo respondería el servidor a un cliente que sí acepta compresión.",
    "El peso real de recursos individuales (imágenes/scripts/CSS/fuentes) no se mide: solo se analiza lo DECLARADO en el HTML, nunca se descargan.",
  ],
  async collect(input = {}) {
    const startedAt = Date.now();
    const pages = Array.isArray(input.pages) ? input.pages : [];
    if (pages.length === 0) {
      return defineProviderResult({ providerId: PERFORMANCE_PROVIDER_ID, status: "skipped", durationMs: Date.now() - startedAt, metadata: { reason: "sin páginas recopiladas que analizar (requiere publicWebsiteFetcher, fixture o servidor local previo)" } });
    }

    const profileId = input.profileId ?? null;
    let findings;
    try {
      findings = analyzePerformanceForPages(pages, { profileId });
    } catch (err) {
      return defineProviderResult({ providerId: PERFORMANCE_PROVIDER_ID, status: "failed", errors: [{ message: err.message }], durationMs: Date.now() - startedAt });
    }

    const evidence = buildEvidenceFromPerfFindings(findings, { sourceProviderId: input.sourceProviderId ?? "publicWebsiteFetcher", profileId });
    const criticalCount = findings.filter((f) => f.severity === "critical").length;
    const unmeasuredCount = findings.filter((f) => f.status === "not_measured" || f.status === "unavailable").length;
    const scoreBreakdown = computePerfScoreBreakdown(evidence);
    const recommendations = buildPerfRecommendations(findings, { profileId });

    return defineProviderResult({
      providerId: PERFORMANCE_PROVIDER_ID,
      status: "success",
      evidence,
      durationMs: Date.now() - startedAt,
      metadata: { pagesAnalyzed: pages.length, findingsCount: findings.length, criticalFindings: criticalCount, unmeasuredCount, profileId, scoreBreakdown, recommendations },
    });
  },
  async healthCheck() {
    return defineProviderHealth({ healthy: true, mode: "real-offline-analyzer", message: "analizador puro sobre datos ya recopilados (timing/cabeceras/HTML); no requiere red, navegador ni credenciales; siempre disponible; nunca mide Core Web Vitals." });
  },
});
