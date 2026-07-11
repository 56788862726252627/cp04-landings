import test from "node:test";
import assert from "node:assert/strict";
import {
  checkHealthLive,
  checkHealthReady,
  checkManifestPwaLocal,
  checkRoleRouteVisibility,
  checkMakeWebhookReachabilityContract,
  checkDependencyStatus,
  checkBookingEndpointContract,
  runAllSmokeChecks,
} from "../../scripts/release/smoke-tests.mjs";
import { validateAgainstSchema } from "../../src/config/schemaValidator.js";

function fakeFetch(responses) {
  return async (url) => {
    for (const [suffix, status] of Object.entries(responses)) {
      if (url.endsWith(suffix)) return { status };
    }
    return { status: 404 };
  };
}

test("smoke /health/live: HTTP 200 -> PASS", async () => {
  const result = await checkHealthLive({ baseUrl: "https://x.test", fetchImpl: fakeFetch({ "/health/live": 200 }) });
  assert.equal(result.status, "PASS");
});

test("smoke /health/live: HTTP 500 -> FAIL", async () => {
  const result = await checkHealthLive({ baseUrl: "https://x.test", fetchImpl: fakeFetch({ "/health/live": 500 }) });
  assert.equal(result.status, "FAIL");
});

test("smoke /api/support/health/ready sin auth: 401 es el resultado ESPERADO (fail-closed) -> PASS", async () => {
  const result = await checkHealthReady({ baseUrl: "https://x.test", fetchImpl: fakeFetch({ "/api/support/health/ready": 401 }) });
  assert.equal(result.status, "PASS");
});

test("smoke /api/support/health/ready sin auth: HTTP 200 (fuga fail-open) -> FAIL, nunca aceptable", async () => {
  const result = await checkHealthReady({ baseUrl: "https://x.test", fetchImpl: fakeFetch({ "/api/support/health/ready": 200 }) });
  assert.equal(result.status, "FAIL");
});

test("smoke manifest/PWA: manifest.webmanifest real del repo tiene los campos mínimos", () => {
  const result = checkManifestPwaLocal();
  assert.equal(result.status, "PASS", result.summary);
});

test("smoke role route visibility: resolvedConfig con roles/features válidos resuelve capabilities para todos los roles activos", () => {
  const resolvedConfig = { roles: ["ADMIN", "PLAYER"], features: { reservas: true, cancelaciones: true, reprogramaciones: true, torneos: true, ranking: true, soporte: true } };
  const result = checkRoleRouteVisibility({ resolvedConfig });
  assert.equal(result.status, "PASS");
});

test("smoke role route visibility: un rol activo sin ninguna capability visible (features desactivadas) -> WARN, no PASS silencioso", () => {
  const resolvedConfig = { roles: ["ADMIN", "PLAYER"], features: { torneos: true, ranking: true, soporte: true } };
  const result = checkRoleRouteVisibility({ resolvedConfig });
  assert.equal(result.status, "WARN");
  assert.ok(result.summary.includes("PLAYER"));
});

test("smoke Make webhook reachability contract: env var presente -> PASS, nunca se llama a Make real", () => {
  const result = checkMakeWebhookReachabilityContract({ env: { MAKE_RESERVAS_WEBHOOK: "https://hook.make.com/xyz" } });
  assert.equal(result.status, "PASS");
});

test("smoke Make webhook reachability contract: env var ausente -> WARN, no bloqueante", () => {
  const result = checkMakeWebhookReachabilityContract({ env: {} });
  assert.equal(result.status, "WARN");
});

test("smoke dependency status: dependency-status.json real de hoy reporta WARN (hay degradaciones conocidas)", async () => {
  const fs = await import("node:fs");
  const dependencyStatus = JSON.parse(fs.readFileSync("fixtures/make-qa/dependency-status.json", "utf8"));
  const result = checkDependencyStatus({ dependencyStatus });
  assert.equal(result.status, "WARN");
});

test("smoke booking endpoint contract: payload sintético válido contra el schema real -> PASS, sin POST real", async () => {
  const fs = await import("node:fs");
  const schema = JSON.parse(fs.readFileSync("schemas/make-qa/payload-api-reservas-crear.schema.json", "utf8"));
  // Payload mínimo construido a partir de 'required' del propio schema, sin inventar campos fuera de él.
  const samplePayload = buildMinimalSampleFromSchema(schema);
  const result = checkBookingEndpointContract({ validateAgainstSchema, samplePayload, schema });
  assert.equal(result.status, "PASS", result.summary);
});

function buildMinimalSampleFromSchema(schema) {
  const out = {};
  for (const key of schema.required ?? []) {
    const prop = schema.properties?.[key];
    out[key] = sampleForProp(prop);
  }
  return out;
}

function sampleForProp(prop) {
  if (!prop) return null;
  if (prop.const !== undefined) return prop.const;
  if (prop.enum) return prop.enum[0];
  if (prop.pattern) return patternSample(prop.pattern, prop);
  const type = Array.isArray(prop.type) ? prop.type[0] : prop.type;
  if (type === "string") return "x".repeat(prop.minLength ?? 3);
  if (type === "integer" || type === "number") return prop.minimum ?? 1;
  if (type === "boolean") return true;
  if (type === "object") return buildMinimalSampleFromSchema(prop);
  if (type === "array") return [];
  return null;
}

function patternSample(pattern) {
  // Solo cubre los patrones reales usados en payload-api-reservas-crear.schema.json — no un generador genérico de regex.
  if (pattern.includes("{4}")) return "2026-07-09";
  if (pattern.includes("@")) return "qa.jugador@example.com";
  if (pattern.includes(":")) return "10:00";
  if (pattern.startsWith("^QA_CP04")) return "QA_CP04_test";
  if (pattern.startsWith("^QA_")) return "QA_test_pista_1";
  return "valor-sintetico-001";
}
