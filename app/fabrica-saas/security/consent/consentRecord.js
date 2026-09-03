// Consent Record — ADV-19

export const CONSENT_STATUS = Object.freeze({
  GRANTED:   'GRANTED',
  DENIED:    'DENIED',
  WITHDRAWN: 'WITHDRAWN',
  EXPIRED:   'EXPIRED',
  UNKNOWN:   'UNKNOWN',
});

export function createConsentRecord(config = {}) {
  const {
    subjectRef = null,
    purpose = '',
    status = CONSENT_STATUS.UNKNOWN,
    source = 'UNKNOWN',
    policyVersion = '1.0.0',
    evidence = null,
    clientId = null,
  } = config;

  const warnings = [];
  if (!subjectRef)     warnings.push('NO_SUBJECT_REFERENCE');
  if (!purpose)        warnings.push('NO_PURPOSE_DECLARED');
  if (!evidence)       warnings.push('NO_CONSENT_EVIDENCE');
  if (status === CONSENT_STATUS.UNKNOWN) warnings.push('CONSENT_STATUS_UNKNOWN');

  return Object.freeze({
    id: `consent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    clientId,
    subjectRef,
    purpose,
    status,
    source,
    timestamp: new Date().toISOString(),
    policyVersion,
    evidence,
    withdrawnAt: null,
    warnings: Object.freeze([...warnings]),
    active: status === CONSENT_STATUS.GRANTED,
    isReal: false,
  });
}

export function withdrawConsent(record, reason = '') {
  return Object.freeze({
    ...record,
    status: CONSENT_STATUS.WITHDRAWN,
    withdrawnAt: new Date().toISOString(),
    withdrawReason: reason,
    active: false,
    isReal: false,
  });
}

export const CONSENT_RECORD_VERSION = '1.0.0';
