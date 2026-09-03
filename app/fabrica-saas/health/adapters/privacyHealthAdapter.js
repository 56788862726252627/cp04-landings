// Privacy Health Adapter — ADV-20 (connects ADV-19)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createPrivacyHealthAdapter(config = {}) {
  const {
    privacyQualityScore   = null,
    marketingNoConsent    = false,
    dsarUnverified        = false,
    legalBasisUnknown     = false,
    piiOversharing        = false,
    retentionViolation    = false,
    aiPrivacyViolation    = false,
    processorRisk         = false,
    clientId              = null,
    environment           = 'LOCAL',
  } = config;

  const blockers = [];
  if (marketingNoConsent) blockers.push('MARKETING_TRACKER_NO_CONSENT');
  if (dsarUnverified)     blockers.push('DSAR_WITHOUT_IDENTITY');
  if (piiOversharing)     blockers.push('PII_OVERSHARING');

  const warnings = [];
  if (legalBasisUnknown) warnings.push('LEGAL_BASIS_UNKNOWN');
  if (retentionViolation) warnings.push('RETENTION_VIOLATION');
  if (aiPrivacyViolation) warnings.push('AI_PRIVACY_VIOLATION');
  if (processorRisk) warnings.push('PROCESSOR_RISK');

  const score = privacyQualityScore !== null ? privacyQualityScore :
    blockers.length > 0 ? 10 : warnings.length > 0 ? 65 : 100;

  let status;
  if (blockers.length > 0)  status = HEALTH_STATUS.BLOCKED;
  else if (warnings.length > 0) status = HEALTH_STATUS.WARNING;
  else                     status = HEALTH_STATUS.HEALTHY;

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.PRIVACY,
    status,
    score,
    source: 'ADV-19',
    clientId,
    environment,
    message: blockers.length > 0 ? `Privacy blocked: ${blockers[0]}` : `Privacy score ${score}`,
    evidence: [...blockers, ...warnings],
    recommendedAction: blockers[0] ? `Fix ${blockers[0]}` : null,
  });

  return Object.freeze({
    privacyQualityScore: score,
    blockers: Object.freeze([...blockers]),
    warnings: Object.freeze([...warnings]),
    status,
    score,
    signal,
    adv19Connected: true,
    isReal: false,
  });
}

export const PRIVACY_HEALTH_ADAPTER_VERSION = '1.0.0';
