// Paso 12 · Fase 8 — Dimensiones de auditoría (evaluadores modulares).
//
// Las 45 dimensiones del enunciado están declaradas aquí como datos
// (id/label/categorías de score), NO como 45 archivos de lógica separada:
// todas comparten un único evaluador genérico y explicable
// (`evaluateDimension`) que agrega las Evidence enlazadas a esa dimensión
// por `relatedDimension` (ver evidenceSchema.js). Esto evita duplicar 45
// veces la misma lógica de agregación/confianza/contradicción, y hace que
// cada dimensión sea trazable: su score sale SIEMPRE de evidencia real, o
// queda marcada explícitamente como "unknown" por falta de datos.

export const DIMENSION_IDS = Object.freeze([
  "identity",
  "valueProposition",
  "serviceClarity",
  "targetAudienceClarity",
  "mobileExperience",
  "desktopExperience",
  "navigation",
  "conversion",
  "forms",
  "bookingCapability",
  "contactInfo",
  "trustSignals",
  "socialProof",
  "publicReputation",
  "seoTechnical",
  "seoContent",
  "seoLocal",
  "accessibility",
  "performance",
  "observableSecurity",
  "visiblePrivacy",
  "analyticsDeclared",
  "branding",
  "visualConsistency",
  "contentQuality",
  "contentFreshness",
  "socialMediaPresence",
  "directoryPresence",
  "observableIntegrations",
  "observableAutomation",
  "digitalMaturitySignal",
  "leadCapture",
  "retention",
  "customerSupport",
  "salesFollowUp",
  "differentiation",
  "competitivePosition",
  "pwaApp",
  "multilanguage",
  "visibleCompliance",
  "reputationalRisk",
  "ctaQuality",
  "funnel",
  "friction",
  "publicDataConsistency",
]);

// Cada dimensión contribuye (con peso 1 salvo que se indique) a una o más
// de las 14 categorías de puntuación de scoringEngine.js. Una dimensión
// puede contribuir a varias categorías: no es una partición, es un grafo.
export const DIMENSIONS = Object.freeze(
  Object.fromEntries(
    [
      ["identity", "Identidad", ["branding", "content"]],
      ["valueProposition", "Propuesta de valor", ["content", "conversion"]],
      ["serviceClarity", "Claridad de servicios", ["content"]],
      ["targetAudienceClarity", "Audiencia", ["content"]],
      ["mobileExperience", "Experiencia móvil", ["ux", "technicalQuality"]],
      ["desktopExperience", "Experiencia escritorio", ["ux"]],
      ["navigation", "Navegación", ["ux"]],
      ["conversion", "Conversión", ["conversion"]],
      ["forms", "Formularios", ["ux", "conversion"]],
      ["bookingCapability", "Reservas/citas", ["conversion", "digitalMaturity"]],
      ["contactInfo", "Contacto", ["trust", "localPresence"]],
      ["trustSignals", "Confianza", ["trust"]],
      ["socialProof", "Prueba social", ["trust", "reputation"]],
      ["publicReputation", "Reputación pública", ["reputation"]],
      ["seoTechnical", "SEO técnico básico", ["seo", "technicalQuality"]],
      ["seoContent", "SEO de contenidos", ["seo", "content"]],
      ["seoLocal", "SEO local", ["seo", "localPresence"]],
      ["accessibility", "Accesibilidad", ["accessibility"]],
      ["performance", "Rendimiento", ["technicalQuality"]],
      ["observableSecurity", "Seguridad públicamente observable", ["observableSecurity", "technicalQuality"]],
      ["visiblePrivacy", "Privacidad visible", ["trust", "observableSecurity"]],
      ["analyticsDeclared", "Analítica declarada", ["digitalMaturity"]],
      ["branding", "Branding", ["branding"]],
      ["visualConsistency", "Coherencia visual", ["branding"]],
      ["contentQuality", "Contenido", ["content"]],
      ["contentFreshness", "Actualización", ["content"]],
      ["socialMediaPresence", "Redes sociales", ["reputation", "localPresence"]],
      ["directoryPresence", "Directorios", ["localPresence"]],
      ["observableIntegrations", "Integraciones observables", ["digitalMaturity"]],
      ["observableAutomation", "Automatización observable", ["digitalMaturity", "automation"]],
      ["digitalMaturitySignal", "Madurez digital", ["digitalMaturity"]],
      ["leadCapture", "Captación", ["conversion", "automation"]],
      ["retention", "Retención", ["automation"]],
      ["customerSupport", "Atención al cliente", ["automation"]],
      ["salesFollowUp", "Seguimiento comercial", ["automation"]],
      ["differentiation", "Diferenciación", ["branding"]],
      ["competitivePosition", "Competencia", ["branding"]],
      ["pwaApp", "PWA/app", ["digitalMaturity"]],
      ["multilanguage", "Multidioma", ["technicalQuality"]],
      ["visibleCompliance", "Cumplimiento visible", ["trust"]],
      ["reputationalRisk", "Riesgo reputacional", ["reputation"]],
      ["ctaQuality", "Calidad de CTA", ["conversion"]],
      ["funnel", "Funnel", ["conversion", "ux"]],
      ["friction", "Fricción", ["ux", "conversion"]],
      ["publicDataConsistency", "Consistencia de datos públicos", ["localPresence", "reputation"]],
    ].map(([id, label, scoreCategories]) => [id, Object.freeze({ id, label, scoreCategories: Object.freeze(scoreCategories) })])
  )
);

const STATUS_BANDS = Object.freeze([
  { max: 20, status: "crítico" },
  { max: 40, status: "débil" },
  { max: 60, status: "básico" },
  { max: 75, status: "correcto" },
  { max: 90, status: "avanzado" },
  { max: Infinity, status: "excelente" },
]);

/** Clasifica un score 0-100 en una banda cualitativa (nunca lanza). */
export function classifyScore(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return "desconocido";
  const band = STATUS_BANDS.find((b) => score <= b.max);
  return band ? band.status : "desconocido";
}

function polarityFactor(polarity) {
  if (polarity === "positive") return 1;
  if (polarity === "negative") return -1;
  return 0;
}

/**
 * Evalúa una dimensión agregando toda la evidencia enlazada a ella.
 * Determinista: mismo input -> mismo output, sin aleatoriedad ni reloj.
 * @param {string} dimensionId
 * @param {object[]} allEvidence - lista completa de Evidence de la auditoría
 * @returns {object} resultado de la dimensión (ver Fase 8 del enunciado)
 */
export function evaluateDimension(dimensionId, allEvidence) {
  const dimension = DIMENSIONS[dimensionId];
  if (!dimension) throw new Error(`dimensión desconocida: "${dimensionId}"`);

  const linked = allEvidence.filter((e) => e.relatedDimension === dimensionId);

  if (linked.length === 0) {
    return Object.freeze({
      dimensionId,
      label: dimension.label,
      score: null,
      confidence: 0,
      status: "unknown",
      evidenceIds: Object.freeze([]),
      findings: Object.freeze([]),
      contradictions: Object.freeze([]),
      risks: Object.freeze([]),
      opportunities: Object.freeze([`Sin evidencia disponible para "${dimension.label}": no se puede evaluar sin ampliar la investigación.`]),
      recommendations: Object.freeze([]),
      missingData: Object.freeze([dimensionId]),
      limitations: Object.freeze(["Ninguna fuente investigada aportó evidencia para esta dimensión."]),
    });
  }

  const hasPositive = linked.some((e) => e.signal.polarity === "positive" && e.signal.strength >= 0.5);
  const hasNegative = linked.some((e) => e.signal.polarity === "negative" && e.signal.strength >= 0.5);
  const contradictory = hasPositive && hasNegative;

  let weightedScoreSum = 0;
  let weightSum = 0;
  for (const e of linked) {
    const weight = Math.max(e.confidence, 0.05);
    const pointScore = 50 + polarityFactor(e.signal.polarity) * e.signal.strength * 50;
    weightedScoreSum += pointScore * weight;
    weightSum += weight;
  }
  const rawScore = weightSum > 0 ? weightedScoreSum / weightSum : 50;
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  const avgConfidence = linked.reduce((sum, e) => sum + e.confidence, 0) / linked.length;
  const coveragePenalty = linked.length === 1 ? 0.85 : 1;
  const contradictionPenalty = contradictory ? 0.6 : 1;
  const confidence = Math.round(avgConfidence * coveragePenalty * contradictionPenalty * 100) / 100;

  const findings = linked.filter((e) => e.signal.polarity !== "neutral").map((e) => `[${e.signal.polarity === "positive" ? "+" : "-"}] ${e.title}: ${e.excerpt}`);
  const risks = linked.filter((e) => e.signal.polarity === "negative").map((e) => e.title);
  const opportunities = linked.filter((e) => e.signal.polarity === "negative").map((e) => `Mejorar "${dimension.label}": ${e.excerpt}`);

  return Object.freeze({
    dimensionId,
    label: dimension.label,
    score,
    confidence,
    status: classifyScore(score),
    evidenceIds: Object.freeze(linked.map((e) => e.evidenceId)),
    findings: Object.freeze(findings),
    contradictions: Object.freeze(contradictory ? [{ dimensionId, reason: "evidencia positiva y negativa simultánea con fuerza ≥0.5" }] : []),
    risks: Object.freeze(risks),
    opportunities: Object.freeze(opportunities),
    recommendations: Object.freeze([]),
    missingData: Object.freeze([]),
    limitations: Object.freeze(linked.length === 1 ? ["Basado en una sola evidencia; ampliar fuentes aumentaría la confianza."] : []),
  });
}

/** Evalúa las 45 dimensiones de una vez. Determinista, sin I/O. */
export function evaluateAllDimensions(allEvidence) {
  const results = {};
  for (const id of DIMENSION_IDS) results[id] = evaluateDimension(id, allEvidence);
  return results;
}
