// Club Pádel 04 · WhatsApp Business Platform — Idempotency avanzada (T-whatsapp-closure, 2026-07-10, FASE 7)
// Aislado, no conectado. Complementa (no reemplaza) WhatsappDuplicateSendStore/
// deduplicateOutboundMessage de whatsapp-adapter.mock.js, que sigue siendo
// el dedup INTERNO de sendTemplateMessage()/sendTextMessage() sin cambios
// (marca antes de conocer el resultado del proveedor, por diseño — ver el
// comentario en tests/whatsapp/adapter.test.mjs: "un fallo del proveedor NO
// debe deshacer la marca de dedup"). Este módulo resuelve dos problemas
// DISTINTOS que ese dedup simple no cubre:
//
// 1. Alcance por tenant: WhatsappDuplicateSendStore es un Set plano — si dos
//    tenants generan por coincidencia el mismo idempotency_key (posible si
//    un llamador no namespacea, p.ej. usa solo el booking_reference sin
//    prefijo de tenant), colisionarían y el segundo tenant vería su envío
//    real bloqueado como "duplicado" de otro cliente. TenantScopedDedupStore
//    lo resuelve sin tocar la clase existente — la REUTILIZA, una instancia
//    aislada por tenant.
// 2. Concurrencia dentro de un mismo intento: WhatsappDuplicateSendStore
//    responde "¿ya se completó?", no "¿alguien lo está procesando ahora
//    mismo?" — dos requests concurrentes con el mismo idempotency_key pueden
//    llegar ambas ANTES de que la primera marque el store. SendLockStore
//    añade esa segunda pregunta (lock de "en vuelo"), con recuperación por
//    lock obsoleto (`stale`) para el caso de un worker que se cae sin
//    liberar el lock.

import { WhatsappDuplicateSendStore } from "./whatsapp-adapter.mock.js";

/**
 * Una WhatsappDuplicateSendStore AISLADA por tenant — nunca se comparte una
 * misma instancia interna entre dos tenants, así que un idempotency_key
 * repetido entre tenants nunca colisiona.
 */
export class TenantScopedDedupStore {
  #stores = new Map(); // tenantId -> WhatsappDuplicateSendStore

  /** @param {string} tenantId @returns {WhatsappDuplicateSendStore} */
  forTenant(tenantId) {
    if (!tenantId) throw new Error("TenantScopedDedupStore.forTenant: tenantId obligatorio — ningún tenant es implícito");
    if (!this.#stores.has(tenantId)) {
      this.#stores.set(tenantId, new WhatsappDuplicateSendStore());
    }
    return this.#stores.get(tenantId);
  }

  get tenantCount() {
    return this.#stores.size;
  }
}

const DEFAULT_STALE_AFTER_MS = 30000;

/**
 * Lock de "en vuelo" por clave — modela el intervalo entre "empecé a
 * procesar este envío" y "terminé (éxito o fallo)". No es un mutex real
 * distribuido (esto es un mock local, sin red, sin Durable Objects/KV) — el
 * equivalente real en producción sería un lock en Durable Object o
 * `KV.put(..., {expirationTtl})` con el mismo contrato de staleness.
 */
export class SendLockStore {
  #locks = new Map(); // key -> acquiredAtMs

  /**
   * @param {string} key
   * @param {{nowMs?: number, staleAfterMs?: number}} [opts]
   * @returns {{acquired: boolean, stale: boolean}} `stale:true` significa que el lock existía pero había caducado (recuperación de un holder que nunca liberó) — el caller debería auditar/loguear ese caso, no tratarlo como un acquire silencioso normal.
   */
  tryAcquire(key, { nowMs = Date.now(), staleAfterMs = DEFAULT_STALE_AFTER_MS } = {}) {
    const acquiredAtMs = this.#locks.get(key);
    if (acquiredAtMs === undefined) {
      this.#locks.set(key, nowMs);
      return { acquired: true, stale: false };
    }
    if (nowMs - acquiredAtMs > staleAfterMs) {
      this.#locks.set(key, nowMs);
      return { acquired: true, stale: true };
    }
    return { acquired: false, stale: false };
  }

  /** @param {string} key */
  release(key) {
    this.#locks.delete(key);
  }

  /** @param {string} key @param {{nowMs?: number, staleAfterMs?: number}} [opts] */
  isLocked(key, { nowMs = Date.now(), staleAfterMs = DEFAULT_STALE_AFTER_MS } = {}) {
    const acquiredAtMs = this.#locks.get(key);
    if (acquiredAtMs === undefined) return false;
    return nowMs - acquiredAtMs <= staleAfterMs;
  }

  get lockedCount() {
    return this.#locks.size;
  }
}

/**
 * Orquesta dedup (¿ya completado?) + lock (¿en vuelo ahora mismo?) alrededor
 * de una función de envío arbitraria (normalmente sendTemplateMessage()/
 * sendTextMessage() ya parametrizados por el caller). Estrategia de marcado
 * DISTINTA y deliberadamente más permisiva que el dedup interno del
 * adapter: aquí solo se marca "enviado" tras un resultado `status:"accepted"`
 * — un fallo del proveedor libera el lock SIN marcar dedup, así que un
 * reintento posterior con el MISMO idempotency_key sí puede volver a
 * intentarlo (a diferencia de deduplicateOutboundMessage(), que marca antes
 * de conocer el resultado). Dos estrategias válidas para dos capas
 * distintas — el caller elige cuál usar según si su `sendFn` ya incluye o
 * no el dedup interno del adapter.
 * @param {{tenantId: string, idempotencyKey: string, dedupStore: TenantScopedDedupStore, lockStore: SendLockStore, nowMs?: number, staleAfterMs?: number}} params
 * @param {() => Promise<object>} sendFn función que realiza el envío real (o llama al adapter mock)
 * @returns {Promise<{status: string, reason?: string, stale?: boolean, result?: object}>}
 */
export async function guardedSend({ tenantId, idempotencyKey, dedupStore, lockStore, nowMs, staleAfterMs }, sendFn) {
  if (!tenantId) return { status: "rejected", reason: "missing_tenant_id" };
  const tenantStore = dedupStore.forTenant(tenantId);
  if (tenantStore.wasSent(idempotencyKey)) {
    return { status: "skipped_duplicate", reason: "already_completed" };
  }

  const lockKey = `${tenantId}:${idempotencyKey}`;
  const lockResult = lockStore.tryAcquire(lockKey, { nowMs, staleAfterMs });
  if (!lockResult.acquired) {
    return { status: "locked", reason: "concurrent_duplicate_in_flight" };
  }

  try {
    const result = await sendFn();
    if (result?.status === "accepted") {
      tenantStore.markSent(idempotencyKey);
    }
    return { status: result?.status ?? "unknown", stale: lockResult.stale, result };
  } finally {
    lockStore.release(lockKey);
  }
}
