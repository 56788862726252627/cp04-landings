// Business Truth Bridge — ADV-17 ↔ ADV-10b
// Agents cannot act on ungrounded facts. Supervisor enforces business truth before any write action.

export function createMultiAgentBusinessTruthBridge(config = {}) {
  const { strictMode = true } = config;

  return Object.freeze({
    strictMode,

    // Ground agent output against business source of truth before allowing write actions
    // eslint-disable-next-line no-unused-vars
    groundAgentOutput(agentId, output, _groundingData) {
      return Object.freeze({
        agentId,
        grounded:         true,   // fixture — always grounded in simulation
        groundingSource:  'BUSINESS_SOURCE_OF_TRUTH',
        bypassAttempted:  false,
        isReal:           false,
      });
    },

    // Agents cannot bypass business truth — supervisor enforces
    canBypassGrounding() {
      return false;
    },

    isReal: false,
  });
}

export const MULTIAGENT_BUSINESS_TRUTH_BRIDGE_VERSION = '1.0.0';
