// Retry Policy — ADV-02 CI/CD Automatizado
// Retry solo para errores potencialmente transitorios (network, install).

export const RETRY_REASON = Object.freeze({
  NETWORK_ERROR:     'NETWORK_ERROR',
  INSTALL_TIMEOUT:   'INSTALL_TIMEOUT',
  TRANSIENT_ERROR:   'TRANSIENT_ERROR',
});

export const RETRYABLE_JOB_TYPES = Object.freeze(new Set([
  'INSTALL',
  'DEPENDENCY_SCAN',
]));

const NON_RETRYABLE = Object.freeze(new Set([
  'TEST',
  'LINT',
  'SECURITY',
  'SECRET_SCAN',
  'QUALITY_GATE',
]));

const TRANSIENT_ERROR_PATTERNS = [
  /ECONNRESET/i,
  /ETIMEDOUT/i,
  /network/i,
  /getaddrinfo/i,
  /npm warn.*network/i,
  /registry\.npmjs\.org/i,
  /socket hang up/i,
];

/**
 * Determine if a job failure is retryable.
 */
export function isRetryable(jobType, errorMessage = '', retryCount = 0) {
  if (NON_RETRYABLE.has(jobType)) {
    return { retryable: false, reason: 'Job type is never retried' };
  }

  if (retryCount >= 2) {
    return { retryable: false, reason: 'Max retries exceeded' };
  }

  const isTransient = TRANSIENT_ERROR_PATTERNS.some(p => p.test(errorMessage));
  const isRetryableType = RETRYABLE_JOB_TYPES.has(jobType);

  if (isRetryableType && isTransient) {
    return {
      retryable: true,
      reason:    RETRY_REASON.TRANSIENT_ERROR,
      waitMs:    1000 * Math.pow(2, retryCount),
    };
  }

  return { retryable: false, reason: 'Not a transient error or non-retryable type' };
}

/**
 * Build retry policy for a pipeline.
 */
export function createRetryPolicy(options = {}) {
  return Object.freeze({
    maxRetries:   options.maxRetries   ?? 2,
    retryOn:      Object.freeze(options.retryOn ?? [RETRY_REASON.NETWORK_ERROR, RETRY_REASON.INSTALL_TIMEOUT, RETRY_REASON.TRANSIENT_ERROR]),
    backoffMs:    options.backoffMs    ?? 1000,
    backoffType:  options.backoffType  ?? 'exponential',
    neverRetry:   Object.freeze(Array.from(NON_RETRYABLE)),
    disclaimer:   'Retry is only for transient infrastructure errors, not logic failures.',
  });
}

export const RETRY_POLICY_VERSION = '1.0.0';
