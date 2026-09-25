// Safe Retry Policy — ADV-05
// Classifies errors and decides if/how to retry.

export const ERROR_CLASS = Object.freeze({
  DETERMINISTIC: 'DETERMINISTIC',
  TRANSIENT:     'TRANSIENT',
  EXTERNAL:      'EXTERNAL',
  PERMISSION:    'PERMISSION',
  UNKNOWN:       'UNKNOWN',
});

export const RETRY_DECISION = Object.freeze({
  RETRY:         'RETRY',
  NO_RETRY:      'NO_RETRY',
  WAITING_HUMAN: 'WAITING_HUMAN',
});

const CLASSIFICATION_RULES = [
  { pattern: /ECONNRESET|ETIMEDOUT|ECONNREFUSED|503|429|network/i, class: ERROR_CLASS.TRANSIENT, maxRetries: 2, delayMs: 1000 },
  { pattern: /ENOENT|MODULE_NOT_FOUND|SyntaxError|TypeError|assertion/i, class: ERROR_CLASS.DETERMINISTIC, maxRetries: 0 },
  { pattern: /EACCES|EPERM|permission denied/i, class: ERROR_CLASS.PERMISSION, maxRetries: 0 },
  { pattern: /rate.?limit|quota|billing/i, class: ERROR_CLASS.EXTERNAL, maxRetries: 1, delayMs: 5000 },
  { pattern: /oauth|mfa|authentication/i, class: ERROR_CLASS.PERMISSION, maxRetries: 0 },
];

export function classifyError(errorMessage = '') {
  const msg = String(errorMessage);
  for (const rule of CLASSIFICATION_RULES) {
    if (rule.pattern.test(msg)) {
      return {
        valid: true,
        class: rule.class,
        maxRetries: rule.maxRetries ?? 0,
        delayMs: rule.delayMs ?? 0,
        isReal: false,
      };
    }
  }
  return { valid: true, class: ERROR_CLASS.UNKNOWN, maxRetries: 1, delayMs: 500, isReal: false };
}

export function evaluateRetry(errorMessage, attemptCount = 0) {
  const classification = classifyError(errorMessage);
  const { class: errorClass, maxRetries, delayMs } = classification;

  if (errorClass === ERROR_CLASS.DETERMINISTIC) {
    return { decision: RETRY_DECISION.NO_RETRY, reason: 'deterministic error — fix required', classification, isReal: false };
  }
  if (errorClass === ERROR_CLASS.PERMISSION) {
    return { decision: RETRY_DECISION.WAITING_HUMAN, reason: 'permission error — human action needed', classification, isReal: false };
  }
  if (attemptCount >= maxRetries) {
    return { decision: RETRY_DECISION.NO_RETRY, reason: `max retries (${maxRetries}) exceeded`, classification, isReal: false };
  }
  return { decision: RETRY_DECISION.RETRY, delayMs, attemptsRemaining: maxRetries - attemptCount, classification, isReal: false };
}

export const SAFE_RETRY_POLICY_VERSION = '1.0.0';
