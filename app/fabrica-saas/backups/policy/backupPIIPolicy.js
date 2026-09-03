// Backup PII Policy — ADV-18

export const PII_LEVEL = Object.freeze({
  NONE:        'NONE',
  LOW:         'LOW',
  PERSONAL:    'PERSONAL',
  SENSITIVE:   'SENSITIVE',
  RESTRICTED:  'RESTRICTED',
});

const LEVEL_REQUIRES_ENCRYPTION = new Set([PII_LEVEL.SENSITIVE, PII_LEVEL.RESTRICTED]);
const LEVEL_REQUIRES_APPROVAL   = new Set([PII_LEVEL.RESTRICTED]);

export function createBackupPIIPolicy(config = {}) {
  const {
    piiLevel              = PII_LEVEL.NONE,
    minimizeBeforeBackup  = true,
    retentionOverrideDays = null,
    requireApprovalForRestore = false,
  } = config;

  const encryptionRequired = LEVEL_REQUIRES_ENCRYPTION.has(piiLevel);
  const restoreApproval    = LEVEL_REQUIRES_APPROVAL.has(piiLevel) || requireApprovalForRestore;

  return Object.freeze({
    piiLevel,
    minimizeBeforeBackup,
    encryptionRequired,
    restoreApprovalRequired: restoreApproval,
    retentionOverrideDays,
    isHighRisk:   piiLevel === PII_LEVEL.SENSITIVE || piiLevel === PII_LEVEL.RESTRICTED,
    isRestricted: piiLevel === PII_LEVEL.RESTRICTED,
    isReal:       false,
  });
}

export const BACKUP_PII_POLICY_VERSION = '1.0.0';
