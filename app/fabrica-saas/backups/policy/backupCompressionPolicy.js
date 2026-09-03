// Backup Compression Policy — ADV-18

export const COMPRESSION_LEVEL = Object.freeze({
  NONE:      'NONE',
  STANDARD:  'STANDARD',
  HIGH:      'HIGH',
});

export function createBackupCompressionPolicy(config = {}) {
  const {
    level           = COMPRESSION_LEVEL.STANDARD,
    excludeBinaries = true,
    algorithm       = 'gzip',
  } = config;

  return Object.freeze({
    level,
    excludeBinaries,
    algorithm,
    compressionEnabled: level !== COMPRESSION_LEVEL.NONE,
    isReal:             false,
  });
}

export const BACKUP_COMPRESSION_POLICY_VERSION = '1.0.0';
