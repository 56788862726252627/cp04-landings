// Club Pádel 04 · Stripe Payments — Idempotency KV Adapter.
//
// Production Readiness 2026-07-10 — riesgo residual #2 ("idempotencia
// basada en memoria"). Integración KV 2026-07-10c: el binding
// STRIPE_IDEMPOTENCY_KV ya existe en worker-reservas/wrangler.toml con IDs
// reales de producción y preview (namespaces creados previamente en
// Cloudflare, ver audit/stripe-kv-provisioning-20260710/KV_PROVISIONING_PLAN.md).
// Esta clase se conecta a ese binding a través de
// stripe-lock-store-factory.js (createStripeEventLockStore) — sigue sin
// importarse desde worker-reservas/src/index.js, porque la ruta central del
// Worker (`/api/payments/stripe/webhook`) no se monta en esta sesión (ver
// WORKER_ROUTE_INTEGRATION_PLAN.md). Su constructor sigue lanzando si no
// recibe un objeto con forma de KVNamespace real, para que no pueda
// instanciarse por accidente sin un binding válido.
//
// Por qué existe además de StripeEventProcessingLockStore
// (stripe-idempotency-lock-store.js): ese store es 100% en memoria — cada
// isolate de Cloudflare Workers tiene su propia memoria, y un Worker puede
// reciclar el isolate en cualquier momento (redeploy, idle eviction, nueva
// versión). Un lock "acquired" en el isolate A es invisible para el isolate
// B que reciba el reintento de Stripe. Sin persistencia externa, dos
// isolates distintos podrían ambos creerse los primeros en procesar el
// mismo event.id. NINGÚN cambio de código puede arreglar esto sin un
// backend compartido — es la razón por la que el cierre técnico anterior
// (95%) no podía subir a producción sin este adapter.
//
// BINDING CONFIGURADO (worker-reservas/wrangler.toml):
//
//   [[kv_namespaces]]
//   binding = "STRIPE_IDEMPOTENCY_KV"
//   id = "5479e1741d0b4567bb4ee075efe21303"
//   preview_id = "029b31a07f9f40b8925c5d64e11a9b50"
//
// Alternativa D1 (si se prefiere consistencia transaccional sobre la
// eventual-consistency de KV — KV tiene hasta ~60s de propagación entre
// regiones, lo cual podría permitir una ventana de doble-procesamiento en el
// peor caso; D1 con una tabla `stripe_idempotency_lock(key TEXT PRIMARY KEY,
// state TEXT, locked_at_ms INTEGER, processed_at_ms INTEGER)` y `INSERT ...
// ON CONFLICT DO NOTHING` sería la opción sin esa ventana). Documentado como
// alternativa, no implementado — decisión de arquitectura pendiente, no de
// esta sesión.
//
// NADA de este archivo se ha ejecutado contra el KV real todavía (ni deploy,
// ni wrangler dev, ni escritura de claves) — la conexión de esta sesión es
// de código local únicamente.

import { LOCK_STATES } from "./stripe-idempotency-lock-store.js";

export { LOCK_STATES };

/**
 * Interfaz mínima que este adapter espera de su dependencia — el subconjunto
 * real de `KVNamespace` que usa (Cloudflare Workers Runtime API). Cualquier
 * objeto con esta forma sirve (permite inyectar un fake en tests futuros del
 * adapter mismo, sin necesitar Miniflare).
 * @typedef {{
 *   get: (key: string, opts?: {type?: "json"}) => Promise<any|null>,
 *   put: (key: string, value: string, opts?: {expirationTtl?: number}) => Promise<void>,
 *   delete: (key: string) => Promise<void>,
 * }} KvNamespaceLike
 */

const DEFAULT_STALE_LOCK_MS = 30_000;
const DEFAULT_PROCESSED_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 días — KV exige TTL en segundos, no ms.

function compoundKey(eventId, tenantId) {
  return tenantId ? `stripe_lock::${tenantId}::${eventId}` : `stripe_lock::${eventId}`;
}

/**
 * Mismo contrato de 5 verbos que StripeEventProcessingLockStore, respaldado
 * por un KVNamespace real en vez de un Map en memoria. Ver
 * IDEMPOTENCY_STORE_CONTRACT (stripe-idempotency-lock-store.js no la
 * exporta hoy — este skeleton documenta la forma exacta que debe respetar
 * cualquier adapter intercambiable).
 */
export class StripeEventProcessingKvLockStore {
  #kv;
  #staleLockMs;
  #processedTtlSeconds;

  /**
   * @param {KvNamespaceLike} kvNamespace binding real de Cloudflare (`env.STRIPE_IDEMPOTENCY_KV`).
   *   OBLIGATORIO — lanza si es null/undefined/no tiene get+put+delete, para
   *   que sea imposible instanciar esto "por accidente" sin un binding real.
   * @param {object} [opts]
   * @param {number} [opts.staleLockMs]
   * @param {number} [opts.processedTtlSeconds]
   */
  constructor(kvNamespace, { staleLockMs = DEFAULT_STALE_LOCK_MS, processedTtlSeconds = DEFAULT_PROCESSED_TTL_SECONDS } = {}) {
    const looksLikeKv = kvNamespace && typeof kvNamespace.get === "function" && typeof kvNamespace.put === "function" && typeof kvNamespace.delete === "function";
    if (!looksLikeKv) {
      throw new Error(
        "StripeEventProcessingKvLockStore requiere un KVNamespace real (env.STRIPE_IDEMPOTENCY_KV) con get/put/delete — no se puede instanciar sin un binding configurado. Ver el binding requerido documentado en la cabecera de este archivo.",
      );
    }
    this.#kv = kvNamespace;
    this.#staleLockMs = staleLockMs;
    this.#processedTtlSeconds = processedTtlSeconds;
  }

  async hasProcessedEvent(eventId, tenantId = null) {
    const entry = await this.#kv.get(compoundKey(eventId, tenantId), { type: "json" });
    return entry?.state === "PROCESSED";
  }

  async markEventProcessing(eventId, tenantId = null) {
    const key = compoundKey(eventId, tenantId);
    const entry = await this.#kv.get(key, { type: "json" });

    if (entry?.state === "PROCESSED") {
      return { acquired: false, reason: "already_processed" };
    }
    if (entry?.state === "PROCESSING") {
      const ageMs = Date.now() - entry.lockedAtMs;
      if (ageMs <= this.#staleLockMs) {
        return { acquired: false, reason: "locked_in_progress" };
      }
      await this.#kv.put(key, JSON.stringify({ state: "PROCESSING", lockedAtMs: Date.now() }));
      return { acquired: true, reason: "stale_lock_reclaimed" };
    }

    // TODO(binding real, no ejecutado en esta sesión): KV.put() NO es
    // compare-and-swap — dos isolates podrían leer "sin entrada" a la vez y
    // ambos escribir "acquired: true" (misma ventana de carrera que
    // cualquier read-then-write sin transacción). KV por sí solo no puede
    // cerrar esa ventana; si la concurrencia real de dos isolates procesando
    // el mismo evento en el mismo milisegundo resulta ser un riesgo de
    // negocio aceptado como bajo (Stripe no suele reintentar así de rápido),
    // esto es aceptable. Si no, la alternativa D1 con `INSERT ... ON
    // CONFLICT DO NOTHING` documentada en la cabecera SÍ cierra esa ventana
    // (constraint de PRIMARY KEY es atómico). Decisión pendiente, no de esta sesión.
    await this.#kv.put(key, JSON.stringify({ state: "PROCESSING", lockedAtMs: Date.now() }));
    return { acquired: true };
  }

  async markEventProcessed(eventId, tenantId = null) {
    const key = compoundKey(eventId, tenantId);
    const entry = await this.#kv.get(key, { type: "json" });
    if (entry?.state !== "PROCESSING") {
      throw new Error(`markEventProcessed: "${key}" no está en PROCESSING (estado actual: ${entry?.state ?? "sin entrada"}) — llama primero a markEventProcessing`);
    }
    await this.#kv.put(key, JSON.stringify({ state: "PROCESSED", processedAtMs: Date.now() }), { expirationTtl: this.#processedTtlSeconds });
  }

  async markEventFailed(eventId, tenantId = null) {
    await this.#kv.put(compoundKey(eventId, tenantId), JSON.stringify({ state: "FAILED", failedAtMs: Date.now() }), { expirationTtl: this.#processedTtlSeconds });
  }

  async releaseProcessingLock(eventId, tenantId = null) {
    await this.#kv.delete(compoundKey(eventId, tenantId));
  }
}
