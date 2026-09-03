// Backup Observability Bridge — ADV-18 → ADV-01

export const BACKUP_EVENT = Object.freeze({
  BACKUP_PLANNED:              'backup.planned',
  BACKUP_STARTED:              'backup.started',
  BACKUP_COMPLETED:            'backup.completed',
  BACKUP_FAILED:               'backup.failed',
  INTEGRITY_CHECK_FAILED:      'backup.integrity_check_failed',
  RESTORE_PLANNED:             'restore.planned',
  RESTORE_DRY_RUN_COMPLETED:   'restore.dry_run_completed',
  RESTORE_BLOCKED:             'restore.blocked',
  ROLLBACK_PREPARED:           'restore.rollback_prepared',
  RECOVERY_VALIDATION_FAILED:  'recovery.validation_failed',
});

export function createBackupObservabilityBridge() {
  const events = [];

  return Object.freeze({
    emit(eventName = '', payload = {}) {
      const event = Object.freeze({
        event:     eventName,
        payload:   Object.freeze({ ...payload }),
        timestamp: new Date().toISOString(),
        isReal:    false,
      });
      events.push(event);
      return event;
    },

    getEvents() {
      return Object.freeze([...events]);
    },

    getEventsOfType(eventName = '') {
      return Object.freeze(events.filter(e => e.event === eventName));
    },

    reset() { events.length = 0; },

    isReal: false,
  });
}

export const BACKUP_OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
