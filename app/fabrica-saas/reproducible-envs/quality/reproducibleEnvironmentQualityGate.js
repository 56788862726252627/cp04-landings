// Reproducible Environment Quality Gate — ADV-15

export const ENV_GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARN:    'WARN',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export const ENV_CRITICAL_FAILURE = Object.freeze({
  SECRET_IN_IMAGE:          'SECRET_IN_IMAGE',
  PRIVILEGED_RUNTIME:       'PRIVILEGED_RUNTIME',
  UNSAFE_HOST_MOUNT:        'UNSAFE_HOST_MOUNT',
  INVALID_DEPENDENCY_STATE: 'INVALID_DEPENDENCY_STATE',
  UNREPRODUCIBLE_BUILD:     'UNREPRODUCIBLE_BUILD',
  WRONG_DEPLOYMENT_RUNTIME: 'WRONG_DEPLOYMENT_RUNTIME',
  HEALTH_CRITICAL_FAILURE:  'HEALTH_CRITICAL_FAILURE',
});

export function evaluateReproducibleEnvironmentQualityGate(score, criticalFailures = [], warnings = []) {
  if (criticalFailures.length > 0) {
    return Object.freeze({
      status:           ENV_GATE_STATUS.BLOCKED,
      score,
      criticalFailures: Object.freeze(criticalFailures),
      warnings:         Object.freeze(warnings),
      blocked:          true,
      isReal:           false,
    });
  }

  const status = score < 50
    ? ENV_GATE_STATUS.FAIL
    : score < 70 || warnings.length > 0
      ? ENV_GATE_STATUS.WARN
      : ENV_GATE_STATUS.PASS;

  return Object.freeze({
    status,
    score,
    criticalFailures: Object.freeze([]),
    warnings:         Object.freeze(warnings),
    blocked:          false,
    isReal:           false,
  });
}

export const REPRODUCIBLE_ENV_QUALITY_GATE_VERSION = '1.0.0';
