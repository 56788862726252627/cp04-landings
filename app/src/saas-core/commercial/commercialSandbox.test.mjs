import { test } from "node:test";
import assert from "node:assert/strict";

import { simulateStripeCheckout, simulateStripeRefund, simulateWhatsAppSend, buildSimulatedWebhookEvent, describeSandboxReadiness } from "./commercialSandbox.js";
import { sampleCheckoutSessionParams, sampleRefundParams, sampleWhatsAppTemplateParams, sampleWhatsAppTextParams, createInMemoryConsentStore } from "./commercialFixtures.js";

test("simulateStripeCheckout: siempre simulated:true, id con prefijo sandbox_ que nunca coincide con el formato real cs_", () => {
  const result = simulateStripeCheckout(sampleCheckoutSessionParams());
  assert.equal(result.status, "simulated");
  assert.equal(result.simulated, true);
  assert.match(result.sandboxCheckoutSessionId, /^sandbox_cs_/);
  assert.doesNotMatch(result.sandboxCheckoutSessionId, /^cs_[a-zA-Z0-9]+$/);
  assert.match(result.disclaimer, /ningún pago real/i);
});

test("simulateStripeCheckout con params inválidos: invalid_params, simulated:true, sin id", () => {
  const result = simulateStripeCheckout({});
  assert.equal(result.status, "invalid_params");
  assert.equal(result.simulated, true);
  assert.equal(result.sandboxCheckoutSessionId, undefined);
});

test("simulateStripeCheckout: idempotencia — misma llamada produce el mismo sandboxCheckoutSessionId", () => {
  const a = simulateStripeCheckout(sampleCheckoutSessionParams());
  const b = simulateStripeCheckout(sampleCheckoutSessionParams());
  assert.equal(a.sandboxCheckoutSessionId, b.sandboxCheckoutSessionId);
  assert.equal(a.idempotencyKey, b.idempotencyKey);
});

test("simulateStripeCheckout nunca importa/llama fetch (inspección del módulo)", async () => {
  const src = await import("node:fs/promises").then((fs) => fs.readFile(new URL("./commercialSandbox.js", import.meta.url), "utf8"));
  assert.doesNotMatch(src, /\bfetch\(/);
});

test("simulateStripeRefund: mismo patrón sandbox_re_, nunca pi_/re_ real", () => {
  const result = simulateStripeRefund(sampleRefundParams());
  assert.equal(result.simulated, true);
  assert.match(result.sandboxRefundId, /^sandbox_re_/);
});

test("simulateWhatsAppSend sin consentimiento: consent_not_recorded, NUNCA status:'simulated' (nunca se marca como enviado)", () => {
  const store = createInMemoryConsentStore();
  const result = simulateWhatsAppSend("template", sampleWhatsAppTemplateParams(), { consentStore: store });
  assert.equal(result.status, "consent_not_recorded");
  assert.equal(result.simulated, true);
  assert.equal(result.sandboxMessageId, undefined);
});

test("simulateWhatsAppSend con consentimiento: simulated:true, id sandbox_wamid_ (nunca 'wamid.' real)", () => {
  const store = createInMemoryConsentStore({ "+34600000001": { granted: true } });
  const result = simulateWhatsAppSend("template", sampleWhatsAppTemplateParams(), { consentStore: store });
  assert.equal(result.status, "simulated");
  assert.match(result.sandboxMessageId, /^sandbox_wamid_/);
  assert.doesNotMatch(result.sandboxMessageId, /^wamid\./);
});

test("simulateWhatsAppSend('text', ...) exige consentimiento igual que 'template'", () => {
  const store = createInMemoryConsentStore();
  const result = simulateWhatsAppSend("text", sampleWhatsAppTextParams(), { consentStore: store });
  assert.equal(result.status, "consent_not_recorded");
});

test("simulateWhatsAppSend con params inválidos: invalid_params antes de comprobar consentimiento", () => {
  const result = simulateWhatsAppSend("template", {}, { consentStore: createInMemoryConsentStore() });
  assert.equal(result.status, "invalid_params");
});

test("buildSimulatedWebhookEvent etiqueta explícitamente el evento como simulado, para Stripe y WhatsApp", () => {
  const stripeEvent = buildSimulatedWebhookEvent("stripe", { type: "checkout.session.completed" });
  assert.equal(stripeEvent.simulated, true);
  assert.match(stripeEvent.label, /SIMULATED_WEBHOOK_STRIPE/);
  const waEvent = buildSimulatedWebhookEvent("whatsapp", { object: "whatsapp_business_account" });
  assert.match(waEvent.label, /SIMULATED_WEBHOOK_WHATSAPP/);
});

test("buildSimulatedWebhookEvent rechaza un proveedor desconocido", () => {
  assert.throws(() => buildSimulatedWebhookEvent("otro", {}));
});

test("describeSandboxReadiness diferencia mock/test/producción y nunca bloquea la simulación por falta de credenciales", () => {
  const unconfigured = describeSandboxReadiness({});
  assert.equal(unconfigured.stripe.mode, "unconfigured");
  assert.equal(unconfigured.stripe.sandboxAvailable, true);
  const testMode = describeSandboxReadiness({ STRIPE_SECRET_KEY: "sk_test_x" });
  assert.equal(testMode.stripe.mode, "test");
  const liveMode = describeSandboxReadiness({ STRIPE_SECRET_KEY: "sk_live_x" });
  assert.equal(liveMode.stripe.mode, "live");
});

test("describeSandboxReadiness nunca expone un secreto completo (reutiliza redactSecret de los adaptadores)", () => {
  const result = describeSandboxReadiness({ STRIPE_SECRET_KEY: "sk_test_abcdefghijklmnop" });
  assert.ok(!JSON.stringify(result).includes("sk_test_abcdefghijklmnop"));
});
