// Social Health Adapter — ADV-20 (connects ADV-14, no real publish)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createSocialHealthAdapter(config = {}) {
  const {
    contentPipelineReady  = false,
    brandConsistent       = true,
    approvalState         = 'PENDING',
    channelReady          = false,
    publicationBlocked    = false,
    clientId              = null,
    environment           = 'LOCAL',
  } = config;

  let status, score;
  if (publicationBlocked || !brandConsistent) {
    status = HEALTH_STATUS.BLOCKED;
    score = 0;
  } else if (!contentPipelineReady) {
    status = HEALTH_STATUS.DEGRADED;
    score = 40;
  } else if (approvalState === 'PENDING' || !channelReady) {
    status = HEALTH_STATUS.WARNING;
    score = 70;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = 100;
  }

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.SOCIAL,
    status,
    score,
    source: 'ADV-14',
    clientId,
    environment,
    message: publicationBlocked ? 'Social publication blocked' : `Social: approval ${approvalState}`,
    evidence: !brandConsistent ? ['BRAND_INCONSISTENCY'] : [],
    recommendedAction: publicationBlocked ? 'Review publication block' :
      approvalState === 'PENDING' ? 'Approve content for publication' : null,
  });

  return Object.freeze({
    contentPipelineReady,
    brandConsistent,
    approvalState,
    channelReady,
    publicationBlocked,
    noRealPublish: true,
    status,
    score,
    signal,
    adv14Connected: true,
    isReal: false,
  });
}

export const SOCIAL_HEALTH_ADAPTER_VERSION = '1.0.0';
