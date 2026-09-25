// Health Aggregator — ADV-20 (extends ADV-01)
// Priority: BLOCKED > CRITICAL > DEGRADED/WARNING > UNKNOWN > HEALTHY
// A high average score NEVER hides a critical blocker.

import { HEALTH_STATUS, HEALTH_DIMENSION_PRIORITY } from './healthDimension.js';
import { createHealthSnapshot } from './healthSnapshot.js';

export function createHealthAggregator(config = {}) {
  const {
    clientId = null,
    environment = 'LOCAL',
  } = config;

  const _signals = [];

  function addSignal(signal) {
    _signals.push(signal);
  }

  function addSignals(signals = []) {
    signals.forEach(addSignal);
  }

  function aggregate() {
    if (_signals.length === 0) {
      return createHealthSnapshot({ signals: [], clientId, environment });
    }

    const sorted = [..._signals].sort((a, b) => {
      const pa = HEALTH_DIMENSION_PRIORITY[a.dimension] ?? 9;
      const pb = HEALTH_DIMENSION_PRIORITY[b.dimension] ?? 9;
      return pa - pb;
    });

    const hasBlocked   = _signals.some(s => s.status === HEALTH_STATUS.BLOCKED);
    const hasCritical  = _signals.some(s => s.status === HEALTH_STATUS.CRITICAL);
    const hasUnknown   = _signals.some(s => s.status === HEALTH_STATUS.UNKNOWN);

    const productionReady = !hasBlocked && !hasCritical && !hasUnknown;

    return createHealthSnapshot({
      signals: sorted,
      clientId,
      environment,
      productionReady,
    });
  }

  function reset() {
    _signals.length = 0;
  }

  return Object.freeze({
    clientId,
    environment,
    addSignal,
    addSignals,
    aggregate,
    reset,
    get signalCount() { return _signals.length; },
    adv01Connected: true,
    isReal: false,
  });
}

export function deriveOverallStatus(signals = []) {
  if (signals.some(s => s.status === HEALTH_STATUS.BLOCKED))   return HEALTH_STATUS.BLOCKED;
  if (signals.some(s => s.status === HEALTH_STATUS.CRITICAL))  return HEALTH_STATUS.CRITICAL;
  if (signals.some(s => s.status === HEALTH_STATUS.DEGRADED))  return HEALTH_STATUS.DEGRADED;
  if (signals.some(s => s.status === HEALTH_STATUS.WARNING))   return HEALTH_STATUS.WARNING;
  if (signals.some(s => s.status === HEALTH_STATUS.UNKNOWN))   return HEALTH_STATUS.UNKNOWN;
  if (signals.length === 0) return HEALTH_STATUS.UNKNOWN;
  return HEALTH_STATUS.HEALTHY;
}

export const HEALTH_AGGREGATOR_VERSION = '1.0.0';
