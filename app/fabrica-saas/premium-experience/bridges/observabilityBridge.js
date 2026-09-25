// Observability Bridge — ADV-07 → ADV-01

export const PREMIUM_UX_EVENT = Object.freeze({
  EXPERIENCE_RESOLVED:       'premium.experience.resolved',
  DESIGN_GATE_STARTED:       'premium.design.gate.started',
  DESIGN_ISSUE_DETECTED:     'premium.design.issue.detected',
  RESPONSIVE_FAILURE:        'premium.responsive.failure',
  PREMIUM_SCORE_CALCULATED:  'premium.score.calculated',
  DESIGN_GATE_PASSED:        'premium.design.gate.passed',
});

const NEVER_LOG_FIELDS = Object.freeze(['secret', 'password', 'token', 'key', 'credential', 'apiKey', 'privateKey']);

function sanitizePayload(payload = {}) {
  const result = {};
  for (const [k, v] of Object.entries(payload)) {
    const isSecret = NEVER_LOG_FIELDS.some(f => k.toLowerCase().includes(f));
    result[k] = isSecret ? '[REDACTED]' : v;
  }
  return result;
}

export function emitPremiumUXEvent(type, payload = {}, emitFn = null) {
  if (!Object.values(PREMIUM_UX_EVENT).includes(type)) {
    throw new Error(`Unknown premium UX event type: ${type}`);
  }
  const event = {
    type,
    timestamp:   new Date().toISOString(),
    payload:     sanitizePayload(payload),
    bridge:      'ADV-01',
    isReal:      false,
  };
  if (typeof emitFn === 'function') emitFn(event);
  return Object.freeze(event);
}

export function createPremiumUXLogger(emitFn = null) {
  return Object.freeze({
    experienceResolved:   (p) => emitPremiumUXEvent(PREMIUM_UX_EVENT.EXPERIENCE_RESOLVED, p, emitFn),
    designGateStarted:    (p) => emitPremiumUXEvent(PREMIUM_UX_EVENT.DESIGN_GATE_STARTED, p, emitFn),
    issueDetected:        (p) => emitPremiumUXEvent(PREMIUM_UX_EVENT.DESIGN_ISSUE_DETECTED, p, emitFn),
    responsiveFailure:    (p) => emitPremiumUXEvent(PREMIUM_UX_EVENT.RESPONSIVE_FAILURE, p, emitFn),
    scoreCalculated:      (p) => emitPremiumUXEvent(PREMIUM_UX_EVENT.PREMIUM_SCORE_CALCULATED, p, emitFn),
    gatePassed:           (p) => emitPremiumUXEvent(PREMIUM_UX_EVENT.DESIGN_GATE_PASSED, p, emitFn),
  });
}

export const OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
