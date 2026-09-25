// Agent Engine Bridge — ADV-16
// Connects ADV-03 Agent Engine with ADV-16 AI Router.
// AgentDefinition requests quality/capability profile — never a concrete model name.

export function createAgentEngineBridge(config = {}) {
  const {
    agentId          = 'unknown',
    aiRoutingProfile = 'BALANCED',
    allowedProviders = null,
    modelAliases     = [],
    qualityTarget    = 'STANDARD',
    budgetPolicy     = null,
  } = config;

  return Object.freeze({
    agentId,
    aiRoutingProfile,
    allowedProviders: allowedProviders ? Object.freeze([...allowedProviders]) : null,
    modelAliases:     Object.freeze([...modelAliases]),
    qualityTarget,
    budgetPolicy,

    buildRequestProfile(taskType = 'SIMPLE_CHAT', overrides = {}) {
      return Object.freeze({
        taskType,
        qualityTarget,
        agentId,
        routingMode: aiRoutingProfile,
        ...overrides,
        isReal: false,
      });
    },
    isReal: false,
  });
}

export const AGENT_ENGINE_BRIDGE_VERSION = '1.0.0';
