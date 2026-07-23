// Paso 19 · Fase 4 — fixtures deterministas para tests offline. Las
// firmas de webhook se calculan aquí mismo con el mismo HMAC real que
// usan los adaptadores (`commercialShared.computeHmacSha256Hex`) —
// nunca se pega una firma "de ejemplo" copiada a mano, que podría
// desincronizarse silenciosamente del código real.

import { computeHmacSha256Hex } from "./commercialShared.js";

export const FIXTURE_STRIPE_WEBHOOK_SECRET = "whsec_fixture_0123456789abcdef";
export const FIXTURE_WHATSAPP_APP_SECRET = "fixture_app_secret_0123456789";

export function sampleCheckoutSessionParams(overrides = {}) {
  return {
    amountMinorUnits: 4900,
    currency: "eur",
    successUrl: "https://ejemplo-negocio.invalid/pago-ok",
    cancelUrl: "https://ejemplo-negocio.invalid/pago-cancelado",
    customerReference: "cliente-demo-001",
    description: "Cuota mensual club deportivo",
    ...overrides,
  };
}

export function sampleRefundParams(overrides = {}) {
  return { paymentIntentId: "pi_fixture_0001", amountMinorUnits: 4900, ...overrides };
}

export function sampleWhatsAppTemplateParams(overrides = {}) {
  return { toPhoneE164: "+34600000001", templateName: "confirmacion_reserva", languageCode: "es", components: [], ...overrides };
}

export function sampleWhatsAppTextParams(overrides = {}) {
  return { toPhoneE164: "+34600000001", body: "Tu reserva ha sido confirmada.", ...overrides };
}

/** Payload+firma Stripe válidos para `FIXTURE_STRIPE_WEBHOOK_SECRET`. */
export function buildSignedStripeWebhookFixture({ timestamp = 1700000000, payload = JSON.stringify({ id: "evt_fixture_1", type: "checkout.session.completed" }), secret = FIXTURE_STRIPE_WEBHOOK_SECRET } = {}) {
  const signature = computeHmacSha256Hex(secret, `${timestamp}.${payload}`);
  return { rawPayload: payload, signatureHeader: `t=${timestamp},v1=${signature}`, secret, timestamp };
}

/** Payload+firma Meta válidos para `FIXTURE_WHATSAPP_APP_SECRET`. */
export function buildSignedWhatsAppWebhookFixture({ payload = JSON.stringify({ object: "whatsapp_business_account", entry: [] }), secret = FIXTURE_WHATSAPP_APP_SECRET } = {}) {
  const signature = computeHmacSha256Hex(secret, payload);
  return { rawPayload: payload, signatureHeader: `sha256=${signature}`, secret };
}

export function createInMemoryConsentStore(initial = {}) {
  const map = new Map(Object.entries(initial));
  return { get: (phone) => map.get(phone), set: (phone, record) => map.set(phone, record) };
}
