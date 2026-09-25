// Social Content Report — final output summary for a content batch or campaign

export function createSocialContentReport(config = {}) {
  if (!config.businessId) throw new Error('SocialContentReport requires businessId');
  if (!config.clientId)   throw new Error('SocialContentReport requires clientId');

  return Object.freeze({
    reportId:        config.reportId ?? `report_${config.businessId}_${Date.now()}`,
    businessId:      config.businessId,
    clientId:        config.clientId,
    generatedAt:     config.generatedAt ?? new Date().toISOString(),
    strategy: Object.freeze({
      objectives:    Object.freeze(config.objectives ?? []),
      pillars:       Object.freeze(config.pillars    ?? []),
      channels:      Object.freeze(config.channels   ?? []),
      postsPerWeek:  config.postsPerWeek ?? 3,
    }),
    metrics: Object.freeze({
      ideasGenerated:  config.ideasGenerated  ?? 0,
      postsCreated:    config.postsCreated    ?? 0,
      postsApproved:   config.postsApproved   ?? 0,
      postsBlocked:    config.postsBlocked    ?? 0,
      campaignsPlanned: config.campaignsPlanned ?? 0,
      avgQualityScore: config.avgQualityScore ?? 0,
    }),
    qualityGate: Object.freeze({
      passed:          config.gateStatus === 'PASS',
      status:          config.gateStatus ?? 'PENDING',
      criticalFailures: Object.freeze(config.criticalFailures ?? []),
    }),
    guardrails: Object.freeze({
      noRealPublish:  true,
      noRealAdSpend:  true,
      noRealOutreach: true,
      clientIsolated: true,
    }),
    isReal: false,
  });
}
