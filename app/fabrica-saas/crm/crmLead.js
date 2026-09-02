// CRM Lead Model — ADV-09 CRM

import { CRM_STAGE } from './salesPipeline.js';

export const CRM_LEAD_STATUS = Object.freeze({
  ACTIVE:    'ACTIVE',
  QUALIFIED: 'QUALIFIED',
  DISQUALIFIED: 'DISQUALIFIED',
  CONVERTED: 'CONVERTED',
  NURTURE:   'NURTURE',
  ARCHIVED:  'ARCHIVED',
});

export const CRM_PRIORITY = Object.freeze({
  P0_CRITICAL: 'P0_CRITICAL',
  P1_HIGH:     'P1_HIGH',
  P2_MEDIUM:   'P2_MEDIUM',
  P3_LOW:      'P3_LOW',
});

export function createCRMLead(fields = {}) {
  return Object.freeze({
    id:                    fields.id ?? `crm_lead_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    leadId:                fields.leadId ?? '',
    businessName:          fields.businessName ?? '',
    vertical:              fields.vertical ?? 'default',
    location:              fields.location ?? '',
    website:               fields.website ?? '',
    publicEmail:           fields.publicEmail ?? '',
    publicPhone:           fields.publicPhone ?? '',
    source:                fields.source ?? 'MANUAL',
    sourceAttribution:     fields.sourceAttribution ?? '',
    stage:                 fields.stage ?? CRM_STAGE.NEW,
    status:                fields.status ?? CRM_LEAD_STATUS.ACTIVE,
    priority:              fields.priority ?? CRM_PRIORITY.P2_MEDIUM,
    opportunityScore:      fields.opportunityScore ?? 0,
    temperature:           fields.temperature ?? 'COLD',
    confidence:            fields.confidence ?? 0,
    dataQualityScore:      fields.dataQualityScore ?? 0,
    recommendedService:    fields.recommendedService ?? '',
    recommendedNextAction: fields.recommendedNextAction ?? '',
    digitalMaturityLevel:  fields.digitalMaturityLevel ?? 'UNKNOWN',
    painSignals:           Object.freeze([...(fields.painSignals ?? [])]),
    digitalSignals:        Object.freeze([...(fields.digitalSignals ?? [])]),
    accountId:             fields.accountId ?? '',
    opportunityId:         fields.opportunityId ?? '',
    ownerId:               fields.ownerId ?? '',
    notes:                 fields.notes ?? '',
    enteredCRMAt:          fields.enteredCRMAt ?? new Date().toISOString(),
    lastActivityAt:        fields.lastActivityAt ?? new Date().toISOString(),
    createdAt:             fields.createdAt ?? new Date().toISOString(),
    updatedAt:             fields.updatedAt ?? new Date().toISOString(),
    isReal:                false,
  });
}

export const CRM_LEAD_MODEL_VERSION = '1.0.0';
