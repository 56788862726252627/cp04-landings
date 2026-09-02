// Agent Engine Bridge — CRM ↔ ADV-03 Agent Engine

export const CRM_AGENT_TASK_TYPE = Object.freeze({
  QUALIFY_LEAD:       'QUALIFY_LEAD',
  RESEARCH_ACCOUNT:   'RESEARCH_ACCOUNT',
  DRAFT_PROPOSAL:     'DRAFT_PROPOSAL',
  ANALYZE_WIN_LOSS:   'ANALYZE_WIN_LOSS',
  FORECAST_PIPELINE:  'FORECAST_PIPELINE',
});

export function createAgentEngineTask(opportunity = {}, taskType = CRM_AGENT_TASK_TYPE.QUALIFY_LEAD) {
  return Object.freeze({
    taskId:        `agent_task_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    taskType,
    opportunityId: opportunity.id ?? '',
    businessName:  opportunity.businessName ?? '',
    stage:         opportunity.stage ?? '',
    priority:      opportunity.priority ?? 'P2',
    context:       Object.freeze({
      sector:      opportunity.sector ?? '',
      temperature: opportunity.temperature ?? 'COLD',
      score:       opportunity.opportunityScore ?? 0,
    }),
    createdAt:     new Date().toISOString(),
    note:          'Agent task specification only — no agent execution triggered.',
    isReal: false,
  });
}

export const AGENT_ENGINE_BRIDGE_VERSION = '1.0.0';
