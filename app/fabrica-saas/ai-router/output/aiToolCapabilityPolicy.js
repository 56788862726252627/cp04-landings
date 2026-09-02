// AI Tool Capability Policy — ADV-16

export function createAIToolCapabilityPolicy() {
  return Object.freeze({
    isCompatible(model) {
      return model?.tools === true;
    },

    validate(agentToolsRequired, model) {
      if (!agentToolsRequired) return Object.freeze({ valid: true, isReal: false });
      const compatible = model?.tools === true;
      return Object.freeze({
        valid:  compatible,
        reason: compatible ? null : 'MODEL_DOES_NOT_SUPPORT_TOOLS',
        isReal: false,
      });
    },
    isReal: false,
  });
}

export const AI_TOOL_CAPABILITY_POLICY_VERSION = '1.0.0';
