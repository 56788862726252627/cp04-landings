// Multi-Agent Trace — ADV-17
// Full audit trail for a workflow execution.

export function createMultiAgentTrace(config = {}) {
  const {
    systemId = 'unknown',
    clientId = 'unknown',
  } = config;

  const events = [];

  return Object.freeze({
    systemId,
    clientId,

    record(event = {}) {
      events.push(Object.freeze({ ...event, ts: new Date().toISOString() }));
    },

    build(extras = {}) {
      return Object.freeze({
        systemId,
        clientId,
        taskGraph:       extras.taskGraph       ?? null,
        agents:          Object.freeze(extras.agents ?? []),
        handoffs:        Object.freeze(extras.handoffs ?? []),
        toolCallsCount:  extras.toolCallsCount  ?? 0,
        decisionSummary: extras.decisionSummary ?? null,
        conflicts:       Object.freeze(extras.conflicts ?? []),
        approvals:       Object.freeze(extras.approvals ?? []),
        outcome:         extras.outcome         ?? 'UNKNOWN',
        events:          Object.freeze([...events]),
        chainOfThought:  null,  // NEVER exposed
        isReal:          false,
      });
    },

    eventCount() { return events.length; },

    isReal: false,
  });
}

export const MULTIAGENT_TRACE_VERSION = '1.0.0';
