// MCP AI Router Bridge — ADV-12

export const AI_ROUTER_MCP_TOOL = Object.freeze({
  id: 'ai_router.route', serverId: 'mcp_ai_router', name: 'ai_router.route',
  description: 'Route a prompt to the appropriate AI model/provider',
  inputSchema:  { required: ['prompt', 'context'] },
  outputSchema: { required: ['model', 'response', 'isReal'] },
  readOnly: true, idempotent: false, destructive: false, requiresHumanApproval: false,
  riskLevel: 'LOW', costClass: 'LOW', requiredScopes: [], timeoutMs: 30000, retryPolicy: 'TRANSIENT', isReal: false,
});

export function createAiRouterBridge() {
  return Object.freeze({
    tools:    Object.freeze([AI_ROUTER_MCP_TOOL]),
    isReal: false,
  });
}

export const MCP_AI_ROUTER_BRIDGE_VERSION = '1.0.0';
