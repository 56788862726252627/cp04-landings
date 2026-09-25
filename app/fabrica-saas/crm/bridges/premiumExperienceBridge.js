// Premium Experience Bridge — CRM ↔ ADV-07 Premium Experience

export const DEMO_CONTEXT_TYPE = Object.freeze({
  SECTOR_DEMO:    'SECTOR_DEMO',
  PROPOSAL_DECK:  'PROPOSAL_DECK',
  LIVE_PROTOTYPE: 'LIVE_PROTOTYPE',
});

export function createDemoContext(opportunity = {}, contextType = DEMO_CONTEXT_TYPE.SECTOR_DEMO) {
  return Object.freeze({
    contextId:     `demo_ctx_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    contextType,
    opportunityId: opportunity.id ?? '',
    businessName:  opportunity.businessName ?? '',
    sector:        opportunity.sector ?? '',
    service:       opportunity.service ?? '',
    keyFeatures:   Object.freeze(opportunity.proposedModules ?? []),
    brandTokens:   Object.freeze({}),
    note:          'Demo context spec only — no real deployment or billing triggered.',
    isReal: false,
  });
}

export const PREMIUM_EXPERIENCE_BRIDGE_VERSION = '1.0.0';
