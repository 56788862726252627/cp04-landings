// Social Content Brief — structured spec for a single piece of content

import { SOCIAL_OBJECTIVE } from './socialObjective.js';
import { CONTENT_PILLAR }    from './contentPillar.js';

export function createSocialContentBrief(config = {}) {
  if (!config.businessId) throw new Error('SocialContentBrief requires businessId');
  if (!config.clientId)   throw new Error('SocialContentBrief requires clientId');
  if (!config.objective)  throw new Error('SocialContentBrief requires objective');
  if (!config.pillar)     throw new Error('SocialContentBrief requires pillar');
  if (!config.channel)    throw new Error('SocialContentBrief requires channel');

  if (!Object.values(SOCIAL_OBJECTIVE).includes(config.objective)) {
    throw new Error(`Unknown objective: ${config.objective}`);
  }
  if (!Object.values(CONTENT_PILLAR).includes(config.pillar)) {
    throw new Error(`Unknown pillar: ${config.pillar}`);
  }

  return Object.freeze({
    businessId:   config.businessId,
    clientId:     config.clientId,
    objective:    config.objective,
    pillar:       config.pillar,
    channel:      config.channel,
    topic:        config.topic          ?? null,
    hook:         config.hook           ?? null,
    cta:          config.cta            ?? null,
    copyStyle:    config.copyStyle      ?? 'CONVERSATIONAL',
    mediaType:    config.mediaType      ?? 'IMAGE',
    targetAudience: config.targetAudience ?? null,
    keywords:     Object.freeze(config.keywords ?? []),
    restrictions: Object.freeze(config.restrictions ?? ['NO_INVENTED_CLAIMS', 'NO_FAKE_TESTIMONIALS']),
    isReal:       false,
  });
}
