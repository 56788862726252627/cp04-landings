// Paso 16 · Fase 5 — Desglose de scoring SEO.
//
// NO sustituye ni duplica scoringEngine.js/dimensionRegistry.js (Paso
// 12): la categoría "seo" y las dimensiones seoTechnical/seoContent/
// seoLocal se siguen calculando exactamente igual, con las 45
// dimensiones y 13 categorías intactas. Este módulo añade un desglose
// MÁS GRANULAR, por debajo de la categoría "seo", agrupando la Evidence
// de `seoProvider` (sourceType: "seo_analysis_derived") por categoría de
// análisis (indexación/metadatos/.../SEO local) en vez de por dimensión.
//
// Reutiliza la MISMA fórmula que dimensionRegistry.evaluateDimension
// (Paso 12): score = 50 + polaridad*fuerza*50, ponderado por
// max(confianza, 0.05) — para que un sub-score de SEO sea directamente
// comparable en escala (0-100) con cualquier otro score del motor.

export const SEO_SCORE_GROUPS = Object.freeze(["indexation", "metadata", "structure", "links", "images", "structuredData", "content", "local", "technical"]);

const SEO_SCORE_GROUP_LABELS = Object.freeze({
  indexation: "Indexabilidad",
  metadata: "Metadatos",
  structure: "Estructura",
  links: "Enlaces",
  images: "Imágenes",
  structuredData: "Datos estructurados",
  content: "Contenido",
  local: "SEO local",
  technical: "Cobertura técnica",
});

const UNRESOLVED_STATUSES = Object.freeze(["unavailable", "unverified", "blocked"]);

function polarityFactor(polarity) {
  if (polarity === "positive") return 1;
  if (polarity === "negative") return -1;
  return 0;
}

/** Evidencia de seoProvider agrupada por categoría de análisis; "local" agrupa relatedDimension==="seoLocal" de CUALQUIER categoría (cross-cutting). */
function groupSeoEvidence(seoEvidence) {
  const groups = Object.fromEntries(SEO_SCORE_GROUPS.map((g) => [g, []]));
  for (const ev of seoEvidence) {
    const category = ev.metadata?.category;
    if (category && category in groups && category !== "local") groups[category].push(ev);
    if (ev.relatedDimension === "seoLocal") groups.local.push(ev);
  }
  return groups;
}

/**
 * Calcula un sub-score 0-100 para un grupo de evidencia SEO. Nunca
 * inventa una puntuación cuando no hay evidencia suficiente evaluada
 * (score: null, no 0 — 0 significaría "muy malo", no "sin datos").
 */
function computeGroupScore(group, groupEvidence) {
  const total = groupEvidence.length;
  const unresolved = groupEvidence.filter((e) => UNRESOLVED_STATUSES.includes(e.metadata?.evidenceKind)).length;
  const evaluated = groupEvidence.filter((e) => !UNRESOLVED_STATUSES.includes(e.metadata?.evidenceKind));

  if (total === 0) {
    return Object.freeze({ group, label: SEO_SCORE_GROUP_LABELS[group], score: null, confidence: 0, coverage: 0, findingsCount: 0, explanation: `Sin hallazgos de "${SEO_SCORE_GROUP_LABELS[group]}" en esta auditoría.` });
  }
  if (evaluated.length === 0) {
    return Object.freeze({ group, label: SEO_SCORE_GROUP_LABELS[group], score: null, confidence: 0, coverage: 0, findingsCount: total, explanation: `${total} hallazgo(s) de "${SEO_SCORE_GROUP_LABELS[group]}", ninguno comprobable en esta ejecución (datos no disponibles/no comprobados).` });
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
    label: SEO_SCORE_GROUP_LABELS[group],
    score,
    confidence,
    coverage,
    findingsCount: total,
    explanation: `${evaluated.length}/${total} hallazgo(s) evaluados (${unresolved} no comprobable(s), no penalizados como fallo).`,
  });
}

/**
 * @param {object[]} evidence - lista completa de Evidence de la auditoría (se filtra internamente por sourceType seo_analysis_derived)
 * @returns {{groups: object, overall: {score:number|null, confidence:number, coverage:number}}}
 */
export function computeSeoScoreBreakdown(evidence) {
  const seoEvidence = evidence.filter((e) => e.sourceType === "seo_analysis_derived");
  const grouped = groupSeoEvidence(seoEvidence);
  const groups = Object.fromEntries(SEO_SCORE_GROUPS.map((g) => [g, computeGroupScore(g, grouped[g])]));

  const scored = Object.values(groups).filter((g) => g.score !== null);
  const overallScore = scored.length > 0 ? Math.round(scored.reduce((sum, g) => sum + g.score * Math.max(g.confidence, 0.1), 0) / scored.reduce((sum, g) => sum + Math.max(g.confidence, 0.1), 0)) : null;
  const overallConfidence = scored.length > 0 ? Math.round((scored.reduce((sum, g) => sum + g.confidence, 0) / scored.length) * 100) / 100 : 0;
  const overallCoverage = Math.round((scored.length / SEO_SCORE_GROUPS.length) * 100) / 100;

  return Object.freeze({
    groups: Object.freeze(groups),
    overall: Object.freeze({ score: overallScore, confidence: overallConfidence, coverage: overallCoverage, groupsEvaluated: scored.length, groupsTotal: SEO_SCORE_GROUPS.length }),
  });
}
