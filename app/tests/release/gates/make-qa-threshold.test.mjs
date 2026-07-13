import test from "node:test";
import assert from "node:assert/strict";
import { evaluateMakeQaThreshold } from "../../../scripts/release/gates/make-qa-threshold.mjs";
import { buildFinalReadinessMatrix } from "../../../scripts/make-qa/release-gate.mjs";

test("QA threshold: matriz real 50/50 (PASS=1) por debajo de un umbral 50% -> WARN (hay al menos 1 PASS real)", () => {
  const matrix = buildFinalReadinessMatrix();
  const result = evaluateMakeQaThreshold({ matrix, thresholdRatio: 0.5, evidenceRef: "fixtures/make-qa/manifest/release-readiness-matrix.json" });
  assert.equal(result.status, "WARN");
});

test("QA threshold: umbral configurado a 0 -> PASS con cualquier PASS>=0 (umbral configurable, sin default optimista)", () => {
  const matrix = buildFinalReadinessMatrix();
  const result = evaluateMakeQaThreshold({ matrix, thresholdRatio: 0, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("QA threshold: cero escenarios PASS -> BLOCKED", () => {
  const matrix = { total: 10, by_release_gate: { BLOCKED: 10 } };
  const result = evaluateMakeQaThreshold({ matrix, thresholdRatio: 0.1, evidenceRef: "x" });
  assert.equal(result.status, "BLOCKED");
});

test("QA threshold: ratio por encima del umbral configurado -> PASS", () => {
  const matrix = { total: 10, by_release_gate: { PASS: 9, BLOCKED: 1 } };
  const result = evaluateMakeQaThreshold({ matrix, thresholdRatio: 0.8, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("QA threshold: sin matriz cargada -> UNKNOWN", () => {
  const result = evaluateMakeQaThreshold({ matrix: null, evidenceRef: "x" });
  assert.equal(result.status, "UNKNOWN");
});
