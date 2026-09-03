// CRM Bridge — ADV-17 ↔ ADV-09
// CRM agent writes require idempotency key + human approval for sensitive records.

export const CRM_ACTION = Object.freeze({
  CREATE_CONTACT:  'CREATE_CONTACT',
  UPDATE_CONTACT:  'UPDATE_CONTACT',
  CREATE_DEAL:     'CREATE_DEAL',
  UPDATE_DEAL:     'UPDATE_DEAL',
  LOG_INTERACTION: 'LOG_INTERACTION',
  EXPORT_RECORDS:  'EXPORT_RECORDS',
});

const SENSITIVE_ACTIONS = new Set([CRM_ACTION.EXPORT_RECORDS]);

export function createMultiAgentCRMBridge(config = {}) {
  const { requireApprovalForSensitive = true } = config;

  return Object.freeze({
    requireApprovalForSensitive,

    isSensitive(action) {
      return SENSITIVE_ACTIONS.has(action);
    },

    buildWriteRequest(specialist, action, payload = {}) {
      return Object.freeze({
        agentId:          specialist.id,
        action,
        payload:          Object.freeze({ ...payload }),
        requiresApproval: requireApprovalForSensitive && SENSITIVE_ACTIONS.has(action),
        idempotencyKey:   `${specialist.id}:${action}:${payload.contactId ?? payload.dealId ?? 'unknown'}`,
        isReal:           false,
      });
    },

    isReal: false,
  });
}

export const MULTIAGENT_CRM_BRIDGE_VERSION = '1.0.0';
