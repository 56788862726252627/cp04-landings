// Agent Evaluation Definition — ADV-10

export const AGENT_TYPE = Object.freeze({
  CHAT:     'CHAT',
  SALES:    'SALES',
  SUPPORT:  'SUPPORT',
  BOOKING:  'BOOKING',
  LEAD:     'LEAD',
  CRM:      'CRM',
  VOICE:    'VOICE',
});

export const EVAL_SCENARIO = Object.freeze({
  GOLDEN:      'GOLDEN',
  EDGE:        'EDGE',
  ADVERSARIAL: 'ADVERSARIAL',
  REGRESSION:  'REGRESSION',
  MULTITURN:   'MULTITURN',
  FAILURE:     'FAILURE',
});

export function createAgentEvaluationDefinition(fields = {}) {
  return Object.freeze({
    id:               fields.id ?? `eval_def_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    name:             fields.name ?? '',
    agentType:        fields.agentType ?? AGENT_TYPE.CHAT,
    vertical:         fields.vertical ?? 'general',
    scenario:         fields.scenario ?? EVAL_SCENARIO.GOLDEN,
    input:            fields.input ?? '',
    expectedBehavior: fields.expectedBehavior ?? '',
    dimensions:       Object.freeze([...(fields.dimensions ?? [])]),
    criticalRules:    Object.freeze([...(fields.criticalRules ?? [])]),
    dataset:          fields.dataset ?? '',
    evaluatorConfig:  Object.freeze({ ...(fields.evaluatorConfig ?? {}) }),
    version:          fields.version ?? '1.0.0',
    isReal: false,
  });
}

export const EVALUATION_DEFINITION_VERSION = '1.0.0';
