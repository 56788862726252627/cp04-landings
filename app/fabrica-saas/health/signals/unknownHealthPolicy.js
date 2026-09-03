// Unknown Health Policy — ADV-20
// Differentiates NOT_APPLICABLE from UNKNOWN.
// UNKNOWN critical → can block production readiness.

import { HEALTH_STATUS } from '../core/healthDimension.js';

export const UNKNOWN_IMPACT = Object.freeze({
  BLOCKS_PRODUCTION: 'BLOCKS_PRODUCTION',
  WARRANTS_REVIEW:   'WARRANTS_REVIEW',
  INFORMATIONAL:     'INFORMATIONAL',
});

const CRITICAL_UNKNOWN_DIMENSIONS = new Set([
  'SECURITY', 'CLIENT_ISOLATION', 'PRODUCTION_READINESS',
  'BACKUPS', 'RESTORE', 'BUSINESS_TRUTH',
]);

export function createUnknownHealthPolicy(config = {}) {
  const { strictMode = true } = config;

  function evaluate(signal) {
    if (!signal) return Object.freeze({ impact: UNKNOWN_IMPACT.INFORMATIONAL, blocksProduction: false, isReal: false });

    const isUnknown = signal.status === HEALTH_STATUS.UNKNOWN;
    const isNA = signal.status === HEALTH_STATUS.NOT_APPLICABLE;

    if (isNA) {
      return Object.freeze({
        impact: UNKNOWN_IMPACT.INFORMATIONAL,
        blocksProduction: false,
        reason: 'NOT_APPLICABLE_EXCLUDED_FROM_HEALTH',
        isReal: false,
      });
    }

    if (!isUnknown) {
      return Object.freeze({ impact: UNKNOWN_IMPACT.INFORMATIONAL, blocksProduction: false, isReal: false });
    }

    const isCriticalDimension = CRITICAL_UNKNOWN_DIMENSIONS.has(signal.dimension);
    const blocksProduction = strictMode && isCriticalDimension;

    return Object.freeze({
      impact: blocksProduction ? UNKNOWN_IMPACT.BLOCKS_PRODUCTION :
        isCriticalDimension ? UNKNOWN_IMPACT.WARRANTS_REVIEW : UNKNOWN_IMPACT.INFORMATIONAL,
      blocksProduction,
      dimension: signal.dimension,
      reason: blocksProduction ? 'UNKNOWN_CRITICAL_DIMENSION_BLOCKS_PRODUCTION' : 'UNKNOWN_WARRANTS_REVIEW',
      isReal: false,
    });
  }

  function filterProductionBlockers(signals = []) {
    return signals.filter(s => evaluate(s).blocksProduction);
  }

  return Object.freeze({
    strictMode,
    evaluate,
    filterProductionBlockers,
    criticalDimensions: Object.freeze([...CRITICAL_UNKNOWN_DIMENSIONS]),
    isReal: false,
  });
}

export const UNKNOWN_HEALTH_POLICY_VERSION = '1.0.0';
