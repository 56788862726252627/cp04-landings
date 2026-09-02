// AI Provider Health — ADV-16

export const PROVIDER_HEALTH_STATUS = Object.freeze({
  HEALTHY:     'HEALTHY',
  DEGRADED:    'DEGRADED',
  UNAVAILABLE: 'UNAVAILABLE',
  UNKNOWN:     'UNKNOWN',
  DISABLED:    'DISABLED',
});

export function createAIProviderHealth(config = {}) {
  const {
    providerId  = 'unknown',
    status      = PROVIDER_HEALTH_STATUS.UNKNOWN,
    reason      = null,
    latencyMs   = null,
    errorRate   = null,
    checkedAt   = null,
  } = config;

  return Object.freeze({
    providerId,
    status,
    reason,
    latencyMs,
    errorRate,
    checkedAt,
    isReal: false,
  });
}

export function isProviderHealthy(health) {
  return health.status === PROVIDER_HEALTH_STATUS.HEALTHY ||
         health.status === PROVIDER_HEALTH_STATUS.DEGRADED;
}

export function aggregateProviderHealth(healthList = []) {
  if (!healthList.length) return PROVIDER_HEALTH_STATUS.UNKNOWN;
  const statuses = healthList.map(h => h.status);
  if (statuses.every(s => s === PROVIDER_HEALTH_STATUS.HEALTHY)) return PROVIDER_HEALTH_STATUS.HEALTHY;
  if (statuses.some(s  => s === PROVIDER_HEALTH_STATUS.HEALTHY || s === PROVIDER_HEALTH_STATUS.DEGRADED)) return PROVIDER_HEALTH_STATUS.DEGRADED;
  return PROVIDER_HEALTH_STATUS.UNAVAILABLE;
}

export const AI_PROVIDER_HEALTH_VERSION = '1.0.0';
