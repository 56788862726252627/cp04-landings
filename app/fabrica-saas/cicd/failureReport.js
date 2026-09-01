// Failure Report — ADV-02 CI/CD Automatizado
// generateCIFailureReport(): explica el fallo con contexto accionable.

export const ACTION_TYPE = Object.freeze({
  FIX_CODE:        'FIX_CODE',
  REMOVE_SECRET:   'REMOVE_SECRET',
  FIX_DEPENDENCY:  'FIX_DEPENDENCY',
  FIX_BUILD:       'FIX_BUILD',
  FIX_LINT:        'FIX_LINT',
  REVIEW_MANUALLY: 'REVIEW_MANUALLY',
  CONTACT_SUPPORT: 'CONTACT_SUPPORT',
});

const FAILURE_ACTIONS = {
  'SECRET_SCAN':       { action: ACTION_TYPE.REMOVE_SECRET,   desc: 'Remove or rotate the secret and use environment variables instead' },
  'TEST':              { action: ACTION_TYPE.FIX_CODE,         desc: 'Fix failing tests before merging' },
  'LINT':              { action: ACTION_TYPE.FIX_LINT,         desc: 'Run `npm run lint -- --fix` and resolve remaining issues' },
  'BUILD':             { action: ACTION_TYPE.FIX_BUILD,        desc: 'Investigate build errors in Vite output' },
  'SECURITY':          { action: ACTION_TYPE.REVIEW_MANUALLY,  desc: 'Review security finding and remediate before proceeding' },
  'DEPENDENCY_SCAN':   { action: ACTION_TYPE.FIX_DEPENDENCY,   desc: 'Run `npm audit fix` and review remaining advisories' },
  'ARTIFACT':          { action: ACTION_TYPE.FIX_BUILD,        desc: 'Re-run build and verify dist/ output is complete' },
  'QUALITY_GATE':      { action: ACTION_TYPE.FIX_CODE,         desc: 'Fix underlying gate failures before quality gate can pass' },
  'RELEASE_READINESS': { action: ACTION_TYPE.REVIEW_MANUALLY,  desc: 'Ensure all release checks pass before attempting release' },
};

/**
 * Generate a structured failure report for a CI job/gate failure.
 */
export function generateCIFailureReport(failure = {}) {
  const {
    failedJob,
    failedGate,
    reason,
    affectedFiles = [],
    correlationId = null,
    commitSha     = null,
    branch        = null,
    durationMs    = null,
  } = failure;

  const jobOrGate = failedJob ?? failedGate ?? 'UNKNOWN';
  const actionInfo = FAILURE_ACTIONS[jobOrGate] ?? { action: ACTION_TYPE.REVIEW_MANUALLY, desc: 'Investigate the failure and retry' };

  return Object.freeze({
    valid:             true,
    failedJob,
    failedGate,
    reason:            reason ?? 'No reason provided',
    affectedFiles:     Object.freeze(affectedFiles),
    recommendedAction: actionInfo.action,
    actionDescription: actionInfo.desc,
    blocking:          true,
    correlationId,
    commitSha:         commitSha ? String(commitSha).slice(0, 7) : null,
    branch,
    durationMs,
    generatedAt:       new Date().toISOString(),
    message:           `CI failure in ${jobOrGate}: ${reason ?? 'see details'}. Action: ${actionInfo.desc}`,
    disclaimer:        'Failure report is informational. No automated fixes applied.',
  });
}

/**
 * Generate a batch failure summary for multiple failures.
 */
export function generateBatchFailureReport(failures = []) {
  if (!Array.isArray(failures)) return { valid: false, error: 'failures must be array' };

  const reports    = failures.map(f => generateCIFailureReport(f));
  const hasBlocking = reports.some(r => r.blocking);
  const actions    = [...new Set(reports.map(r => r.recommendedAction))];

  return {
    valid:        true,
    totalFailures: reports.length,
    hasBlocking,
    reports,
    uniqueActions: actions,
    summary:      `${reports.length} failure(s). Blocking: ${hasBlocking}. Actions: ${actions.join(', ')}`,
  };
}

export const FAILURE_REPORT_VERSION = '1.0.0';
