// Health Signal Freshness Policy — ADV-20
// Stale data cannot produce false health (UNKNOWN on stale, not HEALTHY)

export const FRESHNESS_STATUS = Object.freeze({
  FRESH:   'FRESH',
  AGING:   'AGING',
  STALE:   'STALE',
  UNKNOWN: 'UNKNOWN',
});

const DEFAULT_THRESHOLDS_MS = Object.freeze({
  FRESH:  5 * 60 * 1000,     // 5 min
  AGING:  30 * 60 * 1000,    // 30 min
  STALE:  Infinity,
});

export function createHealthSignalFreshnessPolicy(config = {}) {
  const {
    freshThresholdMs  = DEFAULT_THRESHOLDS_MS.FRESH,
    agingThresholdMs  = DEFAULT_THRESHOLDS_MS.AGING,
    allowStaleReporting = false,
  } = config;

  function evaluate(signal) {
    if (!signal || !signal.timestamp) {
      return Object.freeze({ status: FRESHNESS_STATUS.UNKNOWN, ageMs: null, trustworthy: false, isReal: false });
    }

    const ageMs = Date.now() - new Date(signal.timestamp).getTime();

    let status;
    if (ageMs < freshThresholdMs)       status = FRESHNESS_STATUS.FRESH;
    else if (ageMs < agingThresholdMs)  status = FRESHNESS_STATUS.AGING;
    else                                status = FRESHNESS_STATUS.STALE;

    const trustworthy = status !== FRESHNESS_STATUS.STALE || allowStaleReporting;

    return Object.freeze({ status, ageMs, trustworthy, signalId: signal.id, isReal: false });
  }

  function isTrustworthy(signal) {
    return evaluate(signal).trustworthy;
  }

  return Object.freeze({
    freshThresholdMs,
    agingThresholdMs,
    allowStaleReporting,
    evaluate,
    isTrustworthy,
    isReal: false,
  });
}

export const SIGNAL_FRESHNESS = FRESHNESS_STATUS;

export const HEALTH_SIGNAL_FRESHNESS_VERSION = '1.0.0';
