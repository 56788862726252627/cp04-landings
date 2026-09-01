// Agent Engine Bridge — ADV-08 → ADV-03

export function buildLeadContext(lead = {}) {
  return Object.freeze({
    leadId:            lead.id ?? '',
    businessName:      lead.businessName ?? '',
    vertical:          lead.vertical ?? 'default',
    location:          lead.location ?? '',
    temperature:       lead.temperature ?? 'COLD',
    opportunityScore:  lead.opportunityScore ?? 0,
    recommendedService:lead.recommendedService ?? '',
    painSignals:       Object.freeze((lead.painSignals ?? []).map(s => typeof s === 'string' ? s : s.type)),
    digitalSignals:    Object.freeze(lead.digitalSignals ?? []),
    recommendedAction: lead.recommendedNextAction ?? 'RESEARCH_MORE',
    website:           lead.website ?? '',
    note:              'Context prepared for Agent Engine — no outreach will be triggered automatically.',
    isReal: false,
  });
}

export function buildSalesPreparationContext(lead = {}) {
  return Object.freeze({
    leadContext:       buildLeadContext(lead),
    keyPainPoints:     Object.freeze((lead.painSignals ?? []).slice(0, 3).map(s => typeof s === 'string' ? s : s.type)),
    proposedService:   lead.recommendedService ?? '',
    valueProposition:  `Help ${lead.businessName ?? 'this business'} solve ${(lead.painSignals ?? []).length} identified digital gap(s)`,
    objections:        Object.freeze(['Price sensitivity', 'Implementation time', 'Current provider loyalty']),
    note:              'Preparation context only — human sales action required.',
    isReal: false,
  });
}

export const AGENT_ENGINE_BRIDGE_VERSION = '1.0.0';
