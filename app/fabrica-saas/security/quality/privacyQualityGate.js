// Privacy Quality Gate — ADV-19

export const PRIVACY_GATE_BLOCKED_REASON = Object.freeze({
  CROSS_CLIENT_PII:            'CROSS_CLIENT_PII',
  PURPOSE_VIOLATION:           'PURPOSE_VIOLATION',
  UNNECESSARY_SENSITIVE_DATA:  'UNNECESSARY_SENSITIVE_DATA',
  CONSENT_BYPASS:              'CONSENT_BYPASS',
  MARKETING_TRACKER_NO_CONSENT:'MARKETING_TRACKER_BEFORE_CONSENT',
  DELETION_WITHOUT_VERIFY:     'DELETION_WITHOUT_IDENTITY_VERIFICATION',
  DSAR_WITHOUT_IDENTITY:       'DSAR_WITHOUT_IDENTITY_VERIFICATION',
  RESTRICTED_PROVIDER_ROUTING: 'RESTRICTED_PROVIDER_ROUTING',
});

export const GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  BLOCKED: 'BLOCKED',
});

export function evaluatePrivacyQualityGate(checks = {}) {
  const blocked = [];
  const warnings = [];

  if (checks.crossClientPII)             blocked.push(PRIVACY_GATE_BLOCKED_REASON.CROSS_CLIENT_PII);
  if (checks.purposeViolation)           blocked.push(PRIVACY_GATE_BLOCKED_REASON.PURPOSE_VIOLATION);
  if (checks.unnecessarySensitiveData)   blocked.push(PRIVACY_GATE_BLOCKED_REASON.UNNECESSARY_SENSITIVE_DATA);
  if (checks.consentBypass)             blocked.push(PRIVACY_GATE_BLOCKED_REASON.CONSENT_BYPASS);
  if (checks.marketingTrackerNoConsent) blocked.push(PRIVACY_GATE_BLOCKED_REASON.MARKETING_TRACKER_NO_CONSENT);
  if (checks.deletionWithoutVerify)     blocked.push(PRIVACY_GATE_BLOCKED_REASON.DELETION_WITHOUT_VERIFY);
  if (checks.dsarWithoutIdentity)       blocked.push(PRIVACY_GATE_BLOCKED_REASON.DSAR_WITHOUT_IDENTITY);
  if (checks.restrictedProviderRouting) blocked.push(PRIVACY_GATE_BLOCKED_REASON.RESTRICTED_PROVIDER_ROUTING);

  if (checks.legalBasisUnknown)    warnings.push('LEGAL_BASIS_REQUIRES_REVIEW');
  if (checks.retentionUndefined)   warnings.push('RETENTION_NOT_DEFINED');
  if (checks.processorDPAMissing)  warnings.push('PROCESSOR_DPA_MISSING');

  const status = blocked.length > 0
    ? GATE_STATUS.BLOCKED
    : warnings.length > 0
      ? GATE_STATUS.WARNING
      : GATE_STATUS.PASS;

  return Object.freeze({
    status,
    blocked: Object.freeze([...blocked]),
    warnings: Object.freeze([...warnings]),
    pass: status === GATE_STATUS.PASS,
    isReal: false,
  });
}

export const PRIVACY_GATE_VERSION = '1.0.0';
