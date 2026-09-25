// Paso 19 · Fase 4 — validación pura de los payloads que entran a
// stripeAdapter.js/whatsappAdapter.js. Nunca hace red, nunca conoce
// credenciales — solo forma/tipos/rangos. Mismo estilo que
// researchRequestSchema.js (Paso 12): `{valid, errors}`, sin lanzar.

const CURRENCY_CODES = Object.freeze(["eur", "usd", "gbp"]);

function pushError(errors, field, message) {
  errors.push({ field, message });
}

export function validateCheckoutSessionParams(params) {
  const errors = [];
  if (!params || typeof params !== "object") {
    return { valid: false, errors: [{ field: "params", message: "params debe ser un objeto" }] };
  }
  if (!Number.isInteger(params.amountMinorUnits) || params.amountMinorUnits <= 0) {
    pushError(errors, "amountMinorUnits", "debe ser un entero positivo (unidad menor de la moneda, p. ej. céntimos)");
  }
  if (typeof params.currency !== "string" || !CURRENCY_CODES.includes(params.currency.toLowerCase())) {
    pushError(errors, "currency", `debe ser una de: ${CURRENCY_CODES.join(", ")}`);
  }
  if (typeof params.successUrl !== "string" || !/^https:\/\//.test(params.successUrl)) {
    pushError(errors, "successUrl", "debe ser una URL https:// absoluta");
  }
  if (typeof params.cancelUrl !== "string" || !/^https:\/\//.test(params.cancelUrl)) {
    pushError(errors, "cancelUrl", "debe ser una URL https:// absoluta");
  }
  if (typeof params.customerReference !== "string" || params.customerReference.trim().length === 0) {
    pushError(errors, "customerReference", "debe ser un identificador de cliente no vacío (nunca un dato personal sensible en claro)");
  }
  if (params.description !== undefined && typeof params.description !== "string") {
    pushError(errors, "description", "si se indica, debe ser texto");
  }
  return { valid: errors.length === 0, errors };
}

export function validateRefundParams(params) {
  const errors = [];
  if (!params || typeof params !== "object") {
    return { valid: false, errors: [{ field: "params", message: "params debe ser un objeto" }] };
  }
  if (typeof params.paymentIntentId !== "string" || !/^pi_/.test(params.paymentIntentId)) {
    pushError(errors, "paymentIntentId", "debe ser un id de PaymentIntent de Stripe (prefijo 'pi_')");
  }
  if (params.amountMinorUnits !== undefined && (!Number.isInteger(params.amountMinorUnits) || params.amountMinorUnits <= 0)) {
    pushError(errors, "amountMinorUnits", "si se indica (reembolso parcial), debe ser un entero positivo");
  }
  return { valid: errors.length === 0, errors };
}

const E164_PHONE_RE = /^\+[1-9]\d{6,14}$/;

export function validateWhatsAppTemplateParams(params) {
  const errors = [];
  if (!params || typeof params !== "object") {
    return { valid: false, errors: [{ field: "params", message: "params debe ser un objeto" }] };
  }
  if (typeof params.toPhoneE164 !== "string" || !E164_PHONE_RE.test(params.toPhoneE164)) {
    pushError(errors, "toPhoneE164", "debe ser un número en formato E.164 (p. ej. +34600000000)");
  }
  if (typeof params.templateName !== "string" || params.templateName.trim().length === 0) {
    pushError(errors, "templateName", "debe ser el nombre de una plantilla ya aprobada por Meta");
  }
  if (typeof params.languageCode !== "string" || !/^[a-z]{2}(_[A-Z]{2})?$/.test(params.languageCode)) {
    pushError(errors, "languageCode", "debe ser un código de idioma válido (p. ej. 'es', 'es_ES')");
  }
  if (params.components !== undefined && !Array.isArray(params.components)) {
    pushError(errors, "components", "si se indica, debe ser un array de componentes de plantilla");
  }
  return { valid: errors.length === 0, errors };
}

export function validateWhatsAppTextParams(params) {
  const errors = [];
  if (!params || typeof params !== "object") {
    return { valid: false, errors: [{ field: "params", message: "params debe ser un objeto" }] };
  }
  if (typeof params.toPhoneE164 !== "string" || !E164_PHONE_RE.test(params.toPhoneE164)) {
    pushError(errors, "toPhoneE164", "debe ser un número en formato E.164 (p. ej. +34600000000)");
  }
  if (typeof params.body !== "string" || params.body.trim().length === 0 || params.body.length > 4096) {
    pushError(errors, "body", "debe ser texto no vacío de hasta 4096 caracteres (límite de WhatsApp Cloud API)");
  }
  return { valid: errors.length === 0, errors };
}
