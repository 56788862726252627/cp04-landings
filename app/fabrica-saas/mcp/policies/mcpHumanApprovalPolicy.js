// MCP Human Approval Policy — ADV-12

export const APPROVAL_TRIGGER = Object.freeze({
  BILLING_PAYMENT:       'BILLING_PAYMENT',
  PRODUCTION_DEPLOY:     'PRODUCTION_DEPLOY',
  REAL_OUTBOUND:         'REAL_OUTBOUND',
  DELETE_OPERATION:      'DELETE_OPERATION',
  DESTRUCTIVE_OPERATION: 'DESTRUCTIVE_OPERATION',
  PRIVILEGED_ADMIN:      'PRIVILEGED_ADMIN',
  SENSITIVE_EXPORT:      'SENSITIVE_EXPORT',
  CROSS_CLIENT_ACCESS:   'CROSS_CLIENT_ACCESS',
});

const AUTO_TRIGGER_RULES = [
  { trigger: APPROVAL_TRIGGER.BILLING_PAYMENT,       match: (t) => t.costClass === 'HIGH' || t.costClass === 'UNKNOWN' },
  { trigger: APPROVAL_TRIGGER.REAL_OUTBOUND,         match: (t) => (t.requiredScopes ?? []).some(s => ['SEND_EMAIL','SEND_SMS','SEND_WHATSAPP'].includes(s)) },
  { trigger: APPROVAL_TRIGGER.DELETE_OPERATION,      match: (t) => /delete|destroy|remove|eliminar/i.test(t.name ?? '') },
  { trigger: APPROVAL_TRIGGER.DESTRUCTIVE_OPERATION, match: (t) => t.destructive === true },
  { trigger: APPROVAL_TRIGGER.PRIVILEGED_ADMIN,      match: (t) => (t.requiredScopes ?? []).some(s => ['ADMIN_USERS','ADMIN_CONFIG'].includes(s)) },
];

export function evaluateHumanApproval(tool) {
  const triggeredReasons = [];
  for (const { trigger, match } of AUTO_TRIGGER_RULES) {
    if (match(tool)) triggeredReasons.push(trigger);
  }
  if (tool.requiresHumanApproval) triggeredReasons.push('TOOL_FLAG');

  return Object.freeze({
    required: triggeredReasons.length > 0,
    reasons:  Object.freeze(triggeredReasons),
    isReal: false,
  });
}

export const MCP_HUMAN_APPROVAL_POLICY_VERSION = '1.0.0';
