// Paso 15 · Fase 3 — Circuit breaker sencillo / estado de salud básico.
//
// Cuenta fallos consecutivos (failed/timeout) por proveedor. Tras
// `failureThreshold` fallos seguidos, el proveedor queda "blocked": el
// puente (orchestratorProviderBridge.js) lo desactiva en el registro
// antes de resolver la siguiente cadena de fallback, protegiendo
// ejecuciones futuras dentro del MISMO proceso (p. ej. un CLI que audita
// varios negocios seguidos y reutiliza el mismo breaker) de golpear un
// proveedor real que ya se sabe caído. Un único fallo NUNCA bloquea nada
// (degradación controlada: la auditoría sigue con el resto de la cadena).

const FAILURE_STATUSES = Object.freeze(["failed", "timeout"]);
const RECOVERY_STATUSES = Object.freeze(["success", "partial"]);

export function createProviderCircuitBreaker({ failureThreshold = 3 } = {}) {
  if (!Number.isInteger(failureThreshold) || failureThreshold < 1) {
    throw new Error("createProviderCircuitBreaker: failureThreshold debe ser un entero >= 1");
  }
  const state = new Map(); // id -> { consecutiveFailures, blocked }

  function entryFor(id) {
    return state.get(id) ?? { consecutiveFailures: 0, blocked: false };
  }

  /** Registra el resultado (ProviderResult.status) de un intento real de proveedor. */
  function recordResult(id, status) {
    const entry = { ...entryFor(id) };
    if (RECOVERY_STATUSES.includes(status)) {
      entry.consecutiveFailures = 0;
      entry.blocked = false;
    } else if (FAILURE_STATUSES.includes(status)) {
      entry.consecutiveFailures += 1;
      if (entry.consecutiveFailures >= failureThreshold) entry.blocked = true;
    }
    // skipped/cancelled/not_implemented no cuentan como fallo real del proveedor.
    state.set(id, entry);
  }

  function isBlocked(id) {
    return entryFor(id).blocked;
  }

  function getState(id) {
    return { ...entryFor(id) };
  }

  function reset(id) {
    state.delete(id);
  }

  function snapshot() {
    return Object.fromEntries([...state.entries()].map(([id, v]) => [id, { ...v }]));
  }

  return { recordResult, isBlocked, getState, reset, snapshot, failureThreshold };
}
