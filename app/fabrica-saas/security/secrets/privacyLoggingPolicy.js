// Privacy Logging Policy — ADV-19 (connects ADV-01 Observability)

const FORBIDDEN_LOG_PATTERNS = [
  { pattern: /password/i,               reason: 'PASSWORD_IN_LOG' },
  { pattern: /token/i,                  reason: 'TOKEN_IN_LOG' },
  { pattern: /secret/i,                 reason: 'SECRET_IN_LOG' },
  { pattern: /\bcard\b|\bcvv\b|\bpan\b/i, reason: 'PAYMENT_DATA_IN_LOG' },
  { pattern: /-----BEGIN/,              reason: 'PRIVATE_KEY_IN_LOG' },
  { pattern: /sk_(live|test)_/i,        reason: 'STRIPE_KEY_IN_LOG' },
];

const SENSITIVE_PII_PATTERNS = [
  { pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, reason: 'EMAIL_PII_IN_LOG' },
  { pattern: /\b\d{16}\b/,              reason: 'CARD_NUMBER_IN_LOG' },
];

export function createPrivacyLoggingPolicy(config = {}) {
  const {
    redactPII = true,
    blockSecrets = true,
    clientId = null,
  } = config;

  function validateLogEntry(entry = {}) {
    const str = JSON.stringify(entry);
    const violations = [];

    if (blockSecrets) {
      for (const { pattern, reason } of FORBIDDEN_LOG_PATTERNS) {
        if (pattern.test(str)) {
          violations.push({ reason, severity: 'CRITICAL' });
        }
      }
    }

    if (redactPII) {
      for (const { pattern, reason } of SENSITIVE_PII_PATTERNS) {
        if (pattern.test(str)) {
          violations.push({ reason, severity: 'HIGH' });
        }
      }
    }

    return Object.freeze({
      safe: violations.length === 0,
      violations: Object.freeze(violations),
      isReal: false,
    });
  }

  return Object.freeze({ clientId, redactPII, blockSecrets, validateLogEntry, isReal: false });
}

export const PRIVACY_LOGGING_VERSION = '1.0.0';
