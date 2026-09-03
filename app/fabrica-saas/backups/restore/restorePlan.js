// Restore Plan — ADV-18

export const RESTORE_MODE = Object.freeze({
  DRY_RUN:  'DRY_RUN',
  PARTIAL:  'PARTIAL',
  FULL:     'FULL',
});

export const RESTORE_TARGET_ENV = Object.freeze({
  LOCAL:       'LOCAL',
  STAGING:     'STAGING',
  PRODUCTION:  'PRODUCTION',
  CONTAINER:   'CONTAINER',
  SERVERLESS:  'SERVERLESS',
});

export function createRestorePlan(config = {}) {
  const {
    restorePoint       = null,
    targetEnvironment  = RESTORE_TARGET_ENV.LOCAL,
    scope              = [],
    mode               = RESTORE_MODE.DRY_RUN,
    preconditions      = [],
    steps              = [],
    validation         = null,
    rollbackPlan       = null,
    approvalRequired   = true,
    clientId           = null,
  } = config;

  const isSafeMode = mode === RESTORE_MODE.DRY_RUN;

  return Object.freeze({
    restorePoint:      restorePoint?.id ?? restorePoint,
    targetEnvironment,
    scope:             Object.freeze([...scope]),
    mode,
    preconditions:     Object.freeze([...preconditions]),
    steps:             Object.freeze([...steps]),
    validation,
    rollbackPlan,
    approvalRequired,
    clientId,
    isSafeMode,
    isReal:            false,
  });
}

export const RESTORE_PLAN_VERSION = '1.0.0';
