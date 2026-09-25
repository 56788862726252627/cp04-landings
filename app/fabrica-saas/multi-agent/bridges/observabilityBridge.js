// Multi-Agent Observability Bridge — ADV-17 ↔ ADV-01

export const MULTIAGENT_EVENT = Object.freeze({
  MULTI_AGENT_STARTED:          'MULTI_AGENT_STARTED',
  AGENT_TASK_CREATED:           'AGENT_TASK_CREATED',
  AGENT_SELECTED:               'AGENT_SELECTED',
  TASK_DELEGATED:               'TASK_DELEGATED',
  HANDOFF_STARTED:              'HANDOFF_STARTED',
  HANDOFF_COMPLETED:            'HANDOFF_COMPLETED',
  AGENT_CONFLICT_DETECTED:      'AGENT_CONFLICT_DETECTED',
  HUMAN_APPROVAL_REQUESTED:     'HUMAN_APPROVAL_REQUESTED',
  PARALLEL_EXECUTION_STARTED:   'PARALLEL_EXECUTION_STARTED',
  TASK_COMPLETED:               'TASK_COMPLETED',
  MULTI_AGENT_COMPLETED:        'MULTI_AGENT_COMPLETED',
  MULTI_AGENT_BLOCKED:          'MULTI_AGENT_BLOCKED',
});

const REDACTED_KEYS = new Set(['secret', 'key', 'token', 'password', 'prompt', 'content', 'chainofthought']);

function sanitize(payload = {}) {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(payload).filter(([k]) => !REDACTED_KEYS.has(k.toLowerCase()))
    )
  );
}

export function emitMultiAgentEvent(event, payload = {}) {
  return Object.freeze({
    event,
    payload:   sanitize(payload),
    timestamp: new Date().toISOString(),
    isReal:    false,
  });
}

export function createMultiAgentObservabilityBridge() {
  const events = [];
  return Object.freeze({
    emit(event, payload = {}) {
      const e = emitMultiAgentEvent(event, payload);
      events.push(e);
      return e;
    },
    snapshot() {
      return Object.freeze({ count: events.length, events: Object.freeze([...events]), isReal: false });
    },
    isReal: false,
  });
}

export const MULTIAGENT_OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
