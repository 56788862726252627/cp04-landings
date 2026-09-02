// Lead Bridge — ADV-08 Lead Engine → ADV-09 CRM
// Converts scored leads into CRM lead records

import { createCRMLead, CRM_LEAD_STATUS, CRM_PRIORITY } from './crmLead.js';

export function convertLeadToCRMLead(scoredLead = {}) {
  const { lead = {}, scoreResult = {} } = scoredLead;

  const temperature = scoreResult.temperature ?? lead.temperature ?? 'COLD';
  const priority = temperature === 'HOT'    ? CRM_PRIORITY.P0_CRITICAL
                 : temperature === 'WARM'   ? CRM_PRIORITY.P1_HIGH
                 : temperature === 'COLD'   ? CRM_PRIORITY.P2_MEDIUM
                 : CRM_PRIORITY.P3_LOW;

  return createCRMLead({
    leadId:           lead.id ?? '',
    businessName:     lead.businessName ?? '',
    vertical:         lead.sector ?? lead.vertical ?? '',
    location:         lead.location ?? '',
    website:          lead.website ?? '',
    publicEmail:      lead.publicEmail ?? '',
    publicPhone:      lead.publicPhone ?? '',
    source:           lead.source ?? 'LEAD_ENGINE',
    sourceAttribution: scoreResult.source ?? '',
    temperature,
    opportunityScore: scoreResult.score ?? 0,
    confidence:       scoreResult.confidence ?? 0,
    status:           CRM_LEAD_STATUS.ACTIVE,
    priority,
  });
}

export function convertLeadsToCRMLeads(scoredLeads = []) {
  return Object.freeze(scoredLeads.map(convertLeadToCRMLead));
}

export const LEAD_BRIDGE_VERSION = '1.0.0';
