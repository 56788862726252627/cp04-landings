// Club Pádel 04 · WhatsApp Business Platform Adapter (mock)
// Implementación en modo mock del contrato descrito en whatsapp-contract.js.
// No importa ningún SDK de Meta, no hace ninguna llamada de red, no está
// importado en worker-reservas/src/index.js (mismo patrón que
// worker-reservas/auth/auth-adapter.mock.js y
// worker-reservas/payments/stripe-adapter.mock.js).
//
// No importa scripts/make-qa/whatsapp-mock.mjs a propósito: worker-reservas
// se empaqueta y despliega como Worker de Cloudflare (código que debe poder
// ejecutarse en producción), mientras que scripts/ es tooling de Node solo
// para desarrollo/QA — cruzar esa frontera acoplaría el bundle del Worker a
// dependencias de tooling que nunca deberían desplegarse. El algoritmo de
// backoff se reimplementa aquí por ese motivo de despliegue, no por
// desconocimiento del ya existente (mismo criterio ya aplicado en
// stripe-adapter.mock.js con Web Crypto frente a node:crypto).

import { WHATSAPP_TEMPLATES, SUPPORTED_LANGUAGES, PROVIDER_ERROR_CODES } from "./whatsapp-contract.js";
import { CONSENT_STATE } from "./whatsapp-consent.js";

const E164_PATTERN = /^\+[1-9][0-9]{6,14}$/;
const MAX_TEXT_MESSAGE_LENGTH = 4096; // límite real publicado por Meta para mensajes de texto libre

/** @param {string} phone @returns {boolean} */
function isValidE164(phone) {
  return typeof phone === "string" && E164_PATTERN.test(phone);
}

/**
 * Normaliza una entrada de teléfono heterogénea (espacios, guiones,
 * paréntesis, prefijo "00") a E.164. No adivina el código de país si no
 * viene ya con "+" o "00" y no se pasa `defaultCountryCode` — inventar un
 * país sería peor que rechazar el número.
 * @param {string} rawInput
 * @param {string} [defaultCountryCode] p.ej. "34" (España), sin "+"
 * @returns {{valid: boolean, e164?: string, reason?: string}}
 */
export function normalizePhoneNumber(rawInput, defaultCountryCode) {
  if (typeof rawInput !== "string" || rawInput.trim().length === 0) {
    return { valid: false, reason: "empty_input" };
  }

  let candidate = rawInput.replace(/[\s\-().]/g, "");

  if (candidate.startsWith("00")) {
    candidate = `+${candidate.slice(2)}`;
  } else if (!candidate.startsWith("+")) {
    if (!defaultCountryCode) {
      return { valid: false, reason: "missing_country_code" };
    }
    candidate = `+${defaultCountryCode}${candidate.replace(/^0+/, "")}`;
  }

  if (!isValidE164(candidate)) {
    return { valid: false, reason: "not_e164_after_normalization" };
  }

  return { valid: true, e164: candidate };
}

/**
 * @param {string} phone se asume ya normalizado (salida de normalizePhoneNumber)
 * @param {import("./whatsapp-consent.js").ConsentStore} consentStore
 * @param {import("./whatsapp-consent.js").SuppressionList} [suppressionList]
 * @returns {{allowed: boolean, reason: string}}
 */
export function validateRecipient(phone, consentStore, suppressionList) {
  if (!isValidE164(phone)) {
    return { allowed: false, reason: "invalid_phone_format" };
  }
  if (suppressionList?.isBlocked(phone)) {
    return { allowed: false, reason: `blocked_recipient:${suppressionList.getReason(phone) ?? "no_reason_given"}` };
  }
  const state = consentStore.getConsentState(phone);
  if (state === CONSENT_STATE.OPTED_OUT) {
    return { allowed: false, reason: "recipient_opted_out" };
  }
  if (state === CONSENT_STATE.PENDING) {
    return { allowed: false, reason: "recipient_not_opted_in" };
  }
  return { allowed: true, reason: "recipient_valid_consent_confirmed" };
}

/**
 * @param {string} templateName
 * @param {string} [language] si se omite, usa el idioma por defecto de la plantilla
 * @returns {{found: boolean, template?: object, reason?: string}}
 */
export function resolveTemplate(templateName, language) {
  const template = WHATSAPP_TEMPLATES[templateName];
  if (!template) {
    return { found: false, reason: "unsupported_template" };
  }
  const resolvedLanguage = language ?? template.defaultLanguage;
  if (!SUPPORTED_LANGUAGES.includes(resolvedLanguage)) {
    return { found: false, reason: "wrong_locale" };
  }
  return {
    found: true,
    template: {
      name: templateName,
      language: resolvedLanguage,
      category: template.category,
      variables: template.variables,
    },
  };
}

/**
 * T-whatsapp-closure (2026-07-10): igual que resolveTemplate(), pero si el
 * idioma solicitado no está soportado cae al `defaultLanguage` de la propia
 * plantilla en vez de rechazar de inmediato con `wrong_locale` — útil cuando
 * un tenant pide un locale que Meta no tiene aprobado todavía para esa
 * plantilla concreta. Contrato APARTE, explícito: sendTemplateMessage() no
 * lo usa por defecto (sigue llamando a resolveTemplate() sin fallback,
 * fail-closed) — un llamador debe pedir el fallback a propósito, nunca es
 * automático dentro del envío real.
 * @param {string} templateName
 * @param {string} [language]
 * @returns {{found: boolean, template?: object, reason?: string, fallback_applied: boolean, requested_language?: string}}
 */
export function resolveTemplateWithLocaleFallback(templateName, language) {
  const direct = resolveTemplate(templateName, language);
  if (direct.found || direct.reason !== "wrong_locale") {
    return { ...direct, fallback_applied: false };
  }
  const template = WHATSAPP_TEMPLATES[templateName];
  const fallbackResolution = resolveTemplate(templateName, template.defaultLanguage);
  return { ...fallbackResolution, fallback_applied: true, requested_language: language };
}

/**
 * @param {string} templateName
 * @param {Record<string,string>} variableValues
 * @returns {{valid: boolean, components?: Array<object>, errors?: string[]}}
 */
export function buildTemplateComponents(templateName, variableValues = {}) {
  const template = WHATSAPP_TEMPLATES[templateName];
  if (!template) {
    return { valid: false, errors: ["unsupported_template"] };
  }

  const errors = [];
  const parameters = [];
  for (const varDef of template.variables) {
    const value = variableValues[varDef.name];
    if (value === undefined || value === null || String(value).length === 0) {
      errors.push(`missing_variable:${varDef.name}`);
      continue;
    }
    if (String(value).length > varDef.maxLength) {
      errors.push(`variable_too_long:${varDef.name}`);
      continue;
    }
    parameters.push({ type: "text", text: String(value) });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const components = parameters.length > 0 ? [{ type: "body", parameters }] : [];
  return { valid: true, components };
}

/** Dedup de envíos salientes por idempotency_key — mismo principio que WhatsappDuplicateSendStore de scripts/make-qa/whatsapp-mock.mjs. */
export class WhatsappDuplicateSendStore {
  #sent = new Set();

  wasSent(idempotencyKey) {
    return this.#sent.has(idempotencyKey);
  }

  markSent(idempotencyKey) {
    this.#sent.add(idempotencyKey);
  }

  get sentCount() {
    return this.#sent.size;
  }
}

/**
 * @param {string} idempotencyKey
 * @param {WhatsappDuplicateSendStore} store
 * @returns {boolean} true si YA se había enviado (no se marca de nuevo); false si es la primera vez (se marca ahora)
 */
export function deduplicateOutboundMessage(idempotencyKey, store) {
  if (store.wasSent(idempotencyKey)) return true;
  store.markSent(idempotencyKey);
  return false;
}

/**
 * Interpreta la forma real de una respuesta de WhatsApp Cloud API (éxito:
 * `{messages:[{id:"wamid...."}]}`; error: `{error:{code, message, type}}`),
 * sin asumir que siempre llega bien formada.
 * @param {object} rawResponse
 * @returns {{status: "accepted"|"failed", providerMessageId?: string, errorCode?: number, errorMessage?: string}}
 */
export function handleProviderResponse(rawResponse) {
  const providerMessageId = rawResponse?.messages?.[0]?.id;
  if (typeof providerMessageId === "string" && providerMessageId.length > 0) {
    return { status: "accepted", providerMessageId };
  }
  const errorCode = rawResponse?.error?.code;
  if (typeof errorCode === "number") {
    return { status: "failed", errorCode, errorMessage: rawResponse.error.message ?? "sin mensaje" };
  }
  return { status: "failed", errorCode: null, errorMessage: "malformed_provider_response" };
}

/**
 * @param {number|null} errorCode
 * @returns {{retryable: boolean, category: string, message: string}}
 */
export function classifyProviderError(errorCode) {
  const known = errorCode !== null && errorCode !== undefined ? PROVIDER_ERROR_CODES[errorCode] : undefined;
  if (known) {
    return { retryable: known.retryable, category: known.category, message: known.message };
  }
  // Código no catalogado: por defecto NO se reintenta — reintentar un error
  // desconocido a ciegas puede convertir un fallo permanente (p.ej. una
  // plantilla desactivada por Meta) en un bucle de reintentos inútil. Un
  // código nuevo real debe añadirse explícitamente a PROVIDER_ERROR_CODES.
  return { retryable: false, category: "unrecognized", message: "Código de error no catalogado — tratado como permanente por precaución" };
}

/**
 * @param {{attempt: number, retryable: boolean, retryAfterMs?: number|null, maxAttempts?: number, baseMs?: number, maxMs?: number, jitterMs?: number}} params
 * @returns {{shouldRetry: boolean, delayMs: number|null, reason: string}}
 */
export function computeRetryDecision({ attempt, retryable, retryAfterMs = null, maxAttempts = 5, baseMs = 1000, maxMs = 30000, jitterMs = 250 }) {
  if (!retryable) {
    return { shouldRetry: false, delayMs: null, reason: "permanent_error_no_retry" };
  }
  if (attempt >= maxAttempts) {
    return { shouldRetry: false, delayMs: null, reason: "retry_budget_exhausted" };
  }
  if (typeof retryAfterMs === "number" && retryAfterMs >= 0) {
    return { shouldRetry: true, delayMs: retryAfterMs, reason: "provider_retry_after_honored" };
  }
  const exponential = Math.min(maxMs, baseMs * 2 ** (attempt - 1));
  const jitter = Math.floor(Math.random() * jitterMs);
  return { shouldRetry: true, delayMs: exponential + jitter, reason: "exponential_backoff" };
}

/**
 * Simula una llamada a la Cloud API — nunca hace red real. Por defecto
 * responde éxito; los tests inyectan `deps.providerSend` para simular
 * 429/500/timeout/fallos permanentes sin tocar este adapter.
 */
function defaultProviderSend() {
  return { messages: [{ id: `wamid.MOCK_${Math.random().toString(36).slice(2)}` }] };
}

/**
 * Invoca `providerSend` y normaliza tanto una respuesta bien formada
 * (delegado a handleProviderResponse) como un fallo de transporte (timeout,
 * red caída) — en ese caso `providerSend` lanza en vez de devolver un
 * objeto `{error}`, porque un timeout real no produce ninguna respuesta de
 * Meta que clasificar por código. Se modela como retryable: la ausencia de
 * respuesta nunca es un error permanente por definición.
 * @param {() => object} providerSend
 * @returns {{status: "accepted"|"failed", providerMessageId?: string, errorCode?: number|null, errorMessage?: string, retryable?: boolean, category?: string}}
 */
function callProvider(providerSend) {
  let rawResponse;
  try {
    rawResponse = providerSend();
  } catch (error) {
    return {
      status: "failed",
      errorCode: null,
      errorMessage: error instanceof Error ? error.message : String(error),
      retryable: true,
      category: "network_failure",
    };
  }
  const handled = handleProviderResponse(rawResponse);
  if (handled.status === "failed") {
    const classification = classifyProviderError(handled.errorCode);
    return { status: "failed", errorCode: handled.errorCode, errorMessage: handled.errorMessage, ...classification };
  }
  return handled;
}

/**
 * @param {{to: string, templateName: string, language?: string, variables?: Record<string,string>, tenantId: string, idempotencyKey: string}} params
 * @param {{consentStore: import("./whatsapp-consent.js").ConsentStore, suppressionList?: import("./whatsapp-consent.js").SuppressionList, dedupStore: WhatsappDuplicateSendStore, providerSend?: () => object, defaultCountryCode?: string}} deps
 * @returns {Promise<object>}
 */
export async function sendTemplateMessage({ to, templateName, language, variables = {}, tenantId, idempotencyKey }, deps) {
  if (!tenantId) return { status: "rejected", reason: "missing_tenant_id" };

  const normalized = normalizePhoneNumber(to, deps.defaultCountryCode);
  if (!normalized.valid) return { status: "rejected", reason: `invalid_phone:${normalized.reason}` };

  const recipientCheck = validateRecipient(normalized.e164, deps.consentStore, deps.suppressionList);
  if (!recipientCheck.allowed) return { status: "rejected", reason: recipientCheck.reason };

  const templateResolution = resolveTemplate(templateName, language);
  if (!templateResolution.found) return { status: "rejected", reason: templateResolution.reason };

  const componentsResult = buildTemplateComponents(templateName, variables);
  if (!componentsResult.valid) return { status: "rejected", reason: "invalid_template_payload", errors: componentsResult.errors };

  if (deduplicateOutboundMessage(idempotencyKey, deps.dedupStore)) {
    return { status: "skipped_duplicate", reason: `idempotency_key ${idempotencyKey} ya enviado` };
  }

  const handled = callProvider(deps.providerSend ?? defaultProviderSend);
  if (handled.status === "failed") return handled;

  return { status: "accepted", providerMessageId: handled.providerMessageId, tenantId, templateName, language: templateResolution.template.language };
}

/**
 * Mensaje de texto libre — solo permitido dentro de la ventana de 24h de
 * sesión abierta (misma restricción que produce el error real 131047 en
 * plantillas fuera de ventana). Esta capa no rastrea el historial de
 * conversación por sí misma: `sessionWindowOpen` lo decide el llamador
 * (quien sí tiene acceso al último mensaje entrante del destinatario).
 * @param {{to: string, text: string, tenantId: string, idempotencyKey: string, sessionWindowOpen: boolean}} params
 * @param {{consentStore: import("./whatsapp-consent.js").ConsentStore, suppressionList?: import("./whatsapp-consent.js").SuppressionList, dedupStore: WhatsappDuplicateSendStore, providerSend?: () => object, defaultCountryCode?: string}} deps
 * @returns {Promise<object>}
 */
export async function sendTextMessage({ to, text, tenantId, idempotencyKey, sessionWindowOpen }, deps) {
  if (!tenantId) return { status: "rejected", reason: "missing_tenant_id" };
  if (typeof text !== "string" || text.length === 0) return { status: "rejected", reason: "empty_text" };
  if (text.length > MAX_TEXT_MESSAGE_LENGTH) return { status: "rejected", reason: "text_too_long" };
  if (!sessionWindowOpen) return { status: "rejected", reason: "session_window_closed" };

  const normalized = normalizePhoneNumber(to, deps.defaultCountryCode);
  if (!normalized.valid) return { status: "rejected", reason: `invalid_phone:${normalized.reason}` };

  const recipientCheck = validateRecipient(normalized.e164, deps.consentStore, deps.suppressionList);
  if (!recipientCheck.allowed) return { status: "rejected", reason: recipientCheck.reason };

  if (deduplicateOutboundMessage(idempotencyKey, deps.dedupStore)) {
    return { status: "skipped_duplicate", reason: `idempotency_key ${idempotencyKey} ya enviado` };
  }

  const handled = callProvider(deps.providerSend ?? defaultProviderSend);
  if (handled.status === "failed") return handled;

  return { status: "accepted", providerMessageId: handled.providerMessageId, tenantId };
}
