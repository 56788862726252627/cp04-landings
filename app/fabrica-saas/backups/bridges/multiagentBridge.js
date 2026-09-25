// Backup Multi-Agent Bridge — ADV-18 → ADV-17
// Agents can inspect health, prepare plans, evaluate risk.
// Agents CANNOT execute restore, delete backup, or change retention without human approval.

export const AGENT_BACKUP_PERMISSION = Object.freeze({
  INSPECT_HEALTH:       'INSPECT_HEALTH',
  PREPARE_RESTORE_PLAN: 'PREPARE_RESTORE_PLAN',
  EVALUATE_RISK:        'EVALUATE_RISK',
  EXECUTE_RESTORE:      'EXECUTE_RESTORE',         // requires human
  DELETE_BACKUP:        'DELETE_BACKUP',            // requires human
  CHANGE_RETENTION:     'CHANGE_RETENTION',         // requires human
});

const AGENT_ALLOWED = new Set([
  'INSPECT_HEALTH',
  'PREPARE_RESTORE_PLAN',
  'EVALUATE_RISK',
]);

export function createBackupMultiagentBridge() {
  return Object.freeze({
    authorize(agentId = '', operation = '', config = {}) {
      const { humanApproved = false } = config;

      if (AGENT_ALLOWED.has(operation)) {
        return Object.freeze({
          agentId,
          operation,
          allowed:       true,
          requiresHuman: false,
          reason:        null,
          isReal:        false,
        });
      }

      return Object.freeze({
        agentId,
        operation,
        allowed:       humanApproved,
        requiresHuman: true,
        reason:        humanApproved ? null : 'HUMAN_APPROVAL_REQUIRED_FOR_DESTRUCTIVE_OPERATION',
        isReal:        false,
      });
    },

    isReal: false,
  });
}

export const BACKUP_MULTIAGENT_BRIDGE_VERSION = '1.0.0';
