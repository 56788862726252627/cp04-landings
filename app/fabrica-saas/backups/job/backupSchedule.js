// Backup Schedule Foundation — ADV-18

export const SCHEDULE_FREQUENCY = Object.freeze({
  MANUAL:   'MANUAL',
  DAILY:    'DAILY',
  WEEKLY:   'WEEKLY',
  MONTHLY:  'MONTHLY',
  ON_EVENT: 'ON_EVENT',
});

export function createBackupSchedule(config = {}) {
  const {
    frequency  = SCHEDULE_FREQUENCY.MANUAL,
    window     = '02:00-04:00',
    timezone   = 'UTC',
    enabled    = false,
    policy     = null,
    scope      = [],
    label      = '',
  } = config;

  return Object.freeze({
    frequency,
    window,
    timezone,
    enabled,
    policy,
    scope:   Object.freeze([...scope]),
    label,
    isReal:  false,
  });
}

export const BACKUP_SCHEDULE_VERSION = '1.0.0';
