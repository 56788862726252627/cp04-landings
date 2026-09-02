// Observability Bridge — Agent Evaluation events — ADV-10

import { redactObject } from '../redactionPolicy.js';

const EVAL_EVENT_TYPES = Object.freeze({
  EVAL_STARTED:   'EVAL_STARTED',
  EVAL_COMPLETED: 'EVAL_COMPLETED',
  EVAL_BLOCKED:   'EVAL_BLOCKED',
  GATE_PASSED:    'GATE_PASSED',
  GATE_FAILED:    'GATE_FAILED',
  REGRESSION:     'REGRESSION',
});

export function buildEvaluationEvent(type, payload = {}) {
  const sanitized = redactObject(payload);
  return Object.freeze({
    type:      type,
    payload:   sanitized,
    timestamp: new Date().toISOString(),
    isReal:    false,
  });
}

export function emitEvaluationStarted(caseId, agentType) {
  return buildEvaluationEvent(EVAL_EVENT_TYPES.EVAL_STARTED, { caseId, agentType });
}

export function emitEvaluationCompleted(caseId, status, score) {
  return buildEvaluationEvent(EVAL_EVENT_TYPES.EVAL_COMPLETED, { caseId, status, score });
}

export function emitEvaluationBlocked(caseId, criticalFailures) {
  return buildEvaluationEvent(EVAL_EVENT_TYPES.EVAL_BLOCKED, { caseId, criticalFailureCount: criticalFailures.length });
}

export function emitGateResult(pass, blocks) {
  const type = pass ? EVAL_EVENT_TYPES.GATE_PASSED : EVAL_EVENT_TYPES.GATE_FAILED;
  return buildEvaluationEvent(type, { pass, blockCount: blocks.length });
}

export const EvalObservabilityBridge = Object.freeze({
  EVAL_EVENT_TYPES,
  buildEvaluationEvent,
  emitEvaluationStarted,
  emitEvaluationCompleted,
  emitEvaluationBlocked,
  emitGateResult,
  isReal: false,
});

export const OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
