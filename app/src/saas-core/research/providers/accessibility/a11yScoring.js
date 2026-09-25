// Paso 17 · Fase 5 — Desglose de scoring de accesibilidad.
//
// NO sustituye ni duplica scoringEngine.js/dimensionRegistry.js (Paso
// 12): la categoría "accessibility" y la dimensión `accessibility` se
// siguen calculando exactamente igual, con las 45 dimensiones y 13
// categorías intactas. Este módulo añade un desglose MÁS GRANULAR, por
// debajo de esa categoría, agrupando la Evidence de
// `accessibilityProvider` (sourceType: "accessibility_analysis_derived")
// en los 9 grupos pedidos por el enunciado (Fase 5).
//
// Reutiliza la MISMA fórmula que dimensionRegistry.evaluateDimension y
// seoScoring.js (Paso 16): score = 50 + polaridad×fuerza×50, ponderado
// por max(confianza, 0.05).

export const A11Y_SCORE_GROUPS = Object.freeze(["structure", "images", "forms", "navigation", "aria", "tables", "keyboard", "contrast", "content"]);

const A11Y_SCORE_GROUP_LABELS = Object.freeze({
  structure: "Estructura",
  images: "Imágenes",
  forms: "Formularios",
  navigation: "Navegación (enlaces/botones)",
  aria: "ARIA",
  tables: "Tablas",
  keyboard: "Teclado y foco",
  contrast: "Contraste",
  content: "Contenido y legibilidad",
});

// Los 10 categorías de análisis (a11yAnalyzer.js) se agrupan en los 9
// grupos de scoring del enunciado — "document" y "headings" comparten
// el grupo "structure" (ambas son de estructura del documento).
const ANALYSIS_CATEGORY_TO_SCORE_GROUP = Object.freeze({
  document: "structure",
  headings: "structure",
  media: "images",
  forms: "forms",
  linksButtons: "navigation",
  aria: "aria",
  tables: "tables",
  keyboard: "keyboard",
  contrast: "contrast",
  content: "content",
});

const UNRESOLVED_STATUSES = Object.freeze(["unavailable", "unverified", "blocked", "manual_required"]);

function polarityFactor(polarity) {
  if (polarity === "positive") return 1;
  if (polarity === "negative") return -1;
  return 0;
}

function groupA11yEvidence(a11yEvidence) {
  const groups = Object.fromEntries(A11Y_SCORE_GROUPS.map((g) => [g, []]));
  for (const ev of a11yEvidence) {
    const category = ev.metadata?.category;
    const group = ANALYSIS_CATEGORY_TO_SCORE_GROUP[category];
    if (group) groups[group].push(ev);
  }
  return groups;
}

/**
 * Calcula un sub-score 0-100 para un grupo de evidencia de
 * accesibilidad. Nunca inventa una puntuación cuando no hay evidencia
 * suficiente evaluada (score: null). Las comprobaciones manuales/no
 * evaluables NUNCA se penalizan como fallo — se excluyen del cálculo,
 * solo reducen la cobertura.
 */
function computeGroupScore(group, groupEvidence) {
  const total = groupEvidence.length;
  const unresolved = groupEvidence.filter((e) => UNRESOLVED_STATUSES.includes(e.metadata?.evidenceKind)).length;
  const evaluated = groupEvidence.filter((e) => !UNRESOLVED_STATUSES.includes(e.metadata?.evidenceKind));

  if (total === 0) {
    return Object.freeze({ group, label: A11Y_SCORE_GROUP_LABELS[group], score: null, confidence: 0, coverage: 0, findingsCount: 0, manualReviewCount: 0, explanation: `Sin hallazgos de "${A11Y_SCORE_GROUP_LABELS[group]}" en esta auditoría.` });
  }
  if (evaluated.length === 0) {
    return Object.freeze({ group, label: A11Y_SCORE_GROUP_LABELS[group], score: null, confidence: 0, coverage: 0, findingsCount: total, manualReviewCount: unresolved, explanation: `${total} hallazgo(s) de "${A11Y_SCORE_GROUP_LABELS[group]}", ninguno automatizable en esta ejecución (revisión manual requerida).` });
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
    label: A11Y_SCORE_GROUP_LABELS[group],
    score,
    confidence,
    coverage,
    findingsCount: total,
    manualReviewCount: unresolved,
    explanation: `${evaluated.length}/${total} hallazgo(s) automatizados evaluados (${unresolved} requiere(n) revisión manual/no evaluable, no penalizados como fallo).`,
  });
}

/**
 * @param {object[]} evidence - lista completa de Evidence de la auditoría (se filtra internamente por sourceType accessibility_analysis_derived)
 */
export function computeA11yScoreBreakdown(evidence) {
  const a11yEvidence = evidence.filter((e) => e.sourceType === "accessibility_analysis_derived");
  const grouped = groupA11yEvidence(a11yEvidence);
  const groups = Object.fromEntries(A11Y_SCORE_GROUPS.map((g) => [g, computeGroupScore(g, grouped[g])]));

  const scored = Object.values(groups).filter((g) => g.score !== null);
  const overallScore = scored.length > 0 ? Math.round(scored.reduce((sum, g) => sum + g.score * Math.max(g.confidence, 0.1), 0) / scored.reduce((sum, g) => sum + Math.max(g.confidence, 0.1), 0)) : null;
  const overallConfidence = scored.length > 0 ? Math.round((scored.reduce((sum, g) => sum + g.confidence, 0) / scored.length) * 100) / 100 : 0;
  const overallCoverage = Math.round((scored.length / A11Y_SCORE_GROUPS.length) * 100) / 100;
  const totalManualReview = Object.values(groups).reduce((sum, g) => sum + g.manualReviewCount, 0);

  return Object.freeze({
    groups: Object.freeze(groups),
    overall: Object.freeze({ score: overallScore, confidence: overallConfidence, coverage: overallCoverage, groupsEvaluated: scored.length, groupsTotal: A11Y_SCORE_GROUPS.length, manualReviewCount: totalManualReview }),
    // Fase 5 — recordatorio explícito: una puntuación automática nunca es
    // una certificación legal de accesibilidad ni sustituye una
    // auditoría humana completa.
    disclaimer: "Puntuación automática orientativa — no constituye una certificación de accesibilidad ni sustituye una auditoría manual completa con tecnología de asistencia real.",
  });
}
