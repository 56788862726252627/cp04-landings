// Paso 18 · Fase 5 — Desglose de scoring de rendimiento.
//
// NO sustituye ni duplica scoringEngine.js/dimensionRegistry.js (Paso
// 12): la categoría "technicalQuality" y la dimensión `performance` se
// siguen calculando exactamente igual, con las 45 dimensiones y 13
// categorías intactas. Este módulo añade un desglose MÁS GRANULAR, por
// debajo de esa dimensión, agrupando la Evidence de
// `performanceProvider` (sourceType: "performance_analysis_derived") en
// los 11 grupos pedidos por el enunciado (Fase 5).
//
// Reutiliza la MISMA fórmula que dimensionRegistry.evaluateDimension y
// seoScoring.js/a11yScoring.js (Pasos 16/17): score = 50 +
// polaridad×fuerza×50, ponderado por max(confianza, 0.05).
//
// NUNCA se presenta como una puntuación Lighthouse: es un desglose
// propio, con su propia fórmula documentada, sobre datos observados/
// medidos/calculados — nunca sobre una simulación de motor de renderizado.

export const PERF_SCORE_GROUPS = Object.freeze(["response", "html", "resources", "images", "javascript", "css", "fonts", "caching", "compression", "thirdParty", "mobile"]);

const PERF_SCORE_GROUP_LABELS = Object.freeze({
  response: "Respuesta HTTP",
  html: "Documento HTML",
  resources: "Recursos declarados",
  images: "Imágenes",
  javascript: "JavaScript",
  css: "CSS",
  fonts: "Fuentes",
  caching: "Caché",
  compression: "Compresión",
  thirdParty: "Terceros",
  mobile: "Señales móviles",
});

// Reglas cuyo grupo de SCORING difiere de su categoría de ANÁLISIS
// (p. ej. "compresión" y "terceros" son grupos propios en el enunciado,
// aunque el analizador los etiquete dentro de "response"/"resources"/
// "javascript" por dónde se detectan en el código).
const RULE_ID_TO_SCORE_GROUP_OVERRIDE = Object.freeze({
  "perf.response.compression": "compression",
  "perf.resources.thirdPartyDomains": "thirdParty",
  "perf.javascript.thirdParty": "thirdParty",
  "perf.derived.imageOptimizationCoverage": "images",
  "perf.derived.cachingCoverage": "caching",
});

const CATEGORY_TO_SCORE_GROUP = Object.freeze({
  response: "response",
  html: "html",
  resources: "resources",
  images: "images",
  javascript: "javascript",
  css: "css",
  fonts: "fonts",
  caching: "caching",
  mobile: "mobile",
});

const UNRESOLVED_STATUSES = Object.freeze(["not_measured", "unavailable"]);

function polarityFactor(polarity) {
  if (polarity === "positive") return 1;
  if (polarity === "negative") return -1;
  return 0;
}

function resolveScoreGroup(ev) {
  const ruleId = ev.metadata?.ruleId;
  if (ruleId && RULE_ID_TO_SCORE_GROUP_OVERRIDE[ruleId]) return RULE_ID_TO_SCORE_GROUP_OVERRIDE[ruleId];
  return CATEGORY_TO_SCORE_GROUP[ev.metadata?.category] ?? null;
}

function groupPerfEvidence(perfEvidence) {
  const groups = Object.fromEntries(PERF_SCORE_GROUPS.map((g) => [g, []]));
  for (const ev of perfEvidence) {
    const group = resolveScoreGroup(ev);
    if (group) groups[group].push(ev);
  }
  return groups;
}

/**
 * Calcula un sub-score 0-100 para un grupo de evidencia de rendimiento.
 * Nunca inventa una puntuación cuando no hay evidencia suficiente
 * evaluada (score: null). Los datos "not_measured"/"unavailable" NUNCA
 * se penalizan como fallo — se excluyen del cálculo, solo reducen la
 * cobertura.
 */
function computeGroupScore(group, groupEvidence) {
  const total = groupEvidence.length;
  const unresolved = groupEvidence.filter((e) => UNRESOLVED_STATUSES.includes(e.metadata?.evidenceKind)).length;
  const evaluated = groupEvidence.filter((e) => !UNRESOLVED_STATUSES.includes(e.metadata?.evidenceKind));

  if (total === 0) {
    return Object.freeze({ group, label: PERF_SCORE_GROUP_LABELS[group], score: null, confidence: 0, coverage: 0, findingsCount: 0, unmeasuredCount: 0, explanation: `Sin hallazgos de "${PERF_SCORE_GROUP_LABELS[group]}" en esta auditoría.` });
  }
  if (evaluated.length === 0) {
    return Object.freeze({ group, label: PERF_SCORE_GROUP_LABELS[group], score: null, confidence: 0, coverage: 0, findingsCount: total, unmeasuredCount: unresolved, explanation: `${total} hallazgo(s) de "${PERF_SCORE_GROUP_LABELS[group]}", ninguno medible en esta ejecución.` });
  }

  let weightedSum = 0;
  let weightSum = 0;
  let confidenceSum = 0;
  for (const ev of evaluated) {
    const weight = Math.max(ev.confidence, 0.05);
    const pointScore = 50 + polarityFactor(ev.signal.polarity) * ev.signal.strength * 50;
    weightedSum += pointScore * weight;
    weightSum += weight;
    confidenceSum += ev.confidence;
  }
  const score = Math.round(Math.max(0, Math.min(100, weightedSum / weightSum)));
  const confidence = Math.round((confidenceSum / evaluated.length) * 100) / 100;
  const coverage = Math.round((evaluated.length / total) * 100) / 100;

  return Object.freeze({
    group,
    label: PERF_SCORE_GROUP_LABELS[group],
    score,
    confidence,
    coverage,
    findingsCount: total,
    unmeasuredCount: unresolved,
    explanation: `${evaluated.length}/${total} hallazgo(s) medidos/calculados/observados evaluados (${unresolved} no medido(s)/no disponible(s), no penalizados como fallo).`,
  });
}

/**
 * @param {object[]} evidence - lista completa de Evidence de la auditoría (se filtra internamente por sourceType performance_analysis_derived)
 */
export function computePerfScoreBreakdown(evidence) {
  const perfEvidence = evidence.filter((e) => e.sourceType === "performance_analysis_derived");
  const grouped = groupPerfEvidence(perfEvidence);
  const groups = Object.fromEntries(PERF_SCORE_GROUPS.map((g) => [g, computeGroupScore(g, grouped[g])]));

  const scored = Object.values(groups).filter((g) => g.score !== null);
  const overallScore = scored.length > 0 ? Math.round(scored.reduce((sum, g) => sum + g.score * Math.max(g.confidence, 0.1), 0) / scored.reduce((sum, g) => sum + Math.max(g.confidence, 0.1), 0)) : null;
  const overallConfidence = scored.length > 0 ? Math.round((scored.reduce((sum, g) => sum + g.confidence, 0) / scored.length) * 100) / 100 : 0;
  const overallCoverage = Math.round((scored.length / PERF_SCORE_GROUPS.length) * 100) / 100;
  const totalUnmeasured = Object.values(groups).reduce((sum, g) => sum + g.unmeasuredCount, 0);

  return Object.freeze({
    groups: Object.freeze(groups),
    overall: Object.freeze({ score: overallScore, confidence: overallConfidence, coverage: overallCoverage, groupsEvaluated: scored.length, groupsTotal: PERF_SCORE_GROUPS.length, unmeasuredCount: totalUnmeasured }),
    disclaimer: "Puntuación propia basada en datos observados/medidos/calculados de este proveedor — no es una puntuación de Lighthouse ni de PageSpeed Insights, no mide Core Web Vitals (LCP/CLS/INP/FCP) y no sustituye una prueba real de navegador.",
  });
}
