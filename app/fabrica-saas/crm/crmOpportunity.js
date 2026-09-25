// CRM Opportunity Model — ADV-09 CRM

import { CRM_STAGE } from './salesPipeline.js';
import { CRM_PRIORITY } from './crmLead.js';

export const PROBABILITY_BAND = Object.freeze({
  VERY_HIGH: 'VERY_HIGH',
  HIGH:      'HIGH',
  MEDIUM:    'MEDIUM',
  LOW:       'LOW',
  UNKNOWN:   'UNKNOWN',
});

export const CLOSE_WINDOW = Object.freeze({
  THIS_WEEK:    'THIS_WEEK',
  THIS_MONTH:   'THIS_MONTH',
  THIS_QUARTER: 'THIS_QUARTER',
  NEXT_QUARTER: 'NEXT_QUARTER',
  UNKNOWN:      'UNKNOWN',
});

export function createCRMOpportunity(fields = {}) {
  return Object.freeze({
    id:                    fields.id ?? `opp_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    leadId:                fields.leadId ?? '',
    crmLeadId:             fields.crmLeadId ?? '',
    accountId:             fields.accountId ?? '',
    businessName:          fields.businessName ?? '',
    vertical:              fields.vertical ?? 'default',
    service:               fields.service ?? '',
    stage:                 fields.stage ?? CRM_STAGE.NEW,
    priority:              fields.priority ?? CRM_PRIORITY.P2_MEDIUM,
    opportunityScore:      fields.opportunityScore ?? 0,
    estimatedSetupLow:     fields.estimatedSetupLow ?? 0,
    estimatedSetupHigh:    fields.estimatedSetupHigh ?? 0,
    estimatedMonthlyLow:   fields.estimatedMonthlyLow ?? 0,
    estimatedMonthlyHigh:  fields.estimatedMonthlyHigh ?? 0,
    confidence:            fields.confidence ?? 0,
    probabilityBand:       fields.probabilityBand ?? PROBABILITY_BAND.UNKNOWN,
    expectedCloseWindow:   fields.expectedCloseWindow ?? CLOSE_WINDOW.UNKNOWN,
    nextAction:            fields.nextAction ?? '',
    ownerId:               fields.ownerId ?? '',
    notes:                 fields.notes ?? '',
    stageHistory:          Object.freeze([...(fields.stageHistory ?? [])]),
    createdAt:             fields.createdAt ?? new Date().toISOString(),
    updatedAt:             fields.updatedAt ?? new Date().toISOString(),
    lastActivityAt:        fields.lastActivityAt ?? new Date().toISOString(),
    staleAt:               fields.staleAt ?? '',
    closeWindowDays:       fields.closeWindowDays ?? 90,
    dealValueEstimate:     fields.dealValueEstimate ? Object.freeze({ ...fields.dealValueEstimate }) : null,
    isReal:                false,
  });
}

export function updateOpportunityStage(opportunity = {}, newStage = '', reason = '') {
  const now = new Date().toISOString();
  const historyEntry = Object.freeze({ from: opportunity.stage, to: newStage, at: now, reason });
  return Object.freeze({
    ...opportunity,
    stage: newStage,
    updatedAt: now,
    lastActivityAt: now,
    stageHistory: Object.freeze([...(opportunity.stageHistory ?? []), historyEntry]),
    isReal: false,
  });
}

export const CRM_OPPORTUNITY_VERSION = '1.0.0';
