// Club Pádel 04 · Stripe Payments — Idempotency Store Contract (FASE 4, cierre técnico
// 2026-07-10; refactor async + tenant-scoped + TTL en Production Readiness 2026-07-10b,
// riesgo residual #2).
//
// Complementa, sin sustituir, los dos mecanismos de idempotencia ya
// existentes (stripe-adapter.mock.js/stripe-idempotency.js):
//  - StripeEventDedupStore: has/mark plano por event.id, sin estado de "en
//    proceso" ni recuperación de lock — suficiente para dedup simple.
//  - PaymentIdempotencyStore: processOnce() por CLAVE DE NEGOCIO
//    (tenant+booking+payment_reference), protege que dos eventos Stripe
//    DISTINTOS no dupliquen el mismo efecto de negocio. Su clave
//    (idempotencyKey(), stripe-adapter.mock.js) ya incluye tenantId, así que
//    la protección "same key/different tenant" para el efecto de NEGOCIO ya
//    existía antes de esta sesión — lo que faltaba era la misma protección
//    en el lock POR EVENTO (este módulo), que hasta ahora indexaba solo por
//    event.id de Stripe.
//
// Este módulo cubre lo que ninguno de los dos cubre: un ciclo de vida
// explícito de 5 verbos por event.id (hasProcessedEvent/markEventProcessing/
// markEventProcessed/markEventFailed/releaseProcessingLock), pensado para un
// entorno con más de un worker/isolate procesando el mismo evento en
// paralelo (reintento de Stripe llegando mientras el primer intento sigue en
// vuelo) — el caso que ni el dedup simple ni processOnce (pensado para un
// solo proceso) modelan con un lock explícito y recuperable.
//
// Producción-ready (riesgo residual #2, ver
// audit/stripe-production-readiness-20260710/IDEMPOTENCY_STORE_CONTRACT.md):
//  - Los 5 verbos son ahora ASYNC (devuelven Promise), aunque esta
//    implementación en memoria resuelve de forma síncrona por dentro — es
//    deliberado: un binding KV/D1 real (KVNamespace.get/put, D1 prepared
//    statements) es intrínsecamente asíncrono, y el contrato debe ser
//    idéntico para ambos o no son intercambiables. Ver
//    stripe-idempotency-kv-adapter.skeleton.js para el adapter real (NO
//    activo, sin binding configurado).
//  - `tenantId` es ahora un segundo parámetro opcional en los 5 verbos. Si se
//    omite, la clave sigue siendo solo `eventId` (100% compatible con el
//    comportamiento anterior a esta sesión — ningún test viejo se rompe). Si
//    se pasa, la clave real es `${tenantId}::${eventId}`, cerrando de forma
//    explícita la protección "same key/different tenant" también a nivel de
//    lock por evento (defensa en profundidad: los event.id de Stripe son
//    globalmente únicos en la práctica, pero este store nunca debe confiar
//    en esa garantía externa por sí sola).
//  - `processedTtlMs`/`failedTtlMs` (opcionales, sin valor por defecto = sin
//    expiración) permiten que una entrada PROCESSED/FAILED expire y libere
//    memoria — evaluado de forma perezosa en cada lectura, nunca con un
//    temporizador de fondo (no hay "background timers" fiables en un Worker
//    fuera de una request). Un adapter KV real debería usar el TTL nativo de
//    KV (`expirationTtl` en `put()`) en vez de esta lógica perezosa.

export const LOCK_STATES = Object.freeze(["PROCESSING", "PROCESSED", "FAILED"]);

/**
 * Interfaz desacoplada del proveedor (mismo patrón documental que
 * STRIPE_ADAPTER_CONTRACT en stripe-contract.js) — cualquier adapter
 * intercambiable (esta clase en memoria, o
 * StripeEventProcessingKvLockStore en stripe-idempotency-kv-adapter.skeleton.js)
 * debe implementar exactamente estas 5 firmas async. Cubre los 9 aspectos
 * pedidos por Production Readiness (riesgo residual #2): deduplicación
 * (hasProcessedEvent), concurrencia (markEventProcessing/locked_in_progress),
 * estado processing (PROCESSING), estado completed (PROCESSED), estado
 * failed/retryable (FAILED + markEventFailed no marca hasProcessedEvent),
 * TTL (processedTtlMs/failedTtlMs, o expirationTtl nativo en el adapter KV),
 * protección same-key/different-tenant (parámetro tenantId opcional),
 * recuperación tras fallo parcial (markEventFailed libera para reintento),
 * replay seguro (already_processed nunca reejecuta).
 */
export const IDEMPOTENCY_STORE_CONTRACT = Object.freeze({
  hasProcessedEvent: "(eventId: string, tenantId?: string|null) => Promise<boolean>",
  markEventProcessing: "(eventId: string, tenantId?: string|null) => Promise<{acquired: boolean, reason?: string}>",
  markEventProcessed: "(eventId: string, tenantId?: string|null) => Promise<void>",
  markEventFailed: "(eventId: string, tenantId?: string|null) => Promise<void>",
  releaseProcessingLock: "(eventId: string, tenantId?: string|null) => Promise<void>",
});

function compoundKey(eventId, tenantId) {
  return tenantId ? `${tenantId}::${eventId}` : eventId;
}

/**
 * @param {object} [opts]
 * @param {number} [opts.staleLockMs] tras cuánto tiempo un lock en PROCESSING
 *   se considera abandonado (crash/timeout del proceso que lo tomó) y puede
 *   reclamarse por un intento nuevo, en vez de bloquear para siempre.
 * @param {number} [opts.processedTtlMs] tras cuánto tiempo una entrada
 *   PROCESSED se considera expirada (libera memoria, vuelve a estar
 *   disponible como si nunca se hubiera visto). Sin valor por defecto: sin
 *   expiración — solo apto para procesos de vida corta (tests/sandbox
 *   local); un adapter KV real debe fijar `expirationTtl` en el `put()`.
 * @param {number} [opts.failedTtlMs] igual que processedTtlMs pero para FAILED.
 * @param {() => number} [opts.now] inyectable para tests deterministas.
 */
export class StripeEventProcessingLockStore {
  #entries = new Map(); // compoundKey -> { state, lockedAtMs, processedAtMs, failedAtMs }
  #staleLockMs;
  #processedTtlMs;
  #failedTtlMs;
  #now;

  constructor({ staleLockMs = 30_000, processedTtlMs, failedTtlMs, now = () => Date.now() } = {}) {
    this.#staleLockMs = staleLockMs;
    this.#processedTtlMs = processedTtlMs;
    this.#failedTtlMs = failedTtlMs;
    this.#now = now;
  }

  /** Lee la entrada aplicando expiración perezosa por TTL — una entrada expirada se borra y se trata como inexistente. */
  #read(key) {
    const entry = this.#entries.get(key);
    if (!entry) return undefined;
    if (entry.state === "PROCESSED" && this.#processedTtlMs != null && this.#now() - entry.processedAtMs > this.#processedTtlMs) {
      this.#entries.delete(key);
      return undefined;
    }
    if (entry.state === "FAILED" && this.#failedTtlMs != null && this.#now() - entry.failedAtMs > this.#failedTtlMs) {
      this.#entries.delete(key);
      return undefined;
    }
    return entry;
  }

  /** true solo si el evento ya alcanzó PROCESSED (y no ha expirado por TTL) — un FAILED anterior NO cuenta como procesado (permite reintento). */
  async hasProcessedEvent(eventId, tenantId = null) {
    return this.#read(compoundKey(eventId, tenantId))?.state === "PROCESSED";
  }

  /**
   * Intenta tomar el lock de procesamiento para `eventId` (opcionalmente
   * namespaced por `tenantId` — ver nota de cabecera "same key/different
   * tenant").
   * @returns {Promise<{acquired: boolean, reason?: "already_processed"|"locked_in_progress"|"stale_lock_reclaimed"}>}
   */
  async markEventProcessing(eventId, tenantId = null) {
    const key = compoundKey(eventId, tenantId);
    const entry = this.#read(key);

    if (entry?.state === "PROCESSED") {
      return { acquired: false, reason: "already_processed" };
    }

    if (entry?.state === "PROCESSING") {
      const ageMs = this.#now() - entry.lockedAtMs;
      if (ageMs <= this.#staleLockMs) {
        return { acquired: false, reason: "locked_in_progress" };
      }
      // Lock abandonado (crash/timeout del intento anterior) — se reclama,
      // nunca se descarta en silencio: el caller puede loguear
      // "stale_lock_reclaimed" como señal operativa de que algo no liberó su lock.
      this.#entries.set(key, { state: "PROCESSING", lockedAtMs: this.#now() });
      return { acquired: true, reason: "stale_lock_reclaimed" };
    }

    // Sin entrada previa, o FAILED (reintento tras fallo parcial) — libre para tomar.
    this.#entries.set(key, { state: "PROCESSING", lockedAtMs: this.#now() });
    return { acquired: true };
  }

  /** Requiere tener el lock (PROCESSING) — marcar como procesado sin haberlo tomado es un error de uso del caller. */
  async markEventProcessed(eventId, tenantId = null) {
    const key = compoundKey(eventId, tenantId);
    const entry = this.#entries.get(key);
    if (entry?.state !== "PROCESSING") {
      throw new Error(`markEventProcessed: "${key}" no está en PROCESSING (estado actual: ${entry?.state ?? "sin entrada"}) — llama primero a markEventProcessing`);
    }
    this.#entries.set(key, { state: "PROCESSED", processedAtMs: this.#now() });
  }

  /** Libera el lock marcando FAILED — el evento queda elegible para un reintento futuro (hasProcessedEvent sigue false). */
  async markEventFailed(eventId, tenantId = null) {
    this.#entries.set(compoundKey(eventId, tenantId), { state: "FAILED", failedAtMs: this.#now() });
  }

  /**
   * Libera el lock SIN decidir éxito/fallo — recuperación operativa manual
   * (p.ej. un proceso de limpieza de locks huérfanos), distinto de
   * markEventFailed porque no dice nada sobre el resultado, solo desbloquea.
   * Tras esto, el evento vuelve a estar disponible para markEventProcessing
   * como si nunca se hubiera intentado.
   */
  async releaseProcessingLock(eventId, tenantId = null) {
    this.#entries.delete(compoundKey(eventId, tenantId));
  }

  /** Introspección de test/observabilidad — no forma parte del contrato de 5 verbos pedido por la misión. Síncrona a propósito (debug-only, nunca en la ruta caliente). */
  getState(eventId, tenantId = null) {
    return this.#read(compoundKey(eventId, tenantId))?.state ?? null;
  }
}
