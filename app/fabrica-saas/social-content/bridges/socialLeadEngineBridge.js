// Social Lead Engine Bridge — ADV-08 connection (no real outreach)

export function bridgeToLeadEngine(campaign = {}, leadConfig = {}) {
  if (!campaign.businessId) throw new Error('bridgeToLeadEngine requires businessId');
  if (!campaign.clientId)   throw new Error('bridgeToLeadEngine requires clientId');

  if (leadConfig.executeRealOutreach === true) {
    throw new Error('NO_REAL_OUTREACH=SI — real lead outreach not allowed from social bridge');
  }

  return Object.freeze({
    businessId:     campaign.businessId,
    clientId:       campaign.clientId,
    campaignId:     campaign.id ?? null,
    objective:      campaign.objective ?? null,
    leadSignals: Object.freeze({
      channel:     campaign.channels?.[0] ?? null,
      ctaType:     leadConfig.ctaType ?? null,
      landingRef:  leadConfig.landingRef ?? null,
    }),
    adv08Bridge:    'LEAD_ENGINE_CONNECTED',
    noRealOutreach: true,
    isReal:         false,
  });
}
