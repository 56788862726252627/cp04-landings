// MCP Calendar Policy — ADV-12

export const CALENDAR_OP = Object.freeze({
  READ:         'READ',
  CREATE_EVENT: 'CREATE_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  INVITE:       'INVITE',
});

const WRITE_OPS   = new Set([CALENDAR_OP.CREATE_EVENT, CALENDAR_OP.UPDATE_EVENT]);
const RISKY_OPS   = new Set([CALENDAR_OP.DELETE_EVENT, CALENDAR_OP.INVITE]);

export function checkCalendarOperation(op, options = {}) {
  if (op === CALENDAR_OP.READ) {
    return Object.freeze({ allowed: true, op, isReal: false });
  }
  if (RISKY_OPS.has(op) && !options.approvedByHuman) {
    return Object.freeze({ allowed: false, reason: 'CALENDAR_RISKY_OP_REQUIRES_APPROVAL', op, isReal: false });
  }
  if (WRITE_OPS.has(op) && !options.allowWrite) {
    return Object.freeze({ allowed: false, reason: 'CALENDAR_WRITE_NOT_PERMITTED', op, isReal: false });
  }
  return Object.freeze({ allowed: true, op, isReal: false });
}

export const MCP_CALENDAR_POLICY_VERSION = '1.0.0';
