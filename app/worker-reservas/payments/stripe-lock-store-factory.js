// Club Pádel 04 · Stripe Payments — Lock Store Factory (integración KV real, 2026-07-10c).
//
// Punto único de selección entre el adapter KV real
// (StripeEventProcessingKvLockStore, stripe-idempotency-kv-adapter.skeleton.js)
// y el fallback en memoria (StripeEventProcessingLockStore,
// stripe-idempotency-lock-store.js) — el patrón que
// audit/stripe-kv-provisioning-20260710/KV_PROVISIONING_PLAN.md (FASE 4,
// punto 7) dejó anotado como "pendiente, no de esta sesión". Ahora que el
// binding STRIPE_IDEMPOTENCY_KV existe en worker-reservas/wrangler.toml con
// IDs reales, este módulo es ese punto de integración.
//
// Regla no negociable: si env.STRIPE_IDEMPOTENCY_KV está presente, este
// factory SIEMPRE devuelve el adapter KV — nunca degrada en silencio a
// memoria solo porque sea más simple. La única vía de fallback a memoria es
// la AUSENCIA del binding (entorno local/tests/rollback de emergencia). Si el
// binding está presente pero no tiene la forma de un KVNamespace real, se
// lanza un error explícito en vez de continuar en memoria sin avisar.
//
// Este módulo NO se importa todavía desde worker-reservas/src/index.js — la
// ruta central del Worker (`/api/payments/stripe/webhook`) sigue sin
// montarse (WORKER_ROUTE_INTEGRATION_PLAN.md), fuera del alcance de esta
// sesión.

import { StripeEventProcessingKvLockStore } from "./stripe-idempotency-kv-adapter.skeleton.js";
import { StripeEventProcessingLockStore } from "./stripe-idempotency-lock-store.js";

function looksLikeKvNamespace(candidate) {
  return Boolean(candidate) && typeof candidate.get === "function" && typeof candidate.put === "function" && typeof candidate.delete === "function";
}

/**
 * @param {{STRIPE_IDEMPOTENCY_KV?: unknown}} env objeto `env` del Worker (o un fake en tests).
 * @param {object} [opts]
 * @param {number} [opts.staleLockMs] usado por ambos backends.
 * @param {number} [opts.processedTtlMs] solo backend memoria (StripeEventProcessingLockStore).
 * @param {number} [opts.failedTtlMs] solo backend memoria.
 * @param {() => number} [opts.now] solo backend memoria (inyección de reloj para tests).
 * @param {number} [opts.processedTtlSeconds] solo backend KV (expirationTtl nativo, en segundos).
 * @returns {{store: StripeEventProcessingLockStore | StripeEventProcessingKvLockStore, backend: "kv" | "memory"}}
 */
export function createStripeEventLockStore(env, opts = {}) {
  const kvBinding = env?.STRIPE_IDEMPOTENCY_KV;

  if (kvBinding !== undefined && kvBinding !== null) {
    if (!looksLikeKvNamespace(kvBinding)) {
      throw new Error(
        "createStripeEventLockStore: env.STRIPE_IDEMPOTENCY_KV está presente pero no expone get/put/delete (no parece un KVNamespace real) — no se degrada en silencio a memoria; corrige el binding en wrangler.toml o el fake inyectado en el test.",
      );
    }
    const { staleLockMs, processedTtlSeconds } = opts;
    return { store: new StripeEventProcessingKvLockStore(kvBinding, { staleLockMs, processedTtlSeconds }), backend: "kv" };
  }

  const { staleLockMs, processedTtlMs, failedTtlMs, now } = opts;
  return { store: new StripeEventProcessingLockStore({ staleLockMs, processedTtlMs, failedTtlMs, now }), backend: "memory" };
}
