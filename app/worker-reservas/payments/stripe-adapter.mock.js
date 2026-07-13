// Club Pádel 04 · Stripe Payments Adapter (mock)
// Implementación en modo mock del contrato descrito en stripe-contract.js.
// No importa el SDK de Stripe, no hace ninguna llamada de red, no está
// importado en worker-reservas/src/index.js (mismo patrón que
// worker-reservas/auth/auth-adapter.mock.js). Usa Web Crypto (globalThis.crypto.subtle)
// en vez de node:crypto para que el mismo código funcione, sin cambios,
// cuando se despliegue en el Worker real (Cloudflare Workers expone
// crypto.subtle de forma nativa, sin compat flags).

import {
  EVENT_TYPE_TO_STATUS,
  REQUIRED_METADATA_FIELDS,
} from "./stripe-contract.js";

const DEFAULT_TOLERANCE_SECONDS = 300; // misma tolerancia por defecto que usa Stripe

async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signatureBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparación en tiempo constante de dos strings hex de igual longitud esperada. */
function timingSafeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function parseSignatureHeader(header) {
  const parts = Object.fromEntries(String(header).split(",").map((kv) => kv.split("=")));
  return { timestamp: Number(parts.t), signature: parts.v1 };
}

/**
 * Firma un payload como lo haría Stripe (`t=<ts>,v1=<hmac>` sobre `${ts}.${rawBody}`).
 * Solo para generar fixtures/tests firmados — nunca se usa con un secreto real.
 */
export async function signStripeEvent(eventPayload, secret, timestamp = Math.floor(Date.now() / 1000)) {
  const rawBody = JSON.stringify(eventPayload);
  const signedPayload = `${timestamp}.${rawBody}`;
  const signature = await hmacSha256Hex(secret, signedPayload);
  return { header: `t=${timestamp},v1=${signature}`, rawBody };
}

/**
 * Igual que signStripeEvent(), pero firma un rawBody YA SERIALIZADO en vez
 * de un objeto (JSON.stringify(eventPayload) internamente en
 * signStripeEvent puede no reproducir bytes ya inválidos o ya-string, como
 * el fixture de payload malformado — ver fixtures/stripe/12-malformed-payload.raw.txt).
 * Añadido en el cierre técnico (FASE 6, sandbox harness) — mismo algoritmo,
 * sin duplicar la lógica HMAC (reutiliza hmacSha256Hex de este módulo).
 */
export async function signRawBody(rawBody, secret, timestamp = Math.floor(Date.now() / 1000)) {
  const signature = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
  return { header: `t=${timestamp},v1=${signature}`, rawBody };
}

/**
 * @param {string} rawBody cuerpo exacto tal como se firmó (no re-serializar el objeto)
 * @param {string} signatureHeader valor de la cabecera Stripe-Signature
 * @param {string} secret
 * @param {{toleranceSeconds?: number, now?: number}} [opts]
 * @returns {Promise<{valid: boolean, reason?: string}>}
 */
export async function verifyWebhookSignature(rawBody, signatureHeader, secret, opts = {}) {
  const toleranceSeconds = opts.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  const now = opts.now ?? Math.floor(Date.now() / 1000);

  if (!signatureHeader || typeof signatureHeader !== "string" || !signatureHeader.includes("t=") || !signatureHeader.includes("v1=")) {
    return { valid: false, reason: "malformed_signature_header" };
  }

  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed.timestamp || !parsed.signature) return { valid: false, reason: "malformed_signature_header" };

  const expected = await hmacSha256Hex(secret, `${parsed.timestamp}.${rawBody}`);
  if (expected.length !== parsed.signature.length || !timingSafeEqualHex(expected, parsed.signature)) {
    return { valid: false, reason: "signature_mismatch" };
  }

  if (Math.abs(now - parsed.timestamp) > toleranceSeconds) {
    return { valid: false, reason: "timestamp_outside_tolerance_possible_replay" };
  }

  return { valid: true };
}

/** @param {string} stripeEventType @returns {string|null} PAYMENT_STATUS o null si el tipo no está soportado por este adapter */
export function mapPaymentStatus(stripeEventType) {
  return EVENT_TYPE_TO_STATUS[stripeEventType] ?? null;
}

/** @param {object} event evento Stripe ya deserializado @returns {{valid: boolean, missing: string[]}} */
export function validateEventMetadata(event) {
  const metadata = event?.data?.object?.metadata ?? {};
  const missing = REQUIRED_METADATA_FIELDS.filter((field) => !metadata[field]);
  return { valid: missing.length === 0, missing };
}

/**
 * Clave de idempotencia de NEGOCIO (no confundir con event.id de Stripe, que
 * ya está cubierto por StripeEventDedupStore). Esta clave identifica "este
 * pago concreto de esta reserva de este tenant" para que, si dos eventos
 * Stripe distintos (p.ej. un checkout.session.completed y un
 * payment_intent.succeeded del mismo cobro) llegasen a describir el mismo
 * pago, el efecto de negocio (marcar la reserva como pagada) se aplique una
 * sola vez.
 * @param {{tenantId: string, bookingId: string, paymentReference: string}} params
 * @returns {string}
 */
export function idempotencyKey({ tenantId, bookingId, paymentReference }) {
  if (!tenantId || !bookingId || !paymentReference) {
    throw new Error("idempotencyKey requiere tenantId, bookingId y paymentReference — ninguno es opcional");
  }
  return `stripe:${tenantId}:${bookingId}:${paymentReference}`;
}

/** Dedup de eventos por event.id — mismo principio que StripeEventDedupStore de scripts/make-qa/stripe-mock.mjs. */
export class StripeEventDedupStore {
  #seen = new Set();

  isDuplicate(eventId) {
    return this.#seen.has(eventId);
  }

  markProcessed(eventId) {
    this.#seen.add(eventId);
  }

  get processedCount() {
    return this.#seen.size;
  }
}

/**
 * @param {string} eventId
 * @param {StripeEventDedupStore} store
 * @returns {boolean} true si YA era un duplicado (no se marca de nuevo); false si es la primera vez (se marca ahora)
 */
export function duplicateEventProtection(eventId, store) {
  if (store.isDuplicate(eventId)) return true;
  store.markProcessed(eventId);
  return false;
}

/**
 * Store de sesiones de Checkout en memoria — sustituye a la API real de
 * Stripe (`stripe.checkout.sessions.create/retrieve`) para poder probar el
 * contrato sin credenciales. Instanciar una por test/caso de uso: no hay
 * estado compartido a nivel de módulo.
 */
export class MockStripeCheckoutStore {
  #sessions = new Map();

  /**
   * @param {{tenantId: string, clientId: string, userId: string, bookingId: string, amount: number, currency?: string, successUrl: string, cancelUrl: string}} params
   * @returns {object} CheckoutSession (forma mock, subconjunto de la real: id, status, metadata...)
   */
  createCheckoutSession({ tenantId, clientId, userId, bookingId, amount, currency = "eur", successUrl, cancelUrl }) {
    for (const [key, value] of Object.entries({ tenantId, clientId, userId, bookingId, successUrl, cancelUrl })) {
      if (!value) throw new Error(`createCheckoutSession requiere '${key}' — ningún campo de tenant/reserva es opcional`);
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("createCheckoutSession requiere 'amount' entero positivo, en céntimos (misma convención que Stripe real)");
    }

    const sequence = this.#sessions.size + 1;
    const paymentReference = `payref_${tenantId}_${bookingId}_${sequence}`;
    const sessionId = `cs_test_mock_${tenantId}_${bookingId}_${sequence}`;

    const session = Object.freeze({
      id: sessionId,
      object: "checkout.session",
      livemode: false,
      status: "open",
      amount_total: amount,
      currency,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: Object.freeze({
        tenant_id: tenantId,
        client_id: clientId,
        user_id: userId,
        booking_id: bookingId,
        payment_reference: paymentReference,
      }),
    });

    this.#sessions.set(sessionId, session);
    return session;
  }

  /** @param {string} sessionId @returns {object|null} */
  retrieveSession(sessionId) {
    return this.#sessions.get(sessionId) ?? null;
  }

  /** Simula el side-effect de que Stripe completa el pago — solo para construir fixtures/tests de webhook end-to-end. */
  markSessionCompleted(sessionId) {
    const session = this.#sessions.get(sessionId);
    if (!session) throw new Error(`MockStripeCheckoutStore: sesión desconocida '${sessionId}'`);
    const updated = { ...session, status: "complete" };
    this.#sessions.set(sessionId, updated);
    return updated;
  }
}

/**
 * Orquesta el recorrido completo de un webhook entrante: firma -> parseo ->
 * metadata -> tenant/user esperado -> dedup -> mapeo de estado. Es la
 * implementación mock de `handleWebhookEvent` del contrato. Nunca lanza
 * excepciones por payload malo — todo fallo se devuelve como
 * `{action: "reject", reason}` para que el llamador decida el código HTTP.
 *
 * @param {string} rawBody
 * @param {string} signatureHeader
 * @param {{webhookSecret: string, dedupStore?: StripeEventDedupStore, expectedTenantId?: string, expectedUserId?: string, toleranceSeconds?: number, now?: number}} env
 * @returns {Promise<object>} WebhookHandlingResult
 */
export async function handleWebhookEvent(rawBody, signatureHeader, env) {
  const { webhookSecret, dedupStore, expectedTenantId = null, expectedUserId = null, toleranceSeconds, now } = env;

  const signatureResult = await verifyWebhookSignature(rawBody, signatureHeader, webhookSecret, { toleranceSeconds, now });
  if (!signatureResult.valid) {
    const reason = signatureResult.reason === "timestamp_outside_tolerance_possible_replay" ? "replay_rejected" : signatureResult.reason;
    return { action: "reject", reason };
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return { action: "reject", reason: "malformed_payload" };
  }

  if (!event || typeof event !== "object" || !event.id || !event.type || !event.data?.object?.id) {
    return { action: "reject", reason: "malformed_payload" };
  }

  const metadataCheck = validateEventMetadata(event);
  if (!metadataCheck.valid) {
    return { action: "reject", reason: "missing_metadata", missing: metadataCheck.missing };
  }

  const metadata = event.data.object.metadata;
  if (expectedTenantId && metadata.tenant_id !== expectedTenantId) {
    return { action: "reject", reason: "wrong_tenant" };
  }
  if (expectedUserId && metadata.user_id !== expectedUserId) {
    return { action: "reject", reason: "wrong_user" };
  }

  if (dedupStore && duplicateEventProtection(event.id, dedupStore)) {
    return { action: "skip_duplicate", reason: "event.id ya procesado — idempotencia", eventId: event.id };
  }

  const status = mapPaymentStatus(event.type);
  if (!status) {
    return { action: "ignore_unhandled_event_type", reason: `tipo de evento no soportado por este adapter: ${event.type}` };
  }

  return {
    action: "process",
    status,
    eventId: event.id,
    tenantId: metadata.tenant_id,
    clientId: metadata.client_id,
    userId: metadata.user_id,
    bookingId: metadata.booking_id,
    paymentReference: metadata.payment_reference,
    idempotencyKey: idempotencyKey({ tenantId: metadata.tenant_id, bookingId: metadata.booking_id, paymentReference: metadata.payment_reference }),
  };
}
