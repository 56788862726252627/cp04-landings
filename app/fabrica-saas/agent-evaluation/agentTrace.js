// Agent Trace Model — ADV-10

export const TRACE_STATUS = Object.freeze({
  PENDING:    'PENDING',
  COMPLETED:  'COMPLETED',
  ERROR:      'ERROR',
  REDACTED:   'REDACTED',
});

export function createAgentTrace(fields = {}) {
  return Object.freeze({
    traceId:      fields.traceId ?? `trace-${Date.now()}-fixture`,
    agentType:    fields.agentType ?? 'CHAT',
    vertical:     fields.vertical ?? 'general',
    turnIndex:    fields.turnIndex ?? 0,
    inputTokens:  fields.inputTokens ?? 0,
    outputTokens: fields.outputTokens ?? 0,
    latencyMs:    fields.latencyMs ?? 0,
    status:       fields.status ?? TRACE_STATUS.PENDING,
    redacted:     fields.redacted ?? false,
    tags:         Object.freeze(fields.tags ?? []),
    metadata:     Object.freeze(fields.metadata ?? {}),
    createdAt:    fields.createdAt ?? new Date().toISOString(),
    isReal: false,
  });
}

export const AGENT_TRACE_VERSION = '1.0.0';
