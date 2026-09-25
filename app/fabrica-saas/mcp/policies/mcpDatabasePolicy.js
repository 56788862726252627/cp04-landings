// MCP Database Policy — ADV-12

export const DB_OPERATION = Object.freeze({
  SELECT: 'SELECT',
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  DROP:   'DROP',
  EXEC:   'EXEC',
});

const SAFE_OPS    = new Set([DB_OPERATION.SELECT]);
const RISKY_OPS   = new Set([DB_OPERATION.INSERT, DB_OPERATION.UPDATE]);
const BLOCKED_OPS = new Set([DB_OPERATION.DELETE, DB_OPERATION.DROP, DB_OPERATION.EXEC]);

export function checkDatabaseOperation(op, options = {}) {
  if (BLOCKED_OPS.has(op) && !options.allowDestructive) {
    return Object.freeze({ allowed: false, reason: 'DESTRUCTIVE_DB_OP', op, isReal: false });
  }
  if (RISKY_OPS.has(op) && !options.allowWrite) {
    return Object.freeze({ allowed: false, reason: 'WRITE_NOT_PERMITTED', op, isReal: false });
  }
  if (SAFE_OPS.has(op)) {
    return Object.freeze({ allowed: true, op, isReal: false });
  }
  return Object.freeze({ allowed: true, op, requiresApproval: RISKY_OPS.has(op), isReal: false });
}

export const MCP_DATABASE_POLICY_VERSION = '1.0.0';
