// Redaction Engine — ADV-01 Transversal Observability
// Detects and redacts secrets, PII, and sensitive values from log metadata.
// Must be loaded before structuredLogger since logger imports it.

export const REDACTED = '[REDACTED]';

const SECRET_KEYS = new Set([
  'authorization', 'bearer', 'token', 'apikey', 'api_key', 'secret',
  'password', 'passwd', 'pwd', 'cookie', 'session', 'sessionid',
  'accesstoken', 'access_token', 'refreshtoken', 'refresh_token',
  'webhooksecret', 'webhook_secret', 'privatekey', 'private_key',
  'clientsecret', 'client_secret', 'authtoken', 'auth_token',
  'x-api-key', 'x-auth-token', 'x-access-token',
]);

const PII_KEYS = new Set([
  'email', 'phone', 'phonenumber', 'phone_number', 'mobile',
  'address', 'birthdate', 'birth_date', 'dob', 'ssn', 'nif', 'nie',
  'creditcard', 'credit_card', 'cardnumber', 'card_number', 'cvv', 'cvc',
  'iban', 'bankaccount', 'bank_account',
]);

const SECRET_VALUE_PATTERNS = [
  /^Bearer\s+\S+/i,
  /^Basic\s+\S+/i,
  /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*/,  // JWT
  /sk_live_[A-Za-z0-9]{20,}/,                                // Stripe live key
  /sk_test_[A-Za-z0-9]{20,}/,                                // Stripe test key
  /^whsec_[A-Za-z0-9]{20,}/,                                 // Stripe webhook
  /^[A-Za-z0-9]{32,}$/,                                      // Generic long token (≥32 chars)
];

function normalizeKey(key) {
  return String(key).toLowerCase().replace(/[-_\s]/g, '');
}

function isSecretKey(key) {
  const norm = normalizeKey(key);
  return SECRET_KEYS.has(norm);
}

function isPIIKey(key) {
  const norm = normalizeKey(key);
  return PII_KEYS.has(norm);
}

function looksLikeSecret(value) {
  if (typeof value !== 'string') return false;
  return SECRET_VALUE_PATTERNS.some(p => p.test(value));
}

/**
 * Recursively redact sensitive data from an object.
 * @param {*} input — any value (object, array, string, etc.)
 * @param {object} options
 * @param {boolean} options.redactPII — also redact PII fields (default: false; PII kept for analytics unless opted in)
 * @returns redacted copy
 */
export function redactSensitiveData(input, options = {}) {
  const redactPII = options.redactPII ?? false;

  if (input === null || input === undefined) return input;

  if (typeof input === 'string') {
    return looksLikeSecret(input) ? REDACTED : input;
  }

  if (Array.isArray(input)) {
    return input.map(item => redactSensitiveData(item, options));
  }

  if (typeof input === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(input)) {
      if (isSecretKey(key)) {
        result[key] = REDACTED;
      } else if (redactPII && isPIIKey(key)) {
        result[key] = REDACTED;
      } else if (typeof value === 'string' && looksLikeSecret(value)) {
        result[key] = REDACTED;
      } else if (typeof value === 'object' && value !== null) {
        result[key] = redactSensitiveData(value, options);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return input;
}

/**
 * Check if a value contains a secret (without modifying).
 */
export function containsSecret(value) {
  if (typeof value === 'string') return looksLikeSecret(value);
  if (typeof value === 'object' && value !== null) {
    for (const [key, val] of Object.entries(value)) {
      if (isSecretKey(key)) return true;
      if (containsSecret(val)) return true;
    }
  }
  return false;
}

/**
 * Audit a metadata object: report which keys were/would be redacted.
 */
export function auditMetadataForSecrets(metadata = {}) {
  const secretKeys = [];
  const piiKeys = [];
  const patternMatches = [];

  function audit(obj, path = '') {
    if (typeof obj !== 'object' || obj === null) return;
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = path ? `${path}.${key}` : key;
      if (isSecretKey(key)) secretKeys.push(fullKey);
      else if (isPIIKey(key)) piiKeys.push(fullKey);
      else if (typeof value === 'string' && looksLikeSecret(value)) patternMatches.push(fullKey);
      else if (typeof value === 'object' && value !== null) audit(value, fullKey);
    }
  }

  audit(metadata);

  return {
    hasSecrets:     secretKeys.length > 0 || patternMatches.length > 0,
    hasPII:         piiKeys.length > 0,
    secretKeys,
    piiKeys,
    patternMatches,
    totalIssues:    secretKeys.length + piiKeys.length + patternMatches.length,
  };
}

export const REDACTION_ENGINE_VERSION = '1.0.0';
