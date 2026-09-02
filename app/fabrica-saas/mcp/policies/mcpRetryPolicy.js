// MCP Retry Policy — ADV-12

export const RETRY_STRATEGY = Object.freeze({
  NONE:        'NONE',
  TRANSIENT:   'TRANSIENT',    // retry on network/timeout errors
  EXPONENTIAL: 'EXPONENTIAL',  // exponential backoff
  IDEMPOTENT:  'IDEMPOTENT',   // only retry if tool is idempotent
});

export function createRetryPolicy(config = {}) {
  return Object.freeze({
    strategy:      config.strategy      ?? RETRY_STRATEGY.TRANSIENT,
    maxAttempts:   config.maxAttempts   ?? 3,
    baseDelayMs:   config.baseDelayMs   ?? 500,
    maxDelayMs:    config.maxDelayMs    ?? 10000,
    retryOnCodes:  Object.freeze(config.retryOnCodes ?? ['TIMEOUT', 'NETWORK_ERROR', 'RATE_LIMITED']),
    isReal: false,
  });
}

export function shouldRetry(attempt, error, policy) {
  if (policy.strategy === RETRY_STRATEGY.NONE) return false;
  if (attempt >= policy.maxAttempts) return false;
  return policy.retryOnCodes.includes(error?.code ?? '');
}

export function computeDelay(attempt, policy) {
  if (policy.strategy === RETRY_STRATEGY.EXPONENTIAL) {
    return Math.min(policy.baseDelayMs * Math.pow(2, attempt), policy.maxDelayMs);
  }
  return policy.baseDelayMs;
}

export const MCP_RETRY_POLICY_VERSION = '1.0.0';
