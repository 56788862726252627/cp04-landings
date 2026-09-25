// Restore Point — ADV-18

export const RESTORE_POINT_STATUS = Object.freeze({
  AVAILABLE:    'AVAILABLE',
  VERIFIED:     'VERIFIED',
  DEGRADED:     'DEGRADED',
  INCOMPATIBLE: 'INCOMPATIBLE',
  BLOCKED:      'BLOCKED',
});

let _rpCounter = 1;

export function createRestorePoint(config = {}) {
  const {
    backupId            = null,
    sourceVersion       = '1.0.0',
    targetCompatibility = ['1.x'],
    scope               = [],
    status              = RESTORE_POINT_STATUS.AVAILABLE,
    verified            = false,
    warnings            = [],
    restorePointId      = null,
    clientId            = null,
  } = config;

  const id        = restorePointId ?? `rp-${Date.now()}-${_rpCounter++}`;
  const createdAt = new Date().toISOString();

  return Object.freeze({
    id,
    backupId,
    createdAt,
    sourceVersion,
    targetCompatibility: Object.freeze([...targetCompatibility]),
    scope:               Object.freeze([...scope]),
    status,
    verified,
    clientId,
    warnings:            Object.freeze([...warnings]),
    isAvailable:         status === RESTORE_POINT_STATUS.AVAILABLE || status === RESTORE_POINT_STATUS.VERIFIED,
    isBlocked:           status === RESTORE_POINT_STATUS.BLOCKED,
    isReal:              false,
  });
}

export const RESTORE_POINT_VERSION = '1.0.0';
