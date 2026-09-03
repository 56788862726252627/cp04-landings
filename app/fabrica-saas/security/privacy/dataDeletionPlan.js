// Data Deletion Plan — ADV-19 (DRY_RUN only)

export const DELETION_TYPE = Object.freeze({
  DELETE:           'DELETE',
  ANONYMIZE:        'ANONYMIZE',
  PSEUDONYMIZE:     'PSEUDONYMIZE',
  RETAIN_LEGAL_HOLD:'RETAIN_LEGAL_HOLD',
  BLOCKED:          'BLOCKED',
});

export const DELETION_STATUS = Object.freeze({
  PLANNED:          'PLANNED',
  DRY_RUN_COMPLETE: 'DRY_RUN_COMPLETE',
  BLOCKED:          'BLOCKED',
  REQUIRES_REVIEW:  'REQUIRES_REVIEW',
});

export function createDataDeletionPlan(config = {}) {
  const {
    dataType = 'UNKNOWN',
    deletionType = DELETION_TYPE.ANONYMIZE,
    scope = [],
    legalHold = false,
    identityVerified = false,
    clientId = null,
    requestedBy = 'UNKNOWN',
  } = config;

  const blockers = [];

  if (legalHold) {
    blockers.push('LEGAL_HOLD_ACTIVE');
  }
  if (!identityVerified && deletionType !== DELETION_TYPE.ANONYMIZE) {
    blockers.push('IDENTITY_NOT_VERIFIED');
  }

  const effectiveDeletionType = blockers.includes('LEGAL_HOLD_ACTIVE')
    ? DELETION_TYPE.RETAIN_LEGAL_HOLD
    : blockers.length > 0
      ? DELETION_TYPE.BLOCKED
      : deletionType;

  const status = blockers.length > 0
    ? DELETION_STATUS.BLOCKED
    : DELETION_STATUS.PLANNED;

  return Object.freeze({
    clientId,
    dataType,
    deletionType: effectiveDeletionType,
    scope: Object.freeze([...scope]),
    legalHold,
    identityVerified,
    requestedBy,
    blockers: Object.freeze([...blockers]),
    status,
    mode: 'DRY_RUN',
    executed: false,
    isReal: false,
  });
}

export function simulateDeletion(plan) {
  if (plan.status === DELETION_STATUS.BLOCKED) {
    return Object.freeze({
      planId: plan.dataType,
      wouldDelete: [],
      wouldAnonymize: [],
      wouldBlock: [...plan.scope],
      blockers: [...plan.blockers],
      mode: 'DRY_RUN',
      executed: false,
      isReal: false,
    });
  }

  const wouldDelete = plan.deletionType === DELETION_TYPE.DELETE ? [...plan.scope] : [];
  const wouldAnonymize = plan.deletionType === DELETION_TYPE.ANONYMIZE ? [...plan.scope] : [];

  return Object.freeze({
    planId: plan.dataType,
    wouldDelete: Object.freeze(wouldDelete),
    wouldAnonymize: Object.freeze(wouldAnonymize),
    wouldBlock: Object.freeze([]),
    blockers: Object.freeze([]),
    mode: 'DRY_RUN',
    executed: false,
    isReal: false,
  });
}

export const DATA_DELETION_VERSION = '1.0.0';
