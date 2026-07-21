import { test } from "node:test";
import assert from "node:assert/strict";

import { buildRecommendationFromDimension, buildRecommendations, buildBacklog, buildImpactEffortMatrix } from "./recommendationEngine.js";
import { evaluateDimension, evaluateAllDimensions } from "./dimensionRegistry.js";
import { createEvidence } from "./evidenceSchema.js";

function negativeEvidence(dimensionId, strength = 1, confidence = 0.8) {
  return createEvidence({ sourceId: "s1", sourceType: "local_html", title: "problema", excerpt: "detalle del problema", normalizedContent: "detalle del problema", relatedDimension: dimensionId, signal: { strength, polarity: "negative" }, confidence });
}

test("buildRecommendationFromDimension devuelve null para una dimensión con score alto", () => {
  const ev = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "bien", excerpt: "bien", normalizedContent: "bien", relatedDimension: "branding", signal: { strength: 1, polarity: "positive" }, confidence: 0.9 });
  const result = evaluateDimension("branding", [ev]);
  assert.equal(buildRecommendationFromDimension(result), null);
});

test("buildRecommendationFromDimension devuelve null para una dimensión sin evidencia (unknown)", () => {
  const result = evaluateDimension("accessibility", []);
  assert.equal(buildRecommendationFromDimension(result), null);
});

test("buildRecommendationFromDimension produce una recomendación completa y enlazada a evidencia real", () => {
  const ev = negativeEvidence("mobileExperience");
  const result = evaluateDimension("mobileExperience", [ev]);
  const rec = buildRecommendationFromDimension(result);
  assert.ok(rec);
  assert.equal(rec.recommendationId, "rec_mobileExperience");
  assert.deepEqual([...rec.evidenceIds], [...result.evidenceIds]);
  assert.ok(rec.priority > 0);
  assert.ok(rec.acceptanceCriteria.length > 0);
});

test("buildRecommendationFromDimension marca urgencia mayor cuando la dimensión es prioritaria para el sector", () => {
  const ev = negativeEvidence("bookingCapability");
  const result = evaluateDimension("bookingCapability", [ev]);
  const withoutPriority = buildRecommendationFromDimension(result, { priorityDimensionIds: [] });
  const withPriority = buildRecommendationFromDimension(result, { priorityDimensionIds: ["bookingCapability"] });
  assert.ok(withPriority.urgency > withoutPriority.urgency);
  assert.ok(withPriority.priority > withoutPriority.priority);
});

test("buildRecommendations ordena por prioridad descendente de forma determinista", () => {
  const evStrong = negativeEvidence("mobileExperience", 1, 0.95);
  const evWeak = negativeEvidence("navigation", 0.5, 0.4);
  const dims = evaluateAllDimensions([evStrong, evWeak]);
  const recs = buildRecommendations(dims);
  assert.ok(recs.length >= 2);
  for (let i = 1; i < recs.length; i++) assert.ok(recs[i - 1].priority >= recs[i].priority);
});

test("buildBacklog devuelve las recomendaciones ya priorizadas sin reordenar de nuevo", () => {
  const dims = evaluateAllDimensions([negativeEvidence("mobileExperience")]);
  const recs = buildRecommendations(dims);
  assert.deepEqual(buildBacklog(recs), recs);
});

test("buildImpactEffortMatrix clasifica en 4 cuadrantes sin perder ninguna recomendación", () => {
  const dims = evaluateAllDimensions([negativeEvidence("contactInfo"), negativeEvidence("bookingCapability"), negativeEvidence("performance")]);
  const recs = buildRecommendations(dims);
  const matrix = buildImpactEffortMatrix(recs);
  const total = matrix.quickWins.length + matrix.majorProjects.length + matrix.fillIns.length + matrix.questionable.length;
  assert.equal(total, recs.length);
});

test("un sector regulado no genera recomendaciones que suenen a asesoramiento definitivo para bookingCapability/serviceClarity", () => {
  const ev = negativeEvidence("serviceClarity");
  const result = evaluateDimension("serviceClarity", [ev]);
  const rec = buildRecommendationFromDimension(result, { mustNotAutoInfer: ["estrategia jurídica concreta"] });
  assert.equal(rec.proposedImplementation, "revisión profesional");
});
