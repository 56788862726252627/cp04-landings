// Agent Replacement Policy — ADV-17

export function createAgentReplacementPolicy(config = {}) {
  const { requireCapabilityMatch = true } = config;

  return Object.freeze({
    requireCapabilityMatch,

    findReplacement(failedAgent, registry) {
      if (!failedAgent) {
        return Object.freeze({ found: false, reason: 'NO_FAILED_AGENT', isReal: false });
      }

      const candidates = registry.findByRole(failedAgent.role)
        .filter(a => a.id !== failedAgent.id);

      if (!candidates.length) {
        // Try by capability match
        const byCap = registry.findCapable(failedAgent.capabilities)
          .filter(a => a.id !== failedAgent.id);
        if (!byCap.length) {
          return Object.freeze({ found: false, reason: 'NO_REPLACEMENT_AVAILABLE', isReal: false });
        }
        return Object.freeze({ found: true, replacement: byCap[0], reason: 'CAPABILITY_MATCH', isReal: false });
      }

      return Object.freeze({ found: true, replacement: candidates[0], reason: 'ROLE_MATCH', isReal: false });
    },

    isReal: false,
  });
}

export const AGENT_REPLACEMENT_POLICY_VERSION = '1.0.0';
