# ADV-11 Cost Guardrails

## Hard Rule: NO_REAL_COST=SI
ALL cost estimates in ADV-11 are simulation-only (EUR = 0.00).
No billing activation, no real Twilio minutes, no real TTS charges.

## VoiceCostGuard
COST_GATE_TYPE: TTS_CHARS, STT_SECONDS, LLM_TOKENS, TELEPHONY_MIN
All rates = 0 EUR in simulation mode.
approveCost() always returns SIMULATED status.

## VoiceCostEstimate
COST_STATE: FREE (0 EUR), ESTIMATED, UNKNOWN, PAID (future only)
ZERO_COST_ESTIMATE exported as default.

## Future Production Path
When ready for real deployment:
1. Configure TelephonyProvider with real Twilio credentials
2. Configure TTSProvider with real ElevenLabs/Google key
3. Set NO_REAL_CALLS=NO and activate cost metering
4. All cost gates will enforce real approval workflows
