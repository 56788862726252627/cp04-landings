// Metrics Engine — ADV-01 Transversal Observability
// Calculates operational metrics from a set of ObservabilityEvents.

import { SEVERITY, EVENT_STATUS } from './eventModel.js';

/**
 * Calculate standard observability metrics from an array of events.
 */
export function calculateObservabilityMetrics(events = []) {
  if (!Array.isArray(events)) {
    return { valid: false, error: 'events must be an array' };
  }

  const total = events.length;
  if (total === 0) {
    return {
      valid:           true,
      totalEvents:     0,
      requestCount:    0,
      successCount:    0,
      failureCount:    0,
      errorRate:       null,
      criticalCount:   0,
      warningCount:    0,
      averageDuration: null,
      p50Duration:     null,
      p95Duration:     null,
      retryRate:       null,
      recoveryRate:    null,
      humanActionCount: 0,
      disclaimer:      'No events provided. Metrics unavailable.',
    };
  }

  const successStatuses = new Set([EVENT_STATUS.SUCCESS, EVENT_STATUS.RECOVERED]);
  const failureStatuses = new Set([EVENT_STATUS.FAILURE]);

  const successCount    = events.filter(e => successStatuses.has(e.status)).length;
  const failureCount    = events.filter(e => failureStatuses.has(e.status)).length;
  const criticalCount   = events.filter(e => e.severity === SEVERITY.CRITICAL).length;
  const warningCount    = events.filter(e => e.severity === SEVERITY.WARNING).length;
  const errorCount      = events.filter(e => e.severity === SEVERITY.ERROR).length;
  const recoveredCount  = events.filter(e => e.status === EVENT_STATUS.RECOVERED).length;
  const retriedEvents   = events.filter(e => (e.retryCount ?? 0) > 0);
  const humanActionCount = events.filter(e => e.humanActionRequired).length;

  const durations = events
    .map(e => e.durationMs)
    .filter(d => d !== null && d !== undefined && typeof d === 'number' && d >= 0)
    .sort((a, b) => a - b);

  const averageDuration = durations.length > 0
    ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
    : null;

  const p50Duration = percentile(durations, 0.50);
  const p95Duration = percentile(durations, 0.95);

  const errorRate  = total > 0 ? (failureCount + errorCount + criticalCount) / total : null;
  const retryRate  = total > 0 ? retriedEvents.length / total : null;
  const recoveryRate = failureCount > 0 ? recoveredCount / (failureCount + recoveredCount) : null;

  return {
    valid:            true,
    totalEvents:      total,
    requestCount:     total,
    successCount,
    failureCount,
    errorCount,
    criticalCount,
    warningCount,
    recoveredCount,
    errorRate:        errorRate !== null ? parseFloat(errorRate.toFixed(4)) : null,
    errorRatePercent: errorRate !== null ? parseFloat((errorRate * 100).toFixed(2)) : null,
    averageDuration,
    p50Duration,
    p95Duration,
    retryRate:        retryRate !== null ? parseFloat(retryRate.toFixed(4)) : null,
    recoveryRate:     recoveryRate !== null ? parseFloat(recoveryRate.toFixed(4)) : null,
    humanActionCount,
    durationSampleSize: durations.length,
  };
}

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return null;
  const idx = Math.ceil(sortedArr.length * p) - 1;
  return sortedArr[Math.max(0, Math.min(idx, sortedArr.length - 1))];
}

/**
 * Compare two metric snapshots and detect regressions.
 */
export function compareMetrics(before, after) {
  if (!before || !after) return { valid: false, error: 'both before and after required' };

  const errorRateDelta = after.errorRate !== null && before.errorRate !== null
    ? parseFloat((after.errorRate - before.errorRate).toFixed(4))
    : null;

  const latencyDelta = after.p95Duration !== null && before.p95Duration !== null
    ? after.p95Duration - before.p95Duration
    : null;

  const regressions = [];
  if (errorRateDelta !== null && errorRateDelta > 0.05) regressions.push('error_rate_increased');
  if (latencyDelta   !== null && latencyDelta > 500)    regressions.push('p95_latency_increased');
  if ((after.criticalCount ?? 0) > (before.criticalCount ?? 0)) regressions.push('critical_events_increased');

  return {
    valid:          true,
    errorRateDelta,
    latencyDelta,
    regressions,
    improved:       regressions.length === 0 && (errorRateDelta ?? 0) <= 0,
  };
}

export const METRICS_ENGINE_VERSION = '1.0.0';
