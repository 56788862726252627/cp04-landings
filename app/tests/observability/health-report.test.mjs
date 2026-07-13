import test from "node:test";
import assert from "node:assert/strict";
import { generateReport } from "../../scripts/observability/health-report.mjs";

test("el reporte incluye las 3 secciones pedidas en el orden pedido", () => {
  const report = generateReport();
  const idxSummary = report.indexOf("=== HEALTH SUMMARY ===");
  const idxSlo = report.indexOf("=== SLO ===");
  const idxAlert = report.indexOf("=== ALERT RECOMMENDATION ===");
  assert.ok(idxSummary !== -1 && idxSlo !== -1 && idxAlert !== -1);
  assert.ok(idxSummary < idxSlo && idxSlo < idxAlert);
});

test("el reporte no envía nada — es texto local, y lo declara explícitamente", () => {
  const report = generateReport();
  assert.ok(report.includes("No se ha enviado ninguna alerta real"));
});

test("el reporte clasifica el escenario 'make-fallando' en P0 y 'sistema-sano' en None", () => {
  const report = generateReport();
  const alertSection = report.slice(report.indexOf("=== ALERT RECOMMENDATION ==="));
  const p0Line = alertSection.split("\n").find((l) => l.startsWith("P0:"));
  const noneLine = alertSection.split("\n").find((l) => l.startsWith("None:"));
  assert.ok(p0Line.includes("make-fallando"));
  assert.ok(noneLine.includes("sistema-sano"));
});

test("el reporte nunca escribe 'undefined' (todo campo sin dato usa un texto explícito)", () => {
  const report = generateReport();
  assert.ok(!report.includes("undefined"));
});
