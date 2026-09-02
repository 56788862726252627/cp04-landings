// Social MCP Bridge — ADV-12 connection (secretRef pattern, no real tokens)

export function createSocialMCPRequest(config = {}) {
  if (!config.action)     throw new Error('SocialMCPRequest requires action');
  if (!config.businessId) throw new Error('SocialMCPRequest requires businessId');
  if (!config.clientId)   throw new Error('SocialMCPRequest requires clientId');

  if (config.secretValue) {
    throw new Error('SocialMCPRequest must use secretRef, not secretValue');
  }

  return Object.freeze({
    action:      config.action,
    businessId:  config.businessId,
    clientId:    config.clientId,
    secretRef:   config.secretRef ?? null,
    payload:     Object.freeze(config.payload ?? {}),
    adv12Bridge: 'MCP_LAYER_CONNECTED',
    dryRun:      true,
    isReal:      false,
  });
}
