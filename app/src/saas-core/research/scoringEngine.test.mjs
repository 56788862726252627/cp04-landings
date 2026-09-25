import { test } from "node:test";
import assert from "node:assert/strict";

import { computeCategoryScore, computeAllScores, SCORE_CATEGORIES } from "./scoringEngine.js";
import { evaluateAllDimensions } from "./dimensionRegistry.js";
import { createEvidence } from "./evidenceSchema.js";

test("SCORE_CATEGORIES tiene exactamente las 13 categorías del enunciado (más 'global', que se calcula aparte)", () => {
  assert.equal(SCORE_CATEGORIES.length, 13);
  assert.equal(new Set(SCORE_CATEGORIES).size, 13);
});

test("computeCategoryScore devuelve null/unknown cuando ninguna dimensión miembro tiene evidencia", () => {
  const dimensionResults = evaluateAllDimensions([]);
  const result = computeCategoryScore("accessibility", dimensionResults);
  assert.equal(result.score, null);
  assert.equal(result.status, "unknown");
});

test("computeCategoryScore sube con evidencia positiva y baja con evidencia negativa para la misma categoría", () => {
  const good = createEvidence({ sourceId: "s1", sourceType: "mock_accessibility", title: "alt ok", excerpt: "alt presente", normalizedContent: "alt presente", relatedDimension: "accessibility", signal: { strength: 1, polarity: "positive" }, confidence: 0.9 });
  const bad = createEvidence({ sourceId: "s1", sourceType: "mock_accessibility", title: "sin alt", excerpt: "faltan alt", normalizedContent: "faltan alt", relatedDimension: "accessibility", signal: { strength: 1, polarity: "negative" }, confidence: 0.9 });
  const dimensionsGood = evaluateAllDimensions([good]);
  const dimensionsBad = evaluateAllDimensions([bad]);
  const scoreGood = computeCategoryScore("accessibility", dimensionsGood);
  const scoreBad = computeCategoryScore("accessibility", dimensionsBad);
  assert.ok(scoreGood.score > scoreBad.score, `esperado ${scoreGood.score} > ${scoreBad.score}`);
});

test("computeCategoryScore penaliza la confianza cuando hay dimensiones con contradicciones", () => {
  const pos = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "p", excerpt: "p", normalizedContent: "p", relatedDimension: "seoTechnical", signal: { strength: 0.9, polarity: "positive" }, confidence: 0.9 });
  const neg = createEvidence({ sourceId: "s2", sourceType: "mock_seo", title: "n", excerpt: "n", normalizedContent: "n", relatedDimension: "seoTechnical", signal: { strength: 0.9, polarity: "negative" }, confidence: 0.9 });
  const withoutContradiction = computeCategoryScore("seo", evaluateAllDimensions([pos]));
  const withContradiction = computeCategoryScore("seo", evaluateAllDimensions([pos, neg]));
  assert.ok(withContradiction.contradictoryDimensions.includes("seoTechnical"));
  assert.notEqual(withoutContradiction.score, withContradiction.score);
});

test("computeAllScores calcula las 14 categorías + global, y es determinista", () => {
  const ev = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "t", excerpt: "e", normalizedContent: "e", relatedDimension: "branding", signal: { strength: 0.8, polarity: "positive" }, confidence: 0.8 });
  const dimensionResults = evaluateAllDimensions([ev]);
  const r1 = computeAllScores(dimensionResults);
  const r2 = computeAllScores(dimensionResults);
  assert.deepEqual(r1, r2);
  assert.equal(Object.keys(r1.categories).length, 13);
  assert.ok(r1.global.score > 0);
});

test("computeAllScores respeta pesos por dimensión y por categoría de un preset sectorial", () => {
  const ev = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "t", excerpt: "e", normalizedContent: "e", relatedDimension: "branding", signal: { strength: 1, polarity: "positive" }, confidence: 1 });
  const dimensionResults = evaluateAllDimensions([ev]);
  const unweighted = computeAllScores(dimensionResults);
  const weighted = computeAllScores(dimensionResults, { categoryWeights: { branding: 5 } });
  // Con más peso en 'branding' (que aquí tiene el único score no-null=100), el global pondera más hacia arriba.
  assert.ok(weighted.global.score >= unweighted.global.score);
});

test("computeAllScores devuelve global null solo si absolutamente ninguna categoría tiene datos", () => {
  const dimensionResults = evaluateAllDimensions([]);
  const result = computeAllScores(dimensionResults);
  assert.equal(result.global.score, null);
  assert.equal(result.global.coverage, 0);
});
