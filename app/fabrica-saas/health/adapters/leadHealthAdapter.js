// Lead Health Adapter — ADV-20 (connects ADV-08)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createLeadHealthAdapter(config = {}) {
  const {
    leadQualityScore      = null,
    scoringHealth         = 'UNKNOWN',
    duplicateRate         = 0,
    sourceFresh           = true,
    classificationConfidence = null,
    clientId              = null,
    environment           = 'LOCAL',
  } = config;

  const highDuplicates = duplicateRate > 20;
  const lowConfidence = classificationConfidence !== null && classificationConfidence < 60;

  let status, score;
  if (leadQualityScore === null && scoringHealth === 'UNKNOWN') {
    status = HEALTH_STATUS.UNKNOWN;
    score = 50;
  } else if (highDuplicates || lowConfidence || !sourceFresh) {
    status = HEALTH_STATUS.WARNING;
    score = leadQualityScore ?? 60;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = leadQualityScore ?? 90;
  }

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.LEADS,
    status,
    score,
    source: 'ADV-08',
    clientId,
    environment,
    message: `Lead health ${score} (duplicates: ${duplicateRate}%)`,
    evidence: highDuplicates ? [`${duplicateRate}% duplicate rate`] : [],
    recommendedAction: highDuplicates ? 'Run deduplication' :
      !sourceFresh ? 'Refresh lead sources' : null,
  });

  return Object.freeze({
    leadQualityScore: score,
    duplicateRate,
    sourceFresh,
    classificationConfidence,
    status,
    score,
    signal,
    adv08Connected: true,
    isReal: false,
  });
}

export const LEAD_HEALTH_ADAPTER_VERSION = '1.0.0';
