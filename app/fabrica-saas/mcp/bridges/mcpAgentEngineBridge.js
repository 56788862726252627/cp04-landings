// MCP Agent Engine Bridge — ADV-12 → ADV-03

export const AGENT_ENGINE_MCP_TOOLS = Object.freeze([
  Object.freeze({
    id: 'agent_engine.plan', serverId: 'mcp_agent_engine', name: 'agent_engine.plan',
    description: 'Request agent planning for a task',
    inputSchema: { required: ['task'] }, outputSchema: { required: ['plan', 'isReal'] },
    readOnly: true, idempotent: true, destructive: false, requiresHumanApproval: false,
    riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_DATABASE'], timeoutMs: 5000, retryPolicy: 'TRANSIENT', isReal: false,
  }),
  Object.freeze({
    id: 'agent_engine.execute', serverId: 'mcp_agent_engine', name: 'agent_engine.execute',
    description: 'Execute a pre-approved agent plan',
    inputSchema: { required: ['planId', 'approvedByHuman'] }, outputSchema: { required: ['result', 'isReal'] },
    readOnly: false, idempotent: false, destructive: false, requiresHumanApproval: true,
    riskLevel: 'MEDIUM', costClass: 'LOW', requiredScopes: ['EXECUTE_WORKFLOW'], timeoutMs: 30000, retryPolicy: 'NONE', isReal: false,
  }),
]);

export function createAgentEngineBridge() {
  return Object.freeze({
    tools: AGENT_ENGINE_MCP_TOOLS,
    adv03Linked: true,
    isReal: false,
  });
}

export const MCP_AGENT_ENGINE_BRIDGE_VERSION = '1.0.0';
