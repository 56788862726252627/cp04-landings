// Health Risk Model — ADV-20

import { HEALTH_SEVERITY } from '../core/healthDimension.js';

export const RISK_IMPACT = Object.freeze({
  NONE:     'NONE',
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export const RISK_LIKELIHOOD = Object.freeze({
  UNLIKELY:  'UNLIKELY',
  POSSIBLE:  'POSSIBLE',
  LIKELY:    'LIKELY',
  CERTAIN:   'CERTAIN',
  UNKNOWN:   'UNKNOWN',
});

let _riskCounter = 0;

export function createHealthRisk(config = {}) {
  const {
    dimension,
    severity          = HEALTH_SEVERITY.MEDIUM,
    impact            = RISK_IMPACT.MEDIUM,
    likelihood        = RISK_LIKELIHOOD.POSSIBLE,
    status            = 'OPEN',
    source            = 'HEALTH_ENGINE',
    recommendedAction = null,
    productionBlocker = false,
    securityRisk      = false,
    privacyRisk       = false,
  } = config;

  if (!dimension) {
    return Object.freeze({ error: 'DIMENSION_REQUIRED', isReal: false });
  }

  const id = config.id || `risk-${dimension}-${++_riskCounter}`;
  const timestamp = config.timestamp || new Date().toISOString();

  const urgencyScore = _urgencyScore(severity, likelihood, productionBlocker);

  return Object.freeze({
    id,
    dimension,
    severity,
    impact,
    likelihood,
    status,
    source,
    timestamp,
    recommendedAction,
    productionBlocker,
    securityRisk,
    privacyRisk,
    urgencyScore,
    isReal: false,
  });
}

function _urgencyScore(severity, likelihood, productionBlocker) {
  const sv = { INFO: 1, LOW: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const lv = { UNLIKELY: 1, POSSIBLE: 2, LIKELY: 3, CERTAIN: 4, UNKNOWN: 2 };
  const base = (sv[severity] ?? 3) * (lv[likelihood] ?? 2);
  return productionBlocker ? base * 2 : base;
}

export const HEALTH_RISK_VERSION = '1.0.0';
