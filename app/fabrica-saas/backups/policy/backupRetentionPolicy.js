// Backup Retention Policy — ADV-18

export const RETENTION_PRESET = Object.freeze({
  SHORT:                 'SHORT',           // 7 days
  STANDARD:              'STANDARD',        // 30 days
  EXTENDED:              'EXTENDED',        // 90 days
  LEGAL_HOLD_FOUNDATION: 'LEGAL_HOLD_FOUNDATION', // indefinite, no auto-delete
  CUSTOM:                'CUSTOM',
});

const PRESET_DAYS = Object.freeze({
  SHORT:                 7,
  STANDARD:              30,
  EXTENDED:              90,
  LEGAL_HOLD_FOUNDATION: Infinity,
  CUSTOM:                null,
});

export function createBackupRetentionPolicy(config = {}) {
  const {
    preset          = RETENTION_PRESET.STANDARD,
    customDays      = null,
    autoDelete      = false,
    requireApprovalForDelete = true,
    legalHold       = false,
    label           = '',
  } = config;

  const retentionDays = preset === RETENTION_PRESET.CUSTOM
    ? (customDays ?? 30)
    : PRESET_DAYS[preset] ?? 30;

  const safeAutoDelete = legalHold ? false : autoDelete;

  return Object.freeze({
    preset,
    retentionDays,
    autoDelete:             safeAutoDelete,
    requireApprovalForDelete,
    legalHold,
    label,
    isIndefinite:           retentionDays === Infinity || legalHold,
    canAutoDelete:          safeAutoDelete && !legalHold,
    isReal:                 false,
  });
}

export const BACKUP_RETENTION_POLICY_VERSION = '1.0.0';
