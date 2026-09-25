// Liveness Policy — ADV-15
// Prevents false restart loops

export const LIVENESS_STATUS = Object.freeze({
  ALIVE:    'ALIVE',
  DEAD:     'DEAD',
  WARMING:  'WARMING',
});

export function createLivenessPolicy(config = {}) {
  return Object.freeze({
    checkIntervalMs:      config.checkIntervalMs    ?? 30000,
    timeoutMs:            config.timeoutMs          ?? 10000,
    warmupGracePeriodMs:  config.warmupGracePeriodMs ?? 30000,
    maxFailures:          config.maxFailures        ?? 5,
    avoidFalseRestarts:   true,
    isReal:               false,
  });
}

export function evaluateLiveness(config = {}) {
  const { consecutiveFailures = 0, elapsedMs = 0, maxFailures = 5, warmupGracePeriodMs = 30000 } = config;

  if (elapsedMs < warmupGracePeriodMs) {
    return Object.freeze({ status: LIVENESS_STATUS.WARMING, restart: false, isReal: false });
  }
  if (consecutiveFailures >= maxFailures) {
    return Object.freeze({ status: LIVENESS_STATUS.DEAD,    restart: true,  isReal: false });
  }
  return Object.freeze({ status: LIVENESS_STATUS.ALIVE,   restart: false, isReal: false });
}

export const LIVENESS_POLICY_VERSION = '1.0.0';
