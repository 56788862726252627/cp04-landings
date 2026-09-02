// Readiness Policy — ADV-15
// Separates "process running" from "application ready"

export const READINESS_STATUS = Object.freeze({
  NOT_STARTED:   'NOT_STARTED',
  PROCESS_UP:    'PROCESS_UP',
  APP_READY:     'APP_READY',
  FAILED:        'FAILED',
});

export function createReadinessPolicy(config = {}) {
  return Object.freeze({
    strategy:            config.strategy          ?? 'WAIT_FOR_HEALTH',
    healthEndpoint:      config.healthEndpoint    ?? '/health',
    maxWaitMs:           config.maxWaitMs         ?? 60000,
    pollIntervalMs:      config.pollIntervalMs    ?? 2000,
    minReadyReplicas:    config.minReadyReplicas  ?? 1,
    processUpIsNotReady: true,
    isReal:              false,
  });
}

export function evaluateReadiness(config = {}) {
  const { processRunning = false, healthOk = false, strategy = 'WAIT_FOR_HEALTH' } = config;

  if (!processRunning) {
    return Object.freeze({ status: READINESS_STATUS.NOT_STARTED, isReal: false });
  }
  if (strategy === 'WAIT_FOR_PROCESS') {
    return Object.freeze({ status: READINESS_STATUS.APP_READY, isReal: false });
  }
  if (healthOk) {
    return Object.freeze({ status: READINESS_STATUS.APP_READY, isReal: false });
  }
  return Object.freeze({ status: READINESS_STATUS.PROCESS_UP, isReal: false });
}

export const READINESS_POLICY_VERSION = '1.0.0';
