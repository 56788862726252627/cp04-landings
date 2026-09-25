// MCP Circuit Breaker — ADV-12

export const CIRCUIT_STATE = Object.freeze({
  CLOSED:    'CLOSED',    // normal — requests pass through
  OPEN:      'OPEN',      // tripped — reject all requests
  HALF_OPEN: 'HALF_OPEN', // probe — allow one request to test recovery
});

export function createCircuitBreaker(config = {}) {
  let state        = CIRCUIT_STATE.CLOSED;
  let failureCount = 0;
  let successCount = 0;
  let lastTrippedAt = null;

  const threshold   = config.failureThreshold    ?? 5;
  const resetAfterMs = config.resetAfterMs       ?? 60000;
  const probeLimit  = config.halfOpenProbeLimit  ?? 1;

  function recordSuccess() {
    failureCount = 0;
    if (state === CIRCUIT_STATE.HALF_OPEN) { successCount++; if (successCount >= probeLimit) { state = CIRCUIT_STATE.CLOSED; successCount = 0; } }
  }

  function recordFailure() {
    failureCount++;
    successCount = 0;
    if (failureCount >= threshold) { state = CIRCUIT_STATE.OPEN; lastTrippedAt = Date.now(); }
  }

  function canRequest() {
    if (state === CIRCUIT_STATE.CLOSED)   return true;
    if (state === CIRCUIT_STATE.HALF_OPEN) return successCount < probeLimit;
    if (state === CIRCUIT_STATE.OPEN && lastTrippedAt && Date.now() - lastTrippedAt >= resetAfterMs) {
      state = CIRCUIT_STATE.HALF_OPEN; successCount = 0; return true;
    }
    return false;
  }

  return Object.freeze({
    getState:      () => state,
    canRequest,
    recordSuccess,
    recordFailure,
    reset:         () => { state = CIRCUIT_STATE.CLOSED; failureCount = 0; successCount = 0; lastTrippedAt = null; },
    isReal: false,
  });
}

export const MCP_CIRCUIT_BREAKER_VERSION = '1.0.0';
