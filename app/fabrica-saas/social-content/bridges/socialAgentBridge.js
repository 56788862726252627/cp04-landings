// Social Agent Bridge — ADV-03 connection (no auto-publish)

export function bridgeToAgentEngine(post = {}, agentConfig = {}) {
  if (!post.businessId) throw new Error('bridgeToAgentEngine requires businessId');
  if (!post.clientId)   throw new Error('bridgeToAgentEngine requires clientId');

  if (agentConfig.autoPublish === true) {
    throw new Error('AGENT_BRIDGE: autoPublish=true not allowed — NO_REAL_SOCIAL_PUBLISH=SI');
  }

  return Object.freeze({
    businessId:   post.businessId,
    clientId:     post.clientId,
    agentTask: Object.freeze({
      type:        'REVIEW_SOCIAL_CONTENT',
      postRef:     post.id ?? null,
      channel:     post.channel ?? null,
      pillar:      post.pillar  ?? null,
      autoPublish: false,
    }),
    adv03Bridge:  'AGENT_ENGINE_CONNECTED',
    noAutoPublish: true,
    isReal:        false,
  });
}
