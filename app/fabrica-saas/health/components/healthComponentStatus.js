// Health Component Status — ADV-20

export function createHealthComponentStatus(config = {}) {
  const {
    component,
    status       = 'UNKNOWN',
    score        = null,
    source       = null,
    warnings     = [],
    blocking     = false,
  } = config;

  if (!component) return Object.freeze({ error: 'COMPONENT_REQUIRED', isReal: false });

  return Object.freeze({
    component,
    status,
    score,
    lastCheck: config.lastCheck || new Date().toISOString(),
    source,
    warnings: Object.freeze([...warnings]),
    blocking,
    isReal: false,
  });
}

export const HEALTH_COMPONENT_STATUS_VERSION = '1.0.0';
