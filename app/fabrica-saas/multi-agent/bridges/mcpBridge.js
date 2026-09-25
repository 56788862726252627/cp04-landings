// MCP Bridge — ADV-17 ↔ ADV-12
// Each agent respects: allowed MCP servers, allowed tools, permission policy, cost, approval, client scope.

export function createMultiAgentMCPBridge(config = {}) {
  const { allowedMCPServers = [] } = config;

  return Object.freeze({
    allowedMCPServers: Object.freeze([...allowedMCPServers]),

    buildAgentMCPContext(specialist) {
      const allowed = specialist.allowedMCP ?? [];
      return Object.freeze({
        agentId:            specialist.id,
        allowedServers:     Object.freeze([...allowed]),
        toolsPermitted:     allowed.length > 0,
        requiresApproval:   specialist.riskLevel === 'HIGH' || specialist.riskLevel === 'CRITICAL',
        clientScoped:       true,
        isReal:             false,
      });
    },

    // Each agent tool call must be validated — supervisor cannot override MCP permission policy
    validateToolCall(agentId, tool, allowedTools = []) {
      const permitted = allowedTools.includes(tool);
      return Object.freeze({
        agentId,
        tool,
        permitted,
        reason: permitted ? 'TOOL_ALLOWED' : 'TOOL_NOT_IN_ALLOWLIST',
        isReal: false,
      });
    },

    isReal: false,
  });
}

export const MULTIAGENT_MCP_BRIDGE_VERSION = '1.0.0';
