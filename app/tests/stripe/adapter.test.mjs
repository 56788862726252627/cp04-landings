import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  signStripeEvent,
  verifyWebhookSignature,
  mapPaymentStatus,
  validateEventMetadata,
  idempotencyKey,
  StripeEventDedupStore,
  duplicateEventProtection,
  MockStripeCheckoutStore,
  handleWebhookEvent,
} from "../../worker-reservas/payments/stripe-adapter.mock.js";
import { PAYMENT_STATUS } from "../../worker-reservas/payments/stripe-contract.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");
const FIXTURES = path.join(APP_ROOT, "fixtures/stripe");
const TEST_SECRET = "whsec_test_qacp04_never_real";
const WRONG_SECRET = "whsec_test_wrong_secret_never_real";

function loadRaw(name) {
  return readFileSync(path.join(FIXTURES, name), "utf8");
}

function load(name) {
  const { _why, ...fixture } = JSON.parse(loadRaw(name));
  return fixture;
}

// --- mapPaymentStatus -------------------------------------------------

test("mapPaymentStatus mapea cada tipo de evento soportado a su PAYMENT_STATUS", () => {
  assert.equal(mapPaymentStatus("checkout.session.completed"), PAYMENT_STATUS.PAID);
  assert.equal(mapPaymentStatus("checkout.session.expired"), PAYMENT_STATUS.EXPIRED);
  assert.equal(mapPaymentStatus("payment_intent.succeeded"), PAYMENT_STATUS.PAID);
  assert.equal(mapPaymentStatus("payment_intent.payment_failed"), PAYMENT_STATUS.FAILED);
  assert.equal(mapPaymentStatus("charge.refunded"), PAYMENT_STATUS.REFUNDED);
});

test("mapPaymentStatus devuelve null para un tipo de evento no soportado por este adapter", () => {
  assert.equal(mapPaymentStatus("customer.subscription.deleted"), null);
});

// --- validateEventMetadata ---------------------------------------------

test("validateEventMetadata acepta metadata completa", () => {
  const result = validateEventMetadata(load("01-checkout-session-completed.json"));
  assert.equal(result.valid, true);
  assert.deepEqual(result.missing, []);
});

test("validateEventMetadata reporta los campos concretos que faltan", () => {
  const result = validateEventMetadata(load("08-missing-metadata.json"));
  assert.equal(result.valid, false);
  assert.deepEqual(result.missing.sort(), ["booking_id", "payment_reference"]);
});

// --- idempotencyKey -------------------------------------------------------

test("idempotencyKey es determinista para los mismos tenant/booking/payment_reference", () => {
  const params = { tenantId: "tnt_a", bookingId: "bkg_1", paymentReference: "payref_1" };
  assert.equal(idempotencyKey(params), idempotencyKey({ ...params }));
});

test("idempotencyKey cambia si cambia cualquiera de los tres campos", () => {
  const base = idempotencyKey({ tenantId: "tnt_a", bookingId: "bkg_1", paymentReference: "payref_1" });
  assert.notEqual(base, idempotencyKey({ tenantId: "tnt_b", bookingId: "bkg_1", paymentReference: "payref_1" }));
  assert.notEqual(base, idempotencyKey({ tenantId: "tnt_a", bookingId: "bkg_2", paymentReference: "payref_1" }));
  assert.notEqual(base, idempotencyKey({ tenantId: "tnt_a", bookingId: "bkg_1", paymentReference: "payref_2" }));
});

test("idempotencyKey exige los tres campos", () => {
  assert.throws(() => idempotencyKey({ tenantId: "tnt_a", bookingId: "bkg_1" }));
});

// --- firma / replay -----------------------------------------------------

test("firma válida generada con el secreto correcto se verifica OK", async () => {
  const event = load("01-checkout-session-completed.json");
  const { header, rawBody } = await signStripeEvent(event, TEST_SECRET);
  const result = await verifyWebhookSignature(rawBody, header, TEST_SECRET);
  assert.equal(result.valid, true);
});

test("invalid signature: secreto incorrecto es rechazado (signature_mismatch)", async () => {
  const event = load("11-invalid-signature-source-event.json");
  const { header, rawBody } = await signStripeEvent(event, TEST_SECRET);
  const result = await verifyWebhookSignature(rawBody, header, WRONG_SECRET);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "signature_mismatch");
});

test("invalid signature: cabecera malformada se rechaza sin lanzar excepción", async () => {
  const result = await verifyWebhookSignature("{}", "esto-no-es-una-firma-valida", TEST_SECRET);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "malformed_signature_header");
});

test("body alterado tras firmar invalida la firma (protección de integridad)", async () => {
  const event = load("01-checkout-session-completed.json");
  const { header, rawBody } = await signStripeEvent(event, TEST_SECRET);
  const tamperedBody = rawBody.replace("bkg_qacp04_0001", "bkg_qacp04_ROBADA");
  const result = await verifyWebhookSignature(tamperedBody, header, TEST_SECRET);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "signature_mismatch");
});

test("replay: firma válida pero timestamp fuera de tolerancia se rechaza", async () => {
  const fixture = JSON.parse(loadRaw("07-replay-old-timestamp.json"));
  const oldTimestamp = Math.floor(Date.now() / 1000) + fixture.replay_timestamp_offset_seconds - 3600;
  const { header, rawBody } = await signStripeEvent(fixture.event, TEST_SECRET, oldTimestamp);
  const result = await verifyWebhookSignature(rawBody, header, TEST_SECRET);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "timestamp_outside_tolerance_possible_replay");
});

// --- dedup / duplicate event protection ----------------------------------

test("duplicateEventProtection: primera vez no es duplicado, segunda vez sí", () => {
  const store = new StripeEventDedupStore();
  assert.equal(duplicateEventProtection("evt_x", store), false);
  assert.equal(duplicateEventProtection("evt_x", store), true);
  assert.equal(store.processedCount, 1);
});

// --- handleWebhookEvent (orquestación end-to-end) ------------------------

async function signedRequest(fixtureName, timestamp) {
  const event = load(fixtureName);
  const { header, rawBody } = await signStripeEvent(event, TEST_SECRET, timestamp);
  return { header, rawBody, event };
}

test("handleWebhookEvent: caso feliz -> action:'process' con status PAID e idempotencyKey", async () => {
  const { header, rawBody } = await signedRequest("01-checkout-session-completed.json");
  const result = await handleWebhookEvent(rawBody, header, { webhookSecret: TEST_SECRET });
  assert.equal(result.action, "process");
  assert.equal(result.status, PAYMENT_STATUS.PAID);
  assert.equal(result.tenantId, "tnt_qacp04_test");
  assert.equal(result.idempotencyKey, "stripe:tnt_qacp04_test:bkg_qacp04_0001:payref_qacp04_0001");
});

test("handleWebhookEvent: firma inválida -> reject/signature_mismatch, nunca se llega a parsear metadata", async () => {
  const { rawBody } = await signedRequest("01-checkout-session-completed.json");
  const result = await handleWebhookEvent(rawBody, "t=1,v1=deadbeef", { webhookSecret: TEST_SECRET });
  assert.equal(result.action, "reject");
  assert.equal(result.reason, "signature_mismatch");
});

async function signRawBody(rawBody, secret, timestamp = Math.floor(Date.now() / 1000)) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  const signature = [...new Uint8Array(signatureBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `t=${timestamp},v1=${signature}`;
}

test("handleWebhookEvent: payload malformado (JSON inválido, con firma válida sobre ese mismo cuerpo) -> reject/malformed_payload", async () => {
  const rawBody = loadRaw("12-malformed-payload.raw.txt");
  const header = await signRawBody(rawBody, TEST_SECRET);
  const result = await handleWebhookEvent(rawBody, header, { webhookSecret: TEST_SECRET });
  assert.equal(result.action, "reject");
  assert.equal(result.reason, "malformed_payload");
});

test("handleWebhookEvent: metadata incompleta -> reject/missing_metadata con campos concretos", async () => {
  const { header, rawBody } = await signedRequest("08-missing-metadata.json");
  const result = await handleWebhookEvent(rawBody, header, { webhookSecret: TEST_SECRET });
  assert.equal(result.action, "reject");
  assert.equal(result.reason, "missing_metadata");
  assert.deepEqual(result.missing.sort(), ["booking_id", "payment_reference"]);
});

test("handleWebhookEvent: wrong_tenant -> reject cuando expectedTenantId no coincide", async () => {
  const { header, rawBody } = await signedRequest("09-wrong-tenant.json");
  const result = await handleWebhookEvent(rawBody, header, { webhookSecret: TEST_SECRET, expectedTenantId: "tnt_qacp04_test" });
  assert.equal(result.action, "reject");
  assert.equal(result.reason, "wrong_tenant");
});

test("handleWebhookEvent: wrong_user -> reject cuando expectedUserId no coincide (tenant correcto)", async () => {
  const { header, rawBody } = await signedRequest("10-wrong-user.json");
  const result = await handleWebhookEvent(rawBody, header, {
    webhookSecret: TEST_SECRET,
    expectedTenantId: "tnt_qacp04_test",
    expectedUserId: "usr_qacp04_test",
  });
  assert.equal(result.action, "reject");
  assert.equal(result.reason, "wrong_user");
});

test("handleWebhookEvent: sin expectedTenantId/expectedUserId, wrong-tenant/wrong-user fixtures se procesan igual (guard es opt-in)", async () => {
  const { header, rawBody } = await signedRequest("09-wrong-tenant.json");
  const result = await handleWebhookEvent(rawBody, header, { webhookSecret: TEST_SECRET });
  assert.equal(result.action, "process");
});

test("handleWebhookEvent: duplicate -> skip_duplicate en el segundo evento con el mismo id, vía dedupStore compartido", async () => {
  const dedupStore = new StripeEventDedupStore();
  const first = await signedRequest("01-checkout-session-completed.json");
  const firstResult = await handleWebhookEvent(first.rawBody, first.header, { webhookSecret: TEST_SECRET, dedupStore });
  assert.equal(firstResult.action, "process");

  const dup = await signedRequest("06-duplicate-of-checkout-completed.json");
  const dupResult = await handleWebhookEvent(dup.rawBody, dup.header, { webhookSecret: TEST_SECRET, dedupStore });
  assert.equal(dupResult.action, "skip_duplicate");
  assert.equal(dedupStore.processedCount, 1);
});

test("handleWebhookEvent: tipo de evento no soportado -> ignore_unhandled_event_type, no lanza", async () => {
  const event = load("01-checkout-session-completed.json");
  const unsupported = { ...event, type: "customer.subscription.deleted" };
  const { header, rawBody } = await signStripeEvent(unsupported, TEST_SECRET);
  const result = await handleWebhookEvent(rawBody, header, { webhookSecret: TEST_SECRET });
  assert.equal(result.action, "ignore_unhandled_event_type");
});

// --- MockStripeCheckoutStore ---------------------------------------------

test("createCheckoutSession + retrieveSession: la sesión creada se puede recuperar por id", () => {
  const store = new MockStripeCheckoutStore();
  const created = store.createCheckoutSession({
    tenantId: "tnt_qacp04_test",
    clientId: "clt_qacp04_test",
    userId: "usr_qacp04_test",
    bookingId: "bkg_qacp04_9002",
    amount: 3000,
    successUrl: "https://example.test/ok",
    cancelUrl: "https://example.test/cancel",
  });
  const retrieved = store.retrieveSession(created.id);
  assert.deepEqual(retrieved, created);
  assert.equal(retrieved.status, "open");
});

test("retrieveSession devuelve null para un id desconocido, nunca lanza", () => {
  const store = new MockStripeCheckoutStore();
  assert.equal(store.retrieveSession("cs_test_mock_no_existe"), null);
});

test("createCheckoutSession exige todos los campos de tenant/reserva", () => {
  const store = new MockStripeCheckoutStore();
  assert.throws(() => store.createCheckoutSession({ tenantId: "tnt_a" }));
});

test("createCheckoutSession exige amount entero positivo", () => {
  const store = new MockStripeCheckoutStore();
  const base = {
    tenantId: "tnt_a",
    clientId: "clt_a",
    userId: "usr_a",
    bookingId: "bkg_a",
    successUrl: "https://example.test/ok",
    cancelUrl: "https://example.test/cancel",
  };
  assert.throws(() => store.createCheckoutSession({ ...base, amount: 0 }));
  assert.throws(() => store.createCheckoutSession({ ...base, amount: -100 }));
  assert.throws(() => store.createCheckoutSession({ ...base, amount: 19.99 }));
});

test("markSessionCompleted cambia el status sin alterar el resto de campos", () => {
  const store = new MockStripeCheckoutStore();
  const created = store.createCheckoutSession({
    tenantId: "tnt_a",
    clientId: "clt_a",
    userId: "usr_a",
    bookingId: "bkg_a",
    amount: 1500,
    successUrl: "https://example.test/ok",
    cancelUrl: "https://example.test/cancel",
  });
  const completed = store.markSessionCompleted(created.id);
  assert.equal(completed.status, "complete");
  assert.equal(completed.amount_total, created.amount_total);
});
