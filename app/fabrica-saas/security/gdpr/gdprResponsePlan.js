// GDPR Response Plan — ADV-19 (simulation only)

export const GDPR_RESPONSE_STEP = Object.freeze({
  VERIFICATION:   'VERIFICATION',
  SCOPE:          'SCOPE',
  SEARCH:         'SEARCH',
  EXCEPTIONS:     'EXCEPTIONS',
  HUMAN_REVIEW:   'HUMAN_REVIEW',
  ACTION:         'ACTION',
  AUDIT:          'AUDIT',
  COMPLETION:     'COMPLETION',
});

export const RESPONSE_PLAN_STATUS = Object.freeze({
  DRAFT:     'DRAFT',
  ACTIVE:    'ACTIVE',
  ON_HOLD:   'ON_HOLD',
  SIMULATED: 'SIMULATED_COMPLETE',
  BLOCKED:   'BLOCKED',
});

export function createGDPRResponsePlan(config = {}) {
  const {
    dsarId = null,
    rightType = 'ACCESS',
    identityVerified = false,
    dataScopes = [],
    exceptions = [],
    clientId = null,
  } = config;

  const steps = [
    { step: GDPR_RESPONSE_STEP.VERIFICATION, complete: identityVerified,   required: true },
    { step: GDPR_RESPONSE_STEP.SCOPE,        complete: dataScopes.length > 0, required: true },
    { step: GDPR_RESPONSE_STEP.SEARCH,       complete: false, required: true },
    { step: GDPR_RESPONSE_STEP.EXCEPTIONS,   complete: exceptions.length >= 0, required: false },
    { step: GDPR_RESPONSE_STEP.HUMAN_REVIEW, complete: false, required: true },
    { step: GDPR_RESPONSE_STEP.ACTION,       complete: false, required: true },
    { step: GDPR_RESPONSE_STEP.AUDIT,        complete: false, required: true },
    { step: GDPR_RESPONSE_STEP.COMPLETION,   complete: false, required: true },
  ];

  const incompleteRequired = steps.filter(s => s.required && !s.complete);
  const status = !identityVerified
    ? RESPONSE_PLAN_STATUS.BLOCKED
    : incompleteRequired.length > 1
      ? RESPONSE_PLAN_STATUS.DRAFT
      : RESPONSE_PLAN_STATUS.ACTIVE;

  return Object.freeze({
    dsarId,
    rightType,
    clientId,
    steps: Object.freeze(steps.map(s => Object.freeze(s))),
    exceptions: Object.freeze([...exceptions]),
    status,
    mode: 'SIMULATION',
    legalCertification: false,
    isReal: false,
  });
}

export const GDPR_RESPONSE_PLAN_VERSION = '1.0.0';
