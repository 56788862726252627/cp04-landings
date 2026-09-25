// Lost Deal Analysis — ADV-09 CRM

export const LOSS_REASON = Object.freeze({
  PRICE_TOO_HIGH:    'PRICE_TOO_HIGH',
  NO_BUDGET:         'NO_BUDGET',
  COMPETITOR_CHOSEN: 'COMPETITOR_CHOSEN',
  NO_DECISION:       'NO_DECISION',
  TIMING_NOT_RIGHT:  'TIMING_NOT_RIGHT',
  POOR_FIT:          'POOR_FIT',
  LOST_CONTACT:      'LOST_CONTACT',
  INTERNAL_PRIORITY_CHANGE: 'INTERNAL_PRIORITY_CHANGE',
  OTHER:             'OTHER',
});

export function createLostDealAnalysis(fields = {}) {
  return Object.freeze({
    id:              fields.id ?? `loss_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    opportunityId:   fields.opportunityId ?? '',
    crmLeadId:       fields.crmLeadId ?? '',
    businessName:    fields.businessName ?? '',
    lossReason:      fields.lossReason ?? LOSS_REASON.OTHER,
    competitorChosen:fields.competitorChosen ?? '',
    pricingFeedback: fields.pricingFeedback ?? '',
    fitIssues:       Object.freeze([...(fields.fitIssues ?? [])]),
    processFeedback: fields.processFeedback ?? '',
    couldReopen:     fields.couldReopen ?? false,
    reopenCondition: fields.reopenCondition ?? '',
    learnings:       Object.freeze([...(fields.learnings ?? [])]),
    lostAt:          fields.lostAt ?? new Date().toISOString(),
    analyzedBy:      fields.analyzedBy ?? '',
    isReal: false,
  });
}

export function aggregateLossReasons(analyses = []) {
  const counts = {};
  for (const a of analyses) {
    counts[a.lossReason] = (counts[a.lossReason] ?? 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return Object.freeze({
    total:   analyses.length,
    reasons: Object.freeze(Object.fromEntries(sorted)),
    topReason: sorted[0]?.[0] ?? null,
    isReal: false,
  });
}

export const LOST_DEAL_VERSION = '1.0.0';
