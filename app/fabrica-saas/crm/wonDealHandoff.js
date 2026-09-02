// Won Deal Handoff — ADV-09 CRM

export const HANDOFF_STATUS = Object.freeze({
  PENDING:    'PENDING',
  IN_PROGRESS:'IN_PROGRESS',
  COMPLETED:  'COMPLETED',
  BLOCKED:    'BLOCKED',
});

export function createWonDealHandoff(fields = {}) {
  return Object.freeze({
    id:              fields.id ?? `handoff_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    dealId:          fields.dealId ?? '',
    opportunityId:   fields.opportunityId ?? '',
    crmLeadId:       fields.crmLeadId ?? '',
    accountId:       fields.accountId ?? '',
    businessName:    fields.businessName ?? '',
    agreedSetup:     fields.agreedSetup ?? 0,
    agreedMonthly:   fields.agreedMonthly ?? 0,
    service:         fields.service ?? '',
    includedModules: Object.freeze([...(fields.includedModules ?? [])]),
    keyContacts:     Object.freeze([...(fields.keyContacts ?? [])]),
    onboardingNotes: fields.onboardingNotes ?? '',
    kickoffDate:     fields.kickoffDate ?? '',
    implementationWeeks: fields.implementationWeeks ?? 4,
    assignedTo:      fields.assignedTo ?? '',
    status:          fields.status ?? HANDOFF_STATUS.PENDING,
    completedAt:     fields.completedAt ?? '',
    isReal: false,
  });
}

export function isHandoffComplete(handoff = {}) {
  return handoff.status === HANDOFF_STATUS.COMPLETED && !!handoff.completedAt;
}

export const WON_DEAL_HANDOFF_VERSION = '1.0.0';
