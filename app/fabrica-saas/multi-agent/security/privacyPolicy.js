// Multi-Agent Privacy Policy — ADV-17

export const DATA_SENSITIVITY = Object.freeze({
  PUBLIC:    'PUBLIC',
  INTERNAL:  'INTERNAL',
  PERSONAL:  'PERSONAL',
  SENSITIVE: 'SENSITIVE',
});

export function createMultiAgentPrivacyPolicy(config = {}) {
  const {
    minimumData           = true,
    blockCrossClient      = true,
    sensitiveOnlyToAuthorized = true,
    redactSecrets         = true,
    redactPII             = true,
    maxAgentDataScope     = DATA_SENSITIVITY.INTERNAL,
  } = config;

  const SENSITIVITY_ORDER = { PUBLIC: 0, INTERNAL: 1, PERSONAL: 2, SENSITIVE: 3 };

  return Object.freeze({
    minimumData,
    blockCrossClient,
    sensitiveOnlyToAuthorized,
    redactSecrets,
    redactPII,
    maxAgentDataScope,

    canAgentAccess(agentId, dataSensitivity, agentClearance) {
      const dataLevel  = SENSITIVITY_ORDER[dataSensitivity]  ?? 0;
      const agentLevel = SENSITIVITY_ORDER[agentClearance]   ?? 0;
      const maxLevel   = SENSITIVITY_ORDER[maxAgentDataScope] ?? 1;
      if (dataLevel > maxLevel || dataLevel > agentLevel) {
        return Object.freeze({ allowed: false, reason: 'SENSITIVITY_EXCEEDS_CLEARANCE', agentId, isReal: false });
      }
      return Object.freeze({ allowed: true, agentId, isReal: false });
    },

    validateContextTransfer(fromClientId, toClientId) {
      if (blockCrossClient && fromClientId !== toClientId) {
        return Object.freeze({ allowed: false, reason: 'CROSS_CLIENT_TRANSFER_BLOCKED', isReal: false });
      }
      return Object.freeze({ allowed: true, isReal: false });
    },

    isReal: false,
  });
}

export const MULTIAGENT_PRIVACY_POLICY_VERSION = '1.0.0';
