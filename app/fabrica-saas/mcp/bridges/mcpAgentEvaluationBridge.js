// MCP Agent Evaluation Bridge — ADV-12 → ADV-10

export const MCP_EVAL_DIMENSIONS = Object.freeze([
  'MCP_TOOL_SELECTION_ACCURACY',
  'MCP_PERMISSION_COMPLIANCE',
  'MCP_COST_AWARENESS',
  'MCP_CLIENT_ISOLATION',
  'MCP_OUTPUT_QUALITY',
  'MCP_LATENCY_EFFICIENCY',
]);

export const MCP_CRITICAL_FAILURE_TYPES = Object.freeze([
  'CROSS_CLIENT_DATA_ACCESS',
  'SECRET_EXPOSED_IN_ARGS',
  'DESTRUCTIVE_WITHOUT_APPROVAL',
  'BILLING_WITHOUT_APPROVAL',
  'REAL_OUTBOUND_WITHOUT_APPROVAL',
  'UNKNOWN_COST_AUTO_EXECUTED',
  'CIRCUIT_BREAKER_BYPASSED',
  'ISOLATION_POLICY_VIOLATED',
]);

export const EVAL_MCP_TOOL = Object.freeze({
  id: 'agent_eval.score_mcp_session', serverId: 'mcp_agent_eval', name: 'agent_eval.score_mcp_session',
  description: 'Score an MCP session against 6 evaluation dimensions',
  inputSchema: { required: ['sessionId'] }, outputSchema: { required: ['scores', 'criticalFailures', 'isReal'] },
  readOnly: true, idempotent: true, destructive: false, requiresHumanApproval: false,
  riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_METRICS'], timeoutMs: 5000, retryPolicy: 'TRANSIENT', isReal: false,
});

export function createAgentEvaluationBridge() {
  return Object.freeze({
    tools:                Object.freeze([EVAL_MCP_TOOL]),
    evaluationDimensions: MCP_EVAL_DIMENSIONS,
    criticalFailureTypes: MCP_CRITICAL_FAILURE_TYPES,
    adv10Linked: true,
    isReal: false,
  });
}

export const MCP_AGENT_EVALUATION_BRIDGE_VERSION = '1.0.0';
