// Backup Audit Entry — ADV-18

export const AUDIT_ACTION = Object.freeze({
  BACKUP_PLANNED:              'BACKUP_PLANNED',
  BACKUP_STARTED:              'BACKUP_STARTED',
  BACKUP_COMPLETED:            'BACKUP_COMPLETED',
  BACKUP_FAILED:               'BACKUP_FAILED',
  INTEGRITY_CHECK:             'INTEGRITY_CHECK',
  INTEGRITY_CHECK_FAILED:      'INTEGRITY_CHECK_FAILED',
  RESTORE_PLANNED:             'RESTORE_PLANNED',
  RESTORE_DRY_RUN_COMPLETED:   'RESTORE_DRY_RUN_COMPLETED',
  RESTORE_BLOCKED:             'RESTORE_BLOCKED',
  ROLLBACK_PREPARED:           'ROLLBACK_PREPARED',
  RECOVERY_VALIDATION_FAILED:  'RECOVERY_VALIDATION_FAILED',
  SECRET_BLOCKED:              'SECRET_BLOCKED',
  CLIENT_ISOLATION_ENFORCED:   'CLIENT_ISOLATION_ENFORCED',
});

export const AUDIT_ACTOR_TYPE = Object.freeze({
  SYSTEM:       'SYSTEM',
  AGENT:        'AGENT',
  HUMAN:        'HUMAN',
  SCHEDULER:    'SCHEDULER',
});

let _auditCounter = 1;

export function createBackupAuditEntry(config = {}) {
  const {
    action    = AUDIT_ACTION.BACKUP_PLANNED,
    actorType = AUDIT_ACTOR_TYPE.SYSTEM,
    backupId  = null,
    restoreId = null,
    result    = 'OK',
    reason    = null,
  } = config;

  return Object.freeze({
    id:        `audit-${Date.now()}-${_auditCounter++}`,
    action,
    actorType,
    backupId,
    restoreId,
    timestamp: new Date().toISOString(),
    result,
    reason,
    isReal:    false,
  });
}

export const BACKUP_AUDIT_ENTRY_VERSION = '1.0.0';
