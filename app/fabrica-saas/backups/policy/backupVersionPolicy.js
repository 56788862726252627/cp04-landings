// Backup Version Policy — ADV-18

export const BACKUP_VERSION_TYPE = Object.freeze({
  FULL:                    'FULL',
  INCREMENTAL_FOUNDATION:  'INCREMENTAL_FOUNDATION',
  SNAPSHOT:                'SNAPSHOT',
  CONFIG_ONLY:             'CONFIG_ONLY',
});

export function createBackupVersionPolicy(config = {}) {
  const {
    versionType   = BACKUP_VERSION_TYPE.FULL,
    maxVersions   = 5,
    keepLatest    = true,
    tag           = '',
    sourceVersion = '1.0.0',
  } = config;

  return Object.freeze({
    versionType,
    maxVersions,
    keepLatest,
    tag,
    sourceVersion,
    isFull:        versionType === BACKUP_VERSION_TYPE.FULL,
    isSnapshot:    versionType === BACKUP_VERSION_TYPE.SNAPSHOT,
    isConfigOnly:  versionType === BACKUP_VERSION_TYPE.CONFIG_ONLY,
    isReal:        false,
  });
}

export const BACKUP_VERSION_POLICY_VERSION = '1.0.0';
