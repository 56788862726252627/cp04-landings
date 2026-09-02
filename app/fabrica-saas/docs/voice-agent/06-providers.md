# ADV-11 Provider Architecture

## TelephonyProvider
Foundation stubs only (NO_REAL_CALLS=SI):
- TwilioProviderStub — throws if called
- SIPProviderStub — throws if called
- WebRTCProviderStub — throws if called
- FixtureVoiceProvider — simulation mode, returns simulated call objects

## TTSProvider
- SimulatedTTSProvider — returns {audioUrl: null, simulated: true, latencyMs: 80}
- Stubs: ElevenLabs, Google TTS, Azure TTS

## STTProvider
- SimulatedSTTProvider — returns {text: '', confidence: 0.90, simulated: true}
- Stubs: Whisper, Google STT, Azure STT

## VoiceProviderRouter
Routes by QUALITY, COST, LATENCY, or LANGUAGE criterion.
Default: LATENCY → SimulatedTTS + SimulatedSTT.

## LatencyBudget
- STT: 300ms, PLANNING: 100ms, TOOL_CALL: 500ms, LLM: 800ms, TTS: 200ms
- TOTAL BUDGET: 1900ms
