// Build Health Adapter — ADV-20

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export const BUILD_DURATION_CLASS = Object.freeze({
  FAST:    'FAST',
  NORMAL:  'NORMAL',
  SLOW:    'SLOW',
  TIMEOUT: 'TIMEOUT',
});

export function createBuildHealthAdapter(config = {}) {
  const {
    buildSuccess   = false,
    durationMs     = null,
    warnings       = [],
    artifactValid  = true,
    bundleRisk     = false,
    clientId       = null,
    environment    = 'LOCAL',
  } = config;

  let durationClass = BUILD_DURATION_CLASS.NORMAL;
  if (durationMs !== null) {
    if (durationMs < 5000)         durationClass = BUILD_DURATION_CLASS.FAST;
    else if (durationMs < 30000)   durationClass = BUILD_DURATION_CLASS.NORMAL;
    else if (durationMs < 120000)  durationClass = BUILD_DURATION_CLASS.SLOW;
    else                           durationClass = BUILD_DURATION_CLASS.TIMEOUT;
  }

  let status, score;
  if (!buildSuccess) {
    status = HEALTH_STATUS.CRITICAL;
    score = 0;
  } else if (!artifactValid || durationClass === BUILD_DURATION_CLASS.TIMEOUT) {
    status = HEALTH_STATUS.DEGRADED;
    score = 40;
  } else if (bundleRisk || warnings.length > 3) {
    status = HEALTH_STATUS.WARNING;
    score = 70;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = 100;
  }

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.BUILD,
    status,
    score,
    source: 'BUILD_SYSTEM',
    clientId,
    environment,
    message: buildSuccess ? `Build OK (${durationClass})` : 'Build failed',
    evidence: warnings,
    recommendedAction: !buildSuccess ? 'Fix build errors' : bundleRisk ? 'Investigate bundle size' : null,
  });

  return Object.freeze({
    buildSuccess,
    durationClass,
    artifactValid,
    bundleRisk,
    warnings: Object.freeze([...warnings]),
    status,
    score,
    signal,
    isReal: false,
  });
}

export const BUILD_HEALTH_ADAPTER_VERSION = '1.0.0';
