// Backup Human Approval Policy — ADV-18

export const BACKUP_APPROVAL_TRIGGER = Object.freeze({
  REAL_RESTORE:              'REAL_RESTORE',
  BACKUP_DELETION:           'BACKUP_DELETION',
  RETENTION_REDUCTION:       'RETENTION_REDUCTION',
  CROSS_ENVIRONMENT_RESTORE: 'CROSS_ENVIRONMENT_RESTORE',
  SENSITIVE_EXPORT:          'SENSITIVE_EXPORT',
  ENCRYPTION_DOWNGRADE:      'ENCRYPTION_DOWNGRADE',
  LEGAL_HOLD_RELEASE:        'LEGAL_HOLD_RELEASE',
});

const ALWAYS_REQUIRE = new Set([
  'REAL_RESTORE',
  'BACKUP_DELETION',
  'CROSS_ENVIRONMENT_RESTORE',
  'SENSITIVE_EXPORT',
  'ENCRYPTION_DOWNGRADE',
  'LEGAL_HOLD_RELEASE',
]);

export function createBackupHumanApprovalPolicy() {
  return Object.freeze({
    requires(trigger = '') {
      const required = ALWAYS_REQUIRE.has(trigger);
      return Object.freeze({
        trigger,
        required,
        status:  required ? 'REQUIRED' : 'NOT_REQUIRED',
        isReal:  false,
      });
    },

    requestApproval(config = {}) {
      const { trigger, context = {} } = config;
      return Object.freeze({
        trigger,
        context:   Object.freeze({ ...context }),
        status:    'PENDING',
        approvedBy: null,
        isReal:    false,
      });
    },

    isReal: false,
  });
}

export const BACKUP_HUMAN_APPROVAL_VERSION = '1.0.0';
