// Pseudonymization Policy — ADV-19

export const PSEUDONYM_STATUS = Object.freeze({
  ACTIVE:   'ACTIVE',
  REVOKED:  'REVOKED',
  EXPIRED:  'EXPIRED',
});

export function createPseudonymizationPolicy(config = {}) {
  const {
    subjectRef = null,
    operationalData = {},
    keyReferenceId = null,
    clientId = null,
    purpose = '',
  } = config;

  const warnings = [];
  if (!keyReferenceId) warnings.push('NO_KEY_REFERENCE_DEFINED');
  if (!subjectRef)     warnings.push('NO_SUBJECT_REFERENCE');

  // Never store real key material — only references
  return Object.freeze({
    clientId,
    pseudonymId: `pseudo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    subjectRef,
    operationalData: Object.freeze({ ...operationalData }),
    keyReferenceId,
    purpose,
    status: PSEUDONYM_STATUS.ACTIVE,
    warnings: Object.freeze([...warnings]),
    keyMaterialStored: false,
    isReal: false,
  });
}

export function revokePseudonym(policy) {
  return Object.freeze({
    ...policy,
    status: PSEUDONYM_STATUS.REVOKED,
    revokedAt: new Date().toISOString(),
    isReal: false,
  });
}

export const PSEUDONYMIZATION_VERSION = '1.0.0';
