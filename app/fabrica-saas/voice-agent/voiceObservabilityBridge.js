// Voice Observability Bridge — ADV-11 (connects ADV-01)

export const VOICE_EVENT_TYPE = Object.freeze({
  CALL_STARTED:        'VOICE_CALL_STARTED',
  CALL_ENDED:          'VOICE_CALL_ENDED',
  TURN_COMPLETED:      'VOICE_TURN_COMPLETED',
  INTENT_DETECTED:     'VOICE_INTENT_DETECTED',
  FACT_RESOLVED:       'VOICE_FACT_RESOLVED',
  SAFETY_VIOLATION:    'VOICE_SAFETY_VIOLATION',
  HANDOFF_TRIGGERED:   'VOICE_HANDOFF_TRIGGERED',
  LATENCY_OVER_BUDGET: 'VOICE_LATENCY_OVER_BUDGET',
});

function buildEvent(type = '', payload = {}) {
  return Object.freeze({ type, payload: Object.freeze(payload), at: Date.now(), isReal: false });
}

export const VoiceObservabilityBridge = Object.freeze({
  emitCallStarted:       (callId, clientId)           => buildEvent(VOICE_EVENT_TYPE.CALL_STARTED,        { callId, clientId }),
  emitCallEnded:         (callId, report)              => buildEvent(VOICE_EVENT_TYPE.CALL_ENDED,          { callId, report }),
  emitTurnCompleted:     (callId, turn)                => buildEvent(VOICE_EVENT_TYPE.TURN_COMPLETED,      { callId, turn }),
  emitIntentDetected:    (callId, intent, confidence)  => buildEvent(VOICE_EVENT_TYPE.INTENT_DETECTED,     { callId, intent, confidence }),
  emitFactResolved:      (callId, factKey, status)     => buildEvent(VOICE_EVENT_TYPE.FACT_RESOLVED,       { callId, factKey, status }),
  emitSafetyViolation:   (callId, violations)          => buildEvent(VOICE_EVENT_TYPE.SAFETY_VIOLATION,    { callId, violations }),
  emitHandoffTriggered:  (callId, trigger)             => buildEvent(VOICE_EVENT_TYPE.HANDOFF_TRIGGERED,   { callId, trigger }),
  emitLatencyOverBudget: (callId, budget)              => buildEvent(VOICE_EVENT_TYPE.LATENCY_OVER_BUDGET,  { callId, budget }),
});

export const VOICE_OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
