// Health Trend — ADV-20

export const TREND_STATUS = Object.freeze({
  IMPROVING:           'IMPROVING',
  STABLE:              'STABLE',
  DEGRADING:           'DEGRADING',
  CRITICAL_DEGRADATION:'CRITICAL_DEGRADATION',
  UNKNOWN:             'UNKNOWN',
});

export function computeHealthTrend(snapshots = []) {
  if (snapshots.length < 2) {
    return Object.freeze({ status: TREND_STATUS.UNKNOWN, delta: null, snapshots: snapshots.length, isReal: false });
  }

  const scores = snapshots.map(s => s.overallScore ?? 0);
  const first = scores[0];
  const last = scores[scores.length - 1];
  const delta = last - first;

  const hasCriticalDrop = delta < -30;
  const isImproving = delta > 5;
  const isDegrading = delta < -5;

  let status;
  if (hasCriticalDrop)   status = TREND_STATUS.CRITICAL_DEGRADATION;
  else if (isDegrading)  status = TREND_STATUS.DEGRADING;
  else if (isImproving)  status = TREND_STATUS.IMPROVING;
  else                   status = TREND_STATUS.STABLE;

  const statusProgression = snapshots.map(s => s.overallStatus);
  const worsened = statusProgression.some((s, i) => i > 0 && _rank(s) > _rank(statusProgression[i - 1]));

  return Object.freeze({
    status,
    delta,
    firstScore: first,
    lastScore: last,
    snapshots: snapshots.length,
    worsened,
    isReal: false,
  });
}

function _rank(status) {
  const r = { HEALTHY: 0, WARNING: 1, DEGRADED: 2, CRITICAL: 3, BLOCKED: 4, UNKNOWN: 2 };
  return r[status] ?? 5;
}

export const HEALTH_TREND_VERSION = '1.0.0';
