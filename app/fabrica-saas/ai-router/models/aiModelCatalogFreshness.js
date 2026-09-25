// AI Model Catalog Freshness — ADV-16

export const CATALOG_FRESHNESS = Object.freeze({
  FRESH:   'FRESH',
  AGING:   'AGING',
  STALE:   'STALE',
  UNKNOWN: 'UNKNOWN',
});

const FRESH_TTL_MS  = 7  * 24 * 60 * 60 * 1000;  // 7 days
const AGING_TTL_MS  = 30 * 24 * 60 * 60 * 1000;  // 30 days

export function createAIModelCatalogFreshnessPolicy(config = {}) {
  const {
    lastUpdatedAt = null,
    provider      = 'unknown',
  } = config;

  let status = CATALOG_FRESHNESS.UNKNOWN;
  if (lastUpdatedAt) {
    const age = Date.now() - new Date(lastUpdatedAt).getTime();
    if (age < FRESH_TTL_MS)  status = CATALOG_FRESHNESS.FRESH;
    else if (age < AGING_TTL_MS) status = CATALOG_FRESHNESS.AGING;
    else status = CATALOG_FRESHNESS.STALE;
  }

  return Object.freeze({
    provider,
    lastUpdatedAt,
    status,
    trustCatalog: status === CATALOG_FRESHNESS.FRESH || status === CATALOG_FRESHNESS.AGING,
    isReal: false,
  });
}

export const AI_MODEL_CATALOG_FRESHNESS_VERSION = '1.0.0';
