// Observability Integration — ADV-05
// Emits structured events for terminal efficiency operations (connects ADV-01).

export const EFFICIENCY_EVENT = Object.freeze({
  EFFICIENCY_PLAN_CREATED:    'efficiencyPlanCreated',
  COMMAND_BATCH_STARTED:      'commandBatchStarted',
  COMMAND_BATCH_COMPLETED:    'commandBatchCompleted',
  COMMAND_SKIPPED_CACHED:     'commandSkippedCached',
  CHECKPOINT_RESTORED:        'checkpointRestored',
  HUMAN_INTERRUPTION_REQUIRED:'humanInterruptionRequired',
  RETRY_PERFORMED:            'retryPerformed',
  VALIDATION_OPTIMIZED:       'validationOptimized',
  EFFICIENCY_RUN_COMPLETED:   'efficiencyRunCompleted',
});

const NEVER_LOG = ['secret', 'password', 'token', 'key', 'credential', 'apiKey', 'privateKey'];

function sanitizePayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([k]) => !NEVER_LOG.some(s => k.toLowerCase().includes(s)))
  );
}

export function emitEfficiencyEvent(eventType, payload = {}, correlationId = '') {
  if (!Object.values(EFFICIENCY_EVENT).includes(eventType)) {
    return { valid: false, error: `Unknown event type: ${eventType}` };
  }
  return Object.freeze({
    valid: true,
    eventType,
    payload: sanitizePayload(payload),
    correlationId: correlationId || `CORR-EFF-${Date.now()}`,
    timestamp: new Date().toISOString(),
    SECRETS_NEVER_LOGGED: true,
    isReal: false,
  });
}

export function createEfficiencyLogger(correlationId = '') {
  const events = [];
  const id = correlationId || `CORR-EFF-${Date.now()}`;

  function log(eventType, payload = {}) {
    const e = emitEfficiencyEvent(eventType, payload, id);
    if (e.valid) events.push(e);
    return e;
  }

  function getEvents() { return [...events]; }
  function count()     { return events.length; }
  function summary()   { return { eventCount: events.length, firstAt: events[0]?.timestamp, lastAt: events[events.length - 1]?.timestamp, correlationId: id, isReal: false }; }

  return Object.freeze({ log, getEvents, count, summary, getCorrelationId: () => id });
}

export const OBSERVABILITY_INTEGRATION_VERSION = '1.0.0';
