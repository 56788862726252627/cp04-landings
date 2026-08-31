// Rollback Model — PASO G
// Rollback planning. No real rollback actions.

export const ROLLBACK_TRIGGER_CONDITIONS = Object.freeze({
  HEALTH_CHECK_FAIL:    'HEALTH_CHECK_FAIL',
  POST_DEPLOY_QA_FAIL:  'POST_DEPLOY_QA_FAIL',
  RUNTIME_BLANK_SCREEN: 'RUNTIME_BLANK_SCREEN',
  AUTH_BROKEN:          'AUTH_BROKEN',
  DATA_CORRUPTION:      'DATA_CORRUPTION',
  SECURITY_INCIDENT:    'SECURITY_INCIDENT',
  MANUAL_REQUEST:       'MANUAL_REQUEST',
});

export const ROLLBACK_RISK = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export function createRollbackPlan(params = {}) {
  const errors = [];
  if (!params.deploymentId)     errors.push('deploymentId required');
  if (!params.previousVersion)  errors.push('previousVersion required');
  if (!params.targetId)         errors.push('targetId required');

  if (errors.length > 0) return { valid: false, errors, plan: null };

  const plan = {
    planId:                   `RB-${params.deploymentId}`,
    deploymentId:             params.deploymentId,
    targetId:                 params.targetId,
    previousKnownGoodVersion: params.previousVersion,
    previousDeploymentId:     params.previousDeploymentId ?? null,

    triggerConditions:        params.triggerConditions ?? [
      ROLLBACK_TRIGGER_CONDITIONS.HEALTH_CHECK_FAIL,
      ROLLBACK_TRIGGER_CONDITIONS.RUNTIME_BLANK_SCREEN,
      ROLLBACK_TRIGGER_CONDITIONS.AUTH_BROKEN,
    ],

    rollbackSteps: params.rollbackSteps ?? [
      'Identify previous deployment ID in provider dashboard',
      'Trigger rollback via provider UI or CLI (no Wrangler automation — manual)',
      'Wait for rollback deployment to complete',
      'Run health check on rolled-back version',
      'Confirm critical flows working',
      'Notify client of rollback and estimated fix ETA',
    ],

    dataCompatibility:      params.dataCompatibility ?? 'COMPATIBLE',
    databaseRisk:           params.databaseRisk ?? ROLLBACK_RISK.LOW,
    integrationRisk:        params.integrationRisk ?? ROLLBACK_RISK.LOW,

    verificationAfterRollback: params.verificationAfterRollback ?? [
      'Health check passes',
      'Login works',
      'Critical routes return 200',
      'Post-deploy QA: critical checks pass',
    ],

    humanApproval:          params.humanApproval ?? true,
    estimatedTimeMinutes:   params.estimatedTimeMinutes ?? 15,
    createdAt:              new Date().toISOString(),
    disclaimer:             'Rollback plan is operational documentation. No real rollback triggered.',
  };

  return { valid: true, errors: [], plan };
}

/**
 * Evaluate whether a rollback is needed based on current state.
 */
export function evaluateRollbackNeed(healthResult, qaResult, renderResult) {
  const triggers = [];

  if (healthResult?.status === 'FAIL')   triggers.push(ROLLBACK_TRIGGER_CONDITIONS.HEALTH_CHECK_FAIL);
  if (qaResult?.status === 'FAIL')       triggers.push(ROLLBACK_TRIGGER_CONDITIONS.POST_DEPLOY_QA_FAIL);
  if (renderResult?.status === 'FAIL')   triggers.push(ROLLBACK_TRIGGER_CONDITIONS.RUNTIME_BLANK_SCREEN);

  const rollbackRequired = triggers.length > 0;
  const urgency = triggers.length >= 2 ? 'IMMEDIATE' : triggers.length === 1 ? 'URGENT' : 'NONE';

  return {
    valid:            true,
    rollbackRequired,
    urgency,
    triggers,
    recommendation:   rollbackRequired
      ? `ROLLBACK REQUIRED — ${urgency}: ${triggers.join(', ')}`
      : 'No rollback needed — system appears healthy',
    disclaimer:       'Rollback evaluation is advisory. Human must authorize rollback execution.',
  };
}

export const ROLLBACK_MODEL_VERSION = '1.0.0';
