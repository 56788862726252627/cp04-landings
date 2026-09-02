// Container Rollback Plan — ADV-15
// No real deploy execution

export const ROLLBACK_TRIGGER = Object.freeze({
  HEALTH_FAILURE:  'HEALTH_FAILURE',
  BUILD_FAILURE:   'BUILD_FAILURE',
  MANUAL:          'MANUAL',
  AUTO_THRESHOLD:  'AUTO_THRESHOLD',
});

export const ROLLBACK_STATUS = Object.freeze({
  NOT_NEEDED:   'NOT_NEEDED',
  TRIGGERED:    'TRIGGERED',
  IN_PROGRESS:  'IN_PROGRESS',
  COMPLETED:    'COMPLETED',
  FAILED:       'FAILED',
});

export function createContainerRollbackPlan(config = {}) {
  if (!config.currentTag) throw new Error('createContainerRollbackPlan requires currentTag');
  if (!config.previousTag) throw new Error('createContainerRollbackPlan requires previousTag');

  return Object.freeze({
    currentTag:      config.currentTag,
    previousTag:     config.previousTag,
    trigger:         config.trigger      ?? ROLLBACK_TRIGGER.MANUAL,
    maxRollbackMs:   config.maxRollbackMs ?? 120000,
    healthValidation: config.healthValidation ?? true,
    steps: Object.freeze([
      'validate-previous-tag-exists',
      'switch-traffic-to-previous',
      'validate-health',
      'confirm-rollback',
      'notify-team',
    ]),
    noRealDeploy:    true,
    isReal:          false,
  });
}

export function evaluateRollbackDecision(config = {}) {
  const { healthOk = true, errorRate = 0, threshold = 0.05, manualOverride = false } = config;

  const shouldRollback = manualOverride || !healthOk || errorRate > threshold;

  return Object.freeze({
    shouldRollback,
    trigger:   manualOverride ? ROLLBACK_TRIGGER.MANUAL : !healthOk ? ROLLBACK_TRIGGER.HEALTH_FAILURE : ROLLBACK_TRIGGER.AUTO_THRESHOLD,
    reason:    shouldRollback ? `errorRate=${errorRate} healthOk=${healthOk}` : 'all healthy',
    noRealDeploy: true,
    isReal:    false,
  });
}

export const CONTAINER_ROLLBACK_PLAN_VERSION = '1.0.0';
