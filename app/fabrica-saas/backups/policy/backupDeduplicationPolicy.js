// Backup Deduplication Policy — ADV-18 (conceptual foundation)

export const DEDUP_STRATEGY = Object.freeze({
  NONE:       'NONE',
  CHECKSUM:   'CHECKSUM',
  BLOCK:      'BLOCK_FOUNDATION',
  SEMANTIC:   'SEMANTIC_FOUNDATION',
});

export function createBackupDeduplicationPolicy(config = {}) {
  // eslint-disable-next-line no-unused-vars
  const { strategy = DEDUP_STRATEGY.CHECKSUM, enabled = true, crossClient = false } = config;

  return Object.freeze({
    strategy,
    enabled:           enabled && strategy !== DEDUP_STRATEGY.NONE,
    crossClient:       false,  // always false regardless of input — client isolation
    estimatedSavings:  'UNKNOWN',
    isReal:            false,
  });
}

export const BACKUP_DEDUP_POLICY_VERSION = '1.0.0';
