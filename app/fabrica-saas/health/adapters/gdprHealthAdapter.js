// GDPR Health Adapter — ADV-20 (connects ADV-19)
// GDPR_TECHNICAL_READINESS only — NOT GDPR certification

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createGDPRHealthAdapter(config = {}) {
  const {
    gdprTechnicalReadinessScore = null,
    noDataMapping               = false,
    noRightsFoundation          = false,
    legalBasisUnknown           = false,
    noAuditTrail                = false,
    clientId                    = null,
    environment                 = 'LOCAL',
  } = config;

  const blockers = [];
  if (noDataMapping)        blockers.push('NO_DATA_MAPPING');
  if (noRightsFoundation)   blockers.push('NO_RIGHTS_FOUNDATION');
  if (noAuditTrail)         blockers.push('NO_AUDIT_TRAIL');

  const reviews = [];
  if (legalBasisUnknown) reviews.push('LEGAL_BASIS_REQUIRES_REVIEW');

  const score = gdprTechnicalReadinessScore !== null ? gdprTechnicalReadinessScore :
    blockers.length > 0 ? 20 : reviews.length > 0 ? 70 : 90;

  let status;
  if (blockers.length > 0)  status = HEALTH_STATUS.BLOCKED;
  else if (reviews.length > 0) status = HEALTH_STATUS.WARNING;
  else                     status = HEALTH_STATUS.HEALTHY;

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.GDPR,
    status,
    score,
    source: 'ADV-19',
    clientId,
    environment,
    message: `GDPR Technical Readiness: ${score}% (NOT certification)`,
    evidence: [...blockers, ...reviews],
    recommendedAction: blockers[0] ? `Implement ${blockers[0]}` : null,
  });

  return Object.freeze({
    gdprTechnicalReadinessScore: score,
    legalCertification: false,
    blockers: Object.freeze([...blockers]),
    reviews: Object.freeze([...reviews]),
    status,
    score,
    signal,
    adv19Connected: true,
    isReal: false,
  });
}

export const GDPR_HEALTH_ADAPTER_VERSION = '1.0.0';
