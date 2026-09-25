// Business Truth Health Adapter — ADV-20 (connects ADV-10b)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createBusinessTruthHealthAdapter(config = {}) {
  const {
    sourceAvailable      = true,
    factConflicts        = 0,
    staleFacts           = 0,
    unknownRequiredFacts = 0,
    availabilityGrounded = true,
    pricingGrounded      = true,
    capacityGrounded     = true,
    clientId             = null,
    environment          = 'LOCAL',
  } = config;

  const criticalUngrounded = !availabilityGrounded || !pricingGrounded;
  const hasConflicts = factConflicts > 0;
  const hasStale = staleFacts > 0;

  let status, score;
  if (!sourceAvailable) {
    status = HEALTH_STATUS.CRITICAL;
    score = 0;
  } else if (criticalUngrounded || unknownRequiredFacts > 3) {
    status = HEALTH_STATUS.DEGRADED;
    score = 30;
  } else if (hasConflicts || hasStale || unknownRequiredFacts > 0) {
    status = HEALTH_STATUS.WARNING;
    score = 65;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = 100;
  }

  const evidence = [];
  if (factConflicts > 0)        evidence.push(`${factConflicts} fact conflicts`);
  if (staleFacts > 0)           evidence.push(`${staleFacts} stale facts`);
  if (unknownRequiredFacts > 0) evidence.push(`${unknownRequiredFacts} unknown required facts`);

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.BUSINESS_TRUTH,
    status,
    score,
    source: 'ADV-10b',
    clientId,
    environment,
    message: !sourceAvailable ? 'Business source of truth unavailable' : `Business truth score ${score}`,
    evidence,
    recommendedAction: !sourceAvailable ? 'Restore business truth source' :
      criticalUngrounded ? 'Ground availability/pricing facts' : null,
  });

  return Object.freeze({
    sourceAvailable,
    factConflicts,
    staleFacts,
    unknownRequiredFacts,
    availabilityGrounded,
    pricingGrounded,
    capacityGrounded,
    status,
    score,
    signal,
    adv10bConnected: true,
    isReal: false,
  });
}

export const BUSINESS_TRUTH_HEALTH_ADAPTER_VERSION = '1.0.0';
