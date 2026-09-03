// Media Health Adapter — ADV-20 (connects ADV-13)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createMediaHealthAdapter(config = {}) {
  const {
    mediaReady        = false,
    consentVerified   = false,
    identityVerified  = false,
    providerReady     = false,
    qualityPassed     = false,
    rightsCostPolicy  = true,
    clientId          = null,
    environment       = 'LOCAL',
  } = config;

  const consentBlocked = !consentVerified;

  let status, score;
  if (consentBlocked || !rightsCostPolicy) {
    status = HEALTH_STATUS.BLOCKED;
    score = 0;
  } else if (!mediaReady || !providerReady) {
    status = HEALTH_STATUS.DEGRADED;
    score = 40;
  } else if (!qualityPassed || !identityVerified) {
    status = HEALTH_STATUS.WARNING;
    score = 70;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = 100;
  }

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.MEDIA,
    status,
    score,
    source: 'ADV-13',
    clientId,
    environment,
    message: consentBlocked ? 'Media blocked: consent not verified' : `Media health ${score}`,
    evidence: consentBlocked ? ['CONSENT_NOT_VERIFIED'] : !qualityPassed ? ['QUALITY_CHECK_FAILED'] : [],
    recommendedAction: consentBlocked ? 'Verify media consent before use' : null,
  });

  return Object.freeze({
    mediaReady,
    consentVerified,
    identityVerified,
    providerReady,
    qualityPassed,
    rightsCostPolicy,
    status,
    score,
    signal,
    adv13Connected: true,
    isReal: false,
  });
}

export const MEDIA_HEALTH_ADAPTER_VERSION = '1.0.0';
