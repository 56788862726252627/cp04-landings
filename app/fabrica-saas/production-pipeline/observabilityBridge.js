// Observability Bridge — ADV-04
// Pipeline-level observability events. Connects to ADV-01 event model.

export const PIPELINE_EVENT = Object.freeze({
  PIPELINE_STARTED:       'PIPELINE_STARTED',
  STAGE_STARTED:          'STAGE_STARTED',
  STAGE_PASSED:           'STAGE_PASSED',
  STAGE_FAILED:           'STAGE_FAILED',
  HUMAN_ACTION_REQUIRED:  'HUMAN_ACTION_REQUIRED',
  DEPLOY_STARTED:         'DEPLOY_STARTED',
  DEPLOY_COMPLETED:       'DEPLOY_COMPLETED',
  HEALTH_CHECK:           'HEALTH_CHECK',
  ROLLBACK:               'ROLLBACK',
  PIPELINE_COMPLETED:     'PIPELINE_COMPLETED',
});

const NEVER_LOG_FIELDS = Object.freeze([
  'secret', 'password', 'token', 'key', 'credential', 'apiKey',
  'privateKey', 'accessToken', 'refreshToken',
]);

function sanitize(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([k]) =>
      !NEVER_LOG_FIELDS.some(f => k.toLowerCase().includes(f))
    )
  );
}

/**
 * Build a pipeline observability event.
 * Never logs sensitive fields.
 */
export function buildPipelineEvent(eventType, payload = {}, correlationId = null) {
  if (!Object.values(PIPELINE_EVENT).includes(eventType)) {
    return { valid: false, error: `Unknown pipeline event: ${eventType}` };
  }

  return Object.freeze({
    valid:         true,
    eventType,
    correlationId: correlationId ?? `CORR-PIPE-${Date.now()}`,
    timestamp:     new Date().toISOString(),
    payload:       Object.freeze(sanitize(payload)),
    source:        'PRODUCTION_PIPELINE',
    version:       '1.0.0',
    isReal:        false,
  });
}

/**
 * Create a pipeline observability logger.
 * Accumulates events in memory — no side effects.
 */
export function createPipelineLogger(correlationId = null) {
  const events = [];
  const corrId = correlationId ?? `CORR-PIPE-${Date.now()}`;

  return {
    log(eventType, payload = {}) {
      const event = buildPipelineEvent(eventType, payload, corrId);
      if (event.valid) events.push(event);
      return event;
    },

    getEvents()      { return [...events]; },
    getCorrelationId() { return corrId; },
    count()          { return events.length; },

    summary() {
      return Object.freeze({
        correlationId: corrId,
        eventCount:    events.length,
        eventTypes:    events.map(e => e.eventType),
        firstAt:       events[0]?.timestamp ?? null,
        lastAt:        events[events.length - 1]?.timestamp ?? null,
      });
    },
  };
}

export const OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
