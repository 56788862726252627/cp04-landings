// Backup Policy — PASO F
// NO_REAL_BACKUPS=SI — purely operational planning model

export const BACKUP_FREQUENCIES = Object.freeze({
  DAILY:    'DAILY',
  WEEKLY:   'WEEKLY',
  MONTHLY:  'MONTHLY',
  ON_DEMAND:'ON_DEMAND',
});

export const BACKUP_TYPES = Object.freeze({
  FULL:        'FULL',
  INCREMENTAL: 'INCREMENTAL',
  SNAPSHOT:    'SNAPSHOT',
  EXPORT:      'EXPORT',
});

export const BACKUP_HEALTH_STATUS = Object.freeze({
  HEALTHY:  'HEALTHY',
  WARNING:  'WARNING',
  CRITICAL: 'CRITICAL',
  UNKNOWN:  'UNKNOWN',
});

export function createBackupPolicy(params = {}) {
  const errors = [];

  if (!params.clientId) errors.push('clientId required');
  if (!params.maintenanceTier) errors.push('maintenanceTier required');

  if (errors.length > 0) return { valid: false, errors, policy: null };

  const defaults = getDefaultPolicy(params.maintenanceTier);

  const policy = {
    id:               params.id ?? `BP-${params.clientId}`,
    clientId:         params.clientId,
    maintenanceTier:  params.maintenanceTier,

    databaseBackup: {
      frequency:  params.databaseFrequency ?? defaults.databaseFrequency,
      type:       params.databaseType ?? BACKUP_TYPES.FULL,
      retention:  params.databaseRetention ?? defaults.retention,
      verified:   false,
    },
    fileBackup: {
      frequency:  params.fileFrequency ?? defaults.fileFrequency,
      type:       params.fileType ?? BACKUP_TYPES.INCREMENTAL,
      retention:  params.fileRetention ?? defaults.retention,
      verified:   false,
    },
    configBackup: {
      frequency:  BACKUP_FREQUENCIES.ON_DEMAND,
      type:       BACKUP_TYPES.EXPORT,
      retention:  '90 days',
      verified:   false,
    },

    rpo: params.rpo ?? defaults.rpo,
    rto: params.rto ?? defaults.rto,

    testRestore: {
      frequency:    defaults.testRestoreFrequency,
      lastTestedAt: null,
      lastResult:   null,
    },

    responsibleParty: 'AGENCY',
    storagePlatform:  params.storagePlatform ?? 'external_storage',
    disclaimer:       'Backup policy is an operational plan. No real backups are created or stored.',
  };

  return { valid: true, errors: [], policy };
}

function getDefaultPolicy(tier) {
  const configs = {
    BASIC: {
      databaseFrequency:    BACKUP_FREQUENCIES.WEEKLY,
      fileFrequency:        BACKUP_FREQUENCIES.MONTHLY,
      retention:            '30 days',
      rpo:                  '7 days',
      rto:                  '48h',
      testRestoreFrequency: BACKUP_FREQUENCIES.MONTHLY,
    },
    PRO: {
      databaseFrequency:    BACKUP_FREQUENCIES.DAILY,
      fileFrequency:        BACKUP_FREQUENCIES.WEEKLY,
      retention:            '60 days',
      rpo:                  '24h',
      rto:                  '24h',
      testRestoreFrequency: BACKUP_FREQUENCIES.MONTHLY,
    },
    PRIORITY: {
      databaseFrequency:    BACKUP_FREQUENCIES.DAILY,
      fileFrequency:        BACKUP_FREQUENCIES.DAILY,
      retention:            '90 days',
      rpo:                  '4h',
      rto:                  '8h',
      testRestoreFrequency: BACKUP_FREQUENCIES.WEEKLY,
    },
  };
  return configs[tier] ?? configs.BASIC;
}

/**
 * Audit the backup health of a policy based on reported checks.
 */
export function auditBackupHealth(policy, checks = {}) {
  if (!policy) return { valid: false, error: 'policy required' };

  const issues = [];
  let score = 100;

  if (!checks.databaseBackupRecent) {
    issues.push({ severity: 'CRITICAL', issue: 'No recent database backup detected' });
    score -= 40;
  }
  if (!checks.fileBackupRecent) {
    issues.push({ severity: 'WARNING', issue: 'No recent file backup detected' });
    score -= 20;
  }
  if (!checks.configBackupRecent) {
    issues.push({ severity: 'WARNING', issue: 'Config backup not recent' });
    score -= 15;
  }
  if (!checks.restoreTestRecent) {
    issues.push({ severity: 'WARNING', issue: 'Restore test overdue' });
    score -= 10;
  }
  if (!checks.backupVerified) {
    issues.push({ severity: 'WARNING', issue: 'Backups not verified via checksum/test' });
    score -= 10;
  }

  const healthScore = Math.max(0, score);
  const status = healthScore >= 80
    ? BACKUP_HEALTH_STATUS.HEALTHY
    : healthScore >= 50
      ? BACKUP_HEALTH_STATUS.WARNING
      : BACKUP_HEALTH_STATUS.CRITICAL;

  return {
    valid: true,
    policyId:    policy.id,
    clientId:    policy.clientId,
    healthScore,
    status,
    issues,
    disclaimer:  'Backup audit is an operational assessment. No real backup data inspected.',
  };
}

/**
 * Evaluate restore readiness based on policy and checks.
 */
export function evaluateRestoreReadiness(policy, checks = {}) {
  if (!policy) return { valid: false, error: 'policy required' };

  const ready = !!(
    checks.databaseBackupRecent &&
    checks.restoreTestRecent &&
    checks.backupVerified
  );

  const blockers = [];
  if (!checks.databaseBackupRecent) blockers.push('No recent database backup');
  if (!checks.restoreTestRecent)    blockers.push('Restore test not performed recently');
  if (!checks.backupVerified)       blockers.push('Backup integrity not verified');

  return {
    valid:       true,
    policyId:    policy.id,
    clientId:    policy.clientId,
    restoreReady: ready,
    rpo:         policy.rpo,
    rto:         policy.rto,
    blockers,
    disclaimer:  'Restore readiness is an operational assessment, not a guarantee.',
  };
}

export const BACKUP_POLICY_VERSION = '1.0.0';
