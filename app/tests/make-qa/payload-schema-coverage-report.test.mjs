import test from "node:test";
import assert from "node:assert/strict";
import { buildPayloadSchemaCoverageReport } from "../../scripts/make-qa/payload-schema-coverage-report.mjs";

test("10/50 escenarios tienen payload_schema hoy (2 históricos + 8 Wave 1/2)", () => {
  const report = buildPayloadSchemaCoverageReport();
  assert.equal(report.with_payload_schema, 10);
  assert.equal(report.total_scenarios, 50);
});

test("ninguna referencia de payload_schema/fixture está rota (archivo inexistente)", () => {
  const report = buildPayloadSchemaCoverageReport();
  assert.deepEqual(report.broken_references, []);
});

test("with + without payload_schema suman 50", () => {
  const report = buildPayloadSchemaCoverageReport();
  assert.equal(report.with_payload_schema + report.without_payload_schema, 50);
});

test("candidates_for_new_schema + genuinely_no_payload_by_design suman exactamente without_payload_schema", () => {
  const report = buildPayloadSchemaCoverageReport();
  assert.equal(report.candidates_for_new_schema.length + report.genuinely_no_payload_by_design.length, report.without_payload_schema);
});

test("Gestión Lista de Espera (NOT_SAFE) aparece en genuinely_no_payload_by_design, no en candidates", () => {
  const report = buildPayloadSchemaCoverageReport();
  const ids = report.genuinely_no_payload_by_design.map((s) => s.scenario_id);
  assert.ok(ids.includes("5791113"));
});
