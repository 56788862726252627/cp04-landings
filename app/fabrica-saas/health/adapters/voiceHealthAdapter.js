// Voice Health Adapter — ADV-20 (connects ADV-11, no real call)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createVoiceHealthAdapter(config = {}) {
  const {
    conversationQuality = null,
    handoffReady        = false,
    businessGrounded    = true,
    safetyPassed        = true,
    telephonyReady      = false,
    clientId            = null,
    environment         = 'LOCAL',
  } = config;

  let status, score;
  if (!safetyPassed) {
    status = HEALTH_STATUS.BLOCKED;
    score = 0;
  } else if (conversationQuality === null) {
    status = HEALTH_STATUS.UNKNOWN;
    score = 50;
  } else if (!businessGrounded || conversationQuality < 60) {
    status = HEALTH_STATUS.DEGRADED;
    score = conversationQuality || 40;
  } else if (!handoffReady || !telephonyReady) {
    status = HEALTH_STATUS.WARNING;
    score = Math.max(60, conversationQuality || 60);
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = conversationQuality || 90;
  }

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.VOICE,
    status,
    score,
    source: 'ADV-11',
    clientId,
    environment,
    message: !safetyPassed ? 'Voice safety violation' : `Voice health ${score}`,
    evidence: !businessGrounded ? ['NOT_BUSINESS_GROUNDED'] : [],
    recommendedAction: !safetyPassed ? 'Fix voice safety policy' :
      !businessGrounded ? 'Ground voice agent to business truth' : null,
  });

  return Object.freeze({
    conversationQuality,
    handoffReady,
    businessGrounded,
    safetyPassed,
    telephonyReady,
    noRealCall: true,
    status,
    score,
    signal,
    adv11Connected: true,
    isReal: false,
  });
}

export const VOICE_HEALTH_ADAPTER_VERSION = '1.0.0';
