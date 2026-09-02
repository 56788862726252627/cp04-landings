// Deal Outcome — ADV-09 CRM

export const DEAL_OUTCOME = Object.freeze({
  WON:     'WON',
  LOST:    'LOST',
  NURTURE: 'NURTURE',
  PENDING: 'PENDING',
});

export function createDealOutcome(fields = {}) {
  const outcome = fields.outcome ?? DEAL_OUTCOME.PENDING;
  const closedAt = (outcome !== DEAL_OUTCOME.PENDING)
    ? (fields.closedAt ?? new Date().toISOString())
    : null;

  return Object.freeze({
    id:            fields.id ?? `outcome_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    opportunityId: fields.opportunityId ?? '',
    dealId:        fields.dealId ?? '',
    crmLeadId:     fields.crmLeadId ?? '',
    businessName:  fields.businessName ?? '',
    outcome,
    closedAt,
    primaryReason: fields.primaryReason ?? '',
    competitorWon: fields.competitorWon ?? '',
    feedbackNotes: fields.feedbackNotes ?? '',
    agreedSetup:   outcome === DEAL_OUTCOME.WON ? (fields.agreedSetup ?? 0) : 0,
    agreedMonthly: outcome === DEAL_OUTCOME.WON ? (fields.agreedMonthly ?? 0) : 0,
    handoffReady:  outcome === DEAL_OUTCOME.WON ? (fields.handoffReady ?? false) : false,
    isReal: false,
  });
}

export const DEAL_OUTCOME_VERSION = '1.0.0';
