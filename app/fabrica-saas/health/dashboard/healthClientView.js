// Health Client View — ADV-20 (hides internals, no secrets/PII/stack traces)

export function createHealthClientView(config = {}) {
  const { snapshot, actions = [], clientId = null } = config;

  if (!snapshot) {
    return Object.freeze({ status: 'UNKNOWN', message: 'No health data', clientId, sensitiveInfoExcluded: true, stackTracesExcluded: true, secretsExcluded: true, isReal: false });
  }

  const statusMessage = {
    HEALTHY:  'All systems operational.',
    WARNING:  'Some services need attention.',
    DEGRADED: 'Service degraded. Our team is aware.',
    CRITICAL: 'Critical issue detected. We are working on it.',
    BLOCKED:  'Service temporarily limited.',
    UNKNOWN:  'Status is being evaluated.',
  };

  const clientActions = actions
    .filter(a => a.priority === 'P0_CRITICAL' || a.priority === 'P1_HIGH')
    .map(a => Object.freeze({ action: a.action, impact: 'Service restoration' }));

  return Object.freeze({
    clientId,
    status: snapshot.overallStatus,
    message: statusMessage[snapshot.overallStatus] ?? 'Status being evaluated.',
    serviceImpact: snapshot.criticalIssues?.length > 0 ? 'HIGH' : snapshot.warnings?.length > 0 ? 'LOW' : 'NONE',
    actions: Object.freeze(clientActions.slice(0, 2)),
    sensitiveInfoExcluded: true,
    stackTracesExcluded: true,
    secretsExcluded: true,
    isReal: false,
  });
}

export const HEALTH_CLIENT_VIEW_VERSION = '1.0.0';
