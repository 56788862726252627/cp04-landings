# ADV-11 Voice Observability

## VoiceObservabilityBridge (connects ADV-01)
8 event types:
- VOICE_CALL_STARTED
- VOICE_CALL_ENDED
- VOICE_TURN_COMPLETED
- VOICE_INTENT_DETECTED
- VOICE_FACT_RESOLVED
- VOICE_SAFETY_VIOLATION
- VOICE_HANDOFF_TRIGGERED
- VOICE_LATENCY_OVER_BUDGET

## VoiceLangfuseBridge (connects ADV-10)
- mapVoiceCallToLangfuseTrace() — full call trace with quality metadata
- mapVoiceTurnToLangfuseSpan() — per-turn span with latency

## VoiceAutomationManifest (Make bridge — foundation)
4 Make events: voice.call.completed, voice.booking.created, voice.lead.qualified, voice.handoff.requested
All payloads include: simulated:true, noRealWebhook:true
