import test from "node:test";
import assert from "node:assert/strict";
import { buildBusinessCapabilityReport, CAPABILITY_BY_SCENARIO_ID, CAPABILITY_ENUM } from "../../scripts/make-qa/business-capability-report.mjs";
import { loadScenarios } from "../../scripts/make-qa/manifest-loader.mjs";

test("el mapa de capacidades cubre exactamente los 50 scenario_id del manifest, sin huérfanos ni sobrantes", () => {
  const manifestIds = loadScenarios().map((s) => s.scenario_id).sort();
  const mappedIds = Object.keys(CAPABILITY_BY_SCENARIO_ID).sort();
  assert.deepEqual(mappedIds, manifestIds);
});

test("todos los valores del mapa están dentro de CAPABILITY_ENUM", () => {
  for (const capability of Object.values(CAPABILITY_BY_SCENARIO_ID)) {
    assert.ok(CAPABILITY_ENUM.includes(capability), `capacidad desconocida: ${capability}`);
  }
});

test("el informe suma 50 escenarios repartidos entre las 10 capacidades", () => {
  const report = buildBusinessCapabilityReport();
  const total = Object.values(report.capabilities).reduce((sum, c) => sum + c.total, 0);
  assert.equal(total, 50);
  assert.equal(Object.keys(report.capabilities).length, 10);
});

test("RESERVAS incluye el único PASS_VERIFIED real (Generación QR Acceso)", () => {
  const report = buildBusinessCapabilityReport();
  assert.equal(report.capabilities.RESERVAS.pass_verified, 1);
  const ids = report.capabilities.RESERVAS.scenarios.map((s) => s.scenario_id);
  assert.ok(ids.includes("6244975"));
});

test("PAGOS contiene exactamente los 2 escenarios Stripe", () => {
  const report = buildBusinessCapabilityReport();
  assert.equal(report.capabilities.PAGOS.total, 2);
});
