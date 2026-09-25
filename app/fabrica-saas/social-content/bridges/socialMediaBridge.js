// Social Media Bridge — connects ADV-14 Social Content to ADV-13 AI Media Engine

export function bridgeToAIMedia(post = {}, mediaConfig = {}) {
  if (!post.businessId) throw new Error('bridgeToAIMedia requires businessId');
  if (!post.clientId)   throw new Error('bridgeToAIMedia requires clientId');

  if (post.businessId !== mediaConfig.clientId && mediaConfig.clientId !== undefined) {
    throw new Error('CLIENT_ISOLATION: post clientId does not match mediaConfig clientId');
  }

  return Object.freeze({
    sourcePost:    Object.freeze({ businessId: post.businessId, clientId: post.clientId, channel: post.channel }),
    mediaRequest: Object.freeze({
      objective:   post.objective  ?? null,
      scriptHook:  post.hook       ?? null,
      scriptCTA:   post.cta        ?? null,
      channel:     post.channel    ?? null,
      language:    post.language   ?? 'es-ES',
    }),
    adv13Bridge:   'AI_MEDIA_LAYER_CONNECTED',
    noRealMedia:   true,
    isReal:        false,
  });
}
