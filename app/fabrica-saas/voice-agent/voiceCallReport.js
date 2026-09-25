// Voice Call Report — ADV-11

export function createVoiceCallReport(callData = {}) {
  return Object.freeze({
    callId:          callData.callId           ?? `report-${Date.now()}`,
    clientId:        callData.clientId         ?? null,
    durationMs:      callData.durationMs       ?? 0,
    turns:           callData.turns            ?? 0,
    finalState:      callData.finalState       ?? 'UNKNOWN',
    intentDetected:  callData.intentDetected   ?? null,
    taskCompleted:   callData.taskCompleted    ?? false,
    handoffRequired: callData.handoffRequired  ?? false,
    qualityScore:    callData.qualityScore     ?? null,
    humannessScore:  callData.humannessScore   ?? null,
    costEstimate:    callData.costEstimate     ?? null,
    transcript:      callData.transcript       ?? [],
    safetyViolations:callData.safetyViolations ?? [],
    isReal: false,
  });
}

export const VOICE_CALL_REPORT_VERSION = '1.0.0';
