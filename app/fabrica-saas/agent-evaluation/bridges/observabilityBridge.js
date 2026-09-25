// Observability Bridge — Agent Evaluation events — ADV-10

import { redactObject } from '../redactionPolicy.js';

const EVAL_EVENT_TYPES = Object.freeze({
  EVAL_STARTED:              'EVAL_STARTED',
  EVAL_COMPLETED:            'EVAL_COMPLETED',
  EVAL_BLOCKED:              'EVAL_BLOCKED',
  GATE_PASSED:               'GATE_PASSED',
  GATE_FAILED:               'GATE_FAILED',
  REGRESSION:                'REGRESSION',
  // ADV-10b: business truth events
  BUSINESS_FACT_RESOLVED:    'BUSINESS_FACT_RESOLVED',
  BUSINESS_FACT_UNKNOWN:     'BUSINESS_FACT_UNKNOWN',
  BUSINESS_FACT_CONFLICT:    'BUSINESS_FACT_CONFLICT',
  AVAILABILITY_CHECKED:      'AVAILABILITY_CHECKED',
  UNSUPPORTED_CLAIM_BLOCKED: 'UNSUPPORTED_CLAIM_BLOCKED',
  FACT_LEAK_BLOCKED:         'FACT_LEAK_BLOCKED',
  STALE_FACT_DETECTED:       'STALE_FACT_DETECTED',
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

export function emitBusinessFactResolved(factKey, source, clientId) {
  return buildEvaluationEvent(EVAL_EVENT_TYPES.BUSINESS_FACT_RESOLVED, { factKey, source, clientId });
}

export function emitBusinessFactUnknown(factKey, clientId) {
  return buildEvaluationEvent(EVAL_EVENT_TYPES.BUSINESS_FACT_UNKNOWN, { factKey, clientId });
}

export function emitBusinessFactConflict(factKey, sources, clientId) {
  return buildEvaluationEvent(EVAL_EVENT_TYPES.BUSINESS_FACT_CONFLICT, { factKey, sourceCount: sources?.length ?? 0, clientId });
}

export function emitAvailabilityChecked(status, claimedDay, scheduleProvider) {
  return buildEvaluationEvent(EVAL_EVENT_TYPES.AVAILABILITY_CHECKED, { status, claimedDay, hasProvider: !!scheduleProvider });
}

export function emitUnsupportedClaimBlocked(claimType, reason) {
  return buildEvaluationEvent(EVAL_EVENT_TYPES.UNSUPPORTED_CLAIM_BLOCKED, { claimType, reason });
}

export function emitFactLeakBlocked(expectedClientId, detectedClientId) {
  return buildEvaluationEvent(EVAL_EVENT_TYPES.FACT_LEAK_BLOCKED, { expectedClientId, detectedClientId });
}

export function emitStaleFactDetected(factKey, freshnessStatus) {
  return buildEvaluationEvent(EVAL_EVENT_TYPES.STALE_FACT_DETECTED, { factKey, freshnessStatus });
}

export const EvalObservabilityBridge = Object.freeze({
  EVAL_EVENT_TYPES,
  buildEvaluationEvent,
  emitEvaluationStarted,
  emitEvaluationCompleted,
  emitEvaluationBlocked,
  emitGateResult,
  emitBusinessFactResolved,
  emitBusinessFactUnknown,
  emitBusinessFactConflict,
  emitAvailabilityChecked,
  emitUnsupportedClaimBlocked,
  emitFactLeakBlocked,
  emitStaleFactDetected,
  isReal: false,
});

export const OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
