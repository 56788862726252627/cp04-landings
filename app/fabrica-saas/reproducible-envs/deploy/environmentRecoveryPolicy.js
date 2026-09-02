// Environment Recovery Policy — ADV-15

export const FAILURE_CASE = Object.freeze({
  BUILD_FAILURE:       'BUILD_FAILURE',
  HEALTH_FAILURE:      'HEALTH_FAILURE',
  RUNTIME_CRASH:       'RUNTIME_CRASH',
  CONFIG_ERROR:        'CONFIG_ERROR',
  MISSING_SECRET:      'MISSING_SECRET',
  PORT_CONFLICT:       'PORT_CONFLICT',
  DEPENDENCY_MISMATCH: 'DEPENDENCY_MISMATCH',
});

const RECOVERY_MAP = Object.freeze({
  [FAILURE_CASE.BUILD_FAILURE]: {
    steps: ['check-build-logs', 'verify-lockfile', 'check-node-version', 'retry-clean-install'],
    canAutoRecover: false,
  },
  [FAILURE_CASE.HEALTH_FAILURE]: {
    steps: ['check-port-availability', 'verify-start-command', 'check-env-vars', 'rollback-if-available'],
    canAutoRecover: true,
  },
  [FAILURE_CASE.RUNTIME_CRASH]: {
    steps: ['capture-logs', 'check-oom', 'increase-memory-limit', 'redeploy'],
    canAutoRecover: true,
  },
  [FAILURE_CASE.CONFIG_ERROR]: {
    steps: ['validate-env-example', 'check-required-vars', 'fix-config-values'],
    canAutoRecover: false,
  },
  [FAILURE_CASE.MISSING_SECRET]: {
    steps: ['identify-missing-secret', 'provide-via-runtime-env', 'do-not-hardcode'],
    canAutoRecover: false,
  },
  [FAILURE_CASE.PORT_CONFLICT]: {
    steps: ['identify-port-in-use', 'change-container-port', 'never-use-5175'],
    canAutoRecover: true,
  },
  [FAILURE_CASE.DEPENDENCY_MISMATCH]: {
    steps: ['run-npm-ci', 'check-lockfile-integrity', 'verify-node-version'],
    canAutoRecover: true,
  },
});

export function createEnvironmentRecoveryPolicy(failureCase) {
  if (!FAILURE_CASE[failureCase]) {
    throw new Error(`createEnvironmentRecoveryPolicy: unknown failure case '${failureCase}'`);
  }

  const rec = RECOVERY_MAP[failureCase];

  return Object.freeze({
    failureCase,
    steps:         Object.freeze(rec.steps),
    canAutoRecover: rec.canAutoRecover,
    noRealDeploy:  true,
    isReal:        false,
  });
}

export const ENVIRONMENT_RECOVERY_POLICY_VERSION = '1.0.0';
