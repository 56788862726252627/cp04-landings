// Fail Fast — ADV-02 CI/CD Automatizado
// Lógica de parada temprana: ciertos fallos detienen el pipeline inmediatamente.

export const FAIL_FAST_REASON = Object.freeze({
  SECRET_CRITICAL:    'SECRET_CRITICAL',
  TESTS_CRITICAL:     'TESTS_CRITICAL',
  BUILD_FAILURE:      'BUILD_FAILURE',
  SECURITY_CRITICAL:  'SECURITY_CRITICAL',
  INSTALL_FAILURE:    'INSTALL_FAILURE',
});

export const FAIL_FAST_ACTION = Object.freeze({
  STOP:     'STOP',
  CONTINUE: 'CONTINUE',
  WARN:     'WARN',
});

const FAIL_FAST_RULES = [
  {
    reason:    FAIL_FAST_REASON.SECRET_CRITICAL,
    action:    FAIL_FAST_ACTION.STOP,
    message:   'Critical secret detected — pipeline stopped immediately',
    test:      (ctx) => ctx.secretResult?.critical === true,
  },
  {
    reason:    FAIL_FAST_REASON.INSTALL_FAILURE,
    action:    FAIL_FAST_ACTION.STOP,
    message:   'Dependency install failed — cannot proceed',
    test:      (ctx) => ctx.installFailed === true,
  },
  {
    reason:    FAIL_FAST_REASON.TESTS_CRITICAL,
    action:    FAIL_FAST_ACTION.STOP,
    message:   'Critical test failures — stopping before build',
    test:      (ctx) => {
      const newFails = (ctx.testResult?.failed ?? 0) - (ctx.testResult?.preExistingFails ?? 0);
      return newFails > 0;
    },
  },
  {
    reason:    FAIL_FAST_REASON.BUILD_FAILURE,
    action:    FAIL_FAST_ACTION.STOP,
    message:   'Build failed — artifact and release checks skipped',
    test:      (ctx) => ctx.buildResult?.success === false,
  },
  {
    reason:    FAIL_FAST_REASON.SECURITY_CRITICAL,
    action:    FAIL_FAST_ACTION.STOP,
    message:   'Critical security issue — pipeline stopped',
    test:      (ctx) => ctx.securityResult?.hasCritical === true,
  },
];

/**
 * Evaluate fail-fast rules against the current pipeline context.
 * Returns the first matching STOP rule, or CONTINUE.
 */
export function evaluateFailFast(context = {}) {
  for (const rule of FAIL_FAST_RULES) {
    if (rule.action === FAIL_FAST_ACTION.STOP && rule.test(context)) {
      return {
        action:    FAIL_FAST_ACTION.STOP,
        reason:    rule.reason,
        message:   rule.message,
        shouldStop: true,
      };
    }
  }

  return {
    action:    FAIL_FAST_ACTION.CONTINUE,
    reason:    null,
    message:   'No fail-fast condition triggered — continue',
    shouldStop: false,
  };
}

/**
 * Check if downstream jobs should be skipped after a fail-fast.
 */
export function shouldSkipJob(jobId, failFastResult, completedJobIds = []) {
  if (!failFastResult?.shouldStop) return false;

  const ALWAYS_RUN = new Set(['secret-quick-scan']);
  if (ALWAYS_RUN.has(jobId)) return false;

  const completedSet = new Set(completedJobIds);
  return !completedSet.has(jobId);
}

export const FAIL_FAST_VERSION = '1.0.0';
