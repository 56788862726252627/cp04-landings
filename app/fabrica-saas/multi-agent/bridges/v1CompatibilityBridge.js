// Agent Engine V1 Compatibility Bridge — ADV-17
// Single-agent mode fallback. V1 agents continue to work unchanged.

export function createV1CompatibilityBridge(config = {}) {
  const {
    v1AgentTypes = ['CHAT', 'SALES', 'SUPPORT', 'BOOKING', 'LEAD', 'VOICE'],
  } = config;

  return Object.freeze({
    v1AgentTypes: Object.freeze([...v1AgentTypes]),

    isV1Compatible(agentType) {
      return v1AgentTypes.includes(agentType);
    },

    routeToV1(agentType, request = {}) {
      if (!this.isV1Compatible(agentType)) {
        return Object.freeze({ routed: false, reason: 'NOT_V1_COMPATIBLE', isReal: false });
      }
      return Object.freeze({
        routed:    true,
        agentType,
        mode:      'SINGLE_AGENT_V1',
        request:   Object.freeze({ ...request }),
        isReal:    false,
      });
    },

    // Fallback: if multiagent fails or adds no value, route to V1
    fallbackToV1(objective, agentType = 'CHAT') {
      return Object.freeze({
        fallback:  true,
        mode:      'SINGLE_AGENT_V1',
        agentType,
        objective,
        reason:    'MULTIAGENT_NOT_REQUIRED_OR_FAILED',
        isReal:    false,
      });
    },

    isReal: false,
  });
}

export const V1_COMPATIBILITY_BRIDGE_VERSION = '1.0.0';
