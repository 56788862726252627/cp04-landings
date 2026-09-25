import { test } from "node:test";
import assert from "node:assert/strict";

import { diffAudits, renderAuditDiffMarkdown } from "./auditDiff.js";
import { evaluateAllDimensions } from "./dimensionRegistry.js";
import { computeAllScores } from "./scoringEngine.js";
import { buildRecommendations } from "./recommendationEngine.js";
import { createEvidence } from "./evidenceSchema.js";

function ev(dimensionId, polarity, strength = 1, confidence = 0.9) {
  return createEvidence({ sourceId: "s", sourceType: "local_html", title: "t", excerpt: "e", normalizedContent: "e", relatedDimension: dimensionId, signal: { strength, polarity }, confidence });
}

function buildAudit(evidence, requestId) {
  const dimensionResults = evaluateAllDimensions(evidence);
  return { requestId, scores: computeAllScores(dimensionResults), recommendations: buildRecommendations(dimensionResults), evidence };
}

test("diffAudits detecta una mejora de score global tras resolver un problema", () => {
  const before = buildAudit([ev("bookingCapability", "negative")], "req_before");
  const after = buildAudit([ev("bookingCapability", "positive")], "req_after");
  const diff = diffAudits(before, after);
  assert.ok(diff.scores.global.delta > 0);
  assert.match(diff.summary, /\+/);
});

test("diffAudits detecta recomendaciones resueltas y nuevas", () => {
  const before = buildAudit([ev("bookingCapability", "negative")], "req_before");
  const after = buildAudit([ev("mobileExperience", "negative")], "req_after");
  const diff = diffAudits(before, after);
  assert.ok(diff.recommendations.resolved.includes("rec_bookingCapability"));
  assert.ok(diff.recommendations.added.includes("rec_mobileExperience"));
});

test("diffAudits detecta evidencia añadida y eliminada por evidenceId", () => {
  const before = buildAudit([ev("branding", "positive")], "req_before");
  const after = buildAudit([ev("seoTechnical", "positive")], "req_after");
  const diff = diffAudits(before, after);
  assert.equal(diff.evidence.removed.length, 1);
  assert.equal(diff.evidence.added.length, 1);
});

test("diffAudits es determinista", () => {
  const before = buildAudit([ev("branding", "positive")], "req_before");
  const after = buildAudit([ev("branding", "positive")], "req_after");
  const d1 = diffAudits(before, after);
  const d2 = diffAudits(before, after);
  assert.deepEqual(d1, d2);
});

test("renderAuditDiffMarkdown produce texto legible sin lanzar", () => {
  const before = buildAudit([ev("branding", "negative")], "req_before");
  const after = buildAudit([ev("branding", "positive")], "req_after");
  const md = renderAuditDiffMarkdown(diffAudits(before, after));
  assert.match(md, /Diff entre auditorías/);
});
