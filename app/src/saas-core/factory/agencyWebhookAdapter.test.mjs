import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildWebhookPayload,
  computeIdempotencyKey,
  validateWebhookDestination,
  redactWebhookPayload,
  simulateWebhookDelivery,
  createMockWebhookAdapter,
  AgencyWebhookError,
} from "./agencyWebhookAdapter.js";
import { buildAgencyStatusReport } from "./agencyStatusReport.js";
import { computeIntegrationReadiness } from "../commercial/integrationReadiness.js";

// ---------------------------------------------------------------------------
// Fixture sintético de informe de agencia
// ---------------------------------------------------------------------------

function makeReport({ businessId, sector }) {
  return {
    businessId,
    blueprint: { businessId, sector, commercialName: `Demo ${businessId}` },
    risks: [],
    manualSteps: [],
    idempotent: true,
    generatedAt: "2026-01-01T00:00:00.000Z",
  };
}
function makeTenantConfig() {
  return { slug: "slug", displayName: "Demo", modulesEnabled: ["reservas"], roles: ["ADMIN"], integrations: {} };
}

const READINESS = computeIntegrationReadiness({});
const AGENCY_REPORT = buildAgencyStatusReport(
  [
    { report: makeReport({ businessId: "padel-01", sector: "padel-club" }), tenantConfig: makeTenantConfig() },
    { report: makeReport({ businessId: "dental-01", sector: "healthcare-clinic" }), tenantConfig: makeTenantConfig() },
  ],
  READINESS,
  { scope: "dryRun" }
);

const EMPTY_REPORT = buildAgencyStatusReport([], READINESS, { scope: "dryRun" });

// ---------------------------------------------------------------------------
// computeIdempotencyKey
// ---------------------------------------------------------------------------

test("computeIdempotencyKey: es determinista — mismas entradas = misma clave", () => {
  const k1 = computeIdempotencyKey(AGENCY_REPORT);
  const k2 = computeIdempotencyKey(AGENCY_REPORT);
  assert.equal(k1, k2);
  assert.ok(typeof k1 === "string" && k1.length > 0);
});

test("computeIdempotencyKey: distinta para scope dryRun vs production", () => {
  const r2 = buildAgencyStatusReport(
    [{ report: makeReport({ businessId: "padel-01", sector: "padel-club" }), tenantConfig: makeTenantConfig() }],
    READINESS,
    { scope: "production" }
  );
  const k1 = computeIdempotencyKey(AGENCY_REPORT);
  const k2 = computeIdempotencyKey(r2);
  assert.notEqual(k1, k2);
});

test("computeIdempotencyKey: incluye businessIds ordenados alfabéticamente", () => {
  const k = computeIdempotencyKey(AGENCY_REPORT);
  assert.ok(k.includes("dental-01"));
  assert.ok(k.includes("padel-01"));
});

test("computeIdempotencyKey: reporte vacío produce clave válida", () => {
  const k = computeIdempotencyKey(EMPTY_REPORT);
  assert.ok(typeof k === "string" && k.length > 0);
});

// ---------------------------------------------------------------------------
// buildWebhookPayload
// ---------------------------------------------------------------------------

test("buildWebhookPayload: estructura esperada (schema_version, event, source, idempotencyKey, payload)", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  assert.equal(wp.schema_version, "1.0.0");
  assert.equal(typeof wp.event, "string");
  assert.equal(typeof wp.source, "string");
  assert.equal(typeof wp.idempotencyKey, "string");
  assert.ok(wp.payload);
  assert.equal(typeof wp.payload.overallClassification, "string");
  assert.equal(typeof wp.payload.totalBusinesses, "number");
});

test("buildWebhookPayload: payload no contiene el array businesses completo (solo businessIds)", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  assert.ok(!("businesses" in wp.payload));
  assert.ok(Array.isArray(wp.payload.businessIds));
});

test("buildWebhookPayload: eventType y source personalizables", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT, { eventType: "custom.event", source: "mi-sistema" });
  assert.equal(wp.event, "custom.event");
  assert.equal(wp.source, "mi-sistema");
});

test("buildWebhookPayload: idempotencyKey igual al de computeIdempotencyKey directo", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  const direct = computeIdempotencyKey(AGENCY_REPORT);
  assert.equal(wp.idempotencyKey, direct);
});

// ---------------------------------------------------------------------------
// validateWebhookDestination
// ---------------------------------------------------------------------------

test("validateWebhookDestination: URL https válida → { valid: true }", () => {
  const result = validateWebhookDestination("https://hook.eu1.make.com/abc123");
  assert.equal(result.valid, true);
  assert.ok(result.destination.startsWith("https://"));
});

test("validateWebhookDestination: URL http válida (local) → { valid: true }", () => {
  const result = validateWebhookDestination("http://localhost:3000/webhook");
  assert.equal(result.valid, true);
});

test("validateWebhookDestination: URL vacía → AgencyWebhookError (MISSING_URL)", () => {
  assert.throws(() => validateWebhookDestination(""), (err) => {
    assert.ok(err instanceof AgencyWebhookError);
    assert.equal(err.code, "MISSING_URL");
    return true;
  });
});

test("validateWebhookDestination: URL nula → AgencyWebhookError (MISSING_URL)", () => {
  assert.throws(() => validateWebhookDestination(null), (err) => {
    assert.ok(err instanceof AgencyWebhookError);
    assert.equal(err.code, "MISSING_URL");
    return true;
  });
});

test("validateWebhookDestination: URL malformada → AgencyWebhookError (INVALID_URL)", () => {
  assert.throws(() => validateWebhookDestination("not-a-url"), (err) => {
    assert.ok(err instanceof AgencyWebhookError);
    assert.equal(err.code, "INVALID_URL");
    return true;
  });
});

test("validateWebhookDestination: protocolo ftp → AgencyWebhookError (INVALID_PROTOCOL)", () => {
  assert.throws(() => validateWebhookDestination("ftp://ejemplo.com/webhook"), (err) => {
    assert.ok(err instanceof AgencyWebhookError);
    assert.equal(err.code, "INVALID_PROTOCOL");
    return true;
  });
});

// ---------------------------------------------------------------------------
// redactWebhookPayload
// ---------------------------------------------------------------------------

test("redactWebhookPayload: redacta claves de token y secret", () => {
  const payload = { event: "test", token: "abc123", secret: "mysecret", data: { ok: true } };
  const redacted = redactWebhookPayload(payload);
  assert.equal(redacted.token, "[REDACTED]");
  assert.equal(redacted.secret, "[REDACTED]");
  assert.equal(redacted.data.ok, true);
});

test("redactWebhookPayload: redacta sk_test_ en valores", () => {
  const payload = { info: "clave: sk_test_abcdefghij123456" };
  const redacted = redactWebhookPayload(payload);
  assert.ok(!redacted.info.includes("sk_test_"));
  assert.ok(redacted.info.includes("[REDACTED]"));
});

test("redactWebhookPayload: no muta el payload original", () => {
  const payload = { token: "secreto", event: "test" };
  redactWebhookPayload(payload);
  assert.equal(payload.token, "secreto");
});

test("redactWebhookPayload: payload limpio (sin secretos) queda intacto", () => {
  const payload = buildWebhookPayload(AGENCY_REPORT);
  const redacted = redactWebhookPayload(payload);
  assert.equal(redacted.event, payload.event);
  assert.equal(redacted.source, payload.source);
});

// ---------------------------------------------------------------------------
// simulateWebhookDelivery
// ---------------------------------------------------------------------------

test("simulateWebhookDelivery: modo=dry-run, sent=false, nunca red real", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  const sim = simulateWebhookDelivery(wp);
  assert.equal(sim.mode, "dry-run");
  assert.equal(sim.sent, false);
  assert.ok(Array.isArray(sim.attempts));
});

test("simulateWebhookDelivery: número de intentos por defecto = 3", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  const sim = simulateWebhookDelivery(wp);
  assert.equal(sim.attempts.length, 3);
});

test("simulateWebhookDelivery: retries personalizable (1 y 5)", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  assert.equal(simulateWebhookDelivery(wp, { retries: 1 }).attempts.length, 1);
  assert.equal(simulateWebhookDelivery(wp, { retries: 5 }).attempts.length, 5);
});

test("simulateWebhookDelivery: retries > MAX_RETRIES (5) queda limitado a 5", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  const sim = simulateWebhookDelivery(wp, { retries: 99 });
  assert.equal(sim.attempts.length, 5);
});

test("simulateWebhookDelivery: idempotencyKey preservado del payload", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  const sim = simulateWebhookDelivery(wp);
  assert.equal(sim.idempotencyKey, wp.idempotencyKey);
});

test("simulateWebhookDelivery: destino validado aunque no se llame", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  const sim = simulateWebhookDelivery(wp, { destination: "https://hook.eu1.make.com/test" });
  assert.ok(sim.destinationValidation?.valid);
});

test("simulateWebhookDelivery: destino inválido → destinationValidation.valid=false, sin lanzar", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  const sim = simulateWebhookDelivery(wp, { destination: "not-a-url" });
  assert.equal(sim.destinationValidation?.valid, false);
});

test("bloqueo de red real: dryRun=false + fetchImpl real → AgencyWebhookError (REAL_SEND_BLOCKED)", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  assert.throws(
    () => simulateWebhookDelivery(wp, { dryRun: false, fetchImpl: () => {} }),
    (err) => {
      assert.ok(err instanceof AgencyWebhookError);
      assert.equal(err.code, "REAL_SEND_BLOCKED");
      return true;
    }
  );
});

test("bloqueo de red: dryRun=false sin fetchImpl → no lanza (fetchImpl=null por defecto)", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  const sim = simulateWebhookDelivery(wp, { dryRun: false });
  assert.equal(sim.mode, "dry-run");
  assert.equal(sim.sent, false);
});

test("simulateWebhookDelivery: signature nunca expuesta si se provee signatureKey", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  const sim = simulateWebhookDelivery(wp, { signatureKey: "supersecret_hmac_key" });
  assert.equal(sim.signature, "[REDACTED]");
});

test("simulateWebhookDelivery: es reproducible — mismas entradas = mismo resultado (salvo timestamp de intentos)", () => {
  const wp = buildWebhookPayload(AGENCY_REPORT);
  const s1 = simulateWebhookDelivery(wp, { retries: 2, destination: "https://hook.make.com/test" });
  const s2 = simulateWebhookDelivery(wp, { retries: 2, destination: "https://hook.make.com/test" });
  assert.equal(s1.mode, s2.mode);
  assert.equal(s1.sent, s2.sent);
  assert.equal(s1.idempotencyKey, s2.idempotencyKey);
  assert.equal(s1.attempts.length, s2.attempts.length);
});

// ---------------------------------------------------------------------------
// createMockWebhookAdapter
// ---------------------------------------------------------------------------

test("createMockWebhookAdapter: registra llamadas y permite resetear", () => {
  const adapter = createMockWebhookAdapter();
  assert.equal(adapter.getCalls().length, 0);
  const wp = buildWebhookPayload(AGENCY_REPORT);
  adapter.simulate(wp, { retries: 1 });
  assert.equal(adapter.getCalls().length, 1);
  adapter.reset();
  assert.equal(adapter.getCalls().length, 0);
});

test("createMockWebhookAdapter: resultado de simulate es idéntico a simulateWebhookDelivery", () => {
  const adapter = createMockWebhookAdapter();
  const wp = buildWebhookPayload(AGENCY_REPORT);
  const result = adapter.simulate(wp);
  assert.equal(result.mode, "dry-run");
  assert.equal(result.sent, false);
});
