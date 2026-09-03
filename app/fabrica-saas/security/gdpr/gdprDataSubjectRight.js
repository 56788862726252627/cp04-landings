// GDPR Data Subject Rights — ADV-19 Foundation

export const GDPR_RIGHT = Object.freeze({
  ACCESS:        'ACCESS',
  RECTIFICATION: 'RECTIFICATION',
  ERASURE:       'ERASURE',
  RESTRICTION:   'RESTRICTION',
  PORTABILITY:   'PORTABILITY',
  OBJECTION:     'OBJECTION',
});

export const RIGHT_STATUS = Object.freeze({
  APPLICABLE:    'APPLICABLE',
  NOT_APPLICABLE:'NOT_APPLICABLE',
  RESTRICTED:    'RESTRICTED',
  REQUIRES_REVIEW:'REQUIRES_REVIEW',
});

const RIGHT_DEADLINES_DAYS = Object.freeze({
  ACCESS:        30,
  RECTIFICATION: 30,
  ERASURE:       30,
  RESTRICTION:   30,
  PORTABILITY:   30,
  OBJECTION:     30,
});

export function evaluateRight(rightType, context = {}) {
  const { legalBasis, legalHold = false, technicallyPossible = true } = context;

  let status = RIGHT_STATUS.APPLICABLE;
  const notes = [];

  if (legalHold && rightType === GDPR_RIGHT.ERASURE) {
    status = RIGHT_STATUS.RESTRICTED;
    notes.push('LEGAL_HOLD_PREVENTS_ERASURE');
  }

  if (rightType === GDPR_RIGHT.PORTABILITY && legalBasis !== 'CONSENT' && legalBasis !== 'CONTRACT') {
    status = RIGHT_STATUS.NOT_APPLICABLE;
    notes.push('PORTABILITY_REQUIRES_CONSENT_OR_CONTRACT');
  }

  if (!technicallyPossible) {
    status = RIGHT_STATUS.REQUIRES_REVIEW;
    notes.push('TECHNICAL_IMPLEMENTATION_PENDING');
  }

  return Object.freeze({
    rightType,
    status,
    deadlineDays: RIGHT_DEADLINES_DAYS[rightType] ?? 30,
    notes: Object.freeze([...notes]),
    legalCertification: false,
    isReal: false,
  });
}

export const GDPR_RIGHTS_VERSION = '1.0.0';
