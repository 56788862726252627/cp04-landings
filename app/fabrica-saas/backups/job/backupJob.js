// Backup Job — ADV-18

export const BACKUP_JOB_STATUS = Object.freeze({
  PLANNED:           'PLANNED',
  RUNNING:           'RUNNING',
  COMPLETED:         'COMPLETED',
  FAILED:            'FAILED',
  BLOCKED:           'BLOCKED',
  EXPIRED:           'EXPIRED',
  DELETED_SIMULATED: 'DELETED_SIMULATED',
});

export const BACKUP_SIZE_CLASS = Object.freeze({
  TINY:    'TINY',    // < 1 MB
  SMALL:   'SMALL',   // 1–100 MB
  MEDIUM:  'MEDIUM',  // 100 MB–1 GB
  LARGE:   'LARGE',   // > 1 GB
  UNKNOWN: 'UNKNOWN',
});

let _jobCounter = 1;

export function createBackupJob(config = {}) {
  const {
    clientId    = null,
    businessId  = null,
    scope       = [],
    status      = BACKUP_JOB_STATUS.PLANNED,
    startedAt   = null,
    completedAt = null,
    manifest    = null,
    checksum    = null,
    sizeClass   = BACKUP_SIZE_CLASS.UNKNOWN,
    warnings    = [],
    jobId       = null,
  } = config;

  const id = jobId ?? `backup-job-${Date.now()}-${_jobCounter++}`;

  return Object.freeze({
    id,
    clientId,
    businessId,
    scope:       Object.freeze([...scope]),
    status,
    startedAt,
    completedAt,
    manifest,
    checksum,
    sizeClass,
    warnings:    Object.freeze([...warnings]),
    isCompleted: status === BACKUP_JOB_STATUS.COMPLETED,
    isBlocked:   status === BACKUP_JOB_STATUS.BLOCKED,
    isReal:      false,
  });
}

export const BACKUP_JOB_VERSION = '1.0.0';
