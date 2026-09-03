// AI Router Health Adapter — ADV-20 (connects ADV-16)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createAIRouterHealthAdapter(config = {}) {
  const {
    providersHealthy    = 0,
    providersTotal      = 0,
    fallbackReady       = false,
    privacyBlocked      = false,
    routingQuality      = 'UNKNOWN',
    catalogFresh        = true,
    clientId            = null,
    environment         = 'LOCAL',
  } = config;

  const allDown = providersTotal > 0 && providersHealthy === 0;
  const partialDown = providersTotal > 0 && providersHealthy < providersTotal;
  const noFallback = allDown && !fallbackReady;

  let status, score;
  if (noFallback || (allDown && !fallbackReady)) {
    status = HEALTH_STATUS.CRITICAL;
    score = 10;
  } else if (privacyBlocked) {
    status = HEALTH_STATUS.BLOCKED;
    score = 0;
  } else if (partialDown || !fallbackReady || !catalogFresh) {
    status = HEALTH_STATUS.DEGRADED;
    score = 60;
  } else if (providersTotal === 0 || routingQuality === 'UNKNOWN') {
    status = HEALTH_STATUS.UNKNOWN;
    score = 40;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = 100;
  }

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.AI_ROUTER,
    status,
    score,
    source: 'ADV-16',
    clientId,
    environment,
    message: allDown ? 'All AI providers down' : `${providersHealthy}/${providersTotal} providers healthy`,
    evidence: privacyBlocked ? ['PRIVACY_BLOCK_ACTIVE'] : [],
    recommendedAction: noFallback ? 'Configure fallback provider' :
      allDown ? 'Restore AI provider connectivity' : null,
  });

  return Object.freeze({
    providersHealthy,
    providersTotal,
    fallbackReady,
    privacyBlocked,
    routingQuality,
    catalogFresh,
    status,
    score,
    signal,
    adv16Connected: true,
    isReal: false,
  });
}

export const AI_ROUTER_HEALTH_ADAPTER_VERSION = '1.0.0';
