// Voice Automation Manifest — ADV-11 (Make bridge foundation, not wired)

export const VOICE_MAKE_EVENT = Object.freeze({
  CALL_COMPLETED:   'voice.call.completed',
  BOOKING_CREATED:  'voice.booking.created',
  LEAD_QUALIFIED:   'voice.lead.qualified',
  HANDOFF_REQUESTED:'voice.handoff.requested',
});

export function buildVoiceMakePayload(eventType = '', callReport = {}) {
  return Object.freeze({
    event:     eventType,
    callId:    callReport.callId    ?? null,
    clientId:  callReport.clientId  ?? null,
    timestamp: Date.now(),
    simulated: true,
    noRealWebhook: true,
    data:      Object.freeze({
      finalState:      callReport.finalState,
      taskCompleted:   callReport.taskCompleted,
      intentDetected:  callReport.intentDetected,
      handoffRequired: callReport.handoffRequired,
    }),
    isReal: false,
  });
}

export const VOICE_AUTOMATION_MANIFEST_VERSION = '1.0.0';
