// Resolve Social Strategy — maps business profile to social strategy config

import { SOCIAL_OBJECTIVE }   from '../core/socialObjective.js';
import { CONTENT_PILLAR }     from '../core/contentPillar.js';
import { STRATEGY_MATURITY, createSocialStrategyProfile } from '../core/socialStrategyProfile.js';

const SECTOR_STRATEGY_MAP = Object.freeze({
  padel:       { objectives: [SOCIAL_OBJECTIVE.BOOKING_CONVERSION, SOCIAL_OBJECTIVE.COMMUNITY_BUILDING], pillars: [CONTENT_PILLAR.EDUCATIONAL, CONTENT_PILLAR.SOCIAL_PROOF, CONTENT_PILLAR.LOCAL_EVENTS], postsPerWeek: 4 },
  fisioterapia: { objectives: [SOCIAL_OBJECTIVE.EDUCATION, SOCIAL_OBJECTIVE.SOCIAL_PROOF],  pillars: [CONTENT_PILLAR.EDUCATIONAL, CONTENT_PILLAR.TIPS_AND_TRICKS, CONTENT_PILLAR.TRANSFORMATIONS], postsPerWeek: 3 },
  educacion:   { objectives: [SOCIAL_OBJECTIVE.BRAND_AWARENESS, SOCIAL_OBJECTIVE.EDUCATION], pillars: [CONTENT_PILLAR.EDUCATIONAL, CONTENT_PILLAR.COMMUNITY, CONTENT_PILLAR.VALUES], postsPerWeek: 3 },
  clinica:     { objectives: [SOCIAL_OBJECTIVE.SOCIAL_PROOF, SOCIAL_OBJECTIVE.EDUCATION],   pillars: [CONTENT_PILLAR.SOCIAL_PROOF, CONTENT_PILLAR.EDUCATIONAL, CONTENT_PILLAR.FAQ], postsPerWeek: 3 },
  restaurante: { objectives: [SOCIAL_OBJECTIVE.BOOKING_CONVERSION, SOCIAL_OBJECTIVE.SEASONAL_PROMOTION], pillars: [CONTENT_PILLAR.PRODUCT_SHOWCASE, CONTENT_PILLAR.BEHIND_THE_SCENES, CONTENT_PILLAR.SEASONAL], postsPerWeek: 5 },
  retail:      { objectives: [SOCIAL_OBJECTIVE.LEAD_GENERATION, SOCIAL_OBJECTIVE.PROMOTIONS !== undefined ? SOCIAL_OBJECTIVE.SEASONAL_PROMOTION : SOCIAL_OBJECTIVE.BRAND_AWARENESS], pillars: [CONTENT_PILLAR.PROMOTIONS, CONTENT_PILLAR.PRODUCT_SHOWCASE, CONTENT_PILLAR.SOCIAL_PROOF], postsPerWeek: 5 },
  gimnasio:    { objectives: [SOCIAL_OBJECTIVE.COMMUNITY_BUILDING, SOCIAL_OBJECTIVE.MOTIVATIONAL !== undefined ? SOCIAL_OBJECTIVE.BRAND_AWARENESS : SOCIAL_OBJECTIVE.RETENTION], pillars: [CONTENT_PILLAR.MOTIVATIONAL !== undefined ? CONTENT_PILLAR.EDUCATIONAL : CONTENT_PILLAR.TIPS_AND_TRICKS, CONTENT_PILLAR.SOCIAL_PROOF, CONTENT_PILLAR.TRANSFORMATIONS], postsPerWeek: 5 },
  default:     { objectives: [SOCIAL_OBJECTIVE.BRAND_AWARENESS, SOCIAL_OBJECTIVE.LOCAL_PRESENCE], pillars: [CONTENT_PILLAR.EDUCATIONAL, CONTENT_PILLAR.COMMUNITY], postsPerWeek: 3 },
});

export function resolveSocialStrategy(business = {}) {
  if (!business.businessId) throw new Error('resolveSocialStrategy requires businessId');
  if (!business.clientId)   throw new Error('resolveSocialStrategy requires clientId');

  const sector  = business.sector?.toLowerCase() ?? 'default';
  const knownSector = SECTOR_STRATEGY_MAP[sector] ? sector : 'default';
  const config  = SECTOR_STRATEGY_MAP[knownSector];
  const channels = business.preferredChannels ?? ['INSTAGRAM_REEL', 'INSTAGRAM_STORY', 'FACEBOOK'];
  const maturity = business.maturity ?? STRATEGY_MATURITY.SEED;

  const profile = createSocialStrategyProfile({
    businessId:   business.businessId,
    clientId:     business.clientId,
    objectives:   config.objectives,
    pillars:      config.pillars,
    channels,
    postsPerWeek: config.postsPerWeek,
    maturity,
  });

  return Object.freeze({ profile, resolvedSector: knownSector, isReal: false });
}
