// Data Subject Request (DSAR) — ADV-19

export const DSAR_STATUS = Object.freeze({
  RECEIVED:             'RECEIVED',
  IDENTITY_REQUIRED:    'IDENTITY_REQUIRED',
  IN_REVIEW:            'IN_REVIEW',
  READY:                'READY',
  COMPLETED_SIMULATED:  'COMPLETED_SIMULATED',
  BLOCKED:              'BLOCKED',
});

export const DSAR_DEADLINE_CLASS = Object.freeze({
  STANDARD: 'STANDARD_30_DAYS',
  EXTENDED: 'EXTENDED_60_DAYS',
  URGENT:   'URGENT_72H',
});

export function createDataSubjectRequest(config = {}) {
  const {
    clientId = null,
    subjectReference = null,
    rightType = 'ACCESS',
    receivedAt = new Date().toISOString(),
    dataScopes = [],
    identityVerified = false,
  } = config;

  const warnings = [];
  if (!subjectReference) warnings.push('NO_SUBJECT_REFERENCE');
  if (!identityVerified)  warnings.push('IDENTITY_NOT_VERIFIED');

  const status = !subjectReference
    ? DSAR_STATUS.BLOCKED
    : !identityVerified
      ? DSAR_STATUS.IDENTITY_REQUIRED
      : DSAR_STATUS.RECEIVED;

  return Object.freeze({
    id: `dsar-${Date.now()}`,
    clientId,
    subjectReference,
    rightType,
    receivedAt,
    status,
    verificationState: identityVerified ? 'VERIFIED' : 'PENDING',
    dataScopes: Object.freeze([...dataScopes]),
    actions: Object.freeze([]),
    deadlineClass: DSAR_DEADLINE_CLASS.STANDARD,
    warnings: Object.freeze([...warnings]),
    isReal: false,
  });
}

export function transitionDSAR(request, newStatus, actor = 'SYSTEM') {
  const allowed = {
    [DSAR_STATUS.RECEIVED]:          [DSAR_STATUS.IN_REVIEW, DSAR_STATUS.BLOCKED],
    [DSAR_STATUS.IDENTITY_REQUIRED]: [DSAR_STATUS.IN_REVIEW, DSAR_STATUS.BLOCKED],
    [DSAR_STATUS.IN_REVIEW]:         [DSAR_STATUS.READY, DSAR_STATUS.BLOCKED],
    [DSAR_STATUS.READY]:             [DSAR_STATUS.COMPLETED_SIMULATED],
  };

  const transitions = allowed[request.status] ?? [];
  if (!transitions.includes(newStatus)) {
    return Object.freeze({
      ...request,
      warnings: Object.freeze([...request.warnings, `INVALID_TRANSITION:${request.status}→${newStatus}`]),
      isReal: false,
    });
  }

  return Object.freeze({
    ...request,
    status: newStatus,
    actions: Object.freeze([...request.actions, `${actor}:${newStatus}:${new Date().toISOString()}`]),
    isReal: false,
  });
}

export const DSAR_VERSION = '1.0.0';
