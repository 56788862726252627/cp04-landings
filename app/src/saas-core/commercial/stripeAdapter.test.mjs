import { test } from "node:test";
import assert from "node:assert/strict";

import { isStripeConfigured, getStripeRuntimeStatus, createCheckoutSession, retrieveCheckoutSession, createRefund, verifyStripeWebhookSignature, parseStripeWebhookEvent } from "./stripeAdapter.js";
import { sampleCheckoutSessionParams, sampleRefundParams, buildSignedStripeWebhookFixture, FIXTURE_STRIPE_WEBHOOK_SECRET } from "./commercialFixtures.js";

function throwingFetch() {
  throw new Error("fetchImpl NUNCA debería invocarse en este escenario");
}

test("isStripeConfigured/getStripeRuntimeStatus: sin STRIPE_SECRET_KEY, unconfigured y nunca expone la clave", () => {
  assert.equal(isStripeConfigured({}), false);
  const status = getStripeRuntimeStatus({});
  assert.equal(status.configured, false);
  assert.equal(status.mode, "unconfigured");
  assert.equal(status.secretKeyRedacted, null);
});

test("getStripeRuntimeStatus distingue test/live y nunca expone la clave completa", () => {
  assert.equal(getStripeRuntimeStatus({ STRIPE_SECRET_KEY: "sk_test_abcdefgh" }).mode, "test");
  const liveStatus = getStripeRuntimeStatus({ STRIPE_SECRET_KEY: "sk_live_abcdefgh" });
  assert.equal(liveStatus.mode, "live");
  assert.ok(!liveStatus.secretKeyRedacted.includes("sk_live_abcdefgh"));
});

test("createCheckoutSession sin configurar: not_configured, fetchImpl NUNCA se invoca", async () => {
  const result = await createCheckoutSession(sampleCheckoutSessionParams(), { env: {}, fetchImpl: throwingFetch });
  assert.equal(result.status, "not_configured");
});

test("createCheckoutSession con clave LIVE sin allowLiveMode: blocked_live_mode, fetchImpl NUNCA se invoca", async () => {
  const result = await createCheckoutSession(sampleCheckoutSessionParams(), { env: { STRIPE_SECRET_KEY: "sk_live_x" }, fetchImpl: throwingFetch });
  assert.equal(result.status, "blocked_live_mode");
});

test("createCheckoutSession con params inválidos: invalid_params, fetchImpl NUNCA se invoca", async () => {
  const result = await createCheckoutSession({}, { env: { STRIPE_SECRET_KEY: "sk_test_x" }, fetchImpl: throwingFetch });
  assert.equal(result.status, "invalid_params");
  assert.ok(result.errors.length > 0);
});

test("createCheckoutSession configurado en modo test: construye la petición real con Authorization/Idempotency-Key correctos", async () => {
  let capturedUrl;
  let capturedInit;
  const fakeFetch = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return { ok: true, status: 200, json: async () => ({ id: "cs_test_fixture", url: "https://checkout.stripe.com/fixture" }) };
  };
  const result = await createCheckoutSession(sampleCheckoutSessionParams(), { env: { STRIPE_SECRET_KEY: "sk_test_x" }, fetchImpl: fakeFetch });
  assert.equal(result.status, "created");
  assert.equal(result.checkoutSessionId, "cs_test_fixture");
  assert.equal(capturedUrl, "https://api.stripe.com/v1/checkout/sessions");
  assert.equal(capturedInit.headers.Authorization, "Bearer sk_test_x");
  assert.ok(capturedInit.headers["Idempotency-Key"].startsWith("idem_"));
});

test("createCheckoutSession: la misma llamada produce la MISMA Idempotency-Key (reintentos seguros)", async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ id: "cs_x", url: "https://x" }) });
  const a = await createCheckoutSession(sampleCheckoutSessionParams(), { env: { STRIPE_SECRET_KEY: "sk_test_x" }, fetchImpl: fakeFetch });
  const b = await createCheckoutSession(sampleCheckoutSessionParams(), { env: { STRIPE_SECRET_KEY: "sk_test_x" }, fetchImpl: fakeFetch });
  assert.equal(a.idempotencyKey, b.idempotencyKey);
});

test("createCheckoutSession propaga un error de Stripe sin inventar un éxito", async () => {
  const fakeFetch = async () => ({ ok: false, status: 402, json: async () => ({ error: { message: "tarjeta rechazada" } }) });
  const result = await createCheckoutSession(sampleCheckoutSessionParams(), { env: { STRIPE_SECRET_KEY: "sk_test_x" }, fetchImpl: fakeFetch });
  assert.equal(result.status, "stripe_error");
  assert.equal(result.httpStatus, 402);
});

test("retrieveCheckoutSession: sin configurar no llama a fetchImpl; con id inválido, invalid_params", async () => {
  assert.equal((await retrieveCheckoutSession("cs_x", { env: {}, fetchImpl: throwingFetch })).status, "not_configured");
  assert.equal((await retrieveCheckoutSession("bad-id", { env: { STRIPE_SECRET_KEY: "sk_test_x" }, fetchImpl: throwingFetch })).status, "invalid_params");
});

test("createRefund: sin configurar no llama a fetchImpl; con params válidos construye la petición", async () => {
  assert.equal((await createRefund(sampleRefundParams(), { env: {}, fetchImpl: throwingFetch })).status, "not_configured");
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ id: "re_fixture" }) });
  const result = await createRefund(sampleRefundParams(), { env: { STRIPE_SECRET_KEY: "sk_test_x" }, fetchImpl: fakeFetch });
  assert.equal(result.status, "refunded");
  assert.equal(result.refundId, "re_fixture");
});

test("verifyStripeWebhookSignature: firma real válida contra el fixture", () => {
  const fixture = buildSignedStripeWebhookFixture();
  const result = verifyStripeWebhookSignature(fixture.rawPayload, fixture.signatureHeader, fixture.secret);
  assert.equal(result.valid, true);
});

test("verifyStripeWebhookSignature: rechaza secreto incorrecto, payload alterado y cabecera mal formada", () => {
  const fixture = buildSignedStripeWebhookFixture();
  assert.equal(verifyStripeWebhookSignature(fixture.rawPayload, fixture.signatureHeader, "otro-secreto").valid, false);
  assert.equal(verifyStripeWebhookSignature(fixture.rawPayload + "manipulado", fixture.signatureHeader, fixture.secret).valid, false);
  assert.equal(verifyStripeWebhookSignature(fixture.rawPayload, "cabecera-invalida", fixture.secret).valid, false);
  assert.equal(verifyStripeWebhookSignature(fixture.rawPayload, "", fixture.secret).valid, false);
});

test("verifyStripeWebhookSignature: tolerancia de timestamp rechaza un evento demasiado antiguo cuando se activa", () => {
  const fixture = buildSignedStripeWebhookFixture({ timestamp: 1000 });
  const withoutTolerance = verifyStripeWebhookSignature(fixture.rawPayload, fixture.signatureHeader, fixture.secret);
  assert.equal(withoutTolerance.valid, true);
  const withTolerance = verifyStripeWebhookSignature(fixture.rawPayload, fixture.signatureHeader, fixture.secret, { toleranceSeconds: 300, nowSeconds: 1000 + 400 });
  assert.equal(withTolerance.valid, false);
});

test("parseStripeWebhookEvent: con firma válida devuelve el evento parseado; con firma inválida nunca expone el evento", () => {
  const fixture = buildSignedStripeWebhookFixture();
  const ok = parseStripeWebhookEvent(fixture.rawPayload, fixture.signatureHeader, fixture.secret);
  assert.equal(ok.valid, true);
  assert.equal(ok.event.type, "checkout.session.completed");

  const bad = parseStripeWebhookEvent(fixture.rawPayload, fixture.signatureHeader, "otro-secreto");
  assert.equal(bad.valid, false);
  assert.equal(bad.event, null);
});

test("FIXTURE_STRIPE_WEBHOOK_SECRET nunca se usa por accidente como si fuera un secreto de producción (constante marcada como fixture)", () => {
  assert.match(FIXTURE_STRIPE_WEBHOOK_SECRET, /fixture/);
});
