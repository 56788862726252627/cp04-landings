import { test } from "node:test";
import assert from "node:assert/strict";

import { DIMENSION_IDS, DIMENSIONS, classifyScore, evaluateDimension, evaluateAllDimensions } from "./dimensionRegistry.js";
import { createEvidence } from "./evidenceSchema.js";

test("DIMENSION_IDS contiene exactamente las 45 dimensiones del enunciado, sin duplicados", () => {
  assert.equal(DIMENSION_IDS.length, 45);
  assert.equal(new Set(DIMENSION_IDS).size, 45);
  for (const id of DIMENSION_IDS) assert.ok(DIMENSIONS[id], `falta metadata para ${id}`);
});

test("classifyScore clasifica en las 6 bandas cualitativas del enunciado", () => {
  assert.equal(classifyScore(10), "crítico");
  assert.equal(classifyScore(35), "débil");
  assert.equal(classifyScore(55), "básico");
  assert.equal(classifyScore(70), "correcto");
  assert.equal(classifyScore(85), "avanzado");
  assert.equal(classifyScore(95), "excelente");
});

test("evaluateDimension marca 'unknown' con missingData cuando no hay evidencia enlazada", () => {
  const result = evaluateDimension("accessibility", []);
  assert.equal(result.status, "unknown");
  assert.equal(result.score, null);
  assert.deepEqual([...result.missingData], ["accessibility"]);
});

test("evaluateDimension calcula un score alto con evidencia positiva fuerte y confianza alta", () => {
  const ev = createEvidence({
    sourceId: "s1",
    sourceType: "local_html",
    title: "viewport presente",
    excerpt: "meta viewport encontrado",
    normalizedContent: "meta viewport encontrado",
    relatedDimension: "mobileExperience",
    signal: { strength: 1, polarity: "positive" },
    confidence: 0.9,
  });
  const result = evaluateDimension("mobileExperience", [ev]);
  assert.ok(result.score > 80, `score esperado alto, obtenido ${result.score}`);
  assert.equal(result.contradictions.length, 0);
});

test("evaluateDimension calcula un score bajo con evidencia negativa fuerte", () => {
  const ev = createEvidence({
    sourceId: "s1",
    sourceType: "local_html",
    title: "sin viewport",
    excerpt: "no se encontró meta viewport",
    normalizedContent: "no se encontró meta viewport",
    relatedDimension: "mobileExperience",
    signal: { strength: 1, polarity: "negative" },
    confidence: 0.9,
  });
  const result = evaluateDimension("mobileExperience", [ev]);
  assert.ok(result.score < 20, `score esperado bajo, obtenido ${result.score}`);
  assert.equal(result.risks.length, 1);
});

test("evaluateDimension detecta contradicción cuando hay evidencia positiva y negativa fuertes a la vez", () => {
  const pos = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "positivo", excerpt: "a", normalizedContent: "a", relatedDimension: "seoTechnical", signal: { strength: 0.9, polarity: "positive" }, confidence: 0.8 });
  const neg = createEvidence({ sourceId: "s2", sourceType: "mock_seo", title: "negativo", excerpt: "b", normalizedContent: "b", relatedDimension: "seoTechnical", signal: { strength: 0.9, polarity: "negative" }, confidence: 0.8 });
  const result = evaluateDimension("seoTechnical", [pos, neg]);
  assert.equal(result.contradictions.length, 1);
  assert.ok(result.confidence < 0.8, "la confianza debe penalizarse ante contradicción");
});

test("evaluateDimension es determinista: mismo input produce exactamente el mismo output", () => {
  const ev = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "t", excerpt: "e", normalizedContent: "e", relatedDimension: "branding", signal: { strength: 0.6, polarity: "positive" }, confidence: 0.6 });
  const r1 = evaluateDimension("branding", [ev]);
  const r2 = evaluateDimension("branding", [ev]);
  assert.deepEqual(r1, r2);
});

test("evaluateDimension lanza para un id de dimensión desconocido", () => {
  assert.throws(() => evaluateDimension("no_existe", []));
});

test("evaluateAllDimensions devuelve un resultado por cada una de las 45 dimensiones", () => {
  const results = evaluateAllDimensions([]);
  assert.equal(Object.keys(results).length, 45);
  for (const id of DIMENSION_IDS) assert.equal(results[id].dimensionId, id);
});
