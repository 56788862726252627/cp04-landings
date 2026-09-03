// Consent Withdrawal Policy — ADV-19

export function createConsentWithdrawalPolicy(config = {}) {
  const {
    withdrawalAccessible = true,
    purposeSpecific = true,
    auditable = true,
    asEasyAsGrant = true,
    clientId = null,
  } = config;

  const violations = [];
  if (!withdrawalAccessible) violations.push('WITHDRAWAL_NOT_ACCESSIBLE');
  if (!purposeSpecific)      violations.push('WITHDRAWAL_NOT_PURPOSE_SPECIFIC');
  if (!auditable)            violations.push('WITHDRAWAL_NOT_AUDITABLE');
  if (!asEasyAsGrant)        violations.push('WITHDRAWAL_HARDER_THAN_GRANT');

  return Object.freeze({
    clientId,
    withdrawalAccessible,
    purposeSpecific,
    auditable,
    asEasyAsGrant,
    violations: Object.freeze([...violations]),
    compliant: violations.length === 0,
    isReal: false,
  });
}

export function recordWithdrawal(consentId, purpose, actor = 'SUBJECT') {
  return Object.freeze({
    consentId,
    purpose,
    withdrawnBy: actor,
    withdrawnAt: new Date().toISOString(),
    effectiveImmediately: true,
    audited: true,
    isReal: false,
  });
}

export const WITHDRAWAL_POLICY_VERSION = '1.0.0';
