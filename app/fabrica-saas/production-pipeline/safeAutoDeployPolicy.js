// Safe Auto Deploy Policy — ADV-04
// canAutoDeploy(): gate before any automated production deploy.

export const AUTO_DEPLOY_DECISION = Object.freeze({
  AUTO_DEPLOY_ALLOWED: 'AUTO_DEPLOY_ALLOWED',
  WAITING_HUMAN:       'WAITING_HUMAN',
  BLOCKED:             'BLOCKED',
});

/**
 * Evaluate whether an automated deploy can proceed.
 * ALL conditions must pass. Any critical failure → BLOCKED.
 * Any missing human approval → WAITING_HUMAN.
 *
 * input: {
 *   allCriticalGatesPass    boolean
 *   noMissingSecrets        boolean
 *   noBillingAction         boolean
 *   noLegalApproval         boolean
 *   noDomainBlocker         boolean
 *   rollbackReady           boolean
 *   observabilityReady      boolean
 *   healthChecksReady       boolean
 *   environmentAllowed      boolean  — e.g. DRY_RUN/STAGING always allowed; PRODUCTION needs extra
 *   humanApprovalSatisfied  boolean
 *   pendingManualActions    string[] — list of blocking action IDs
 * }
 */
export function canAutoDeploy(input = {}) {
  const {
    allCriticalGatesPass   = false,
    noMissingSecrets       = false,
    noBillingAction        = true,
    noLegalApproval        = true,
    noDomainBlocker        = true,
    rollbackReady          = false,
    observabilityReady     = false,
    healthChecksReady      = false,
    environmentAllowed     = false,
    humanApprovalSatisfied = false,
    pendingManualActions   = [],
  } = input;

  const blockers = [];
  const humanRequired = [];

  if (!allCriticalGatesPass)   blockers.push('CRITICAL_GATES_FAILING');
  if (!noMissingSecrets)       blockers.push('MISSING_SECRETS');
  if (!environmentAllowed)     blockers.push('ENVIRONMENT_NOT_ALLOWED');
  if (!rollbackReady)          blockers.push('ROLLBACK_NOT_READY');
  if (!observabilityReady)     blockers.push('OBSERVABILITY_NOT_READY');
  if (!healthChecksReady)      blockers.push('HEALTH_CHECKS_NOT_READY');

  if (!noBillingAction)         humanRequired.push('BILLING_APPROVAL');
  if (!noLegalApproval)         humanRequired.push('LEGAL_APPROVAL');
  if (!noDomainBlocker)         humanRequired.push('DOMAIN_ACTION');
  if (!humanApprovalSatisfied)  humanRequired.push('HUMAN_APPROVAL');
  if (pendingManualActions.length > 0) {
    humanRequired.push(...pendingManualActions);
  }

  if (blockers.length > 0) {
    return Object.freeze({
      decision: AUTO_DEPLOY_DECISION.BLOCKED,
      blockers,
      humanRequired,
      message: `Blocked: ${blockers.join(', ')}`,
      isReal:  false,
    });
  }

  if (humanRequired.length > 0) {
    return Object.freeze({
      decision: AUTO_DEPLOY_DECISION.WAITING_HUMAN,
      blockers: [],
      humanRequired,
      message: `Waiting for human: ${humanRequired.join(', ')}`,
      isReal:  false,
    });
  }

  return Object.freeze({
    decision: AUTO_DEPLOY_DECISION.AUTO_DEPLOY_ALLOWED,
    blockers: [],
    humanRequired: [],
    message: 'All gates passed — auto deploy allowed.',
    isReal:  false,
  });
}

export const SAFE_AUTO_DEPLOY_POLICY_VERSION = '1.0.0';
