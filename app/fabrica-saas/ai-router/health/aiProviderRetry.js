// AI Provider Retry — ADV-16
// Connects to ADV-05 SafeRetry foundation. Retries are limited + jitter-based.

import { isRetryable } from '../routing/aiFallbackPolicy.js';

export function createAIProviderRetry(config = {}) {
  const {
    maxAttempts    = 3,
    baseDelayMs    = 200,
    maxDelayMs     = 5000,
    jitterFactor   = 0.3,
  } = config;

  function computeDelay(attempt) {
    const exp   = Math.min(baseDelayMs * (2 ** attempt), maxDelayMs);
    const jitter = exp * jitterFactor * Math.random();
    return Math.round(exp + jitter);
  }

  return Object.freeze({
    maxAttempts,
    baseDelayMs,
    maxDelayMs,

    shouldRetry(attempt, failureType) {
      if (attempt >= maxAttempts) return false;
      return isRetryable(failureType);
    },

    getDelay(attempt) {
      return computeDelay(attempt);
    },

    buildRetryPlan(failureType) {
      const retries = [];
      for (let i = 0; i < maxAttempts; i++) {
        if (!isRetryable(failureType)) break;
        retries.push({ attempt: i + 1, delayMs: computeDelay(i) });
      }
      return Object.freeze({
        failureType,
        retryable: isRetryable(failureType),
        retries:   Object.freeze(retries),
        isReal:    false,
      });
    },
    isReal: false,
  });
}

export const AI_PROVIDER_RETRY_VERSION = '1.0.0';
