// CRM Data Quality Score — ADV-09 CRM

export const QUALITY_DIMENSION = Object.freeze({
  CONTACT_INFO:    'CONTACT_INFO',
  BUSINESS_DATA:   'BUSINESS_DATA',
  DEAL_DATA:       'DEAL_DATA',
  ACTIVITY_LOG:    'ACTIVITY_LOG',
  QUALIFICATION:   'QUALIFICATION',
});

const DIMENSION_WEIGHTS = Object.freeze({
  [QUALITY_DIMENSION.CONTACT_INFO]:  25,
  [QUALITY_DIMENSION.BUSINESS_DATA]: 25,
  [QUALITY_DIMENSION.DEAL_DATA]:     20,
  [QUALITY_DIMENSION.ACTIVITY_LOG]:  15,
  [QUALITY_DIMENSION.QUALIFICATION]: 15,
});

export function scoreCRMDataQuality(opportunity = {}) {
  const scores = {};

  // Contact info
  const contactScore = ((opportunity.contactName ? 40 : 0)
    + (opportunity.contactEmail ? 35 : 0)
    + (opportunity.contactPhone ? 25 : 0));
  scores[QUALITY_DIMENSION.CONTACT_INFO] = Math.min(100, contactScore);

  // Business data
  const bizScore = ((opportunity.businessName ? 30 : 0)
    + (opportunity.sector ? 20 : 0)
    + (opportunity.website ? 20 : 0)
    + (opportunity.location ? 15 : 0)
    + (opportunity.employeeRange ? 15 : 0));
  scores[QUALITY_DIMENSION.BUSINESS_DATA] = Math.min(100, bizScore);

  // Deal data
  const dealScore = ((opportunity.dealValueEstimate ? 50 : 0)
    + (opportunity.proposalId ? 30 : 0)
    + (opportunity.closeWindowDays ? 20 : 0));
  scores[QUALITY_DIMENSION.DEAL_DATA] = Math.min(100, dealScore);

  // Activity log
  const actScore = ((opportunity.lastActivityAt ? 50 : 0)
    + (opportunity.activityCount > 0 ? 30 : 0)
    + (opportunity.nextAction ? 20 : 0));
  scores[QUALITY_DIMENSION.ACTIVITY_LOG] = Math.min(100, actScore);

  // Qualification
  const qualScore = opportunity.qualificationScore ?? 0;
  scores[QUALITY_DIMENSION.QUALIFICATION] = Math.min(100, qualScore);

  let total = 0;
  for (const [dim, w] of Object.entries(DIMENSION_WEIGHTS)) {
    total += (scores[dim] ?? 0) * w / 100;
  }

  return Object.freeze({
    dimensions: Object.freeze(scores),
    total:      Math.round(total),
    isReal: false,
  });
}

export const CRM_QUALITY_SCORE_VERSION = '1.0.0';
