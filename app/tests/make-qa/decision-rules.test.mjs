import test from "node:test";
import assert from "node:assert/strict";
import { decide } from "../../scripts/make-qa/decision-rules.mjs";
import { generateEvidenceTemplate } from "../../scripts/make-qa/evidence-manifest-generator.mjs";
import { findByTestId } from "../../scripts/make-qa/manifest-loader.mjs";

function completeEvidence(testId, { status = "SUCCESS", forbiddenObserved = false } = {}) {
  const t = generateEvidenceTemplate({ testId });
  t.execution_id = "exec_test";
  t.executed_at = "2026-07-09T00:00:00.000Z";
  t.real_execution_status = status;
  for (const key of Object.keys(t.evidence)) t.evidence[key].value = "capturado";
  for (const c of t.forbidden_side_effects_check) c.observed = forbiddenObserved;
  return t;
}

test("evidencia completa + SUCCESS + sin efectos prohibidos -> PASS_VERIFIED", () => {
  const scenario = findByTestId("QA-A3-001");
  const evidence = completeEvidence("QA-A3-001");
  const result = decide(scenario, evidence);
  assert.equal(result.verdict, "PASS_VERIFIED");
});

test("efecto prohibido observado=true -> NOT_SAFE_ABORT, incluso con evidencia completa y SUCCESS", () => {
  const scenario = findByTestId("QA-A3-001");
  const evidence = completeEvidence("QA-A3-001", { forbiddenObserved: true });
  const result = decide(scenario, evidence);
  assert.equal(result.verdict, "NOT_SAFE_ABORT");
});

test("evidencia incompleta -> INCONCLUSIVE_MISSING_EVIDENCE, nunca PASS por omisión", () => {
  const scenario = findByTestId("QA-A3-001");
  const evidence = generateEvidenceTemplate({ testId: "QA-A3-001" }); // sin rellenar
  const result = decide(scenario, evidence);
  assert.equal(result.verdict, "INCONCLUSIVE_MISSING_EVIDENCE");
});

test("real_execution_status distinto de SUCCESS con evidencia completa -> FAIL", () => {
  const scenario = findByTestId("QA-A3-001");
  const evidence = completeEvidence("QA-A3-001", { status: "ERROR" });
  const result = decide(scenario, evidence);
  assert.equal(result.verdict, "FAIL");
});

test("HTTP 401/403 en la ejecución -> CONFIG_ERROR, aunque evidencia esté completa", () => {
  const scenario = findByTestId("QA-A2-001");
  const evidence = completeEvidence("QA-A2-001", { status: "SUCCESS" });
  const result = decide(scenario, evidence, { http_status: 401 });
  assert.equal(result.verdict, "CONFIG_ERROR");
});

test("mensaje de error con patrón 429/quota -> BLOCKED", () => {
  const scenario = findByTestId("QA-A3-003");
  const evidence = completeEvidence("QA-A3-003", { status: "SUCCESS" });
  const result = decide(scenario, evidence, { error_message: "429 maximum number of requests allowed for this month" });
  assert.equal(result.verdict, "BLOCKED");
});

test("VERDICTS exporta exactamente los 6 veredictos posibles", async () => {
  const { VERDICTS } = await import("../../scripts/make-qa/decision-rules.mjs");
  assert.deepEqual([...VERDICTS].sort(), ["BLOCKED", "CONFIG_ERROR", "FAIL", "INCONCLUSIVE_MISSING_EVIDENCE", "NOT_SAFE_ABORT", "PASS_VERIFIED"].sort());
});
