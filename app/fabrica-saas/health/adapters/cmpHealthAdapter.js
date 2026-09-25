// CMP Health Adapter — ADV-20 (connects ADV-19)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createCMPHealthAdapter(config = {}) {
  const {
    cmpReadinessScore        = null,
    nonEssentialDefaultOn    = false,
    unknownTrackerActive     = false,
    forcedAccept             = false,
    withdrawImpossible       = false,
    preferenceCenterMissing  = false,
    clientId                 = null,
    environment              = 'LOCAL',
  } = config;

  const blockers = [];
  if (nonEssentialDefaultOn)  blockers.push('NON_ESSENTIAL_DEFAULT_ON');
  if (unknownTrackerActive)   blockers.push('UNKNOWN_TRACKER_ACTIVE');
  if (forcedAccept)           blockers.push('FORCED_ACCEPT');
  if (withdrawImpossible)     blockers.push('WITHDRAWAL_IMPOSSIBLE');

  const warnings = [];
  if (preferenceCenterMissing) warnings.push('PREFERENCE_CENTER_MISSING');

  const score = cmpReadinessScore !== null ? cmpReadinessScore :
    blockers.length > 0 ? 0 : warnings.length > 0 ? 70 : 100;

  let status;
  if (blockers.length > 0)  status = HEALTH_STATUS.BLOCKED;
  else if (warnings.length > 0) status = HEALTH_STATUS.WARNING;
  else                     status = HEALTH_STATUS.HEALTHY;

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.CMP,
    status,
    score,
    source: 'ADV-19',
    clientId,
    environment,
    message: blockers.length > 0 ? `CMP blocked: ${blockers[0]}` : `CMP score ${score}`,
    evidence: [...blockers, ...warnings],
    recommendedAction: blockers[0] ? `Fix ${blockers[0]}` : null,
  });

  return Object.freeze({
    cmpReadinessScore: score,
    blockers: Object.freeze([...blockers]),
    warnings: Object.freeze([...warnings]),
    status,
    score,
    signal,
    adv19Connected: true,
    isReal: false,
  });
}

export const CMP_HEALTH_ADAPTER_VERSION = '1.0.0';
