// Social Strategy Profile — root config for a business's social presence

import { SOCIAL_OBJECTIVE } from './socialObjective.js';
import { CONTENT_PILLAR }    from './contentPillar.js';

export const STRATEGY_MATURITY = Object.freeze({
  SEED:        'SEED',        // brand new, < 3 months
  GROWING:     'GROWING',     // 3–12 months, some followers
  ESTABLISHED: 'ESTABLISHED', // 1+ year, consistent presence
  AUTHORITY:   'AUTHORITY',   // recognized local leader
});

export function createSocialStrategyProfile(config = {}) {
  if (!config.businessId) throw new Error('SocialStrategyProfile requires businessId');
  if (!config.clientId)   throw new Error('SocialStrategyProfile requires clientId');

  const objectives = Object.freeze(config.objectives ?? [SOCIAL_OBJECTIVE.BRAND_AWARENESS]);
  const pillars    = Object.freeze(config.pillars    ?? [CONTENT_PILLAR.EDUCATIONAL, CONTENT_PILLAR.SOCIAL_PROOF]);
  const channels   = Object.freeze(config.channels   ?? ['INSTAGRAM_REEL', 'INSTAGRAM_STORY']);

  const invalidObj = objectives.find(o => !Object.values(SOCIAL_OBJECTIVE).includes(o));
  if (invalidObj) throw new Error(`Unknown objective: ${invalidObj}`);

  const invalidPillar = pillars.find(p => !Object.values(CONTENT_PILLAR).includes(p));
  if (invalidPillar) throw new Error(`Unknown pillar: ${invalidPillar}`);

  return Object.freeze({
    businessId:        config.businessId,
    clientId:          config.clientId,
    objectives,
    pillars,
    channels,
    postsPerWeek:      config.postsPerWeek ?? 3,
    maturity:          config.maturity ?? STRATEGY_MATURITY.SEED,
    language:          config.language  ?? 'es',
    locale:            config.locale    ?? 'es-ES',
    organicFirst:      true,
    adsEnabled:        false,
    noRealPublish:     true,
    isReal:            false,
  });
}
