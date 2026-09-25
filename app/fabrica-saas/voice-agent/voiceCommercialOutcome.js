// Voice Commercial Outcome — ADV-11

export const COMMERCIAL_OUTCOME = Object.freeze({
  QUALIFIED:       'QUALIFIED',
  FOLLOW_UP:       'FOLLOW_UP',
  BOOKING_INTENT:  'BOOKING_INTENT',
  BOOKING_CONFIRMED:'BOOKING_CONFIRMED',
  NOT_INTERESTED:  'NOT_INTERESTED',
  TRANSFERRED:     'TRANSFERRED',
  UNKNOWN:         'UNKNOWN',
});

export function classifyCommercialOutcome(callReport = {}) {
  if (callReport.taskCompleted && callReport.intentDetected === 'BOOKING') {
    return COMMERCIAL_OUTCOME.BOOKING_CONFIRMED;
  }
  if (callReport.handoffRequired) return COMMERCIAL_OUTCOME.TRANSFERRED;
  if (callReport.taskCompleted)   return COMMERCIAL_OUTCOME.QUALIFIED;
  if (callReport.durationMs > 60000) return COMMERCIAL_OUTCOME.FOLLOW_UP;
  return COMMERCIAL_OUTCOME.UNKNOWN;
}

export function createVoiceCommercialOutcome(callReport = {}) {
  return Object.freeze({
    outcome:    classifyCommercialOutcome(callReport),
    callId:     callReport.callId   ?? null,
    clientId:   callReport.clientId ?? null,
    isReal: false,
  });
}

export const VOICE_COMMERCIAL_OUTCOME_VERSION = '1.0.0';
