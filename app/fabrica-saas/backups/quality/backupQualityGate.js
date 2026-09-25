// Backup Quality Gate — ADV-18

export const BACKUP_GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARN:    'WARN',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export const BACKUP_BLOCK_REASON = Object.freeze({
  SECRET_INCLUDED:              'SECRET_INCLUDED',
  CHECKSUM_MISMATCH:            'CHECKSUM_MISMATCH',
  WRONG_CLIENT:                 'WRONG_CLIENT',
  MISSING_REQUIRED_ITEM:        'MISSING_REQUIRED_ITEM',
  UNSUPPORTED_SCHEMA:           'UNSUPPORTED_SCHEMA',
  CORRUPTION_DETECTED:          'CORRUPTION_DETECTED',
  UNSAFE_RETENTION:             'UNSAFE_RETENTION',
  UNENCRYPTED_SENSITIVE_BACKUP: 'UNENCRYPTED_SENSITIVE_BACKUP',
});

export function evaluateBackupQualityGate(config = {}) {
  const {
    overallScore         = 100,
    secretIncluded       = false,
    checksumMismatch     = false,
    wrongClient          = false,
    missingRequiredItem  = false,
    unsupportedSchema    = false,
    corruptionDetected   = false,
    unsafeRetention      = false,
    unencryptedSensitive = false,
  } = config;

  const blockReasons = [];
  if (secretIncluded)       blockReasons.push(BACKUP_BLOCK_REASON.SECRET_INCLUDED);
  if (checksumMismatch)     blockReasons.push(BACKUP_BLOCK_REASON.CHECKSUM_MISMATCH);
  if (wrongClient)          blockReasons.push(BACKUP_BLOCK_REASON.WRONG_CLIENT);
  if (missingRequiredItem)  blockReasons.push(BACKUP_BLOCK_REASON.MISSING_REQUIRED_ITEM);
  if (unsupportedSchema)    blockReasons.push(BACKUP_BLOCK_REASON.UNSUPPORTED_SCHEMA);
  if (corruptionDetected)   blockReasons.push(BACKUP_BLOCK_REASON.CORRUPTION_DETECTED);
  if (unsafeRetention)      blockReasons.push(BACKUP_BLOCK_REASON.UNSAFE_RETENTION);
  if (unencryptedSensitive) blockReasons.push(BACKUP_BLOCK_REASON.UNENCRYPTED_SENSITIVE_BACKUP);

  if (blockReasons.length > 0) {
    return Object.freeze({
      status:       BACKUP_GATE_STATUS.BLOCKED,
      blockReasons: Object.freeze(blockReasons),
      score:        overallScore,
      isReal:       false,
    });
  }

  let status;
  if (overallScore >= 90)      status = BACKUP_GATE_STATUS.PASS;
  else if (overallScore >= 80) status = BACKUP_GATE_STATUS.WARN;
  else                         status = BACKUP_GATE_STATUS.FAIL;

  return Object.freeze({
    status,
    blockReasons: Object.freeze([]),
    score:        overallScore,
    isReal:       false,
  });
}

export const BACKUP_QUALITY_GATE_VERSION = '1.0.0';
