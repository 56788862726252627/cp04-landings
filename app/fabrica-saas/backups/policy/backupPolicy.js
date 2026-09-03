// Backup Policy — ADV-18

export const BACKUP_FREQUENCY = Object.freeze({
  MANUAL:     'MANUAL',
  DAILY:      'DAILY',
  WEEKLY:     'WEEKLY',
  MONTHLY:    'MONTHLY',
  ON_DEPLOY:  'ON_DEPLOY',
  ON_CHANGE:  'ON_CHANGE',
});

export const BACKUP_STATUS = Object.freeze({
  ACTIVE:    'ACTIVE',
  PAUSED:    'PAUSED',
  DISABLED:  'DISABLED',
  DRAFT:     'DRAFT',
});

export const STORAGE_CLASS = Object.freeze({
  STANDARD:   'STANDARD',
  ARCHIVE:    'ARCHIVE',
  HOT:        'HOT',
  COLD:       'COLD',
});

export function createBackupPolicy(config = {}) {
  const {
    scope                 = [],
    frequency             = BACKUP_FREQUENCY.MANUAL,
    retentionDays         = 30,
    encryptionRequired    = false,
    integrityCheck        = true,
    clientIsolation       = true,
    storageClass          = STORAGE_CLASS.STANDARD,
    restoreValidation     = true,
    manualApprovalRequired = false,
    status                = BACKUP_STATUS.ACTIVE,
    excludeSecrets        = true,
    label                 = '',
  } = config;

  return Object.freeze({
    scope:                  Object.freeze([...scope]),
    frequency,
    retentionDays,
    encryptionRequired,
    integrityCheck,
    clientIsolation,
    storageClass,
    restoreValidation,
    manualApprovalRequired,
    status,
    excludeSecrets,
    label,
    isActive:               status === BACKUP_STATUS.ACTIVE,
    isReal:                 false,
  });
}

export const BACKUP_POLICY_VERSION = '1.0.0';
