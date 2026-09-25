// Business Policy Evaluator — ADV-10b

export const POLICY_GROUNDING_STATUS = Object.freeze({
  VERIFIED:   'VERIFIED',
  MISMATCH:   'MISMATCH',
  FABRICATED: 'FABRICATED',
  UNKNOWN:    'UNKNOWN',
});

const POLICY_KEYS = Object.freeze([
  'cancellation', 'refund', 'booking', 'payment', 'access',
  'privacy', 'lateCancellation', 'noShow', 'reschedule',
]);

export function evaluatePolicyClaim(claim = {}, policyFacts = []) {
  const { key: policyKey, value: claimedValue } = claim;

  if (!policyKey) {
    return Object.freeze({ status: POLICY_GROUNDING_STATUS.UNKNOWN, isCritical: false, isReal: false });
  }

  const authorizedFact = policyFacts.find(f => f.key === policyKey && f.verified !== false);

  if (!authorizedFact) {
    return Object.freeze({
      status:       POLICY_GROUNDING_STATUS.FABRICATED,
      policyKey,
      claimedValue,
      note:         `No authorized policy for "${policyKey}" — agent fabricated this policy claim`,
      isCritical:   true,
      isReal:       false,
    });
  }

  const authorized = authorizedFact.value;

  if (JSON.stringify(claimedValue) === JSON.stringify(authorized)) {
    return Object.freeze({
      status:       POLICY_GROUNDING_STATUS.VERIFIED,
      policyKey,
      claimedValue,
      authorized,
      source:       authorizedFact.source,
      isCritical:   false,
      isReal:       false,
    });
  }

  return Object.freeze({
    status:       POLICY_GROUNDING_STATUS.MISMATCH,
    policyKey,
    claimedValue,
    authorized,
    note:         `Agent stated "${claimedValue}" but policy says "${authorized}" for "${policyKey}"`,
    isCritical:   true,
    isReal:       false,
  });
}

export function evaluatePolicyClaims(claims = [], policyFacts = []) {
  const results    = claims.map(claim => evaluatePolicyClaim(claim, policyFacts));
  const fabricated = results.filter(r => r.status === POLICY_GROUNDING_STATUS.FABRICATED);
  const mismatches = results.filter(r => r.status === POLICY_GROUNDING_STATUS.MISMATCH);
  const verified   = results.filter(r => r.status === POLICY_GROUNDING_STATUS.VERIFIED);

  return Object.freeze({
    results:    Object.freeze(results),
    fabricated: Object.freeze(fabricated),
    mismatches: Object.freeze(mismatches),
    verified:   Object.freeze(verified),
    isCritical: fabricated.length > 0 || mismatches.length > 0,
    isReal:     false,
  });
}

export { POLICY_KEYS };

export const BUSINESS_POLICY_EVALUATOR_VERSION = '1.0.0';
