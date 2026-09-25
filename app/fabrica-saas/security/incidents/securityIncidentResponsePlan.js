// Security Incident Response Plan — ADV-19 (fixture only)

export const RESPONSE_STEP = Object.freeze({
  DETECT:           'DETECT',
  CONTAIN:          'CONTAIN',
  PRESERVE_EVIDENCE:'PRESERVE_EVIDENCE',
  ASSESS_IMPACT:    'ASSESS_IMPACT',
  ESCALATE:         'ESCALATE',
  RECOVER:          'RECOVER',
  REVIEW:           'REVIEW',
});

export function createSecurityIncidentResponsePlan(config = {}) {
  const {
    incidentId = null,
    severity = 'MEDIUM',
    personalDataInvolved = false,
    clientId = null,
  } = config;

  const steps = [
    { step: RESPONSE_STEP.DETECT,            complete: true,  required: true },
    { step: RESPONSE_STEP.CONTAIN,           complete: false, required: true },
    { step: RESPONSE_STEP.PRESERVE_EVIDENCE, complete: false, required: true },
    { step: RESPONSE_STEP.ASSESS_IMPACT,     complete: false, required: true },
    { step: RESPONSE_STEP.ESCALATE,          complete: false, required: severity === 'CRITICAL' || severity === 'HIGH' },
    { step: RESPONSE_STEP.RECOVER,           complete: false, required: true },
    { step: RESPONSE_STEP.REVIEW,            complete: false, required: true },
  ];

  const notes = personalDataInvolved
    ? ['PERSONAL_DATA_BREACH_ASSESSMENT_REQUIRED', 'LEGAL_REVIEW_RECOMMENDED']
    : [];

  return Object.freeze({
    incidentId,
    clientId,
    severity,
    personalDataInvolved,
    steps: Object.freeze(steps.map(s => Object.freeze(s))),
    notes: Object.freeze(notes),
    mode: 'FIXTURE',
    isReal: false,
  });
}

export const INCIDENT_RESPONSE_VERSION = '1.0.0';
