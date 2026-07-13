import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateHealthStatus } from "../../../scripts/observability/validate-health-status.mjs";
import {
  CONTRACT_VERSION,
  buildHealthLiveResponse,
  buildHealthReadyResponse,
  buildHealthReadyWithAlertRecommendation,
} from "../../../scripts/observability/health-endpoints.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "../../../fixtures/observability/integration");

function loadFixture(name) {
  return JSON.parse(readFileSync(path.join(FIXTURES_DIR, name), "utf8")).input;
}

test("/health/live: responde 'alive' con timestamp ISO, sin checks ni dependencias (liveness puro)", () => {
  const response = buildHealthLiveResponse(Date.parse("2026-07-09T09:00:00.000Z"));
  assert.deepEqual(response, { status: "alive", timestamp: "2026-07-09T09:00:00.000Z" });
});

test("/health/live: no expone forma de health-status.schema.json completo (sin service/dependencies/checks)", () => {
  const response = buildHealthLiveResponse();
  assert.equal("service" in response, false);
  assert.equal("dependencies" in response, false);
  assert.equal("checks" in response, false);
});

test("/api/support/health/ready: todas las dependencias HEALTHY -> agregado HEALTHY, valida contra health-status.schema.json, recomendación None", () => {
  const input = loadFixture("health-ready-healthy.json");
  const { health, alertRecommendation, criticalIssue } = buildHealthReadyWithAlertRecommendation(input);
  assert.equal(health.status, "HEALTHY");
  assert.equal(health.version, CONTRACT_VERSION);
  assert.equal(criticalIssue, false);
  assert.equal(alertRecommendation, "None");
  const result = validateHealthStatus(health);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("/api/support/health/ready: Airtable DEGRADED con el resto sano -> agregado DEGRADED, nunca HEALTHY ni UNHEALTHY", () => {
  const input = loadFixture("health-ready-degraded-dependency.json");
  const { health, alertRecommendation } = buildHealthReadyWithAlertRecommendation(input);
  assert.equal(health.status, "DEGRADED");
  assert.equal(alertRecommendation, "P1");
  const result = validateHealthStatus(health);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("/api/support/health/ready: dependencia crítica UNHEALTHY -> agregado UNHEALTHY, recomendación P0", () => {
  const input = loadFixture("health-ready-unhealthy-critical.json");
  const { health, alertRecommendation, criticalIssue } = buildHealthReadyWithAlertRecommendation(input);
  assert.equal(health.status, "UNHEALTHY");
  assert.equal(criticalIssue, true);
  assert.equal(alertRecommendation, "P0");
  const result = validateHealthStatus(health);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("/api/support/health/ready: dependencia en timeout (status UNKNOWN, error_code TIMEOUT.UPSTREAM_TIMEOUT) nunca se infiere como HEALTHY -> agregado DEGRADED", () => {
  const input = loadFixture("health-ready-dependency-timeout.json");
  const { health, alertRecommendation } = buildHealthReadyWithAlertRecommendation(input);
  assert.equal(health.status, "DEGRADED");
  assert.equal(health.dependencies.find((d) => d.name === "make").error_code, "TIMEOUT.UPSTREAM_TIMEOUT");
  assert.notEqual(alertRecommendation, "None");
  const result = validateHealthStatus(health);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("/api/support/health/ready: check propio fallido (passed=false) fuerza UNHEALTHY aunque todas las dependencias estén sanas", () => {
  const input = loadFixture("health-ready-healthy.json");
  const { health } = buildHealthReadyWithAlertRecommendation({ ...input, checks: [{ name: "process_alive", passed: false, message: "proceso caído" }] });
  assert.equal(health.status, "UNHEALTHY");
});

test("buildHealthReadyResponse: latency_ms se propaga tal cual, null si no se pasa (nunca 0 inventado)", () => {
  const input = loadFixture("health-ready-healthy.json");
  const health = buildHealthReadyResponse({ ...input, latencyMs: undefined });
  assert.equal(health.latency_ms, null);
});
