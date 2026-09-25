// Health Snapshot — ADV-20

import { HEALTH_STATUS } from './healthDimension.js';

export function createHealthSnapshot(config = {}) {
  const {
    signals = [],
    clientId = null,
    environment = 'LOCAL',
    productionReady = false,
  } = config;

  const timestamp = config.timestamp || new Date().toISOString();

  const criticalIssues = signals.filter(s =>
    s.status === HEALTH_STATUS.CRITICAL || s.status === HEALTH_STATUS.BLOCKED
  ).map(s => Object.freeze({ dimension: s.dimension, status: s.status, message: s.message, recommendedAction: s.recommendedAction }));

  const warnings = signals.filter(s =>
    s.status === HEALTH_STATUS.WARNING || s.status === HEALTH_STATUS.DEGRADED
  ).map(s => Object.freeze({ dimension: s.dimension, status: s.status, message: s.message }));

  const unknowns = signals.filter(s => s.status === HEALTH_STATUS.UNKNOWN)
    .map(s => Object.freeze({ dimension: s.dimension }));

  const dimensionMap = {};
  for (const sig of signals) {
    dimensionMap[sig.dimension] = sig.status;
  }

  const nextActions = signals
    .filter(s => s.recommendedAction)
    .map(s => Object.freeze({ dimension: s.dimension, action: s.recommendedAction, status: s.status }));

  const hasBlocked = criticalIssues.some(i => i.status === HEALTH_STATUS.BLOCKED);
  const hasCritical = criticalIssues.some(i => i.status === HEALTH_STATUS.CRITICAL);

  let overallStatus;
  if (hasBlocked) overallStatus = HEALTH_STATUS.BLOCKED;
  else if (hasCritical) overallStatus = HEALTH_STATUS.CRITICAL;
  else if (unknowns.length > 0) overallStatus = HEALTH_STATUS.DEGRADED;
  else if (warnings.length > 0) overallStatus = HEALTH_STATUS.WARNING;
  else overallStatus = signals.length > 0 ? HEALTH_STATUS.HEALTHY : HEALTH_STATUS.UNKNOWN;

  const healthyCount = signals.filter(s => s.status === HEALTH_STATUS.HEALTHY).length;
  const overallScore = signals.length > 0
    ? Math.round(signals.reduce((sum, s) => sum + (s.score !== null ? s.score : 50), 0) / signals.length)
    : 0;

  return Object.freeze({
    timestamp,
    overallStatus,
    overallScore,
    dimensions: Object.freeze(dimensionMap),
    criticalIssues: Object.freeze(criticalIssues),
    warnings: Object.freeze(warnings),
    unknowns: Object.freeze(unknowns),
    productionReady: productionReady && !hasBlocked && !hasCritical,
    nextActions: Object.freeze(nextActions),
    signalCount: signals.length,
    healthyCount,
    clientId,
    environment,
    isReal: false,
  });
}

export const HEALTH_SNAPSHOT_VERSION = '1.0.0';
