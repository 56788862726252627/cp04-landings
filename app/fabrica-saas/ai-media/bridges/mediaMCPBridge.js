// Media MCP Bridge — ADV-13 (bridges ADV-12 MCP Layer)

export const MEDIA_MCP_ACTION = Object.freeze({
  FETCH_BUSINESS_DATA: 'FETCH_BUSINESS_DATA',
  PUSH_MEDIA_ASSET:    'PUSH_MEDIA_ASSET',
  REQUEST_APPROVAL:    'REQUEST_APPROVAL',
  LOG_QA_RESULT:       'LOG_QA_RESULT',
});

export function createMediaMCPRequest(config = {}) {
  if (!config.action)    throw new Error('MediaMCPRequest requires action');
  if (!config.projectId) throw new Error('MediaMCPRequest requires projectId');
  const secretRef = config.secretRef ?? null;
  if (config.secretValue) throw new Error('MediaMCPRequest must use secretRef, not secretValue');
  return Object.freeze({
    action:          config.action,
    projectId:       config.projectId,
    clientId:        config.clientId   ?? null,
    secretRef,
    permissionsCheck: true,
    costGuardEnabled: true,
    humanApprovalRequired: config.requiresHumanApproval ?? false,
    adv12Bridge:      'MCP_LAYER_CONNECTED',
    isReal: false,
  });
}

export const MEDIA_MCP_BRIDGE_VERSION = '1.0.0';
