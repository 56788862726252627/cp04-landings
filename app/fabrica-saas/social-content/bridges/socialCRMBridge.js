// Social CRM Bridge — ADV-09 connection (no real CRM writes)

export function bridgeToCRM(campaign = {}, crmConfig = {}) {
  if (!campaign.businessId) throw new Error('bridgeToCRM requires businessId');
  if (!campaign.clientId)   throw new Error('bridgeToCRM requires clientId');

  if (crmConfig.executeRealWrite === true) {
    throw new Error('NO_REAL_CRM_WRITE=SI — CRM writes are simulated only');
  }

  return Object.freeze({
    businessId:    campaign.businessId,
    clientId:      campaign.clientId,
    campaignId:    campaign.id ?? null,
    crmActivity: Object.freeze({
      type:        'SOCIAL_CAMPAIGN',
      objective:   campaign.objective ?? null,
      channels:    Object.freeze(campaign.channels ?? []),
      simulated:   true,
    }),
    adv09Bridge:   'CRM_ENGINE_CONNECTED',
    noRealWrite:   true,
    isReal:        false,
  });
}
