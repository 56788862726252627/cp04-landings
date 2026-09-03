// Agent Handoff — ADV-17

export const HANDOFF_TYPE = Object.freeze({
  CHAT_TO_BOOKING:     'CHAT_TO_BOOKING',
  LEAD_TO_SALES:       'LEAD_TO_SALES',
  SALES_TO_CRM:        'SALES_TO_CRM',
  SUPPORT_TO_HUMAN:    'SUPPORT_TO_HUMAN',
  VOICE_TO_BOOKING:    'VOICE_TO_BOOKING',
  CONTENT_TO_MEDIA:    'CONTENT_TO_MEDIA',
  SOCIAL_TO_MEDIA:     'SOCIAL_TO_MEDIA',
  QA_TO_SUPERVISOR:    'QA_TO_SUPERVISOR',
  ANY_TO_SUPERVISOR:   'ANY_TO_SUPERVISOR',
});

export const HANDOFF_REASON = Object.freeze({
  TASK_COMPLETE:       'TASK_COMPLETE',
  SPECIALIST_REQUIRED: 'SPECIALIST_REQUIRED',
  ESCALATION:          'ESCALATION',
  CAPABILITY_LIMIT:    'CAPABILITY_LIMIT',
  HUMAN_REQUIRED:      'HUMAN_REQUIRED',
  ERROR:               'ERROR',
});

export function createAgentHandoff(config = {}) {
  const {
    fromAgent        = null,
    toAgent          = null,
    handoffType      = HANDOFF_TYPE.ANY_TO_SUPERVISOR,
    reason           = HANDOFF_REASON.TASK_COMPLETE,
    taskState        = {},
    facts            = [],
    pendingQuestions = [],
    permissions      = [],
    requiredAction   = '',
  } = config;

  return Object.freeze({
    fromAgent:       fromAgent?.id ?? fromAgent,
    toAgent:         toAgent?.id   ?? toAgent,
    handoffType,
    reason,
    taskState:       Object.freeze({ ...taskState }),
    facts:           Object.freeze([...facts]),        // only structured conclusions
    pendingQuestions: Object.freeze([...pendingQuestions]),
    permissions:     Object.freeze([...permissions]),
    requiredAction,
    timestamp:       new Date().toISOString(),
    isReal:          false,
  });
}

export const AGENT_HANDOFF_VERSION = '1.0.0';
