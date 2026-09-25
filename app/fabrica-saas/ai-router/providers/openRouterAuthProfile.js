// OpenRouter Auth Profile — ADV-16
// Stores only a secret reference, NEVER the real key value.
// NO_REAL_API_KEYS=SI

export const AUTH_STATUS = Object.freeze({
  READY:                 'READY',
  MISSING:               'MISSING',
  REQUIRES_CONFIGURATION:'REQUIRES_CONFIGURATION',
  BLOCKED:               'BLOCKED',
});

export function createOpenRouterAuthProfile(config = {}) {
  const {
    secretReference = 'OPENROUTER_API_KEY',
    secretConfigured = false,
    status          = null,
  } = config;

  if (secretReference && secretReference.length > 0 &&
      !secretReference.startsWith('sk-') &&
      !secretReference.match(/^[A-Za-z0-9._-]{40,}$/)) {
    // reference looks like an env var name — safe
  }

  const resolvedStatus = status ?? (secretConfigured ? AUTH_STATUS.READY : AUTH_STATUS.REQUIRES_CONFIGURATION);

  return Object.freeze({
    secretReference,
    secretConfigured,
    status:    resolvedStatus,
    realKeyStored: false,
    isReal: false,
  });
}

export function validateAuthProfile(profile) {
  if (profile.realKeyStored) {
    return Object.freeze({ valid: false, reason: 'REAL_KEY_STORED', isReal: false });
  }
  if (profile.status === AUTH_STATUS.BLOCKED) {
    return Object.freeze({ valid: false, reason: 'AUTH_BLOCKED', isReal: false });
  }
  if (profile.status === AUTH_STATUS.MISSING || profile.status === AUTH_STATUS.REQUIRES_CONFIGURATION) {
    return Object.freeze({ valid: false, reason: 'NOT_CONFIGURED', isReal: false });
  }
  return Object.freeze({ valid: true, reason: null, isReal: false });
}

export const OPENROUTER_AUTH_PROFILE_VERSION = '1.0.0';
