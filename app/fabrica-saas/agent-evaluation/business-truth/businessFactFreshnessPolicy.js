// Business Fact Freshness Policy — ADV-10b

export const FRESHNESS_STATUS = Object.freeze({
  FRESH:   'FRESH',
  AGING:   'AGING',
  STALE:   'STALE',
  EXPIRED: 'EXPIRED',
  UNKNOWN: 'UNKNOWN',
});

// Max age in minutes per category before staleness kicks in
export const FRESHNESS_THRESHOLDS_MINUTES = Object.freeze({
  AVAILABILITY:  15,   // real-time sensitive
  CAPACITY:      15,
  STAFF:         60,
  PRICES:        1440, // 1 day
  OPENING_HOURS: 10080,// 1 week
  SERVICES:      10080,
  FACILITIES:    43200,// 30 days
  POLICIES:      43200,
  DEFAULT:       10080,
});

export function getFreshnessStatus(fact = {}, nowMs = Date.now()) {
  if (!fact.lastUpdatedAt) return FRESHNESS_STATUS.UNKNOWN;

  const ageMs    = nowMs - new Date(fact.lastUpdatedAt).getTime();
  const ageMin   = ageMs / 60000;
  const category = fact.category ?? 'DEFAULT';
  const maxMin   = FRESHNESS_THRESHOLDS_MINUTES[category] ?? FRESHNESS_THRESHOLDS_MINUTES.DEFAULT;

  if (ageMin <= maxMin * 0.5)  return FRESHNESS_STATUS.FRESH;
  if (ageMin <= maxMin)        return FRESHNESS_STATUS.AGING;
  if (ageMin <= maxMin * 2)    return FRESHNESS_STATUS.STALE;
  return FRESHNESS_STATUS.EXPIRED;
}

export function createBusinessFactFreshnessPolicy(fields = {}) {
  return Object.freeze({
    thresholds:         Object.freeze({ ...FRESHNESS_THRESHOLDS_MINUTES, ...(fields.thresholds ?? {}) }),
    blockOnExpired:     fields.blockOnExpired ?? true,
    warnOnStale:        fields.warnOnStale ?? true,
    dynamicFactMaxMin:  fields.dynamicFactMaxMin ?? 15,
    isReal: false,
  });
}

export const DEFAULT_FRESHNESS_POLICY = createBusinessFactFreshnessPolicy({});
export const BUSINESS_FACT_FRESHNESS_VERSION = '1.0.0';
