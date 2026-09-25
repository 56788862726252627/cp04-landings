// Human Approval Gate — ADV-04
// evaluateHumanApprovalRequirement(): decide what needs human sign-off.

export const APPROVAL_TRIGGER = Object.freeze({
  BILLING:              'BILLING',
  PRODUCTION_DOMAIN:    'PRODUCTION_DOMAIN',
  META_ADS_SPEND:       'META_ADS_SPEND',
  STRIPE_LIVE:          'STRIPE_LIVE',
  REAL_OUTBOUND_COMM:   'REAL_OUTBOUND_COMM',
  DESTRUCTIVE_MIGRATION:'DESTRUCTIVE_MIGRATION',
  MEDICAL_LEGAL_DEPLOY: 'MEDICAL_LEGAL_DEPLOY',
  HIGH_RISK_DATA:       'HIGH_RISK_DATA',
});

export const APPROVAL_STATUS = Object.freeze({
  NOT_REQUIRED: 'NOT_REQUIRED',
  REQUIRED:     'REQUIRED',
  SATISFIED:    'SATISFIED',
});

const TRIGGER_CONDITIONS = Object.freeze([
  { trigger: APPROVAL_TRIGGER.BILLING,              check: p => p.hasBillingAction   === true },
  { trigger: APPROVAL_TRIGGER.PRODUCTION_DOMAIN,   check: p => p.isProductionDomain  === true },
  { trigger: APPROVAL_TRIGGER.META_ADS_SPEND,      check: p => (p.integrations ?? []).some(i => i.toLowerCase() === 'meta') },
  { trigger: APPROVAL_TRIGGER.STRIPE_LIVE,         check: p => (p.integrations ?? []).some(i => i.toLowerCase() === 'stripe') && p.environment === 'PRODUCTION' },
  { trigger: APPROVAL_TRIGGER.REAL_OUTBOUND_COMM,  check: p => p.hasRealOutboundComm === true },
  { trigger: APPROVAL_TRIGGER.DESTRUCTIVE_MIGRATION,check: p => p.hasDestructiveMigration === true },
  { trigger: APPROVAL_TRIGGER.MEDICAL_LEGAL_DEPLOY, check: p => ['psychology', 'fertility', 'legal', 'physio', 'dental'].includes(p.vertical) && p.environment === 'PRODUCTION' },
  { trigger: APPROVAL_TRIGGER.HIGH_RISK_DATA,      check: p => p.hasHealthData === true || p.hasMinors === true },
]);

/**
 * Evaluate whether human approval is required before a deploy.
 * Returns specific triggers so the human knows exactly what to approve.
 */
export function evaluateHumanApprovalRequirement(params = {}) {
  const triggered = TRIGGER_CONDITIONS
    .filter(tc => tc.check(params))
    .map(tc => tc.trigger);

  const required = triggered.length > 0;

  return Object.freeze({
    valid:     true,
    status:    required ? APPROVAL_STATUS.REQUIRED : APPROVAL_STATUS.NOT_REQUIRED,
    required,
    triggers:  triggered,
    message:   required
      ? `Human approval required for: ${triggered.join(', ')}`
      : 'No human approval required.',
    isReal:    false,
  });
}

export const HUMAN_APPROVAL_GATE_VERSION = '1.0.0';
