// MCP Observability Bridge — ADV-12 → ADV-01

export const OBSERVABILITY_EVENT_TYPES = Object.freeze([
  'MCP_TOOL_CALLED',
  'MCP_TOOL_SUCCEEDED',
  'MCP_TOOL_FAILED',
  'MCP_TOOL_BLOCKED',
  'MCP_APPROVAL_REQUESTED',
  'MCP_APPROVAL_GRANTED',
  'MCP_APPROVAL_DENIED',
  'MCP_CIRCUIT_OPEN',
  'MCP_RATE_LIMITED',
  'MCP_COST_BLOCKED',
]);

export const OBSERVABILITY_MCP_TOOLS = Object.freeze([
  Object.freeze({
    id: 'observability.emit_event', serverId: 'mcp_observability', name: 'observability.emit_event',
    description: 'Emit an observability event (read-like write, no external side effect)',
    inputSchema: { required: ['eventType', 'payload'] }, outputSchema: { required: ['emitted', 'isReal'] },
    readOnly: false, idempotent: true, destructive: false, requiresHumanApproval: false,
    riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_METRICS'], timeoutMs: 1000, retryPolicy: 'TRANSIENT', isReal: false,
  }),
  Object.freeze({
    id: 'observability.query_metrics', serverId: 'mcp_observability', name: 'observability.query_metrics',
    description: 'Query observability metrics',
    inputSchema: { required: ['metricName', 'range'] }, outputSchema: { required: ['metrics', 'isReal'] },
    readOnly: true, idempotent: true, destructive: false, requiresHumanApproval: false,
    riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_METRICS'], timeoutMs: 3000, retryPolicy: 'TRANSIENT', isReal: false,
  }),
]);

export function emitMCPEvent(eventType, payload = {}) {
  if (!OBSERVABILITY_EVENT_TYPES.includes(eventType)) {
    throw new Error(`Unknown MCP observability event: ${eventType}`);
  }
  return Object.freeze({ emitted: true, eventType, payload: Object.freeze(payload), timestamp: null, isReal: false });
}

export function createObservabilityBridge() {
  return Object.freeze({ tools: OBSERVABILITY_MCP_TOOLS, eventTypes: OBSERVABILITY_EVENT_TYPES, emit: emitMCPEvent, adv01Linked: true, isReal: false });
}

export const MCP_OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
