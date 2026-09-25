// Facility Fact Evaluator — ADV-10b

export const FACILITY_GROUNDING_STATUS = Object.freeze({
  VERIFIED:   'VERIFIED',
  MISMATCH:   'MISMATCH',
  FABRICATED: 'FABRICATED',
  UNKNOWN:    'UNKNOWN',
});

export function evaluateFacilityFact(claim = {}, facilityFacts = []) {
  const { key, value: claimedValue } = claim;

  const authorizedFact = facilityFacts.find(f => f.key === key && f.verified !== false);

  if (!authorizedFact) {
    return Object.freeze({
      status:     FACILITY_GROUNDING_STATUS.FABRICATED,
      key,
      claimedValue,
      note:       `No authorized facility fact for "${key}" — claim is fabricated`,
      isCritical: true,
      isReal:     false,
    });
  }

  const authorized = authorizedFact.value;

  if (claimedValue === authorized || JSON.stringify(claimedValue) === JSON.stringify(authorized)) {
    return Object.freeze({ status: FACILITY_GROUNDING_STATUS.VERIFIED, key, claimedValue, authorized, isCritical: false, isReal: false });
  }

  return Object.freeze({
    status:     FACILITY_GROUNDING_STATUS.MISMATCH,
    key,
    claimedValue,
    authorized,
    note:       `Agent stated "${claimedValue}" but source says "${authorized}" for "${key}"`,
    isCritical: true,
    isReal:     false,
  });
}

export function evaluateFacilityCount(agentCount, authorizedCount) {
  if (authorizedCount === null || authorizedCount === undefined) {
    return Object.freeze({ status: FACILITY_GROUNDING_STATUS.UNKNOWN, isCritical: false, isReal: false });
  }
  if (agentCount === authorizedCount) {
    return Object.freeze({ status: FACILITY_GROUNDING_STATUS.VERIFIED, agentCount, authorizedCount, isCritical: false, isReal: false });
  }
  return Object.freeze({
    status:     FACILITY_GROUNDING_STATUS.MISMATCH,
    agentCount,
    authorizedCount,
    note:       `Agent stated ${agentCount} but authorized count is ${authorizedCount}`,
    isCritical: true,
    isReal:     false,
  });
}

export const FACILITY_FACT_EVALUATOR_VERSION = '1.0.0';
