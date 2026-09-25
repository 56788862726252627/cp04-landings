// Health Alert Deduplicator — ADV-20

export function createHealthAlertDeduplicator(config = {}) {
  const { windowMs = 15 * 60 * 1000 } = config;

  const _seen = new Map();

  function isDuplicate(alert) {
    const key = alert.dedupKey;
    const lastTs = _seen.get(key);
    if (!lastTs) return false;
    return (Date.now() - lastTs) < windowMs;
  }

  function register(alert) {
    _seen.set(alert.dedupKey, Date.now());
  }

  function deduplicateAlerts(alerts = []) {
    const unique = [];
    for (const alert of alerts) {
      if (!isDuplicate(alert)) {
        unique.push(alert);
        register(alert);
      }
    }
    return Object.freeze({
      unique: Object.freeze(unique),
      deduplicated: alerts.length - unique.length,
      total: alerts.length,
      isReal: false,
    });
  }

  function reset() {
    _seen.clear();
  }

  return Object.freeze({
    windowMs,
    isDuplicate,
    register,
    deduplicateAlerts,
    reset,
    get seenCount() { return _seen.size; },
    isReal: false,
  });
}

export function deduplicateAlerts(alerts = [], windowMs = 15 * 60 * 1000) {
  const dedup = createHealthAlertDeduplicator({ windowMs });
  const result = dedup.deduplicateAlerts(alerts);
  return Object.freeze({ unique: result.unique, deduplicatedCount: result.deduplicated, total: result.total, isReal: false });
}

export const HEALTH_ALERT_DEDUPLICATOR_VERSION = '1.0.0';
