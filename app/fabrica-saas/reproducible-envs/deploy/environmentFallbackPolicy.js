// Environment Fallback Policy — ADV-15
// Safe local path when Docker unavailable

export const FALLBACK_MODE = Object.freeze({
  NODE_LOCAL:         'NODE_LOCAL',
  STATIC_VALIDATION:  'STATIC_VALIDATION',
  FIXTURE_SIMULATION: 'FIXTURE_SIMULATION',
  BLOCKED:            'BLOCKED',
});

export function createEnvironmentFallbackPolicy(config = {}) {
  const { dockerAvailable = false, hasLockfile = true, nodeVersionOk = true } = config;

  if (dockerAvailable) {
    return Object.freeze({
      fallbackRequired: false,
      mode:             null,
      reason:           'Docker available — no fallback needed',
      notProductionFail: true,
      isReal:           false,
    });
  }

  const mode = hasLockfile && nodeVersionOk
    ? FALLBACK_MODE.NODE_LOCAL
    : FALLBACK_MODE.STATIC_VALIDATION;

  return Object.freeze({
    fallbackRequired: true,
    mode,
    reason:           'Docker daemon unavailable — using safe local fallback',
    requirements:     Object.freeze([
      'node-installed',
      hasLockfile ? 'lockfile-present' : 'lockfile-missing-use-npm-install',
      'env-validated',
    ]),
    notProductionFail: true,
    isReal:            false,
  });
}

export const ENVIRONMENT_FALLBACK_POLICY_VERSION = '1.0.0';
