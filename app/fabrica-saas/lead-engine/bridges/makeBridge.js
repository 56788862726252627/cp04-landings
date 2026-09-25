// Make Bridge — ADV-08 (Lead → Make automation manifest)
// Does NOT create real Make scenarios — manifest only

export const LEAD_AUTOMATION_EVENT = Object.freeze({
  NEW_LEAD:           'newLead',
  LEAD_ENRICHED:      'leadEnriched',
  LEAD_SCORED:        'leadScored',
  HOT_LEAD:           'hotLead',
  LEAD_NEEDS_REVIEW:  'leadNeedsReview',
});

export function createLeadAutomationManifest(lead = {}, options = {}) {
  const events = [];

  events.push(LEAD_AUTOMATION_EVENT.NEW_LEAD);
  if ((lead.dataQualityScore ?? 0) >= 50) events.push(LEAD_AUTOMATION_EVENT.LEAD_ENRICHED);
  if ((lead.opportunityScore ?? 0) > 0)   events.push(LEAD_AUTOMATION_EVENT.LEAD_SCORED);
  if (lead.temperature === 'HOT')         events.push(LEAD_AUTOMATION_EVENT.HOT_LEAD);
  if ((lead.confidence ?? 0) < 30 && (lead.opportunityScore ?? 0) >= 50) {
    events.push(LEAD_AUTOMATION_EVENT.LEAD_NEEDS_REVIEW);
  }

  return Object.freeze({
    leadId:           lead.id ?? '',
    businessName:     lead.businessName ?? '',
    triggeredEvents:  Object.freeze(events),
    destination:      options.destination ?? 'INTERNAL_QUEUE',
    requiresAuth:     true,
    note:             'Manifest only — no real Make scenario will be triggered without explicit setup and authorization.',
    isReal: false,
  });
}

export const MAKE_BRIDGE_VERSION = '1.0.0';
