// CRM Bridge — ADV-08 → ADV-09 (future CRM)

export const CRM_STAGE = Object.freeze({
  DISCOVERED:     'DISCOVERED',
  RESEARCHING:    'RESEARCHING',
  QUALIFIED:      'QUALIFIED',
  PROPOSAL:       'PROPOSAL',
  NEGOTIATION:    'NEGOTIATION',
  WON:            'WON',
  LOST:           'LOST',
  NURTURE:        'NURTURE',
});

export function createLeadCRMRecord(lead = {}, overrides = {}) {
  const nextReview = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  return Object.freeze({
    leadId:            lead.id ?? '',
    stage:             overrides.stage ?? CRM_STAGE.DISCOVERED,
    temperature:       lead.temperature ?? 'COLD',
    score:             lead.opportunityScore ?? 0,
    recommendedService:lead.recommendedService ?? '',
    nextAction:        lead.recommendedNextAction ?? 'RESEARCH_MORE',
    owner:             overrides.owner ?? 'UNASSIGNED',
    notes:             overrides.notes ?? '',
    lastActivity:      new Date().toISOString(),
    nextReviewAt:      nextReview,
    isReal: false,
  });
}

export const CRM_BRIDGE_VERSION = '1.0.0';
