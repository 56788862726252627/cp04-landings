// Voice Provider — ADV-11
// Foundation abstraction + FixtureVoiceProvider (no real calls)

export const VOICE_PROVIDER_TYPE = Object.freeze({
  FIXTURE:  'FIXTURE',
  TWILIO:   'TWILIO',    // not wired
  SIP:      'SIP',       // not wired
  WEBRTC:   'WEBRTC',    // not wired
});

export const PROVIDER_STATUS = Object.freeze({
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  READY:          'READY',
  SIMULATED:      'SIMULATED',
});

// eslint-disable-next-line no-unused-vars
export function createFixtureVoiceProvider(config = {}) {
  return Object.freeze({
    type:          VOICE_PROVIDER_TYPE.FIXTURE,
    status:        PROVIDER_STATUS.SIMULATED,
    noRealCalls:   true,
    capabilities:  Object.freeze(['tts_simulate', 'stt_simulate', 'call_simulate']),
    makeCall:      (to, from) => Object.freeze({ callId: `sim-${Date.now()}`, to, from, simulated: true, isReal: false }),
    hangUp:        (callId)   => Object.freeze({ callId, ended: true, isReal: false }),
    isReal: false,
  });
}

export function createVoiceProviderStub(type = VOICE_PROVIDER_TYPE.TWILIO) {
  return Object.freeze({
    type,
    status:      PROVIDER_STATUS.NOT_CONFIGURED,
    noRealCalls: true,
    makeCall:    () => { throw new Error(`${type} not configured — NO_REAL_CALLS=SI`); },
    isReal: false,
  });
}

export const VOICE_PROVIDER_VERSION = '1.0.0';
