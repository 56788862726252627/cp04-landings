// AI Provider Circuit Breaker — ADV-16
// Avoids repeatedly hitting a downed provider.

export const CIRCUIT_STATE = Object.freeze({
  CLOSED:    'CLOSED',    // normal — requests allowed
  OPEN:      'OPEN',      // tripped — requests blocked
  HALF_OPEN: 'HALF_OPEN', // probe — one request allowed
});

export function createAIProviderCircuitBreaker(config = {}) {
  const {
    failureThreshold  = 3,
    successThreshold  = 2,
    halfOpenAfterMs   = 30000,
  } = config;

  let state        = CIRCUIT_STATE.CLOSED;
  let failures     = 0;
  let successes    = 0;
  let openedAt     = null;

  return {
    getState()  { return state; },
    getStatus() {
      return Object.freeze({ state, failures, successes, openedAt, isReal: false });
    },

    recordSuccess() {
      if (state === CIRCUIT_STATE.HALF_OPEN) {
        successes++;
        if (successes >= successThreshold) {
          state    = CIRCUIT_STATE.CLOSED;
          failures = 0;
          successes = 0;
          openedAt = null;
        }
      } else {
        failures = 0;
      }
    },

    recordFailure() {
      failures++;
      successes = 0;
      if (failures >= failureThreshold && state === CIRCUIT_STATE.CLOSED) {
        state    = CIRCUIT_STATE.OPEN;
        openedAt = Date.now();
      }
    },

    allowRequest() {
      if (state === CIRCUIT_STATE.CLOSED) return true;
      if (state === CIRCUIT_STATE.OPEN) {
        if (openedAt && (Date.now() - openedAt) >= halfOpenAfterMs) {
          state = CIRCUIT_STATE.HALF_OPEN;
          return true; // probe request
        }
        return false;
      }
      // HALF_OPEN: only one probe at a time — block subsequent
      return successes === 0;
    },

    reset() {
      state     = CIRCUIT_STATE.CLOSED;
      failures  = 0;
      successes = 0;
      openedAt  = null;
    },
  };
}

export const AI_PROVIDER_CIRCUIT_BREAKER_VERSION = '1.0.0';
