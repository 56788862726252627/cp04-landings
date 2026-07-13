import test from "node:test";
import assert from "node:assert/strict";
import { generateEvidenceTemplate, checkEvidenceCompleteness } from "../../scripts/make-qa/evidence-manifest-generator.mjs";

test("genera una plantilla con un placeholder por cada evidence_required y forbidden_side_effect", () => {
  const template = generateEvidenceTemplate({ testId: "QA-A3-001" });
  assert.equal(Object.keys(template.evidence).length, 2); // execution_id, record_id del log creado
  assert.equal(template.forbidden_side_effects_check.length, 1);
  assert.equal(template.execution_id, null);
});

test("plantilla recién generada está INCOMPLETA", () => {
  const template = generateEvidenceTemplate({ testId: "QA-A3-001" });
  const result = checkEvidenceCompleteness(template);
  assert.equal(result.complete, false);
  assert.ok(result.missing.length > 0);
});

test("plantilla completamente rellenada (incl. forbidden_side_effects_check en false) está COMPLETA", () => {
  const template = generateEvidenceTemplate({ testId: "QA-A3-001" });
  template.execution_id = "exec_test_123";
  template.executed_at = "2026-07-09T00:00:00.000Z";
  template.real_execution_status = "SUCCESS";
  for (const key of Object.keys(template.evidence)) template.evidence[key].value = "capturado";
  for (const c of template.forbidden_side_effects_check) c.observed = false;

  const result = checkEvidenceCompleteness(template);
  assert.equal(result.complete, true, JSON.stringify(result.missing));
});

test("forbidden_side_effects_check con observed=null (nunca confirmado) cuenta como incompleto, no como 'no ocurrió'", () => {
  const template = generateEvidenceTemplate({ testId: "QA-A3-001" });
  template.execution_id = "exec_test_123";
  template.real_execution_status = "SUCCESS";
  for (const key of Object.keys(template.evidence)) template.evidence[key].value = "capturado";
  // forbidden_side_effects_check queda sin tocar (observed: null)

  const result = checkEvidenceCompleteness(template);
  assert.equal(result.complete, false);
  assert.ok(result.missing.some((m) => m.includes("forbidden_side_effects_check")));
});

test("escenario sin test_id (ej. sin payload preparado) puede generar plantilla igualmente por scenario_id", () => {
  const template = generateEvidenceTemplate({ scenarioId: "6244975" });
  assert.equal(template.scenario_id, "6244975");
});
