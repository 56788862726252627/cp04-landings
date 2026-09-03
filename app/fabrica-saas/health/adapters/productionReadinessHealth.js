// Production Readiness Health — ADV-20 (connects ADV-04)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export const PRODUCTION_READINESS_STATUS = Object.freeze({
  READY:                'READY',
  READY_WITH_WARNINGS:  'READY_WITH_WARNINGS',
  NOT_READY:            'NOT_READY',
  BLOCKED:              'BLOCKED',
  UNKNOWN:              'UNKNOWN',
});

export function createProductionReadinessHealth(config = {}) {
  const {
    buildPassed        = false,
    testsPassed        = false,
    lintPassed         = false,
    securityGatePassed = false,
    secretScanPassed   = false,
    clientId           = null,
    environment        = 'LOCAL',
    warnings           = [],
  } = config;

  const blockers = [];
  if (!buildPassed)        blockers.push('BUILD_FAILED');
  if (!testsPassed)        blockers.push('TESTS_FAILED');
  if (!lintPassed)         blockers.push('LINT_FAILED');
  if (!securityGatePassed) blockers.push('SECURITY_GATE_NOT_PASSED');
  if (!secretScanPassed)   blockers.push('SECRET_SCAN_NOT_PASSED');

  let status;
  if (blockers.length > 0)         status = PRODUCTION_READINESS_STATUS.BLOCKED;
  else if (warnings.length > 0)    status = PRODUCTION_READINESS_STATUS.READY_WITH_WARNINGS;
  else                             status = PRODUCTION_READINESS_STATUS.READY;

  const score = blockers.length > 0
    ? Math.max(0, 100 - blockers.length * 20)
    : warnings.length > 0 ? 80 : 100;

  const healthStatus = blockers.length > 0 ? HEALTH_STATUS.BLOCKED :
    warnings.length > 0 ? HEALTH_STATUS.WARNING : HEALTH_STATUS.HEALTHY;

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.PRODUCTION_READINESS,
    status: healthStatus,
    score,
    source: 'ADV-04',
    clientId,
    environment,
    message: blockers.length > 0 ? `Blocked: ${blockers[0]}` : 'Production ready',
    recommendedAction: blockers[0] ? `Fix ${blockers[0]}` : null,
  });

  return Object.freeze({
    status,
    blockers: Object.freeze([...blockers]),
    warnings: Object.freeze([...warnings]),
    score,
    signal,
    adv04Connected: true,
    canDeploy: false,
    isReal: false,
  });
}

export const PRODUCTION_READINESS_HEALTH_VERSION = '1.0.0';
