// Social Campaign Model

export const CAMPAIGN_STATUS = Object.freeze({
  PLANNING:        'PLANNING',
  READY:           'READY',
  WAITING_APPROVAL:'WAITING_APPROVAL',
  APPROVED:        'APPROVED',
  BLOCKED:         'BLOCKED',
  COMPLETED:       'COMPLETED',
});

export const CAMPAIGN_TYPE = Object.freeze({
  ORGANIC_ONLY:    'ORGANIC_ONLY',
  ORGANIC_PLUS_ADS:'ORGANIC_PLUS_ADS',
  LAUNCH:          'LAUNCH',
  SEASONAL:        'SEASONAL',
  RETENTION:       'RETENTION',
  COMMUNITY:       'COMMUNITY',
  LEAD_NURTURE:    'LEAD_NURTURE',
});

export function createSocialCampaign(config = {}) {
  if (!config.businessId) throw new Error('SocialCampaign requires businessId');
  if (!config.clientId)   throw new Error('SocialCampaign requires clientId');
  if (!config.name)       throw new Error('SocialCampaign requires name');
  if (!config.objective)  throw new Error('SocialCampaign requires objective');

  const type = config.type ?? CAMPAIGN_TYPE.ORGANIC_ONLY;
  if (!Object.values(CAMPAIGN_TYPE).includes(type)) throw new Error(`Unknown campaign type: ${type}`);

  if (config.type === CAMPAIGN_TYPE.ORGANIC_PLUS_ADS && config.autoActivateAds === true) {
    throw new Error('SocialCampaign: ADS_EXECUTION=BLOCKED — ads cannot be auto-activated');
  }

  return Object.freeze({
    id:            config.id ?? `campaign_${config.businessId}_${Date.now()}`,
    businessId:    config.businessId,
    clientId:      config.clientId,
    name:          config.name,
    objective:     config.objective,
    type,
    channels:      Object.freeze(config.channels ?? ['INSTAGRAM_REEL']),
    pillars:       Object.freeze(config.pillars  ?? []),
    startDate:     config.startDate ?? null,
    endDate:       config.endDate   ?? null,
    postsPlanned:  config.postsPlanned ?? 0,
    status:        config.status ?? CAMPAIGN_STATUS.PLANNING,
    adsBlocked:    true,
    noRealPublish: true,
    isReal:        false,
  });
}
