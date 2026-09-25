// Observability Integration — ADV-03
// Integración con ADV-01. Nunca loguear contenido sensible.

export const AGENT_EVENT = Object.freeze({
  AGENT_STARTED:        'AGENT_STARTED',
  INTENT_RESOLVED:      'INTENT_RESOLVED',
  STAGE_CHANGED:        'STAGE_CHANGED',
  RESPONSE_PLANNED:     'RESPONSE_PLANNED',
  TOOL_REQUESTED:       'TOOL_REQUESTED',
  ESCALATION_TRIGGERED: 'ESCALATION_TRIGGERED',
  RESPONSE_EVALUATED:   'RESPONSE_EVALUATED',
  MODEL_TIER_RESOLVED:  'MODEL_TIER_RESOLVED',
  FALLBACK_USED:        'FALLBACK_USED',
  AGENT_CLOSED:         'AGENT_CLOSED',
});

const NEVER_LOG_FIELDS = Object.freeze([
  'userMessage', 'rawMessage', 'responseText', 'rawResponse',
  'email', 'phone', 'dni', 'creditCard', 'password', 'token',
]);

/**
 * Build a sanitized observability event for an agent interaction.
 * Never logs sensitive content.
 */
export function buildAgentEvent(eventType, payload = {}) {
  if (!AGENT_EVENT[eventType]) {
    return { valid: false, error: `Unknown event type: ${eventType}` };
  }

  const sanitized = sanitizePayload(payload);

  const event = Object.freeze({
    eventType,
    timestamp:   new Date().toISOString(),
    schema:      'agent-engine-v1',
    payload:     Object.freeze(sanitized),
  });

  return { valid: true, event };
}

/**
 * Build the standard agent interaction log entry.
 * Safe to pass to ADV-01 event bus.
 */
export function logAgentInteraction(params = {}) {
  const {
    agentId,
    agentType,
    vertical,
    conversationStage,
    intent,
    latencyMs,
    modelTier,
    fallbackUsed    = false,
    escalationFired = false,
    toolRequested   = null,
    outcome,
  } = params;

  return buildAgentEvent(AGENT_EVENT.RESPONSE_PLANNED, {
    agentId,
    agentType,
    vertical,
    conversationStage,
    intent,
    latencyMs,
    modelTier,
    fallbackUsed,
    escalationFired,
    toolRequested,
    outcome,
    isReal: false,
  });
}

/**
 * Validate that a payload doesn't contain sensitive fields.
 */
export function validatePayloadSafety(payload = {}) {
  const found = [];
  for (const key of Object.keys(payload)) {
    if (NEVER_LOG_FIELDS.includes(key)) found.push(key);
  }
  return Object.freeze({
    safe:          found.length === 0,
    forbiddenKeys: Object.freeze(found),
  });
}

function sanitizePayload(payload) {
  const out = {};
  for (const [key, value] of Object.entries(payload)) {
    if (NEVER_LOG_FIELDS.includes(key)) continue;
    out[key] = value;
  }
  return out;
}

export const OBSERVABILITY_INTEGRATION_VERSION = '1.0.0';
