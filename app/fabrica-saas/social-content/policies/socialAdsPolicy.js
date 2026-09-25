// Social Ads Policy — ADS_EXECUTION=BLOCKED, ads never auto-executed

export const ADS_EXECUTION = 'BLOCKED';

export const ADS_STATUS = Object.freeze({
  NOT_PLANNED:     'NOT_PLANNED',
  PLANNED_HUMAN:   'PLANNED_HUMAN',
  BLOCKED:         'BLOCKED',
});

export function evaluateAdsPolicy(config = {}) {
  if (config.adsRequested === true) {
    return Object.freeze({
      adsExecution:  ADS_EXECUTION,
      status:        ADS_STATUS.BLOCKED,
      allowed:       false,
      reason:        'ADS_EXECUTION=BLOCKED — all ad execution requires human action outside this system',
      canPlanOnly:   true,
      noRealAdSpend: true,
      isReal:        false,
    });
  }

  return Object.freeze({
    adsExecution:  ADS_EXECUTION,
    status:        ADS_STATUS.NOT_PLANNED,
    allowed:       false,
    reason:        'No ads planned — ORGANIC_FIRST default',
    noRealAdSpend: true,
    isReal:        false,
  });
}

export function createAdsPlan(config = {}) {
  return Object.freeze({
    businessId:     config.businessId ?? null,
    budget:         config.budget     ?? 0,
    objective:      config.objective  ?? null,
    channel:        config.channel    ?? null,
    status:         ADS_STATUS.PLANNED_HUMAN,
    execution:      ADS_EXECUTION,
    requiresHumanActivation: true,
    noRealAdSpend:  true,
    isReal:         false,
  });
}
