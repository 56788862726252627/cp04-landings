// Test Health Adapter — ADV-20

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createTestHealthAdapter(config = {}) {
  const {
    totalTests     = 0,
    passingTests   = 0,
    failingTests   = 0,
    regressions    = 0,
    staleTests     = 0,
    criticalSuites = [],
    clientId       = null,
    environment    = 'LOCAL',
  } = config;

  const passRate = totalTests > 0 ? (passingTests / totalTests) * 100 : 0;
  const hasCriticalFailure = failingTests > 0 && criticalSuites.some(s => s.failing);
  const hasRegressions = regressions > 0;

  let status, score;
  if (failingTests > 0 && hasCriticalFailure) {
    status = HEALTH_STATUS.CRITICAL;
    score = Math.max(0, Math.round(passRate) - 20);
  } else if (failingTests > 0 || hasRegressions) {
    status = HEALTH_STATUS.WARNING;
    score = Math.round(passRate);
  } else if (staleTests > 0) {
    status = HEALTH_STATUS.DEGRADED;
    score = Math.max(70, Math.round(passRate));
  } else if (totalTests === 0) {
    status = HEALTH_STATUS.UNKNOWN;
    score = 0;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = 100;
  }

  const evidence = [];
  if (failingTests > 0) evidence.push(`${failingTests} tests failing`);
  if (regressions > 0)  evidence.push(`${regressions} regressions`);
  if (staleTests > 0)   evidence.push(`${staleTests} stale tests`);

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.TESTS,
    status,
    score,
    source: 'TEST_SUITE',
    clientId,
    environment,
    message: `${passingTests}/${totalTests} tests passing (${Math.round(passRate)}%)`,
    evidence,
    recommendedAction: failingTests > 0 ? 'Fix failing tests before deployment' : null,
  });

  return Object.freeze({
    totalTests,
    passingTests,
    failingTests,
    passRate: Math.round(passRate * 100) / 100,
    regressions,
    staleTests,
    status,
    score,
    signal,
    isReal: false,
  });
}

export const TEST_HEALTH_ADAPTER_VERSION = '1.0.0';
