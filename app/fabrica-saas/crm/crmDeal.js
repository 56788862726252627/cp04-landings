// CRM Deal + Proposal Model — ADV-09 CRM

export const PROPOSAL_STATUS = Object.freeze({
  DRAFT:    'DRAFT',
  SENT:     'SENT',
  REVIEWED: 'REVIEWED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED:  'EXPIRED',
});

export function createCRMProposal(fields = {}) {
  return Object.freeze({
    id:                 fields.id ?? `proposal_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    opportunityId:      fields.opportunityId ?? '',
    crmLeadId:          fields.crmLeadId ?? '',
    businessName:       fields.businessName ?? '',
    service:            fields.service ?? '',
    scope:              Object.freeze([...(fields.scope ?? [])]),
    setupLow:           fields.setupLow ?? 0,
    setupCentral:       fields.setupCentral ?? 0,
    setupHigh:          fields.setupHigh ?? 0,
    monthlyLow:         fields.monthlyLow ?? 0,
    monthlyCentral:     fields.monthlyCentral ?? 0,
    monthlyHigh:        fields.monthlyHigh ?? 0,
    includedModules:    Object.freeze([...(fields.includedModules ?? [])]),
    optionalModules:    Object.freeze([...(fields.optionalModules ?? [])]),
    assumptions:        Object.freeze([...(fields.assumptions ?? [])]),
    risks:              Object.freeze([...(fields.risks ?? [])]),
    implementationWeeks:fields.implementationWeeks ?? 4,
    validUntil:         fields.validUntil ?? '',
    status:             fields.status ?? PROPOSAL_STATUS.DRAFT,
    sentAt:             fields.sentAt ?? '',
    createdAt:          fields.createdAt ?? new Date().toISOString(),
    updatedAt:          fields.updatedAt ?? new Date().toISOString(),
    note:               'This is a commercial estimate only — not a final contract.',
    isReal:             false,
  });
}

export function createCRMDeal(fields = {}) {
  return Object.freeze({
    id:             fields.id ?? `deal_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    opportunityId:  fields.opportunityId ?? '',
    proposalId:     fields.proposalId ?? '',
    crmLeadId:      fields.crmLeadId ?? '',
    accountId:      fields.accountId ?? '',
    businessName:   fields.businessName ?? '',
    service:        fields.service ?? '',
    agreedSetup:    fields.agreedSetup ?? 0,
    agreedMonthly:  fields.agreedMonthly ?? 0,
    outcome:        fields.outcome ?? 'PENDING',
    outcomeReason:  fields.outcomeReason ?? '',
    wonAt:          fields.wonAt ?? '',
    lostAt:         fields.lostAt ?? '',
    closedAt:       fields.closedAt ?? '',
    handoffReady:   fields.handoffReady ?? false,
    createdAt:      fields.createdAt ?? new Date().toISOString(),
    isReal:         false,
  });
}

export const CRM_DEAL_VERSION = '1.0.0';
