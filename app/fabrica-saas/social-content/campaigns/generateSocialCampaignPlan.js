// Generate Social Campaign Plan — organic-first, produces structured campaign plan

import { createSocialCampaign, CAMPAIGN_TYPE, CAMPAIGN_STATUS } from './socialCampaign.js';
import { createSocialCadencePolicy, CADENCE_PRESET } from '../core/socialCadencePolicy.js';

export function generateSocialCampaignPlan(params = {}) {
  if (!params.businessId)  throw new Error('generateSocialCampaignPlan requires businessId');
  if (!params.clientId)    throw new Error('generateSocialCampaignPlan requires clientId');
  if (!params.objective)   throw new Error('generateSocialCampaignPlan requires objective');
  if (!params.durationWeeks || params.durationWeeks < 1) throw new Error('generateSocialCampaignPlan requires durationWeeks >= 1');

  const cadence = createSocialCadencePolicy({
    preset: params.cadencePreset ?? CADENCE_PRESET.STANDARD,
    postsPerWeek: params.postsPerWeek,
  });

  const postsPlanned = cadence.postsPerWeek * params.durationWeeks;
  const channels     = params.channels ?? ['INSTAGRAM_REEL', 'INSTAGRAM_STORY', 'FACEBOOK'];

  const campaign = createSocialCampaign({
    id:           params.campaignId ?? `plan_${params.businessId}_${Date.now()}`,
    businessId:   params.businessId,
    clientId:     params.clientId,
    name:         params.name ?? `Campaña ${params.objective}`,
    objective:    params.objective,
    type:         CAMPAIGN_TYPE.ORGANIC_ONLY,
    channels,
    pillars:      params.pillars ?? [],
    startDate:    params.startDate ?? null,
    endDate:      params.endDate   ?? null,
    postsPlanned,
    status:       CAMPAIGN_STATUS.PLANNING,
  });

  const weeklySchedule = Array.from({ length: params.durationWeeks }, (_, i) =>
    Object.freeze({
      week:          i + 1,
      postsScheduled: cadence.postsPerWeek,
      preferredDays:  cadence.preferredDays,
    })
  );

  return Object.freeze({
    campaign,
    cadence,
    weeklySchedule: Object.freeze(weeklySchedule),
    totalPosts:     postsPlanned,
    organicFirst:   true,
    adsBlocked:     true,
    noRealPublish:  true,
    isReal:         false,
  });
}
