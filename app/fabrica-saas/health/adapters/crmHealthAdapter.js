// CRM Health Adapter — ADV-20 (connects ADV-09, no real data)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createCRMHealthAdapter(config = {}) {
  const {
    pipelineHealth     = 'UNKNOWN',
    staleOpportunities = 0,
    overdueFollowUps   = 0,
    dataQuality        = null,
    stageConsistency   = true,
    clientId           = null,
    environment        = 'LOCAL',
  } = config;

  const hasStale = staleOpportunities > 5;
  const hasOverdue = overdueFollowUps > 3;

  let status, score;
  if (pipelineHealth === 'CRITICAL') {
    status = HEALTH_STATUS.CRITICAL;
    score = 20;
  } else if (hasStale && hasOverdue) {
    status = HEALTH_STATUS.DEGRADED;
    score = 40;
  } else if (hasStale || hasOverdue || pipelineHealth === 'UNKNOWN') {
    status = HEALTH_STATUS.WARNING;
    score = 65;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = dataQuality ?? 90;
  }

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.CRM,
    status,
    score,
    source: 'ADV-09',
    clientId,
    environment,
    message: `CRM pipeline: ${pipelineHealth}`,
    evidence: staleOpportunities > 0 ? [`${staleOpportunities} stale opportunities`] : [],
    recommendedAction: hasOverdue ? 'Process overdue follow-ups' :
      hasStale ? 'Review stale opportunities' : null,
  });

  return Object.freeze({
    pipelineHealth,
    staleOpportunities,
    overdueFollowUps,
    dataQuality,
    stageConsistency,
    status,
    score,
    signal,
    adv09Connected: true,
    noRealData: true,
    isReal: false,
  });
}

export const CRM_HEALTH_ADAPTER_VERSION = '1.0.0';
