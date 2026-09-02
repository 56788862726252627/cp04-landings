// MCP Resource Freshness Policy — ADV-12

export const FRESHNESS_STATUS = Object.freeze({
  FRESH:    'FRESH',
  STALE:    'STALE',
  EXPIRED:  'EXPIRED',
  UNKNOWN:  'UNKNOWN',
});

export function evaluateFreshness(resource, lastFetchedAt) {
  if (!lastFetchedAt) return Object.freeze({ status: FRESHNESS_STATUS.UNKNOWN, isReal: false });
  const ageMs  = Date.now() - lastFetchedAt;
  const ttlMs  = resource.freshnessTtlMs ?? 30000;

  let status;
  if (ageMs < ttlMs)          status = FRESHNESS_STATUS.FRESH;
  else if (ageMs < ttlMs * 3) status = FRESHNESS_STATUS.STALE;
  else                         status = FRESHNESS_STATUS.EXPIRED;

  return Object.freeze({ status, ageMs, ttlMs, isReal: false });
}

export const MCP_RESOURCE_FRESHNESS_POLICY_VERSION = '1.0.0';
