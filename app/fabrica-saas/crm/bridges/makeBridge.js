// Make.com Bridge — CRM Automation Manifest

export const MAKE_CRM_TRIGGER = Object.freeze({
  STAGE_CHANGED:     'crm.stage_changed',
  DEAL_WON:          'crm.deal_won',
  DEAL_LOST:         'crm.deal_lost',
  OPPORTUNITY_STALE: 'crm.opportunity_stale',
  TASK_OVERDUE:      'crm.task_overdue',
  PROPOSAL_SENT:     'crm.proposal_sent',
});

export function createCRMAutomationManifest(opportunity = {}, trigger = MAKE_CRM_TRIGGER.STAGE_CHANGED) {
  return Object.freeze({
    trigger,
    opportunityId: opportunity.id ?? '',
    businessName:  opportunity.businessName ?? '',
    fromStage:     opportunity.prevStage ?? '',
    toStage:       opportunity.stage ?? '',
    priority:      opportunity.priority ?? 'P2',
    assignedTo:    opportunity.assignedTo ?? '',
    webhookPayloadSpec: Object.freeze({
      event:         trigger,
      opportunityId: 'string',
      businessName:  'string',
      stage:         'string',
      timestamp:     'ISO8601',
    }),
    note:          'Automation manifest only — no Make.com scenario triggered from this module.',
    isReal: false,
  });
}

export const MAKE_BRIDGE_VERSION = '1.0.0';
