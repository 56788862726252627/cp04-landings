// Backup Encryption Policy — ADV-18
// Foundation only — no real key material ever stored.

export const ENCRYPTION_STATUS = Object.freeze({
  REQUIRED:        'REQUIRED',
  RECOMMENDED:     'RECOMMENDED',
  OPTIONAL:        'OPTIONAL',
  NOT_APPLICABLE:  'NOT_APPLICABLE',
});

export function createBackupEncryptionPolicy(config = {}) {
  const {
    status            = ENCRYPTION_STATUS.RECOMMENDED,
    algorithm         = 'AES-256-GCM',
    keyReferenceOnly  = true,
    enforceAtRest     = false,
    enforceInTransit  = true,
  } = config;

  return Object.freeze({
    status,
    algorithm,
    keyReferenceOnly,
    enforceAtRest,
    enforceInTransit,
    isRequired:      status === ENCRYPTION_STATUS.REQUIRED,
    isReal:          false,
  });
}

export const BACKUP_ENCRYPTION_POLICY_VERSION = '1.0.0';
