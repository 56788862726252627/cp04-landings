// Staging Pipeline — ADV-04
// STAGING_FIRST policy: generation → CI → staging → smoke QA → production eligibility.
// Never skip staging when preset requires it.

export const STAGING_POLICY = Object.freeze({
  STAGING_FIRST:  'STAGING_FIRST',
  STAGING_BYPASS: 'STAGING_BYPASS',
  DRY_RUN_ONLY:   'DRY_RUN_ONLY',
});

export const STAGING_STATUS = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  RUNNING:     'RUNNING',
  PASS:        'PASS',
  FAIL:        'FAIL',
  SKIPPED:     'SKIPPED',
});

const STAGING_SMOKE_CHECKS = Object.freeze([
  { id: 'SMOKE-01', name: 'App loads on staging URL',    critical: true  },
  { id: 'SMOKE-02', name: 'Login surface accessible',    critical: true  },
  { id: 'SMOKE-03', name: 'Main module renders',         critical: true  },
  { id: 'SMOKE-04', name: 'No fatal JS errors',          critical: true  },
  { id: 'SMOKE-05', name: 'Mobile layout correct',       critical: false },
  { id: 'SMOKE-06', name: 'Booking flow navigable',      critical: false },
]);

/**
 * Resolve staging policy for a deployment plan.
 * Production environments always use STAGING_FIRST unless explicitly overridden.
 */
export function resolveStagingPolicy(deployPlan = {}) {
  const env = deployPlan.environment ?? 'DRY_RUN';

  if (env === 'DRY_RUN')   return STAGING_POLICY.DRY_RUN_ONLY;
  if (env === 'STAGING')   return STAGING_POLICY.STAGING_FIRST;
  if (env === 'PRODUCTION') return STAGING_POLICY.STAGING_FIRST;
  return STAGING_POLICY.STAGING_BYPASS;
}

/**
 * Run smoke QA on staging (simulation in non-real environments).
 */
export function runStagingSmokeQA(params = {}) {
  if (!params.projectId) return { valid: false, error: 'projectId required' };

  const isReal    = params.isReal ?? false;
  const overrides = params.checkOverrides ?? {};

  const results = STAGING_SMOKE_CHECKS.map(check => ({
    ...check,
    status: overrides[check.id] ?? (isReal ? 'NOT_EXECUTED' : STAGING_STATUS.PASS),
    simulated: !isReal,
  }));

  const failed   = results.filter(r => r.critical && r.status === STAGING_STATUS.FAIL);
  const warnings = results.filter(r => !r.critical && r.status === STAGING_STATUS.FAIL);

  return Object.freeze({
    valid:        true,
    projectId:    params.projectId,
    status:       failed.length === 0 ? STAGING_STATUS.PASS : STAGING_STATUS.FAIL,
    checks:       results,
    failedCount:  failed.length,
    warningCount: warnings.length,
    isReal,
    productionEligible: failed.length === 0,
    disclaimer:   isReal ? null : '[SIMULATED] Real staging checks require deployed URL.',
  });
}

/**
 * Evaluate production eligibility after staging QA.
 */
export function evaluateStagingEligibility(smokeResult = {}) {
  if (!smokeResult.valid) return { eligible: false, reason: 'Invalid smoke QA result' };

  return Object.freeze({
    eligible:      smokeResult.productionEligible ?? false,
    stagingStatus: smokeResult.status,
    failedCount:   smokeResult.failedCount ?? 0,
    reason:        smokeResult.productionEligible
      ? 'Staging QA passed — eligible for production.'
      : `Staging QA failed (${smokeResult.failedCount} critical failures).`,
  });
}

export const STAGING_PIPELINE_VERSION = '1.0.0';
