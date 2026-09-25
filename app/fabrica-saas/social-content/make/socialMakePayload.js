// Social Make Payload — structured payload compatible with Make.com social webhook contracts

export function createSocialMakePayload(config = {}) {
  if (!config.businessId)  throw new Error('SocialMakePayload requires businessId');
  if (!config.clientId)    throw new Error('SocialMakePayload requires clientId');
  if (!config.channel)     throw new Error('SocialMakePayload requires channel');
  if (!config.postContent) throw new Error('SocialMakePayload requires postContent');

  if (config.realWebhookUrl) {
    throw new Error('SocialMakePayload must use webhookRef, not realWebhookUrl');
  }
  if (config.realToken) {
    throw new Error('SocialMakePayload must use secretRef, not realToken');
  }

  return Object.freeze({
    payloadVersion:  '1.0',
    businessId:      config.businessId,
    clientId:        config.clientId,
    channel:         config.channel,
    postContent:     Object.freeze({
      text:     config.postContent.text      ?? '',
      hashtags: Object.freeze(config.postContent.hashtags ?? []),
      mediaRef: config.postContent.mediaRef  ?? null,
      hook:     config.postContent.hook      ?? null,
      cta:      config.postContent.cta       ?? null,
    }),
    scheduledDate:   config.scheduledDate  ?? null,
    scheduledTime:   config.scheduledTime  ?? null,
    objective:       config.objective      ?? null,
    pillar:          config.pillar         ?? null,
    webhookRef:      config.webhookRef     ?? null,
    dryRun:          true,
    noRealPublish:   true,
    noRealAdSpend:   true,
    isReal:          false,
  });
}
