// MCP Client Profile — ADV-12

export function createMCPClientProfile(config = {}) {
  if (!config.clientId) throw new Error('MCPClientProfile requires clientId');
  return Object.freeze({
    clientId:       config.clientId,
    name:           config.name           ?? config.clientId,
    vertical:       config.vertical       ?? null,
    maxRisk:        config.maxRisk        ?? 'MEDIUM',
    maxCostClass:   config.maxCostClass   ?? 'LOW',
    allowedServers: Object.freeze(config.allowedServers ?? []),
    simulationMode: config.simulationMode ?? true,
    isReal: false,
  });
}

export const MCP_CLIENT_PROFILE_VERSION = '1.0.0';
