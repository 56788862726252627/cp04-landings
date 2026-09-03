// Backup Storage Profile — ADV-18

export const STORAGE_TYPE = Object.freeze({
  LOCAL:          'LOCAL',
  OBJECT_STORAGE: 'OBJECT_STORAGE',
  CLOUD_PROVIDER: 'CLOUD_PROVIDER',
  CUSTOM:         'CUSTOM',
});

export function createBackupStorageProfile(config = {}) {
  const {
    type            = STORAGE_TYPE.LOCAL,
    region          = null,
    bucket          = null,
    provider        = null,
    pathPrefix      = '/backups',
    redundancy      = 1,
    encryptAtRest   = false,
    label           = '',
  } = config;

  return Object.freeze({
    type,
    region,
    bucket,
    provider,
    pathPrefix,
    redundancy,
    encryptAtRest,
    label,
    isRemote: type !== STORAGE_TYPE.LOCAL,
    isReal:   false,
  });
}

export const BACKUP_STORAGE_PROFILE_VERSION = '1.0.0';
