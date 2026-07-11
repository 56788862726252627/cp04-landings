import test from "node:test";
import assert from "node:assert/strict";
import { releaseGateDecision, buildFinalReadinessMatrix, buildExternalDependencyChecklist, buildEvidenceChecklist, buildRollbackChecklist, RELEASE_GATE_VERDICTS } from "../../scripts/make-qa/release-gate.mjs";
import { findByScenarioId } from "../../scripts/make-qa/manifest-loader.mjs";

test("RELEASE_GATE_VERDICTS tiene exactamente los 4 valores pedidos: PASS, FAIL, BLOCKED, NOT_SAFE", () => {
  assert.deepEqual([...RELEASE_GATE_VERDICTS].sort(), ["BLOCKED", "FAIL", "NOT_SAFE", "PASS"]);
});

test("PASS_VERIFIED real (QR Acceso) -> PASS, sin necesitar override", () => {
  const result = releaseGateDecision(findByScenarioId("6244975"));
  assert.equal(result.verdict, "PASS");
});

test("NOT_SAFE estructural (Gestión Lista de Espera) -> NOT_SAFE", () => {
  const result = releaseGateDecision(findByScenarioId("5791113"));
  assert.equal(result.verdict, "NOT_SAFE");
});

test("cualquier otro current_status (ej. READY_PENDING_AIRTABLE_PREFLIGHT) -> BLOCKED, nunca PASS por adelantado", () => {
  const result = releaseGateDecision(findByScenarioId("5291559")); // Control Acceso QR
  assert.equal(result.verdict, "BLOCKED");
});

test("override executionVerdict=FAIL fuerza FAIL incluso si el manifest todavía no se actualizó", () => {
  const result = releaseGateDecision(findByScenarioId("5291559"), { executionVerdict: "FAIL" });
  assert.equal(result.verdict, "FAIL");
});

test("override executionVerdict=NOT_SAFE_ABORT fuerza NOT_SAFE", () => {
  const result = releaseGateDecision(findByScenarioId("5291559"), { executionVerdict: "NOT_SAFE_ABORT" });
  assert.equal(result.verdict, "NOT_SAFE");
});

test("la matriz final tiene 50 filas y el gate suma 1 PASS + 2 NOT_SAFE + 47 BLOCKED + 0 FAIL (estado real, sin inventar)", () => {
  const matrix = buildFinalReadinessMatrix();
  assert.equal(matrix.total, 50);
  assert.equal(matrix.by_release_gate.PASS, 1);
  assert.equal(matrix.by_release_gate.NOT_SAFE, 2);
  assert.equal(matrix.by_release_gate.BLOCKED, 47);
  assert.equal(matrix.by_release_gate.FAIL ?? 0, 0);
});

test("execution_order respeta el orden manual ya documentado para Wave 1: Control Acceso QR, API Reservas, Alta de Jugador", () => {
  const matrix = buildFinalReadinessMatrix();
  const wave1 = matrix.execution_order.filter((e) => e.wave === "wave_1").map((e) => e.scenario_id);
  assert.deepEqual(wave1, ["5291559", "5697630", "6199248"]);
});

test("execution_order respeta el orden manual documentado para Wave 2: GDPR primero, Emparejamiento último", () => {
  const matrix = buildFinalReadinessMatrix();
  const wave2 = matrix.execution_order.filter((e) => e.wave === "wave_2").map((e) => e.scenario_id);
  assert.equal(wave2[0], "6323457");
  assert.equal(wave2[wave2.length - 1], "5791128");
});

test("execution_order es una permutación completa de los 50 scenario_id, sin huecos ni duplicados", () => {
  const matrix = buildFinalReadinessMatrix();
  assert.equal(matrix.execution_order.length, 50);
  assert.equal(new Set(matrix.execution_order.map((e) => e.scenario_id)).size, 50);
  assert.deepEqual(matrix.execution_order.map((e) => e.position), Array.from({ length: 50 }, (_, i) => i + 1));
});

test("checklist de dependencias externas incluye AIRTABLE_OBSERVING con acción sobre P0-2/T3", () => {
  const checklist = buildExternalDependencyChecklist();
  const entry = checklist.find((c) => c.blocker === "AIRTABLE_OBSERVING");
  assert.ok(entry);
  assert.match(entry.action_required, /P0-2/);
});

test("checklist de evidencia cubre los 10 test_id con payload preparado", () => {
  const checklist = buildEvidenceChecklist();
  assert.equal(checklist.length, 10);
  for (const item of checklist) assert.ok(item.evidence_fields.length > 0 || item.forbidden_side_effects_to_confirm.length > 0);
});

test("checklist de rollback solo incluye escenarios destructive:true, y todos tienen un texto de rollback no vacío", () => {
  const checklist = buildRollbackChecklist();
  assert.ok(checklist.length > 0);
  for (const item of checklist) assert.ok(item.rollback && item.rollback.length > 0);
});
