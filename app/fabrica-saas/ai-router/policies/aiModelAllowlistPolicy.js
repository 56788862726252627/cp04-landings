// AI Model Allowlist Policy — ADV-16

export function createAIModelAllowlistPolicy(config = {}) {
  const {
    clientId   = null,
    vertical   = null,
    agentId    = null,
    taskTypes  = null,     // null = allow all
    allowedModelIds = [],
    allowedProviders = [],
  } = config;

  const modelSet    = new Set(allowedModelIds);
  const providerSet = new Set(allowedProviders);

  return Object.freeze({
    clientId,
    vertical,
    agentId,
    taskTypes: taskTypes ? Object.freeze([...taskTypes]) : null,

    isModelAllowed(modelId) {
      if (!modelSet.size) return true; // no restriction
      return modelSet.has(modelId);
    },

    isProviderAllowed(providerId) {
      if (!providerSet.size) return true;
      return providerSet.has(providerId);
    },

    isAllowed(modelId, providerId) {
      return this.isModelAllowed(modelId) && this.isProviderAllowed(providerId);
    },
    isReal: false,
  });
}

export const AI_MODEL_ALLOWLIST_POLICY_VERSION = '1.0.0';
