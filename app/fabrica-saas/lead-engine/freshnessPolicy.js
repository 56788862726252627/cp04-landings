// Freshness Policy — ADV-08

export const FRESHNESS_STATUS = Object.freeze({
  FRESH:   'FRESH',
  AGING:   'AGING',
  STALE:   'STALE',
  UNKNOWN: 'UNKNOWN',
});

const DEFAULT_THRESHOLDS = Object.freeze({ freshDays: 30, agingDays: 90 });

export function createLeadFreshnessPolicy(thresholds = {}) {
  return Object.freeze({
    freshDays:  thresholds.freshDays  ?? DEFAULT_THRESHOLDS.freshDays,
    agingDays:  thresholds.agingDays  ?? DEFAULT_THRESHOLDS.agingDays,
    stalePenalty: 0.5,
    note: 'Stale leads should not be used as current without re-verification.',
    isReal: false,
  });
}

export function evaluateLeadFreshness(lead = {}, policy = {}) {
  if (!lead.discoveredAt) return Object.freeze({ status: FRESHNESS_STATUS.UNKNOWN, ageDays: null, isReal: false });
  const ageDays = Math.floor((Date.now() - new Date(lead.discoveredAt).getTime()) / 86400000);
  const p = { ...DEFAULT_THRESHOLDS, ...policy };
  const status = ageDays <= p.freshDays ? FRESHNESS_STATUS.FRESH
    : ageDays <= p.agingDays ? FRESHNESS_STATUS.AGING
    : FRESHNESS_STATUS.STALE;
  return Object.freeze({ status, ageDays, isReal: false });
}

export const FRESHNESS_POLICY_VERSION = '1.0.0';
