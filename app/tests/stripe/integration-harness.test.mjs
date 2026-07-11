// FASE 1 (cierre técnico 2026-07-10) — cobertura directa de
// runStripeWebhookIntegrationHarness() ejercitando las 8 clasificaciones,
// sin pasar por fixtures/CLI (eso ya lo cubre scripts/stripe/sandbox-harness.mjs,
// probado aparte en sandbox-harness.test.mjs). Aquí se construyen los eventos
// mínimos necesarios para forzar cada rama, incluidas las que ningún fixture
// de fixtures/stripe/ ejercita directamente (RETRYABLE_FAILURE,
// PERMANENT_FAILURE por side-effect, PAYMENTS_DISABLED).
import test from "node:test";
import assert from "node:assert/strict";
import { runStripeWebhookIntegrationHarness, HARNESS_CLASSIFICATIONS } from "../../worker-reservas/payments/stripe-integration-harness.js";
import { StripeEventProcessingLockStore } from "../../worker-reservas/payments/stripe-idempotency-lock-store.js";
import { PaymentIdempotencyStore } from "../../worker-reservas/payments/stripe-idempotency.js";
import { createInMemorySideEffects } from "../../worker-reservas/payments/stripe-side-effects.js";
import { signStripeEvent, signRawBody } from "../../worker-reservas/payments/stripe-adapter.mock.js";

const SECRET = "whsec_test_integration_harness_never_real";
const TENANT_ID = "tnt_harness_test";
const ACTIVE_TENANT = Object.freeze({ status: "active" });
const PAYMENTS_ENABLED = Object.freeze({ integrations: { payments: { enabled: true } } });
const PAYMENTS_DISABLED = Object.freeze({ integrations: { payments: { enabled: false } } });

function baseEvent({ id, type, metadataOverrides = {}, dropMetadata = [] } = {}) {
  const metadata = {
    tenant_id: TENANT_ID,
    client_id: "clt_harness_test",
    user_id: "usr_harness_test",
    booking_id: "bkg_harness_0001",
    payment_reference: "payref_harness_0001",
    ...metadataOverrides,
  };
  for (const field of dropMetadata) delete metadata[field];
  return {
    id: id ?? "evt_harness_0001",
    object: "event",
    type: type ?? "checkout.session.completed",
    created: 1_800_000_000,
    livemode: false,
    data: { object: { id: "cs_harness_0001", metadata } },
  };
}

function freshStores() {
  return {
    eventLockStore: new StripeEventProcessingLockStore(),
    businessIdempotencyStore: new PaymentIdempotencyStore(),
    sideEffects: createInMemorySideEffects(),
  };
}

async function runHarness({ event, clientConfig = PAYMENTS_ENABLED, tenantRegistryEntry = ACTIVE_TENANT, stores = freshStores(), expectedUserId = null }) {
  const { header, rawBody } = await signStripeEvent(event, SECRET);
  const result = await runStripeWebhookIntegrationHarness({
    rawBody,
    signatureHeader: header,
    webhookSecret: SECRET,
    expectedTenantId: TENANT_ID,
    expectedUserId,
    tenantRegistryEntry,
    clientConfig,
    eventLockStore: stores.eventLockStore,
    businessIdempotencyStore: stores.businessIdempotencyStore,
    sideEffects: stores.sideEffects,
  });
  return { result, stores };
}

test("HARNESS_CLASSIFICATIONS enumera exactamente los 8 estados pedidos por la misión", () => {
  assert.deepEqual(HARNESS_CLASSIFICATIONS, [
    "PROCESSED",
    "DUPLICATE",
    "RETRYABLE_FAILURE",
    "PERMANENT_FAILURE",
    "INVALID_SIGNATURE",
    "WRONG_TENANT",
    "MISSING_METADATA",
    "PAYMENTS_DISABLED",
  ]);
});

test("PROCESSED: evento válido con side-effects aplicados", async () => {
  const { result, stores } = await runHarness({ event: baseEvent() });
  assert.equal(result.classification, "PROCESSED");
  assert.deepEqual(result.stageTrace, ["signature", "parse", "tenant_resolution", "business_validation", "idempotency_check", "handler", "side_effect", "classification"]);
  assert.deepEqual(stores.sideEffects.calls.map((c) => c.name), ["markBookingPaid", "publishPaymentEvent", "writeAuditEvent"]);
});

test("DUPLICATE: el mismo event.id reenviado tras completarse no vuelve a ejecutar side-effects", async () => {
  const stores = freshStores();
  const event = baseEvent();
  await runHarness({ event, stores });
  const { result } = await runHarness({ event, stores });

  assert.equal(result.classification, "DUPLICATE");
  assert.equal(stores.sideEffects.calls.filter((c) => c.name === "markBookingPaid").length, 1, "el side-effect real solo debe haberse aplicado una vez, no dos");
});

test("RETRYABLE_FAILURE: un fallo transitorio del side-effect se clasifica retryable y libera el lock para reintento", async () => {
  const stores = freshStores();
  stores.sideEffects = createInMemorySideEffects({ simulateFailureFor: { markBookingPaid: "retryable" } });
  const { result } = await runHarness({ event: baseEvent(), stores });

  assert.equal(result.classification, "RETRYABLE_FAILURE");
  assert.equal(await stores.eventLockStore.hasProcessedEvent("evt_harness_0001"), false, "un fallo retryable NUNCA debe dejar el evento como procesado");
});

test("PERMANENT_FAILURE: dato malformado (JSON inválido) se clasifica permanent en la etapa de parseo", async () => {
  const stores = freshStores();
  const rawBody = "{not valid json";
  const { header } = await signRawBody(rawBody, SECRET);

  const result = await runStripeWebhookIntegrationHarness({
    rawBody,
    signatureHeader: header,
    webhookSecret: SECRET,
    expectedTenantId: TENANT_ID,
    tenantRegistryEntry: ACTIVE_TENANT,
    clientConfig: PAYMENTS_ENABLED,
    eventLockStore: stores.eventLockStore,
    businessIdempotencyStore: stores.businessIdempotencyStore,
    sideEffects: stores.sideEffects,
  });

  assert.equal(result.classification, "PERMANENT_FAILURE");
  assert.equal(result.reason, "malformed_payload");
});

test("PERMANENT_FAILURE: fallo de side-effect no recuperable (PermanentSideEffectError) se reclasifica desde failed_retry_safe", async () => {
  const stores = freshStores();
  stores.sideEffects = createInMemorySideEffects({ simulateFailureFor: { markBookingPaid: "permanent" } });
  const { result } = await runHarness({ event: baseEvent(), stores });

  assert.equal(result.classification, "PERMANENT_FAILURE");
});

test("INVALID_SIGNATURE: firma con secreto incorrecto", async () => {
  const event = baseEvent();
  const { rawBody } = await signStripeEvent(event, SECRET);
  const { header: wrongHeader } = await signStripeEvent(event, "whsec_wrong_never_real");

  const stores = freshStores();
  const result = await runStripeWebhookIntegrationHarness({
    rawBody,
    signatureHeader: wrongHeader,
    webhookSecret: SECRET,
    expectedTenantId: TENANT_ID,
    tenantRegistryEntry: ACTIVE_TENANT,
    clientConfig: PAYMENTS_ENABLED,
    eventLockStore: stores.eventLockStore,
    businessIdempotencyStore: stores.businessIdempotencyStore,
    sideEffects: stores.sideEffects,
  });

  assert.equal(result.classification, "INVALID_SIGNATURE");
  assert.equal(result.stageTrace.length, 1, "una firma inválida debe cortar el pipeline en la primera etapa, nunca llegar a parsear el evento");
});

test("WRONG_TENANT: metadata.tenant_id no coincide con expectedTenantId, detalle fino preservado en tenantSafetyResult", async () => {
  const { result } = await runHarness({ event: baseEvent({ metadataOverrides: { tenant_id: "tnt_OTRO" } }) });
  assert.equal(result.classification, "WRONG_TENANT");
  assert.equal(result.tenantSafetyResult, "WRONG_TENANT");
});

test("WRONG_TENANT: wrong user (expectedUserId no coincide) colapsa en el mismo bucket externo con detalle propio", async () => {
  const { result } = await runHarness({ event: baseEvent(), expectedUserId: "usr_esperado_distinto" });
  assert.equal(result.classification, "WRONG_TENANT");
  assert.equal(result.tenantSafetyResult, "WRONG_USER");
});

test("MISSING_METADATA: falta booking_id/payment_reference", async () => {
  const { result } = await runHarness({ event: baseEvent({ dropMetadata: ["booking_id", "payment_reference"] }) });
  assert.equal(result.classification, "MISSING_METADATA");
  assert.deepEqual(result.missing.sort(), ["booking_id", "payment_reference"]);
});

test("PAYMENTS_DISABLED: integrations.payments.enabled no es true — bucket propio, distinto de WRONG_TENANT", async () => {
  const { result } = await runHarness({ event: baseEvent(), clientConfig: PAYMENTS_DISABLED });
  assert.equal(result.classification, "PAYMENTS_DISABLED");
  assert.equal(result.tenantSafetyResult, "PAYMENTS_FEATURE_DISABLED");
});

test("PAYMENTS_DISABLED: se detecta ANTES de ejecutar cualquier side-effect (nunca se marca nada pagado con pagos desactivados)", async () => {
  const { result, stores } = await runHarness({ event: baseEvent(), clientConfig: PAYMENTS_DISABLED });
  assert.equal(result.classification, "PAYMENTS_DISABLED");
  assert.equal(stores.sideEffects.calls.length, 0);
});

test("tenant deshabilitado (status !== active) colapsa en WRONG_TENANT (no tiene bucket propio en los 8 estados pedidos)", async () => {
  const { result } = await runHarness({ event: baseEvent(), tenantRegistryEntry: { status: "disabled" } });
  assert.equal(result.classification, "WRONG_TENANT");
  assert.equal(result.tenantSafetyResult, "TENANT_DISABLED");
});

test("tipo de evento no soportado por el adapter se acusa PROCESSED (2xx) sin side-effect, para detener reintentos inútiles", async () => {
  const { result, stores } = await runHarness({ event: baseEvent({ type: "customer.subscription.updated" }) });
  assert.equal(result.classification, "PROCESSED");
  assert.equal(result.reason, "unsupported_event_type_acknowledged");
  assert.equal(stores.sideEffects.calls.length, 0);
});
