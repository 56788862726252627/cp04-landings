// Graceful Shutdown Policy — ADV-15

export const SHUTDOWN_SIGNAL = Object.freeze({
  SIGTERM: 'SIGTERM',
  SIGINT:  'SIGINT',
  SIGQUIT: 'SIGQUIT',
});

export const SHUTDOWN_STATUS = Object.freeze({
  CLEAN:    'CLEAN',
  TIMEOUT:  'TIMEOUT',
  FORCED:   'FORCED',
  PENDING:  'PENDING',
});

export function createGracefulShutdownPolicy(config = {}) {
  return Object.freeze({
    timeoutMs:         config.timeoutMs         ?? 30000,
    signal:            config.signal            ?? SHUTDOWN_SIGNAL.SIGTERM,
    drainConnectionMs: config.drainConnectionMs ?? 5000,
    cleanupSteps: Object.freeze(config.cleanupSteps ?? [
      'finish-pending-requests',
      'close-connections',
      'flush-logs',
      'release-resources',
    ]),
    isReal: false,
  });
}

export function evaluateShutdown(config = {}) {
  const { elapsedMs = 0, pendingRequests = 0, timeoutMs = 30000 } = config;

  if (pendingRequests === 0 && elapsedMs < timeoutMs) {
    return Object.freeze({ status: SHUTDOWN_STATUS.CLEAN,   isReal: false });
  }
  if (elapsedMs >= timeoutMs && pendingRequests > 0) {
    return Object.freeze({ status: SHUTDOWN_STATUS.TIMEOUT, isReal: false });
  }
  if (pendingRequests > 0) {
    return Object.freeze({ status: SHUTDOWN_STATUS.PENDING, isReal: false });
  }
  return Object.freeze({ status: SHUTDOWN_STATUS.CLEAN,   isReal: false });
}

export const GRACEFUL_SHUTDOWN_POLICY_VERSION = '1.0.0';
