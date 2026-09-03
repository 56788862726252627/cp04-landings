// Backup Manifest — ADV-18

export function createBackupManifest(config = {}) {
  const {
    version              = '1.0.0',
    sourceVersion        = '1.0.0',
    registryVersion      = '4.1.0',
    schemaVersion        = '1.0.0',
    scope                = [],
    items                = [],
    checksums            = {},
    dependencies         = [],
    restoreRequirements  = [],
    clientId             = null,
    businessId           = null,
    label                = '',
  } = config;

  const createdAt = new Date().toISOString();

  return Object.freeze({
    version,
    createdAt,
    sourceVersion,
    registryVersion,
    schemaVersion,
    scope:               Object.freeze([...scope]),
    items:               Object.freeze([...items]),
    checksums:           Object.freeze({ ...checksums }),
    dependencies:        Object.freeze([...dependencies]),
    restoreRequirements: Object.freeze([...restoreRequirements]),
    clientId,
    businessId,
    label,
    itemCount:           items.length,
    isReal:              false,
  });
}

export const BACKUP_MANIFEST_VERSION = '1.0.0';
