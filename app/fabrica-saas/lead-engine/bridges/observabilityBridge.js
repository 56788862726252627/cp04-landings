// Observability Bridge — ADV-08 → ADV-01

export const LEAD_ENGINE_EVENT = Object.freeze({
  DISCOVERY_STARTED:  'leadDiscoveryStarted',
  LEAD_IMPORTED:      'leadImported',
  LEAD_NORMALIZED:    'leadNormalized',
  DUPLICATE_DETECTED: 'duplicateDetected',
  LEAD_SCORED:        'leadScored',
  LEAD_PRIORITIZED:   'leadPrioritized',
  LEAD_REJECTED:      'leadRejected',
  PROVIDER_BLOCKED:   'providerBlocked',
  ENGINE_COMPLETED:   'leadEngineCompleted',
});

function sanitize(payload = {}) {
  const safe = { ...payload };
  delete safe.publicEmail;
  delete safe.publicPhone;
  delete safe.privateEmail;
  delete safe.privatePhone;
  return safe;
}

export function emitLeadEvent(type, payload = {}, emitFn = null) {
  const event = Object.freeze({
    type,
    payload:   Object.freeze(sanitize(payload)),
    timestamp: new Date().toISOString(),
    source:    'lead-engine',
    isReal: false,
  });
  if (typeof emitFn === 'function') emitFn(event);
  return event;
}

export function createLeadEngineLogger(emitFn = null) {
  return Object.freeze({
    discoveryStarted:  (p) => emitLeadEvent(LEAD_ENGINE_EVENT.DISCOVERY_STARTED,  p, emitFn),
    leadImported:      (p) => emitLeadEvent(LEAD_ENGINE_EVENT.LEAD_IMPORTED,       p, emitFn),
    leadNormalized:    (p) => emitLeadEvent(LEAD_ENGINE_EVENT.LEAD_NORMALIZED,     p, emitFn),
    duplicateDetected: (p) => emitLeadEvent(LEAD_ENGINE_EVENT.DUPLICATE_DETECTED,  p, emitFn),
    leadScored:        (p) => emitLeadEvent(LEAD_ENGINE_EVENT.LEAD_SCORED,         p, emitFn),
    leadPrioritized:   (p) => emitLeadEvent(LEAD_ENGINE_EVENT.LEAD_PRIORITIZED,    p, emitFn),
    leadRejected:      (p) => emitLeadEvent(LEAD_ENGINE_EVENT.LEAD_REJECTED,       p, emitFn),
    providerBlocked:   (p) => emitLeadEvent(LEAD_ENGINE_EVENT.PROVIDER_BLOCKED,    p, emitFn),
    engineCompleted:   (p) => emitLeadEvent(LEAD_ENGINE_EVENT.ENGINE_COMPLETED,    p, emitFn),
  });
}

export const LEAD_OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
