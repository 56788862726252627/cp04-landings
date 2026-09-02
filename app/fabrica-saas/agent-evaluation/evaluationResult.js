// Evaluation Result — ADV-10

export const EVAL_STATUS = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export function deriveStatus(weightedScore = 0, criticalFailures = [], warnings = []) {
  if (criticalFailures.length > 0) return EVAL_STATUS.BLOCKED;
  if (weightedScore >= 85) return warnings.length > 0 ? EVAL_STATUS.WARNING : EVAL_STATUS.PASS;
  if (weightedScore >= 70) return EVAL_STATUS.WARNING;
  return EVAL_STATUS.FAIL;
}

export function createAgentEvaluationResult(fields = {}) {
  const criticalFailures = fields.criticalFailures ?? [];
  const warnings         = fields.warnings ?? [];
  const weightedScore    = fields.weightedScore ?? 0;
  const status           = fields.status ?? deriveStatus(weightedScore, criticalFailures, warnings);

  return Object.freeze({
    evaluationId:       fields.evaluationId ?? `eval_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    agentId:            fields.agentId ?? '',
    scenarioId:         fields.scenarioId ?? '',
    agentType:          fields.agentType ?? '',
    vertical:           fields.vertical ?? '',
    scores:             Object.freeze([...(fields.scores ?? [])]),
    weightedScore,
    criticalFailures:   Object.freeze([...criticalFailures]),
    warnings:           Object.freeze([...warnings]),
    latencyMs:          fields.latencyMs ?? 0,
    inputTokens:        fields.inputTokens ?? 0,
    outputTokens:       fields.outputTokens ?? 0,
    estimatedCostUSD:   fields.estimatedCostUSD ?? 0,
    toolCallCount:      fields.toolCallCount ?? 0,
    escalationTriggered:fields.escalationTriggered ?? false,
    status,
    timestamp:          fields.timestamp ?? new Date().toISOString(),
    isReal: false,
  });
}

export const EVALUATION_RESULT_VERSION = '1.0.0';
