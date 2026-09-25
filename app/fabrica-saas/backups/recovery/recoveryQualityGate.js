// Recovery Quality Gate — ADV-18

export const RECOVERY_GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARN:    'WARN',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export const RECOVERY_BLOCK_REASON = Object.freeze({
  NO_VALID_RESTORE_POINT:        'NO_VALID_RESTORE_POINT',
  CORRUPT_LATEST_BACKUP:         'CORRUPT_LATEST_BACKUP',
  CLIENT_LEAK:                   'CLIENT_LEAK',
  CRITICAL_SECRET_EXPOSURE:      'CRITICAL_SECRET_EXPOSURE',
  RESTORE_UNVALIDATED:           'RESTORE_UNVALIDATED',
  CRITICAL_SCHEMA_INCOMPATIBILITY: 'CRITICAL_SCHEMA_INCOMPATIBILITY',
});

export function evaluateRecoveryQualityGate(config = {}) {
  const {
    overallScore                  = 100,
    noValidRestorePoint           = false,
    corruptLatestBackup           = false,
    clientLeak                    = false,
    criticalSecretExposure        = false,
    restoreUnvalidated            = false,
    criticalSchemaIncompatibility = false,
  } = config;

  const blockReasons = [];
  if (noValidRestorePoint)           blockReasons.push(RECOVERY_BLOCK_REASON.NO_VALID_RESTORE_POINT);
  if (corruptLatestBackup)           blockReasons.push(RECOVERY_BLOCK_REASON.CORRUPT_LATEST_BACKUP);
  if (clientLeak)                    blockReasons.push(RECOVERY_BLOCK_REASON.CLIENT_LEAK);
  if (criticalSecretExposure)        blockReasons.push(RECOVERY_BLOCK_REASON.CRITICAL_SECRET_EXPOSURE);
  if (restoreUnvalidated)            blockReasons.push(RECOVERY_BLOCK_REASON.RESTORE_UNVALIDATED);
  if (criticalSchemaIncompatibility) blockReasons.push(RECOVERY_BLOCK_REASON.CRITICAL_SCHEMA_INCOMPATIBILITY);

  if (blockReasons.length > 0) {
    return Object.freeze({
      status:       RECOVERY_GATE_STATUS.BLOCKED,
      blockReasons: Object.freeze(blockReasons),
      score:        overallScore,
      isReal:       false,
    });
  }

  const status = overallScore >= 90
    ? RECOVERY_GATE_STATUS.PASS
    : overallScore >= 80
      ? RECOVERY_GATE_STATUS.WARN
      : RECOVERY_GATE_STATUS.FAIL;

  return Object.freeze({
    status,
    blockReasons: Object.freeze([]),
    score:        overallScore,
    isReal:       false,
  });
}

export const RECOVERY_QUALITY_GATE_VERSION = '1.0.0';
