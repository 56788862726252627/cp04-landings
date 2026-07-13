// FASE 5 (cierre técnico 2026-07-10) — cobertura de los 6 resultados de
// checkTenantSafety() (worker-reservas/payments/stripe-tenant-safety.js).
// Referenciado por el propio módulo desde su creación; no existía todavía.
import test from "node:test";
import assert from "node:assert/strict";
import { checkTenantSafety, TENANT_SAFETY_RESULTS } from "../../worker-reservas/payments/stripe-tenant-safety.js";

const ACTIVE_TENANT = Object.freeze({ status: "active" });
const PAYMENTS_ENABLED_CONFIG = Object.freeze({ integrations: { payments: { enabled: true } } });
const PAYMENTS_DISABLED_CONFIG = Object.freeze({ integrations: { payments: { enabled: false } } });

test("TENANT_SAFETY_RESULTS enumera exactamente los 6 resultados pedidos", () => {
  assert.deepEqual(TENANT_SAFETY_RESULTS, [
    "TENANT_OK",
    "WRONG_TENANT",
    "MISSING_TENANT",
    "TENANT_DISABLED",
    "PAYMENTS_FEATURE_DISABLED",
    "CROSS_TENANT_METADATA_MISMATCH",
  ]);
});

test("correct tenant: todos los checks pasan -> TENANT_OK", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_a", client_id: "clt_a" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: ACTIVE_TENANT,
    clientConfig: PAYMENTS_ENABLED_CONFIG,
  });
  assert.equal(outcome.result, "TENANT_OK");
});

test("wrong tenant: metadata.tenant_id no coincide con expectedTenantId -> WRONG_TENANT", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_OTRO" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: ACTIVE_TENANT,
    clientConfig: PAYMENTS_ENABLED_CONFIG,
  });
  assert.equal(outcome.result, "WRONG_TENANT");
});

test("missing tenant: metadata sin tenant_id -> MISSING_TENANT", () => {
  const outcome = checkTenantSafety({
    metadata: {},
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: ACTIVE_TENANT,
    clientConfig: PAYMENTS_ENABLED_CONFIG,
  });
  assert.equal(outcome.result, "MISSING_TENANT");
});

test("missing tenant: expectedTenantId sin resolver (endpoint no supo a qué tenant pertenece) -> MISSING_TENANT", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_a" },
    expectedTenantId: null,
    tenantRegistryEntry: null,
    clientConfig: PAYMENTS_ENABLED_CONFIG,
  });
  assert.equal(outcome.result, "MISSING_TENANT");
});

test("missing tenant: expectedTenantId resuelto pero sin entrada en tenant-registry -> MISSING_TENANT", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_a" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: null,
    clientConfig: PAYMENTS_ENABLED_CONFIG,
  });
  assert.equal(outcome.result, "MISSING_TENANT");
});

test("disabled tenant: status distinto de active -> TENANT_DISABLED (staging)", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_a" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: { status: "staging" },
    clientConfig: PAYMENTS_ENABLED_CONFIG,
  });
  assert.equal(outcome.result, "TENANT_DISABLED");
});

test("disabled tenant: status maintenance -> TENANT_DISABLED", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_a" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: { status: "maintenance" },
    clientConfig: PAYMENTS_ENABLED_CONFIG,
  });
  assert.equal(outcome.result, "TENANT_DISABLED");
});

test("disabled tenant: status disabled -> TENANT_DISABLED", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_a" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: { status: "disabled" },
    clientConfig: PAYMENTS_ENABLED_CONFIG,
  });
  assert.equal(outcome.result, "TENANT_DISABLED");
});

test("payments disabled: integrations.payments.enabled !== true -> PAYMENTS_FEATURE_DISABLED", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_a" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: ACTIVE_TENANT,
    clientConfig: PAYMENTS_DISABLED_CONFIG,
  });
  assert.equal(outcome.result, "PAYMENTS_FEATURE_DISABLED");
});

test("payments disabled: clientConfig ausente por completo -> PAYMENTS_FEATURE_DISABLED (default seguro, nunca permisivo)", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_a" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: ACTIVE_TENANT,
    clientConfig: null,
  });
  assert.equal(outcome.result, "PAYMENTS_FEATURE_DISABLED");
});

test("cross-tenant metadata mismatch: client_id no pertenece al tenant_id según el registro -> CROSS_TENANT_METADATA_MISMATCH", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_a", client_id: "clt_de_OTRO_tenant" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: ACTIVE_TENANT,
    clientConfig: PAYMENTS_ENABLED_CONFIG,
    isClientOfTenant: (tenantId, clientId) => !clientId.includes("OTRO"),
  });
  assert.equal(outcome.result, "CROSS_TENANT_METADATA_MISMATCH");
});

test("cross-tenant metadata mismatch: sin isClientOfTenant inyectado, el default permisivo no bloquea (mono-tenant hoy, documentado en el módulo)", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_a", client_id: "clt_cualquiera" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: ACTIVE_TENANT,
    clientConfig: PAYMENTS_ENABLED_CONFIG,
  });
  assert.equal(outcome.result, "TENANT_OK");
});

test("sin client_id en metadata, el check cross-tenant se omite -> TENANT_OK", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_a" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: ACTIVE_TENANT,
    clientConfig: PAYMENTS_ENABLED_CONFIG,
    isClientOfTenant: () => {
      throw new Error("no debería llamarse sin client_id");
    },
  });
  assert.equal(outcome.result, "TENANT_OK");
});

test("orden de precedencia: wrong tenant se detecta ANTES que tenant disabled (metadata incorrecta no debe filtrar el status del tenant real)", () => {
  const outcome = checkTenantSafety({
    metadata: { tenant_id: "tnt_OTRO" },
    expectedTenantId: "tnt_a",
    tenantRegistryEntry: { status: "disabled" },
    clientConfig: PAYMENTS_ENABLED_CONFIG,
  });
  assert.equal(outcome.result, "WRONG_TENANT");
});
