// Club Pádel 04 · Stripe Payments — Idempotencia de negocio (FASE 4)
// Complementa, sin fusionarse con:
//  - StripeEventDedupStore (stripe-adapter.mock.js): dedup por event.id de
//    Stripe — protege de que Stripe reenvíe el MISMO evento dos veces.
//  - verifyWebhookSignature (stripe-adapter.mock.js): protección de replay
//    por tolerancia de reloj sobre la firma.
// Este módulo protege un problema distinto: que DOS eventos Stripe
// DIFERENTES (p.ej. checkout.session.completed y payment_intent.succeeded
// del mismo cobro) describan el mismo pago de negocio, y que el efecto de
// negocio (marcar la reserva como pagada) se aplique más de una vez si
// ambos llegan. La clave aquí es idempotencyKey() (stripe-adapter.mock.js),
// no event.id.

/**
 * Store de idempotencia con protección de reintento seguro: si el efecto de
 * negocio (`effect`) lanza, la clave NO se marca como completada — un
 * reintento posterior (mismo webhook reentregado tras un 5xx, o un cron de
 * recuperación) puede volver a intentarlo. Solo un `effect` que resuelve con
 * éxito se congela para siempre bajo esa clave.
 */
export class PaymentIdempotencyStore {
  #completed = new Map(); // key -> { result, completedAtMs }
  #inFlight = new Set(); // keys en proceso ahora mismo (protección de concurrencia)

  /**
   * @param {string} key normalmente el resultado de idempotencyKey({tenantId, bookingId, paymentReference})
   * @param {() => any | Promise<any>} effect efecto de negocio a aplicar (p.ej. "marcar reserva pagada en Airtable")
   * @returns {Promise<{outcome: "already_completed"|"in_flight_skip"|"completed"|"failed_retry_safe", result?: any, error?: string}>}
   */
  async processOnce(key, effect) {
    if (this.#completed.has(key)) {
      return { outcome: "already_completed", result: this.#completed.get(key).result };
    }
    if (this.#inFlight.has(key)) {
      return { outcome: "in_flight_skip" };
    }

    this.#inFlight.add(key);
    try {
      const result = await effect();
      this.#completed.set(key, { result, completedAtMs: Date.now() });
      return { outcome: "completed", result };
    } catch (error) {
      return { outcome: "failed_retry_safe", error: error instanceof Error ? error.message : String(error) };
    } finally {
      this.#inFlight.delete(key);
    }
  }

  isCompleted(key) {
    return this.#completed.has(key);
  }

  get completedCount() {
    return this.#completed.size;
  }
}
