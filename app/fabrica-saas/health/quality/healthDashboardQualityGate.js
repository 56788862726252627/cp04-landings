// Health Dashboard Quality Gate — ADV-20 (blocks on integrity violations)

export const QUALITY_GATE_BLOCK_REASON = Object.freeze({
  CRITICAL_SIGNAL_HIDDEN:          'CRITICAL_SIGNAL_HIDDEN',
  CROSS_CLIENT_LEAKAGE:            'CROSS_CLIENT_LEAKAGE',
  STALE_SHOWN_AS_HEALTHY:          'STALE_SHOWN_AS_HEALTHY',
  UNKNOWN_CRITICAL_SHOWN_AS_HEALTHY: 'UNKNOWN_CRITICAL_SHOWN_AS_HEALTHY',
  WRONG_PRODUCTION_READINESS:      'WRONG_PRODUCTION_READINESS',
  SECRET_LEAKAGE:                  'SECRET_LEAKAGE',
  WRONG_DEPENDENCY_PROPAGATION:    'WRONG_DEPENDENCY_PROPAGATION',
});

export function runHealthDashboardQualityGate(params = {}) {
  const {
    hasCriticalSignals    = false,
    criticalInDashboard   = false,
    crossClientLeakage    = false,
    staleShownAsHealthy   = false,
    unknownCriticalAsHealthy = false,
    productionReadyWhenBlocked = false,
    secretsExposed        = false,
    dependencyPropagationWrong = false,
  } = params;

  const blocks = [];

  if (hasCriticalSignals && !criticalInDashboard) blocks.push(QUALITY_GATE_BLOCK_REASON.CRITICAL_SIGNAL_HIDDEN);
  if (crossClientLeakage)            blocks.push(QUALITY_GATE_BLOCK_REASON.CROSS_CLIENT_LEAKAGE);
  if (staleShownAsHealthy)           blocks.push(QUALITY_GATE_BLOCK_REASON.STALE_SHOWN_AS_HEALTHY);
  if (unknownCriticalAsHealthy)      blocks.push(QUALITY_GATE_BLOCK_REASON.UNKNOWN_CRITICAL_SHOWN_AS_HEALTHY);
  if (productionReadyWhenBlocked)    blocks.push(QUALITY_GATE_BLOCK_REASON.WRONG_PRODUCTION_READINESS);
  if (secretsExposed)                blocks.push(QUALITY_GATE_BLOCK_REASON.SECRET_LEAKAGE);
  if (dependencyPropagationWrong)    blocks.push(QUALITY_GATE_BLOCK_REASON.WRONG_DEPENDENCY_PROPAGATION);

  return Object.freeze({
    passed: blocks.length === 0,
    blocks: Object.freeze(blocks),
    isReal: false,
  });
}

export const HEALTH_DASHBOARD_QUALITY_GATE_VERSION = '1.0.0';
