// Health Service Status — ADV-20 (conceptual, no real ping required)

export const SERVICE_TYPE = Object.freeze({
  AI:                  'AI',
  DATABASE:            'DATABASE',
  AUTOMATION:          'AUTOMATION',
  AUTH:                'AUTH',
  STORAGE:             'STORAGE',
  EXTERNAL_INTEGRATION:'EXTERNAL_INTEGRATION',
  DEPLOYMENT:          'DEPLOYMENT',
});

export function createHealthServiceStatus(config = {}) {
  const {
    service,
    serviceType  = SERVICE_TYPE.EXTERNAL_INTEGRATION,
    status       = 'UNKNOWN',
    latencyClass = null,
    available    = null,
    lastCheck    = null,
  } = config;

  if (!service) return Object.freeze({ error: 'SERVICE_REQUIRED', isReal: false });

  return Object.freeze({
    service,
    serviceType,
    status,
    latencyClass,
    available,
    lastCheck: lastCheck || new Date().toISOString(),
    noRealPing: true,
    isReal: false,
  });
}

export const HEALTH_SERVICE_STATUS_VERSION = '1.0.0';
