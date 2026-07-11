import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateHealthStatus } from "../../scripts/observability/validate-health-status.mjs";
import { deriveAlertRecommendation } from "../../scripts/observability/service-model.mjs";
import { filterSamplesInWindow, computeErrorBudget, WINDOWS_MS } from "../../scripts/observability/slo-calculator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures/health");

function loadFixtures() {
  return readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => ({ file: f, data: JSON.parse(readFileSync(path.join(FIXTURES_DIR, f), "utf8")) }));
}

test("las 8 fixtures de health existen", () => {
  assert.equal(loadFixtures().length, 8);
});

test("las 8 fixtures pasan el contrato de health status completo", () => {
  for (const { file, data } of loadFixtures()) {
    const result = validateHealthStatus(data.health);
    assert.equal(result.valid, true, `${file} debería ser válido: ${JSON.stringify(result.errors)}`);
  }
});

// Distribución de severidad esperada, sanity-checkeada manualmente antes de escribir este test
// (ver audit/observability/12_HEALTH_CONTRACT_AND_SLO_ENGINE.md, tabla de fixtures).
const EXPECTED_ALERTS = {
  "01-sistema-sano.json": "None",
  "02-airtable-degradado.json": "P1",
  "03-make-fallando.json": "P0",
  "04-auth-caido.json": "P0",
  "05-worker-5xx-alto.json": "P0",
  "06-latencia-alta.json": "P2",
  "07-error-budget-agotado.json": "P0",
  "08-dependencia-unknown.json": "P1",
};

test("cada fixture produce la severidad de alerta esperada combinando estado + error budget", () => {
  for (const { file, data } of loadFixtures()) {
    const now = Date.parse(data.now);
    const windowSamples = filterSamplesInWindow(data.samples, now, WINDOWS_MS["5m"], "worker");
    const budget = computeErrorBudget(windowSamples, data.slo_target_example);
    const alert = deriveAlertRecommendation({
      overallStatus: data.health.status,
      dependencies: data.health.dependencies,
      burnRate: budget.burnRate,
      budgetRemainingRatio: budget.budgetRemainingRatio,
    });
    assert.equal(alert, EXPECTED_ALERTS[file], `${file}: se esperaba ${EXPECTED_ALERTS[file]}, salió ${alert}`);
  }
});

test("el escenario 'make-fallando' tiene make en UNHEALTHY con retryable=true", () => {
  const { data } = loadFixtures().find((f) => f.file === "03-make-fallando.json");
  const make = data.health.dependencies.find((d) => d.name === "make");
  assert.equal(make.status, "UNHEALTHY");
  assert.equal(make.retryable, true);
});

test("el escenario 'auth-caido' tiene supabase-auth en UNHEALTHY (dependencia crítica)", () => {
  const { data } = loadFixtures().find((f) => f.file === "04-auth-caido.json");
  const auth = data.health.dependencies.find((d) => d.name === "supabase-auth");
  assert.equal(auth.status, "UNHEALTHY");
});

test("el escenario 'dependencia-unknown' tiene exactamente una dependencia UNKNOWN y ninguna UNHEALTHY", () => {
  const { data } = loadFixtures().find((f) => f.file === "08-dependencia-unknown.json");
  const statuses = data.health.dependencies.map((d) => d.status);
  assert.equal(statuses.filter((s) => s === "UNKNOWN").length, 1);
  assert.equal(statuses.filter((s) => s === "UNHEALTHY").length, 0);
});

test("stripe y whatsapp no aparecen como dependencia en ninguna fixture (no simular integraciones que no existen)", () => {
  for (const { file, data } of loadFixtures()) {
    const names = data.health.dependencies.map((d) => d.name);
    assert.ok(!names.includes("stripe"), `${file} no debería listar stripe como dependencia`);
    assert.ok(!names.includes("whatsapp"), `${file} no debería listar whatsapp como dependencia`);
  }
});
