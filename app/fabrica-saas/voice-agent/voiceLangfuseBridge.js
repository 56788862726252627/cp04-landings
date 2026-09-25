// Voice Langfuse Bridge — ADV-11

export function mapVoiceCallToLangfuseTrace(callReport = {}) {
  return Object.freeze({
    traceId:   callReport.callId ?? `voice-${Date.now()}`,
    name:      'voice_agent_call',
    input:     Object.freeze({ clientId: callReport.clientId }),
    output:    Object.freeze({ finalState: callReport.finalState, taskCompleted: callReport.taskCompleted }),
    metadata:  Object.freeze({
      durationMs:      callReport.durationMs,
      turns:           callReport.turns,
      intentDetected:  callReport.intentDetected,
      handoffRequired: callReport.handoffRequired,
      qualityScore:    callReport.qualityScore,
      humannessScore:  callReport.humannessScore,
      safetyViolations:callReport.safetyViolations,
    }),
    isReal: false,
  });
}

export function mapVoiceTurnToLangfuseSpan(turn = {}) {
  return Object.freeze({
    spanId:  turn.id ?? `turn-${Date.now()}`,
    name:    'voice_turn',
    input:   Object.freeze({ userText: turn.userText }),
    output:  Object.freeze({ agentText: turn.agentText, intent: turn.intent }),
    latency: turn.latencyMs ?? 0,
    isReal: false,
  });
}

export const VOICE_LANGFUSE_BRIDGE_VERSION = '1.0.0';
