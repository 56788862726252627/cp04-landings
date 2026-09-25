// Full Restore Plan — ADV-18

const FULL_RESTORE_STEPS = Object.freeze([
  'PRE_CHECK',
  'BACKUP_VERIFICATION',
  'TARGET_ISOLATION',
  'RESTORE_EXECUTION',
  'POST_RESTORE_VALIDATION',
  'HEALTH_CHECKS',
  'ROLLBACK_OPTION',
]);

export function createFullRestorePlan(config = {}) {
  const {
    restorePoint      = null,
    targetEnvironment = 'LOCAL',
    approvalRequired  = true,
    clientId          = null,
    preCheckPassed    = false,
    backupVerified    = false,
    rollbackAvailable = true,
    dryRunOnly        = true,
  } = config;

  return Object.freeze({
    restorePoint:     restorePoint?.id ?? restorePoint,
    targetEnvironment,
    scope:            Object.freeze(['FULL']),
    mode:             dryRunOnly ? 'DRY_RUN' : 'FULL',
    steps:            FULL_RESTORE_STEPS,
    preconditions:    Object.freeze([
      { check: 'PRE_CHECK_PASSED',    satisfied: preCheckPassed },
      { check: 'BACKUP_VERIFIED',     satisfied: backupVerified },
      { check: 'TARGET_ISOLATED',     satisfied: false },
    ]),
    rollbackAvailable,
    approvalRequired,
    clientId,
    dryRunOnly,
    isReal:           false,
  });
}

export const FULL_RESTORE_PLAN_VERSION = '1.0.0';
