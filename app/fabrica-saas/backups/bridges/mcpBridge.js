// Backup MCP Bridge — ADV-18 → ADV-12
// Read metadata: allowed. Restore/delete: require human approval.

export const BACKUP_MCP_OPERATION = Object.freeze({
  READ_METADATA:   'READ_METADATA',
  RESTORE_BACKUP:  'RESTORE_BACKUP',
  DELETE_BACKUP:   'DELETE_BACKUP',
  LIST_CATALOG:    'LIST_CATALOG',
  CHECK_INTEGRITY: 'CHECK_INTEGRITY',
});

const READ_ONLY_OPERATIONS = new Set([
  'READ_METADATA',
  'LIST_CATALOG',
  'CHECK_INTEGRITY',
]);

export function createBackupMCPBridge() {
  return Object.freeze({
    authorize(operation = '', config = {}) {
      const { humanApproved = false } = config;

      if (READ_ONLY_OPERATIONS.has(operation)) {
        return Object.freeze({
          allowed:         true,
          requiresHuman:   false,
          operation,
          isReal:          false,
        });
      }

      return Object.freeze({
        allowed:         humanApproved,
        requiresHuman:   true,
        operation,
        reason:          humanApproved ? null : 'HUMAN_APPROVAL_REQUIRED',
        isReal:          false,
      });
    },

    isReal: false,
  });
}

export const BACKUP_MCP_BRIDGE_VERSION = '1.0.0';
