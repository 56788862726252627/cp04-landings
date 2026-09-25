// Paso 20 · Fase 8 — Puente sandbox entre el panel comercial y los
// adaptadores de Stripe/WhatsApp del Paso 19.
//
// Este módulo NUNCA importa `fetch` ni realiza ninguna petición de red
// — a diferencia de `stripeAdapter.js`/`whatsappAdapter.js` (que sí
// pueden llegar a hacerlo si algún día hay credenciales de test/live),
// `commercialSandbox.js` es la superficie que usa el panel para
// "simular" sin ningún riesgo de tocar red por accidente, sea cual sea
// el estado real de configuración.
//
// Reglas verificadas por test (Fase 8 del enunciado):
//  - Nunca se marca un pago como real: todo resultado lleva
//    `simulated: true` y un id con prefijo `sandbox_` que NUNCA
//    coincide con el formato real de Stripe (`cs_`/`pi_`/`re_`) ni de
//    WhatsApp (`wamid.`).
//  - Nunca se marca un mensaje como enviado si no salió: sin
//    consentimiento registrado, el resultado es
//    `consent_not_recorded`, igual que en `whatsappAdapter.js` — nunca
//    `status: "simulated"` en ese caso.
//  - Los webhooks simulados llevan `simulated: true` y un
//    `label` explícito.
//  - La idempotencia se conserva: misma llamada -> misma
//    `sandboxTransactionId`/`idempotencyKey` (reutiliza
//    `generateIdempotencyKey` de `commercialShared.js`, exactamente
//    como los adaptadores reales).

import { generateIdempotencyKey } from "./commercialShared.js";
import { validateCheckoutSessionParams, validateRefundParams, validateWhatsAppTemplateParams, validateWhatsAppTextParams } from "./commercialSchemas.js";
import { getStripeRuntimeStatus } from "./stripeAdapter.js";
import { getWhatsAppRuntimeStatus, hasRecordedConsent } from "./whatsappAdapter.js";

const SANDBOX_DISCLAIMER_PAYMENT = "Simulación interna — ningún pago real se ha procesado ni se procesará con esta llamada.";
const SANDBOX_DISCLAIMER_MESSAGE = "Simulación interna — ningún mensaje real se ha enviado ni se enviará con esta llamada.";

function sandboxId(prefix, idempotencyKey) {
  return `sandbox_${prefix}_${idempotencyKey.slice(5, 21)}`;
}

export function simulateStripeCheckout(params, { env = {}, idempotencyParts } = {}) {
  const { valid, errors } = validateCheckoutSessionParams(params);
  if (!valid) return { status: "invalid_params", errors, simulated: true };

  const idempotencyKey = generateIdempotencyKey(idempotencyParts ?? [params.customerReference, params.amountMinorUnits, params.currency, params.successUrl, params.cancelUrl]);
  return Object.freeze({
    status: "simulated",
    simulated: true,
    mode: getStripeRuntimeStatus(env).mode,
    sandboxCheckoutSessionId: sandboxId("cs", idempotencyKey),
    sandboxCheckoutUrl: "about:blank#sandbox-checkout",
    idempotencyKey,
    disclaimer: SANDBOX_DISCLAIMER_PAYMENT,
  });
}

export function simulateStripeRefund(params, { env = {}, idempotencyParts } = {}) {
  const { valid, errors } = validateRefundParams(params);
  if (!valid) return { status: "invalid_params", errors, simulated: true };

  const idempotencyKey = generateIdempotencyKey(idempotencyParts ?? [params.paymentIntentId, params.amountMinorUnits ?? "full"]);
  return Object.freeze({
    status: "simulated",
    simulated: true,
    mode: getStripeRuntimeStatus(env).mode,
    sandboxRefundId: sandboxId("re", idempotencyKey),
    idempotencyKey,
    disclaimer: SANDBOX_DISCLAIMER_PAYMENT,
  });
}

/**
 * @param {"template"|"text"} kind
 */
export function simulateWhatsAppSend(kind, params, { env = {}, consentStore } = {}) {
  const { valid, errors } = kind === "template" ? validateWhatsAppTemplateParams(params) : validateWhatsAppTextParams(params);
  if (!valid) return { status: "invalid_params", errors, simulated: true };

  if (!hasRecordedConsent(consentStore, params.toPhoneE164)) {
    return Object.freeze({ status: "consent_not_recorded", simulated: true, reason: `No hay consentimiento registrado para ${params.toPhoneE164} — ningún mensaje se ha simulado como enviado.` });
  }

  const idempotencyKey = generateIdempotencyKey([kind, params.toPhoneE164, params.templateName ?? params.body]);
  return Object.freeze({
    status: "simulated",
    simulated: true,
    mode: getWhatsAppRuntimeStatus(env).configured ? "configured_but_sandboxed" : "unconfigured",
    sandboxMessageId: sandboxId("wamid", idempotencyKey),
    idempotencyKey,
    disclaimer: SANDBOX_DISCLAIMER_MESSAGE,
  });
}

/**
 * Construye un evento de webhook simulado — NUNCA una firma real (no
 * tiene sentido "verificar" una firma sobre un evento que nunca llegó
 * de Stripe/Meta). Se etiqueta explícitamente para que sea imposible
 * confundirlo con un webhook real en cualquier log/panel.
 */
export function buildSimulatedWebhookEvent(provider, eventPayload) {
  if (provider !== "stripe" && provider !== "whatsapp") throw new Error(`buildSimulatedWebhookEvent: provider desconocido "${provider}"`);
  return Object.freeze({
    simulated: true,
    label: `SIMULATED_WEBHOOK_${provider.toUpperCase()} — no es un evento real de ${provider === "stripe" ? "Stripe" : "Meta/WhatsApp"}`,
    provider,
    event: Object.freeze({ ...eventPayload }),
  });
}

export function describeSandboxReadiness(env = {}) {
  const stripe = getStripeRuntimeStatus(env);
  const whatsapp = getWhatsAppRuntimeStatus(env);
  return Object.freeze({
    stripe: { ...stripe, sandboxAvailable: true, message: stripe.configured ? `Stripe configurado en modo ${stripe.mode} — el panel puede simular sin tocar red real.` : "Stripe sin configurar — el panel simula igualmente (nunca bloquea la demo por falta de credenciales)." },
    whatsapp: { ...whatsapp, sandboxAvailable: true, message: whatsapp.configured ? "WhatsApp configurado — el panel puede simular sin tocar red real." : "WhatsApp sin configurar — el panel simula igualmente (nunca bloquea la demo por falta de credenciales)." },
  });
}
