// Observability Bridge — ADV-20 (connects ADV-01)

export const HEALTH_OBS_EVENT = Object.freeze({
  SNAPSHOT_CREATED:          'healthSnapshotCreated',
  STATUS_CHANGED:            'healthStatusChanged',
  CRITICAL_DETECTED:         'healthCriticalDetected',
  RECOVERED:                 'healthRecovered',
  RISK_PRIORITIZED:          'healthRiskPrioritized',
  ALERT_CREATED:             'healthAlertCreated',
  NEXT_ACTION_GENERATED:     'healthNextActionGenerated',
  PRODUCTION_READINESS_CHANGED: 'productionReadinessChanged',
});

export function createHealthObservabilityBridge(config = {}) {
  const { clientId = null } = config;
  const _log = [];

  function emit(eventType, payload = {}) {
    const validEvents = Object.values(HEALTH_OBS_EVENT);
    if (!validEvents.includes(eventType)) {
      return Object.freeze({ emitted: false, reason: 'UNKNOWN_EVENT', isReal: false });
    }
    const entry = Object.freeze({
      eventType,
      timestamp: new Date().toISOString(),
      clientId,
      payload: Object.freeze({ ...payload }),
      isReal: false,
    });
    _log.push(entry);
    return Object.freeze({ emitted: true, entry, isReal: false });
  }

  return Object.freeze({
    clientId,
    emit,
    getLog: () => Object.freeze([..._log]),
    adv01Connected: true,
    isReal: false,
  });
}

export const HEALTH_OBS_BRIDGE_VERSION = '1.0.0';
