// MCP Bridge — ADV-16 ↔ ADV-12
// MCP tool execution and AI model routing are distinct layers.
// MCP tool ≠ AI model.

export function createMCPAIRouterBridge() {
  return Object.freeze({
    // Tool execution context — separate from model selection
    routeThroughMCP(toolId, routingProfile = {}) {
      return Object.freeze({
        toolId,
        routingProfile: Object.freeze(routingProfile),
        note: 'MCP tool execution is independent of AI model selection',
        isReal: false,
      });
    },

    // When an MCP tool calls AI internally, it gets a routing profile
    buildMCPAIRequestProfile(toolId = 'unknown', overrides = {}) {
      return Object.freeze({
        taskType:    'STRUCTURED_EXTRACTION',
        source:      'MCP',
        toolId,
        qualityTarget: 'STANDARD',
        ...overrides,
        isReal: false,
      });
    },
    isReal: false,
  });
}

export const MCP_AI_ROUTER_BRIDGE_VERSION = '1.0.0';
