// AI Fallback Policy — ADV-16

export const FALLBACK_FAILURE = Object.freeze({
  RATE_LIMIT:          'RATE_LIMIT',
  TIMEOUT:             'TIMEOUT',
  PROVIDER_DOWN:       'PROVIDER_DOWN',
  MODEL_UNAVAILABLE:   'MODEL_UNAVAILABLE',
  AUTH:                'AUTH',
  POLICY_BLOCK:        'POLICY_BLOCK',
  CAPABILITY_MISMATCH: 'CAPABILITY_MISMATCH',
  COST_BLOCK:          'COST_BLOCK',
  UNKNOWN:             'UNKNOWN',
});

const RETRYABLE_FAILURES = new Set([
  FALLBACK_FAILURE.RATE_LIMIT,
  FALLBACK_FAILURE.TIMEOUT,
  FALLBACK_FAILURE.PROVIDER_DOWN,
  FALLBACK_FAILURE.MODEL_UNAVAILABLE,
  FALLBACK_FAILURE.UNKNOWN,
]);

const NO_RETRY_FAILURES = new Set([
  FALLBACK_FAILURE.AUTH,
  FALLBACK_FAILURE.POLICY_BLOCK,
  FALLBACK_FAILURE.CAPABILITY_MISMATCH,
  FALLBACK_FAILURE.COST_BLOCK,
]);

export function isRetryable(failureType) {
  return RETRYABLE_FAILURES.has(failureType);
}

export function shouldFallback(failureType) {
  // AUTH/POLICY: no blind retry/fallback — escalate
  return !NO_RETRY_FAILURES.has(failureType);
}

export function createAIFallbackPolicy(config = {}) {
  const {
    maxFallbacks    = 2,
    retryRetryable  = true,
    escalateOnAuth  = true,
    escalateOnPolicy = true,
  } = config;

  return Object.freeze({
    maxFallbacks,
    retryRetryable,
    escalateOnAuth,
    escalateOnPolicy,
    classify(failureType) {
      return Object.freeze({
        failureType,
        retryable:    isRetryable(failureType),
        fallbackOk:   shouldFallback(failureType),
        escalate:     NO_RETRY_FAILURES.has(failureType),
        isReal:       false,
      });
    },
    isReal: false,
  });
}

export const FALLBACK_POLICY_VERSION = '1.0.0';
