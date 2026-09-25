// Media Cost Guard — ADV-13

export const MEDIA_COST_GATE = Object.freeze({
  FREE_SAFE:        'FREE_SAFE',
  ESTIMATED:        'ESTIMATED',
  REQUIRES_APPROVAL:'REQUIRES_APPROVAL',
  BLOCKED:          'BLOCKED',
  UNKNOWN:          'UNKNOWN',
});

export function evaluateMediaCost(costEstimate = {}) {
  if (costEstimate.gate === MEDIA_COST_GATE.UNKNOWN) {
    return Object.freeze({ allowed: false, action: 'BLOCK', reason: 'COST_UNKNOWN', isReal: false });
  }
  if (costEstimate.gate === MEDIA_COST_GATE.BLOCKED) {
    return Object.freeze({ allowed: false, action: 'BLOCK', reason: 'COST_BLOCKED', isReal: false });
  }
  if (costEstimate.gate === MEDIA_COST_GATE.REQUIRES_APPROVAL) {
    if (!costEstimate.approvedByHuman) {
      return Object.freeze({ allowed: false, action: 'REQUIRE_APPROVAL', reason: 'COST_REQUIRES_APPROVAL', isReal: false });
    }
  }
  return Object.freeze({ allowed: true, action: 'ALLOW', isReal: false });
}

export const MEDIA_COST_GUARD_VERSION = '1.0.0';
