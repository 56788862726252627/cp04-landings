// Observability Health Adapter — ADV-20 (connects ADV-01)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createObservabilityHealthAdapter(config = {}) {
  const {
    errorRatePercent  = 0,
    criticalEvents    = 0,
    incidentActive    = false,
    metricsFresh      = true,
    loggingActive     = true,
    alertState        = 'NONE',
    clientId          = null,
    environment       = 'LOCAL',
  } = config;

  const hasActiveIncident = incidentActive;
  const hasHighError = errorRatePercent > 5;
  const hasCritical = criticalEvents > 0;
  const stale = !metricsFresh || !loggingActive;

  let status, score;
  if (hasActiveIncident && hasCritical) {
    status = HEALTH_STATUS.CRITICAL;
    score = 20;
  } else if (hasActiveIncident || hasHighError) {
    status = HEALTH_STATUS.DEGRADED;
    score = 50;
  } else if (stale || alertState === 'FIRING') {
    status = HEALTH_STATUS.WARNING;
    score = 70;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = 100;
  }

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.OBSERVABILITY,
    status,
    score,
    source: 'ADV-01',
    clientId,
    environment,
    message: hasActiveIncident ? 'Active incident detected' : `Error rate ${errorRatePercent}%`,
    evidence: criticalEvents > 0 ? [`${criticalEvents} critical events`] : [],
    recommendedAction: hasActiveIncident ? 'Investigate active incident' :
      stale ? 'Restore metrics freshness' : null,
  });

  return Object.freeze({
    errorRatePercent,
    criticalEvents,
    incidentActive,
    metricsFresh,
    loggingActive,
    alertState,
    status,
    score,
    signal,
    adv01Connected: true,
    isReal: false,
  });
}

export const OBSERVABILITY_HEALTH_ADAPTER_VERSION = '1.0.0';
