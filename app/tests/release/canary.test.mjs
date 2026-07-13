import test from "node:test";
import assert from "node:assert/strict";
import { CANARY_STAGES, evaluateCanaryStage, nextCanaryStage, manualApprovalRequiredForStage, buildCanaryPlan, DEFAULT_CANARY_THRESHOLDS } from "../../scripts/release/canary.mjs";

test("canary: las 5 etapas son exactamente 1/5/25/50/100", () => {
  assert.deepEqual(CANARY_STAGES, [1, 5, 25, 50, 100]);
});

test("canary: métricas sanas en 1% avanza automáticamente a 5% (sin aprobación requerida)", () => {
  const result = evaluateCanaryStage({ stage: 1, metrics: { errorRate: 0, latencyP95Ms: 100, healthStatus: "HEALTHY" } });
  assert.equal(result.decision, "ADVANCE");
});

test("canary: avanzar a 25% requiere aprobación humana aunque los umbrales estén en verde (HOLD)", () => {
  const result = evaluateCanaryStage({ stage: 5, metrics: { errorRate: 0, latencyP95Ms: 100, healthStatus: "HEALTHY" } });
  assert.equal(result.decision, "HOLD");
  assert.ok(result.reasons[0].includes("aprobación humana"));
});

test("canary: error_rate por encima del umbral de rollback -> ROLLBACK inmediato", () => {
  const result = evaluateCanaryStage({ stage: 25, metrics: { errorRate: DEFAULT_CANARY_THRESHOLDS.rollbackErrorRateMax, latencyP95Ms: 100, healthStatus: "HEALTHY" } });
  assert.equal(result.decision, "ROLLBACK");
});

test("canary: latencia por encima del umbral de rollback -> ROLLBACK inmediato", () => {
  const result = evaluateCanaryStage({ stage: 50, metrics: { errorRate: 0, latencyP95Ms: DEFAULT_CANARY_THRESHOLDS.rollbackLatencyP95MaxMs, healthStatus: "HEALTHY" } });
  assert.equal(result.decision, "ROLLBACK");
});

test("canary: health degradation (DEGRADED) -> HOLD, no ROLLBACK todavía", () => {
  const result = evaluateCanaryStage({ stage: 5, metrics: { errorRate: 0, latencyP95Ms: 100, healthStatus: "DEGRADED" } });
  assert.equal(result.decision, "HOLD");
});

test("canary: health UNHEALTHY -> ROLLBACK aunque error_rate/latencia estén perfectos", () => {
  const result = evaluateCanaryStage({ stage: 5, metrics: { errorRate: 0, latencyP95Ms: 10, healthStatus: "UNHEALTHY" } });
  assert.equal(result.decision, "ROLLBACK");
});

test("canary: en 100% no hay siguiente etapa, se queda en HOLD estable", () => {
  const result = evaluateCanaryStage({ stage: 100, metrics: { errorRate: 0, latencyP95Ms: 10, healthStatus: "HEALTHY" } });
  assert.equal(result.decision, "HOLD");
  assert.equal(nextCanaryStage(100), null);
});

test("canary: manualApprovalRequiredForStage refleja los 3 puntos de aprobación (1/25/100)", () => {
  assert.equal(manualApprovalRequiredForStage(1), true);
  assert.equal(manualApprovalRequiredForStage(5), false);
  assert.equal(manualApprovalRequiredForStage(25), true);
  assert.equal(manualApprovalRequiredForStage(50), false);
  assert.equal(manualApprovalRequiredForStage(100), true);
});

test("canary: buildCanaryPlan produce las 5 etapas con next_stage encadenado correctamente", () => {
  const plan = buildCanaryPlan();
  assert.equal(plan.length, 5);
  assert.equal(plan[0].next_stage, 5);
  assert.equal(plan[4].next_stage, null);
});
