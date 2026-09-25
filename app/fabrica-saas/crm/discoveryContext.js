// Discovery Context — ADV-09 CRM

export const PAIN_SEVERITY = Object.freeze({
  LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CRITICAL: 'CRITICAL',
});

export function createDiscoveryContext(fields = {}) {
  return Object.freeze({
    id:              fields.id ?? `disc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    opportunityId:   fields.opportunityId ?? '',
    crmLeadId:       fields.crmLeadId ?? '',
    businessName:    fields.businessName ?? '',
    painPoints:      Object.freeze([...(fields.painPoints ?? [])]),
    painSeverity:    fields.painSeverity ?? PAIN_SEVERITY.MEDIUM,
    goals:           Object.freeze([...(fields.goals ?? [])]),
    currentSolution: fields.currentSolution ?? '',
    desiredOutcome:  fields.desiredOutcome ?? '',
    decisionCriteria:Object.freeze([...(fields.decisionCriteria ?? [])]),
    keyStakeholders: Object.freeze([...(fields.keyStakeholders ?? [])]),
    timeline:        fields.timeline ?? '',
    budget:          fields.budget ?? '',
    constraints:     Object.freeze([...(fields.constraints ?? [])]),
    notes:           fields.notes ?? '',
    conductedAt:     fields.conductedAt ?? new Date().toISOString(),
    conductedBy:     fields.conductedBy ?? '',
    isReal: false,
  });
}

export const DISCOVERY_CONTEXT_VERSION = '1.0.0';
