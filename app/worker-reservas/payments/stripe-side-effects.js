// Club Pádel 04 · Stripe Payments — Side Effect Abstraction (FASE 3, cierre técnico).
//
// Contratos de los 5 efectos de negocio que un webhook de Stripe puede
// disparar. Ninguna implementación de este fichero toca Airtable, Make,
// ni ninguna red — createInMemorySideEffects() es la única implementación
// aquí, pensada para tests/sandbox harness. El día que exista una decisión
// de negocio real, la implementación real (Airtable/Make) debe cumplir
// exactamente esta misma firma — este fichero es el contrato a satisfacer,
// no un lugar donde conectar nada todavía.

/** Un reintento de Stripe (mismo evento reentregado) puede resolver este error — nunca se marca la clave de idempotencia como completada. */
export class RetryableSideEffectError extends Error {
  constructor(message) {
    super(message);
    this.name = "RetryableSideEffectError";
    this.retryable = true;
  }
}

/** Reintentar NO va a arreglar este error (dato inválido, regla de negocio violada) — no tiene sentido que Stripe reintente. */
export class PermanentSideEffectError extends Error {
  constructor(message) {
    super(message);
    this.name = "PermanentSideEffectError";
    this.retryable = false;
  }
}

/** Firmas documentales — misma convención que STRIPE_ADAPTER_CONTRACT en stripe-contract.js. */
export const SIDE_EFFECT_CONTRACT = Object.freeze({
  markBookingPaid: "(params: {tenantId, clientId, bookingId, paymentReference, eventId}) => Promise<void>",
  markPaymentFailed: "(params: {tenantId, clientId, bookingId, paymentReference, eventId, reason}) => Promise<void>",
  markRefunded: "(params: {tenantId, clientId, bookingId, paymentReference, eventId}) => Promise<void>",
  publishPaymentEvent: "(params: {eventType, status, tenantId, bookingId, eventId}) => Promise<void>",
  writeAuditEvent: "(params: {action, tenantId, eventId, metadata}) => Promise<void>",
});

export const SIDE_EFFECT_NAMES = Object.freeze(Object.keys(SIDE_EFFECT_CONTRACT));

/**
 * Implementación en memoria de las 5 firmas — nunca hace I/O real. Cada
 * llamada queda registrada en `.calls` (orden de invocación preservado) para
 * que tests y el sandbox harness (FASE 6) puedan inspeccionar qué se
 * habría hecho sin ejecutar ningún efecto de verdad.
 *
 * @param {object} [opts]
 * @param {Record<string, "retryable"|"permanent">} [opts.simulateFailureFor]
 *   nombre de efecto -> modo de fallo a forzar. Solo para tests — permite
 *   ejercitar las rutas RETRYABLE_FAILURE/PERMANENT_FAILURE del harness
 *   (FASE 1) sin depender de un fallo real de infraestructura.
 */
export function createInMemorySideEffects({ simulateFailureFor = {} } = {}) {
  const calls = [];

  function record(name, params) {
    calls.push({ name, params, at: new Date().toISOString() });
  }

  function maybeFail(name) {
    const mode = simulateFailureFor[name];
    if (mode === "retryable") throw new RetryableSideEffectError(`fallo simulado (retryable) en ${name}`);
    if (mode === "permanent") throw new PermanentSideEffectError(`fallo simulado (permanent) en ${name}`);
  }

  return {
    calls,
    async markBookingPaid(params) {
      record("markBookingPaid", params);
      maybeFail("markBookingPaid");
    },
    async markPaymentFailed(params) {
      record("markPaymentFailed", params);
      maybeFail("markPaymentFailed");
    },
    async markRefunded(params) {
      record("markRefunded", params);
      maybeFail("markRefunded");
    },
    async publishPaymentEvent(params) {
      record("publishPaymentEvent", params);
      maybeFail("publishPaymentEvent");
    },
    async writeAuditEvent(params) {
      record("writeAuditEvent", params);
      maybeFail("writeAuditEvent");
    },
  };
}

/** Efecto primario por PAYMENT_STATUS — EXPIRED no tiene efecto primario (nunca hubo un pago que marcar fallido/pagado), solo se audita/publica. */
export const PRIMARY_EFFECT_BY_STATUS = Object.freeze({
  PAID: "markBookingPaid",
  FAILED: "markPaymentFailed",
  REFUNDED: "markRefunded",
  EXPIRED: null,
});
