// CI Pipeline Model — ADV-02 CI/CD Automatizado
// CIPipelineDefinition: modelo canónico de pipeline reutilizable.

export const CI_TRIGGER = Object.freeze({
  PULL_REQUEST:  'PULL_REQUEST',
  PUSH_MAIN:     'PUSH_MAIN',
  MANUAL:        'MANUAL',
  RELEASE:       'RELEASE',
});

export const PIPELINE_STATUS = Object.freeze({
  PENDING:   'PENDING',
  RUNNING:   'RUNNING',
  PASSED:    'PASSED',
  FAILED:    'FAILED',
  BLOCKED:   'BLOCKED',
  CANCELLED: 'CANCELLED',
});

export const PIPELINE_ENVIRONMENT = Object.freeze({
  LOCAL:   'LOCAL',
  CI:      'CI',
  STAGING: 'STAGING',
});

function genPipelineId() {
  return `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create a CI pipeline definition.
 * Returns { valid, errors, pipeline } where pipeline is a frozen object.
 */
export function createPipeline(params = {}) {
  const errors = [];
  if (!params.name)    errors.push('name required');
  if (!params.trigger) errors.push('trigger required');
  if (!CI_TRIGGER[params.trigger]) errors.push(`trigger must be one of: ${Object.keys(CI_TRIGGER).join(', ')}`);
  if (errors.length) return { valid: false, errors };

  const pipeline = Object.freeze({
    id:              params.id ?? genPipelineId(),
    name:            params.name,
    trigger:         params.trigger,
    branchPolicy:    params.branchPolicy ?? null,
    jobs:            Object.freeze(params.jobs ?? []),
    dependencies:    Object.freeze(params.dependencies ?? {}),
    requiredChecks:  Object.freeze(params.requiredChecks ?? []),
    blockingChecks:  Object.freeze(params.blockingChecks ?? []),
    optionalChecks:  Object.freeze(params.optionalChecks ?? []),
    artifacts:       Object.freeze(params.artifacts ?? []),
    timeout:         params.timeout ?? 1800,
    retryPolicy:     Object.freeze(params.retryPolicy ?? { maxRetries: 0, retryOn: [] }),
    securityPolicy:  Object.freeze(params.securityPolicy ?? { blockOnSecretFound: true, blockOnCriticalCVE: true }),
    releasePolicy:   Object.freeze(params.releasePolicy ?? { humanApprovalRequired: true, autoMerge: false }),
    deployPolicy:    Object.freeze(params.deployPolicy ?? { allowDeploy: false, environment: null }),
    status:          PIPELINE_STATUS.PENDING,
    createdAt:       new Date().toISOString(),
    environment:     params.environment ?? PIPELINE_ENVIRONMENT.CI,
    workingDirectory: params.workingDirectory ?? '.',
    nodeVersion:     params.nodeVersion ?? '20',
    disclaimer:      'NO_REAL_DEPLOY. Pipeline definition only.',
  });

  return { valid: true, errors: [], pipeline };
}

/**
 * Evaluate overall pipeline status from job results.
 */
export function evaluatePipelineStatus(jobResults = []) {
  if (!Array.isArray(jobResults)) return { valid: false, error: 'jobResults must be array' };
  if (jobResults.length === 0)    return { valid: true, status: PIPELINE_STATUS.PENDING, blockers: [] };

  const blockers = jobResults
    .filter(r => r.blocking && r.status === 'FAILED')
    .map(r => ({ jobId: r.jobId, name: r.name, reason: r.reason ?? 'job failed' }));

  const allPassed  = jobResults.every(r => r.status === 'PASSED' || r.status === 'SKIPPED');
  const anyBlocked = blockers.length > 0;

  const status = anyBlocked  ? PIPELINE_STATUS.BLOCKED
    : allPassed              ? PIPELINE_STATUS.PASSED
    : PIPELINE_STATUS.FAILED;

  return { valid: true, status, blockers, jobCount: jobResults.length };
}

export const PIPELINE_MODEL_VERSION = '1.0.0';
