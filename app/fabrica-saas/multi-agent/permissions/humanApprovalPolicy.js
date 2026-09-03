// Multi-Agent Human Approval Policy — ADV-17

export const APPROVAL_TRIGGER = Object.freeze({
  PAYMENT:              'PAYMENT',
  ADS:                  'ADS',
  REAL_OUTREACH:        'REAL_OUTREACH',
  PRODUCTION_DEPLOY:    'PRODUCTION_DEPLOY',
  DESTRUCTIVE_WRITE:    'DESTRUCTIVE_WRITE',
  SENSITIVE_EXPORT:     'SENSITIVE_EXPORT',
  PRIVILEGED_CHANGE:    'PRIVILEGED_CHANGE',
  LEGAL_MEDICAL_CRITICAL: 'LEGAL_MEDICAL_CRITICAL',
  PERMISSION_ESCALATION: 'PERMISSION_ESCALATION',
});

export const APPROVAL_STATUS = Object.freeze({
  NOT_REQUIRED: 'NOT_REQUIRED',
  REQUIRED:     'REQUIRED',
  PENDING:      'PENDING',
  APPROVED:     'APPROVED',
  DENIED:       'DENIED',
});

export function createMultiAgentHumanApprovalPolicy(config = {}) {
  const {
    triggers         = Object.values(APPROVAL_TRIGGER),
    timeoutMs        = 86400000, // 24h
    defaultOnTimeout = 'DENY',
  } = config;

  return Object.freeze({
    triggers:    Object.freeze([...triggers]),
    timeoutMs,
    defaultOnTimeout,

    requires(action = {}) {
      const matched = triggers.filter(t => action.triggers?.includes(t) || action.type === t);
      if (!matched.length) return Object.freeze({ status: APPROVAL_STATUS.NOT_REQUIRED, isReal: false });
      return Object.freeze({
        status:   APPROVAL_STATUS.REQUIRED,
        triggers: Object.freeze(matched),
        isReal:   false,
      });
    },

    // In ADV-17: fixture only — no real approval flow
    requestApproval(action) {
      const r = this.requires(action);
      if (r.status === APPROVAL_STATUS.NOT_REQUIRED) return Object.freeze({ status: APPROVAL_STATUS.NOT_REQUIRED, isReal: false });
      return Object.freeze({ status: APPROVAL_STATUS.PENDING, action: Object.freeze(action), isReal: false });
    },

    isReal: false,
  });
}

export const HUMAN_APPROVAL_POLICY_VERSION = '1.0.0';
