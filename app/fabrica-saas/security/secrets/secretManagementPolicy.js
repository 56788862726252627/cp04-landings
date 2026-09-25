// Secret Management Policy — ADV-19

export const SECRET_RULE = Object.freeze({
  REFERENCE_ONLY:        'REFERENCE_ONLY',
  NO_SOURCE_CONTROL:     'NO_SOURCE_CONTROL',
  NO_LOGS:               'NO_LOGS',
  NO_PROMPTS:            'NO_PROMPTS',
  NO_CLIENT_CROSSOVER:   'NO_CLIENT_CROSSOVER',
  ROTATION_READY:        'ROTATION_READY',
});

export function createSecretManagementPolicy(config = {}) {
  const {
    secretReferencesOnly = true,
    rotationMetadata = null,
    clientId = null,
  } = config;

  const enforced = [
    SECRET_RULE.REFERENCE_ONLY,
    SECRET_RULE.NO_SOURCE_CONTROL,
    SECRET_RULE.NO_LOGS,
    SECRET_RULE.NO_PROMPTS,
    SECRET_RULE.NO_CLIENT_CROSSOVER,
  ];

  if (rotationMetadata) enforced.push(SECRET_RULE.ROTATION_READY);

  return Object.freeze({
    clientId,
    secretReferencesOnly,
    enforced: Object.freeze([...enforced]),
    rotationMetadata: rotationMetadata ? Object.freeze(rotationMetadata) : null,
    realSecretRotation: false,
    isReal: false,
  });
}

export function validateSecretReference(ref = '') {
  const PLAINTEXT_PATTERNS = [
    /^sk_/i, /^pk_/i, /^[A-Za-z0-9+/]{40,}={0,2}$/, /^-----BEGIN/,
    /^ey[A-Za-z0-9._-]{20,}/,
  ];

  const looksLikePlaintext = PLAINTEXT_PATTERNS.some(p => p.test(ref));

  return Object.freeze({
    ref,
    safe: !looksLikePlaintext,
    issue: looksLikePlaintext ? 'PLAINTEXT_SECRET_DETECTED' : null,
    isReal: false,
  });
}

export const SECRET_MANAGEMENT_VERSION = '1.0.0';
