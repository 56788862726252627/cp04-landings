// Paso 12 · Fase 9 — Sistema de puntuación.
//
// Agrega los resultados de dimensionRegistry.js en las 14 puntuaciones de
// categoría del enunciado + un score global. Nunca es una media simple:
// pondera por dimensión (sector), penaliza datos ausentes/contradicciones/
// baja confianza, y siempre es explicable (cada score expone qué
// dimensiones lo componen y por qué).

import { DIMENSIONS, classifyScore } from "./dimensionRegistry.js";

export const SCORE_CATEGORIES = Object.freeze([
  "digitalMaturity",
  "technicalQuality",
  "ux",
  "conversion",
  "branding",
  "automation",
  "accessibility",
  "seo",
  "trust",
  "reputation",
  "localPresence",
  "content",
  "observableSecurity",
]);

function dimensionsForCategory(category) {
  return Object.values(DIMENSIONS).filter((d) => d.scoreCategories.includes(category));
}

/**
 * Calcula el score de una categoría a partir de los resultados de
 * dimensión que le pertenecen. Ignora (no como 0, sino fuera del promedio)
 * las dimensiones sin evidencia, pero las registra como missingData —
 * más dimensiones ausentes = más penalización de confianza.
 * @param {string} category
 * @param {object} dimensionResults - salida de evaluateAllDimensions()
 * @param {object} weights - {dimensionId: peso} opcional (sector)
 */
export function computeCategoryScore(category, dimensionResults, weights = {}) {
  const members = dimensionsForCategory(category);
  let weightedScoreSum = 0;
  let scoreWeightSum = 0;
  let confidenceSum = 0;
  let evaluatedCount = 0;
  const missingDimensions = [];
  const contradictoryDimensions = [];

  for (const dim of members) {
    const result = dimensionResults[dim.id];
    if (!result) continue;
    const weight = weights[dim.id] ?? 1;
    if (result.score === null) {
      missingDimensions.push(dim.id);
      continue;
    }
    weightedScoreSum += result.score * weight * Math.max(result.confidence, 0.1);
    scoreWeightSum += weight * Math.max(result.confidence, 0.1);
    confidenceSum += result.confidence;
    evaluatedCount += 1;
    if (result.contradictions.length > 0) contradictoryDimensions.push(dim.id);
  }

  if (evaluatedCount === 0) {
    return Object.freeze({
      category,
      score: null,
      confidence: 0,
      status: "unknown",
      coverage: 0,
      missingDimensions: Object.freeze(missingDimensions),
      contradictoryDimensions: Object.freeze([]),
      explanation: `Sin datos para ninguna de las ${members.length} dimensiones de "${category}".`,
    });
  }

  const rawScore = scoreWeightSum > 0 ? weightedScoreSum / scoreWeightSum : 50;
  const coverage = Math.round((evaluatedCount / members.length) * 100) / 100;
  const coveragePenalty = 0.5 + coverage * 0.5; // cobertura total=1x, cobertura 0 (nunca aquí)=0.5x
  const contradictionPenalty = contradictoryDimensions.length > 0 ? 1 - Math.min(0.3, contradictoryDimensions.length * 0.1) : 1;
  const score = Math.round(rawScore * contradictionPenalty);
  const confidence = Math.round(((confidenceSum / evaluatedCount) * coveragePenalty) * 100) / 100;

  return Object.freeze({
    category,
    score,
    confidence,
    status: classifyScore(score),
    coverage,
    missingDimensions: Object.freeze(missingDimensions),
    contradictoryDimensions: Object.freeze(contradictoryDimensions),
    explanation: `${evaluatedCount}/${members.length} dimensiones evaluadas (cobertura ${Math.round(coverage * 100)}%)${contradictoryDimensions.length > 0 ? `, ${contradictoryDimensions.length} con contradicciones` : ""}.`,
  });
}

/**
 * Calcula las 14 categorías + el score global (media ponderada de las
 * categorías con datos, ponderada también por su propia confianza).
 * @param {object} dimensionResults - salida de evaluateAllDimensions()
 * @param {{dimensionWeights?: object, categoryWeights?: object}} sectorPreset
 */
export function computeAllScores(dimensionResults, sectorPreset = {}) {
  const dimensionWeights = sectorPreset.dimensionWeights ?? {};
  const categoryWeights = sectorPreset.categoryWeights ?? {};

  const categories = {};
  for (const category of SCORE_CATEGORIES) categories[category] = computeCategoryScore(category, dimensionResults, dimensionWeights);

  let weightedSum = 0;
  let weightSum = 0;
  for (const category of SCORE_CATEGORIES) {
    const result = categories[category];
    if (result.score === null) continue;
    const weight = (categoryWeights[category] ?? 1) * Math.max(result.confidence, 0.1);
    weightedSum += result.score * weight;
    weightSum += weight;
  }
  const globalScore = weightSum > 0 ? Math.round(weightedSum / weightSum) : null;
  const evaluatedCategories = SCORE_CATEGORIES.filter((c) => categories[c].score !== null);
  const globalConfidence = evaluatedCategories.length > 0 ? Math.round((evaluatedCategories.reduce((sum, c) => sum + categories[c].confidence, 0) / evaluatedCategories.length) * 100) / 100 : 0;

  return Object.freeze({
    global: Object.freeze({
      score: globalScore,
      confidence: globalConfidence,
      status: classifyScore(globalScore),
      coverage: Math.round((evaluatedCategories.length / SCORE_CATEGORIES.length) * 100) / 100,
    }),
    categories: Object.freeze(categories),
  });
}
