import test from "node:test";
import assert from "node:assert/strict";
import { buildReadinessAggregateReport } from "../../scripts/make-qa/readiness-aggregate-report.mjs";

test("el reporte agregado incluye las 5 dimensiones pedidas: rol, dependencia, riesgo, oleada, capacidad de negocio", () => {
  const report = buildReadinessAggregateReport();
  for (const key of ["by_role", "by_dependency", "by_risk", "by_wave", "by_business_capability"]) {
    assert.ok(report[key], `falta la dimensión ${key}`);
  }
});

test("by_risk suma 50 escenarios entre low/medium/high", () => {
  const report = buildReadinessAggregateReport();
  const total = Object.values(report.by_risk).reduce((sum, r) => sum + r.total, 0);
  assert.equal(total, 50);
});

test("by_risk 'high' incluye los 2 NOT_SAFE en su distribución de release gate", () => {
  const report = buildReadinessAggregateReport();
  assert.equal(report.by_risk.high.by_release_gate.NOT_SAFE, 2);
});

test("by_wave suma 50 escenarios entre las 8 oleadas (wave_0..wave_6 + unassigned)", () => {
  const report = buildReadinessAggregateReport();
  const total = Object.values(report.by_wave).reduce((sum, w) => sum + w.total, 0);
  assert.equal(total, 50);
  assert.equal(Object.keys(report.by_wave).length, 8);
});

test("by_wave wave_0 tiene el único PASS entre sus 2 escenarios", () => {
  const report = buildReadinessAggregateReport();
  assert.equal(report.by_wave.wave_0.by_release_gate.PASS, 1);
  assert.equal(report.by_wave.wave_0.total, 2);
});

test("total_scenarios coincide con el manifest (50) en el nivel superior del reporte", () => {
  const report = buildReadinessAggregateReport();
  assert.equal(report.total_scenarios, 50);
});
