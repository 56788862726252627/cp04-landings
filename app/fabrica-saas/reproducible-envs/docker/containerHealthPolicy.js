// Container Health Policy — ADV-15

export const HEALTH_STATE = Object.freeze({
  STARTING:  'STARTING',
  HEALTHY:   'HEALTHY',
  DEGRADED:  'DEGRADED',
  UNHEALTHY: 'UNHEALTHY',
});

export function createContainerHealthPolicy(config = {}) {
  return Object.freeze({
    endpoint:       config.endpoint       ?? '/health',
    intervalMs:     config.intervalMs     ?? 30000,
    timeoutMs:      config.timeoutMs      ?? 10000,
    startPeriodMs:  config.startPeriodMs  ?? 15000,
    retries:        config.retries        ?? 3,
    expectedStatus: config.expectedStatus ?? 200,
    isReal:         false,
  });
}

export function evaluateHealthState(metrics = {}) {
  const { consecutiveFailures = 0, lastStatusCode = null, startedMs = 0, nowMs = Date.now() } = metrics;

  const policy = createContainerHealthPolicy();
  const elapsedMs = nowMs - startedMs;

  if (elapsedMs < policy.startPeriodMs) {
    return Object.freeze({ state: HEALTH_STATE.STARTING, isReal: false });
  }
  if (consecutiveFailures === 0 && lastStatusCode === 200) {
    return Object.freeze({ state: HEALTH_STATE.HEALTHY,   isReal: false });
  }
  if (consecutiveFailures < policy.retries) {
    return Object.freeze({ state: HEALTH_STATE.DEGRADED,  isReal: false });
  }
  return Object.freeze({ state: HEALTH_STATE.UNHEALTHY, isReal: false });
}

export const CONTAINER_HEALTH_POLICY_VERSION = '1.0.0';
