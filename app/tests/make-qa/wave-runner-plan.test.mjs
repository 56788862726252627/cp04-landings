import test from "node:test";
import assert from "node:assert/strict";
import { buildWaveRunnerPlan } from "../../scripts/make-qa/wave-runner-plan.mjs";

test("el plan cubre las 8 oleadas (wave_0..wave_6 + unassigned) y suma 50 escenarios", () => {
  const plan = buildWaveRunnerPlan();
  const waves = Object.keys(plan.waves);
  assert.deepEqual(waves, ["wave_0", "wave_1", "wave_2", "wave_3", "wave_4", "wave_5", "wave_6", "unassigned"]);
  const total = waves.reduce((sum, w) => sum + plan.waves[w].total, 0);
  assert.equal(total, 50);
});

test("Wave 0 ya tiene 1 GO (histórico PASS_VERIFIED) y 1 NO_GO_STRUCTURAL (CONFIG_ERROR)", () => {
  const plan = buildWaveRunnerPlan();
  const decisions = plan.waves.wave_0.entries.map((e) => e.preflight_decision).sort();
  assert.deepEqual(decisions, ["GO", "NO_GO_STRUCTURAL"]);
});

test("Wave 1 y Wave 2 (prioridad explícita de esta misión) están todos en GO_PENDING_LIVE_PREFLIGHT_CHECK, ninguno bloqueado de forma permanente", () => {
  const plan = buildWaveRunnerPlan();
  for (const wave of ["wave_1", "wave_2"]) {
    for (const entry of plan.waves[wave].entries) {
      assert.equal(entry.preflight_decision, "GO_PENDING_LIVE_PREFLIGHT_CHECK", `${entry.scenario_name} en ${wave}`);
    }
  }
});

test("Wave 6 (destructivos de alto riesgo) está NO_GO_STRUCTURAL para los 2 escenarios NOT_SAFE", () => {
  const plan = buildWaveRunnerPlan();
  for (const entry of plan.waves.wave_6.entries) {
    assert.equal(entry.preflight_decision, "NO_GO_STRUCTURAL");
  }
});
