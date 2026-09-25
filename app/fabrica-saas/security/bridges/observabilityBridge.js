// Observability Bridge — ADV-19 (connects ADV-01)

export const SECURITY_EVENT = Object.freeze({
  SECURITY_RISK_DETECTED:       'securityRiskDetected',
  PRIVACY_RISK_DETECTED:        'privacyRiskDetected',
  SECRET_BLOCKED:               'secretBlocked',
  CROSS_CLIENT_BLOCKED:         'crossClientBlocked',
  CONSENT_CHANGED:              'consentChangedFixture',
  DSAR_CREATED:                 'dsarCreatedFixture',
  INCIDENT_DETECTED:            'securityIncidentDetected',
  PRIVILEGE_ESCALATION_BLOCKED: 'privilegeEscalationBlocked',
  TRACKER_BLOCKED:              'trackerBlocked',
  SECURITY_GATE_EVALUATED:      'securityGateEvaluated',
  PRIVACY_GATE_EVALUATED:       'privacyGateEvaluated',
});

export function createSecurityObservabilityBridge(config = {}) {
  const { clientId = null } = config;
  const log = [];

  function emit(eventType, payload = {}) {
    if (!Object.values(SECURITY_EVENT).includes(eventType)) {
      return Object.freeze({ emitted: false, reason: 'UNKNOWN_EVENT_TYPE', isReal: false });
    }
    const entry = Object.freeze({
      eventType,
      clientId,
      timestamp: new Date().toISOString(),
      payload: Object.freeze({ ...payload }),
      isReal: false,
    });
    log.push(entry);
    return Object.freeze({ emitted: true, entry, isReal: false });
  }

  function getLog() {
    return Object.freeze([...log]);
  }

  return Object.freeze({
    clientId,
    emit,
    getLog,
    supportedEvents: Object.freeze(Object.values(SECURITY_EVENT)),
    adv01Connected: true,
    isReal: false,
  });
}

export const SECURITY_OBS_BRIDGE_VERSION = '1.0.0';
