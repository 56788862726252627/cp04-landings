// Restore Rollback Plan — ADV-18

export const ROLLBACK_STATUS = Object.freeze({
  AVAILABLE:  'AVAILABLE',
  PREPARED:   'PREPARED',
  EXECUTED:   'EXECUTED',
  UNAVAILABLE: 'UNAVAILABLE',
});

export function createRestoreRollbackPlan(config = {}) {
  const {
    preRestorePoint     = null,
    targetEnvironment   = 'LOCAL',
    healthValidation    = true,
    integrityValidation = true,
    status              = ROLLBACK_STATUS.AVAILABLE,
    clientId            = null,
  } = config;

  return Object.freeze({
    preRestorePoint:    preRestorePoint?.id ?? preRestorePoint,
    targetEnvironment,
    healthValidation,
    integrityValidation,
    status,
    clientId,
    steps: Object.freeze([
      'STOP_RESTORE_IF_RUNNING',
      'VERIFY_PRE_RESTORE_POINT',
      'RESTORE_FROM_PRE_RESTORE_POINT',
      'VALIDATE_HEALTH',
      'VALIDATE_INTEGRITY',
      'CONFIRM_ROLLBACK_COMPLETE',
    ]),
    isReal: false,
  });
}

export const RESTORE_ROLLBACK_PLAN_VERSION = '1.0.0';
