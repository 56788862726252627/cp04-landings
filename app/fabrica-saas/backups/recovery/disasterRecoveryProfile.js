// Disaster Recovery Profile — ADV-18

export const DR_CRITICALITY = Object.freeze({
  LOW:      'LOW',
  STANDARD: 'STANDARD',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export const DR_STATUS = Object.freeze({
  CONFIGURED:   'CONFIGURED',
  PARTIAL:      'PARTIAL',
  NOT_READY:    'NOT_READY',
  TESTED:       'TESTED',
});

export function createDisasterRecoveryProfile(config = {}) {
  const {
    criticality           = DR_CRITICALITY.STANDARD,
    RPOClass              = 'DAILY',
    RTOClass              = 'DAILY',
    backupPolicy          = null,
    restoreStrategy       = 'DRY_RUN',
    requiredDependencies  = [],
    manualOwner           = null,
    status                = DR_STATUS.NOT_READY,
    clientId              = null,
    businessId            = null,
  } = config;

  return Object.freeze({
    criticality,
    RPOClass,
    RTOClass,
    backupPolicy,
    restoreStrategy,
    requiredDependencies: Object.freeze([...requiredDependencies]),
    manualOwner,
    status,
    clientId,
    businessId,
    isConfigured:  status !== DR_STATUS.NOT_READY,
    isTested:      status === DR_STATUS.TESTED,
    isCritical:    criticality === DR_CRITICALITY.CRITICAL,
    isReal:        false,
  });
}

export const DISASTER_RECOVERY_PROFILE_VERSION = '1.0.0';
