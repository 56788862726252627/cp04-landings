// Agent Evaluation Dataset — ADV-10

export const DATASET_CASE_TYPE = Object.freeze({
  FIXTURE:     'FIXTURE',
  GOLDEN:      'GOLDEN',
  EDGE:        'EDGE',
  ADVERSARIAL: 'ADVERSARIAL',
  SALES:       'SALES',
  SUPPORT:     'SUPPORT',
  BOOKING:     'BOOKING',
  LEAD:        'LEAD',
  VOICE:       'VOICE',
});

export function createEvaluationCase(fields = {}) {
  return Object.freeze({
    id:               fields.id ?? `case_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    caseType:         fields.caseType ?? DATASET_CASE_TYPE.GOLDEN,
    agentType:        fields.agentType ?? 'CHAT',
    vertical:         fields.vertical ?? 'general',
    userInput:        fields.userInput ?? '',
    agentResponse:    fields.agentResponse ?? '',
    context:          Object.freeze({ ...(fields.context ?? {}) }),
    expectedResult:   fields.expectedResult ?? 'PASS',
    criticalRules:    Object.freeze([...(fields.criticalRules ?? [])]),
    tags:             Object.freeze([...(fields.tags ?? [])]),
    isReal: false,
  });
}

export function createAgentEvaluationDataset(fields = {}) {
  const cases = fields.cases ?? [];
  return Object.freeze({
    id:          fields.id ?? `dataset_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    name:        fields.name ?? 'Agent Evaluation Dataset',
    version:     fields.version ?? '1.0.0',
    cases:       Object.freeze([...cases]),
    totalCases:  cases.length,
    golden:      cases.filter(c => c.caseType === DATASET_CASE_TYPE.GOLDEN).length,
    edge:        cases.filter(c => c.caseType === DATASET_CASE_TYPE.EDGE).length,
    adversarial: cases.filter(c => c.caseType === DATASET_CASE_TYPE.ADVERSARIAL).length,
    isReal: false,
  });
}

export const EVALUATION_DATASET_VERSION = '1.0.0';
