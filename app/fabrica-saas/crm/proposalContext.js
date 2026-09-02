// Proposal Context — ADV-09 CRM

export function createProposalContext(fields = {}) {
  return Object.freeze({
    id:              fields.id ?? `pctx_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    opportunityId:   fields.opportunityId ?? '',
    crmLeadId:       fields.crmLeadId ?? '',
    businessName:    fields.businessName ?? '',
    proposedService: fields.proposedService ?? '',
    solutionSummary: fields.solutionSummary ?? '',
    includedModules: Object.freeze([...(fields.includedModules ?? [])]),
    excludedItems:   Object.freeze([...(fields.excludedItems ?? [])]),
    differentiators: Object.freeze([...(fields.differentiators ?? [])]),
    pricingNarrative:fields.pricingNarrative ?? '',
    roiStatement:    fields.roiStatement ?? '',
    implementationPlan: Object.freeze([...(fields.implementationPlan ?? [])]),
    risks:           Object.freeze([...(fields.risks ?? [])]),
    assumptions:     Object.freeze([...(fields.assumptions ?? [])]),
    nextSteps:       Object.freeze([...(fields.nextSteps ?? [])]),
    preparedAt:      fields.preparedAt ?? new Date().toISOString(),
    preparedBy:      fields.preparedBy ?? '',
    note:            'Commercial context only — not a binding commitment.',
    isReal: false,
  });
}

export const PROPOSAL_CONTEXT_VERSION = '1.0.0';
