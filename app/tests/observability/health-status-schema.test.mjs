import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateHealthStatus } from "../../scripts/observability/validate-health-status.mjs";
import { validateAgainstSchema } from "../../scripts/observability/schema-validator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HEALTH_SCHEMA = JSON.parse(readFileSync(path.join(__dirname, "../../schemas/observability/health-status.schema.json"), "utf8"));

function baseHealth(overrides = {}) {
  return {
    service: "worker",
    status: "HEALTHY",
    timestamp: "2026-07-08T12:00:00.000Z",
    latency_ms: 10,
    version: "1.0.0",
    checks: [{ name: "process_alive", passed: true, message: null }],
    dependencies: [
      { name: "airtable", status: "HEALTHY", latency_ms: 90, error_code: null, last_success_at: "2026-07-08T11:59:00.000Z", retryable: false },
    ],
    ...overrides,
  };
}

test("un health status bien formado y consistente pasa el contrato completo", () => {
  const result = validateHealthStatus(baseHealth());
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("estado 'status' fuera del enum HEALTHY/DEGRADED/UNHEALTHY/UNKNOWN falla", () => {
  const result = validateHealthStatus(baseHealth({ status: "MOSTLY_FINE" }));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.status"));
});

test("los 4 estados HEALTHY/DEGRADED/UNHEALTHY/UNKNOWN son aceptados a nivel de JSON Schema (con independencia de la regla de consistencia de negocio)", () => {
  for (const status of ["HEALTHY", "DEGRADED", "UNHEALTHY", "UNKNOWN"]) {
    const result = validateAgainstSchema(HEALTH_SCHEMA, baseHealth({ status }));
    assert.equal(result.valid, true, `status=${status} debería cumplir el esquema: ${JSON.stringify(result.errors)}`);
  }
});

test("HEALTHY y UNHEALTHY, montados de forma consistente con sus checks/dependencies, pasan también la regla de negocio completa", () => {
  const healthyResult = validateHealthStatus(baseHealth({ status: "HEALTHY" }));
  assert.equal(healthyResult.valid, true, JSON.stringify(healthyResult.errors));

  const unhealthyResult = validateHealthStatus(
    baseHealth({ status: "UNHEALTHY", checks: [{ name: "process_alive", passed: false, message: "caído" }] })
  );
  assert.equal(unhealthyResult.valid, true, JSON.stringify(unhealthyResult.errors));
});

test("campo obligatorio ausente (dependencies) falla", () => {
  const health = baseHealth();
  delete health.dependencies;
  const result = validateHealthStatus(health);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.dependencies"));
});

test("status declarado no coincide con el agregado real (mentira de consistencia) falla", () => {
  // Todo HEALTHY en checks/dependencies pero el reporte se declara UNHEALTHY.
  const result = validateHealthStatus(baseHealth({ status: "UNHEALTHY" }));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.status" && e.message.includes("no coincide")));
});

test("error_code de una dependencia que no existe en la taxonomía falla", () => {
  const health = baseHealth({
    status: "DEGRADED",
    dependencies: [{ name: "airtable", status: "DEGRADED", latency_ms: 900, error_code: "AIRTABLE_RATE_LIMIT.CODIGO_QUE_NO_EXISTE", last_success_at: null, retryable: true }],
  });
  const result = validateHealthStatus(health);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.message.includes("no existe en error-taxonomy.json")));
});

test("dependencia HEALTHY con error_code no-null es inconsistente y falla", () => {
  const health = baseHealth({
    dependencies: [{ name: "airtable", status: "HEALTHY", latency_ms: 90, error_code: "AIRTABLE_RATE_LIMIT.EXCEEDED", last_success_at: "2026-07-08T11:59:00.000Z", retryable: false }],
  });
  const result = validateHealthStatus(health);
  assert.equal(result.valid, false);
});

test("una fuga de secreto en el mensaje de un check falla (mismo escáner que log-event)", () => {
  const health = baseHealth({
    checks: [{ name: "process_alive", passed: true, message: "token=Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" }],
  });
  const result = validateHealthStatus(health);
  assert.equal(result.valid, false);
});

test("fixture completamente inválido (varios problemas a la vez) reporta más de un error", () => {
  const brokenHealth = {
    service: "no-existe",
    status: "SEMI_OK",
    timestamp: "ayer",
    latency_ms: -5,
    version: "v1",
    checks: "no-es-un-array",
    dependencies: [],
  };
  const result = validateHealthStatus(brokenHealth);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 4, `se esperaban varios errores, hubo ${result.errors.length}`);
});
