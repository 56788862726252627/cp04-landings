import test from "node:test";
import assert from "node:assert/strict";
import { buildDependencyCoverageReport } from "../../scripts/make-qa/dependency-coverage-report.mjs";

test("cubre las 6 dependencias primarias + OTROS, pedidas por esta misión", () => {
  const report = buildDependencyCoverageReport();
  for (const dep of ["AIRTABLE", "GMAIL", "GOOGLE_SHEETS", "STRIPE", "WHATSAPP", "OPENAI", "OTROS"]) {
    assert.ok(report.dependencies[dep], `falta ${dep}`);
  }
});

test("AIRTABLE y GMAIL son las dependencias más extendidas (según el mapeo funcional ya conocido)", () => {
  const report = buildDependencyCoverageReport();
  assert.ok(report.dependencies.GMAIL.total >= 40);
  assert.ok(report.dependencies.AIRTABLE.total >= 35);
});

test("STRIPE tiene exactamente 2 escenarios (Pago Confirmado + Dunning)", () => {
  const report = buildDependencyCoverageReport();
  assert.equal(report.dependencies.STRIPE.total, 2);
});

test("OTROS incluye el detalle por dependencia individual (Calendar/Drive/Telegram/MakeAPI)", () => {
  const report = buildDependencyCoverageReport();
  assert.ok(report.dependencies.OTROS.detail_by_dependency.GOOGLE_CALENDAR.length > 0);
  assert.ok(report.dependencies.OTROS.detail_by_dependency.TELEGRAM.length > 0);
});

test("ningún escenario del manifest queda sin al menos 1 dependencia registrada", () => {
  const report = buildDependencyCoverageReport();
  assert.equal(report.dependencies._sin_dependencias_externas.total, 0);
});
