// CMP Quality Gate — ADV-19

export const CMP_GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  BLOCKED: 'BLOCKED',
});

export const CMP_GATE_BLOCKED_REASON = Object.freeze({
  NON_ESSENTIAL_DEFAULT_ON:    'NON_ESSENTIAL_ENABLED_BY_DEFAULT',
  UNKNOWN_TRACKER_ACTIVE:      'UNKNOWN_TRACKER_ACTIVE',
  WITHDRAW_UNAVAILABLE:        'WITHDRAWAL_UNAVAILABLE',
  FORCED_ACCEPT:               'FORCED_ACCEPT_ONLY',
  MARKETING_WITHOUT_CONSENT:   'MARKETING_TRACKER_WITHOUT_CONSENT',
});

export function evaluateCMPQualityGate(checks = {}) {
  const blocked = [];
  const warnings = [];

  if (checks.nonEssentialDefaultOn)   blocked.push(CMP_GATE_BLOCKED_REASON.NON_ESSENTIAL_DEFAULT_ON);
  if (checks.unknownTrackerActive)    blocked.push(CMP_GATE_BLOCKED_REASON.UNKNOWN_TRACKER_ACTIVE);
  if (checks.withdrawUnavailable)     blocked.push(CMP_GATE_BLOCKED_REASON.WITHDRAW_UNAVAILABLE);
  if (checks.forcedAccept)            blocked.push(CMP_GATE_BLOCKED_REASON.FORCED_ACCEPT);
  if (checks.marketingWithoutConsent) blocked.push(CMP_GATE_BLOCKED_REASON.MARKETING_WITHOUT_CONSENT);

  if (checks.noCategoriesClassified)  warnings.push('NO_CATEGORIES_CLASSIFIED');
  if (checks.staleConsentPolicy)      warnings.push('STALE_CONSENT_POLICY_VERSION');
  if (checks.noPreferenceCenter)      warnings.push('NO_PREFERENCE_CENTER');

  const status = blocked.length > 0
    ? CMP_GATE_STATUS.BLOCKED
    : warnings.length > 0
      ? CMP_GATE_STATUS.WARNING
      : CMP_GATE_STATUS.PASS;

  return Object.freeze({
    status,
    blocked: Object.freeze([...blocked]),
    warnings: Object.freeze([...warnings]),
    pass: status === CMP_GATE_STATUS.PASS,
    isReal: false,
  });
}

export const CMP_GATE_VERSION = '1.0.0';
