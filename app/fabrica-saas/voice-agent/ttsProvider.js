// TTS Provider — ADV-11
// Foundation stubs: ElevenLabs/Google/Azure — SIMULATION ONLY

/* eslint-disable no-unused-vars */

export const TTS_PROVIDER_TYPE = Object.freeze({
  ELEVENLABS:  'ELEVENLABS',
  GOOGLE_TTS:  'GOOGLE_TTS',
  AZURE_TTS:   'AZURE_TTS',
  SIMULATED:   'SIMULATED',
});

export const TTS_PROVIDER_STATUS = Object.freeze({
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  SIMULATED:      'SIMULATED',
});

export function createSimulatedTTSProvider() {
  return Object.freeze({
    type:     TTS_PROVIDER_TYPE.SIMULATED,
    status:   TTS_PROVIDER_STATUS.SIMULATED,
    synthesize: (text, voice, options) => Object.freeze({
      audioUrl: null, text, voice, simulated: true, latencyMs: 80, isReal: false,
    }),
    isReal: false,
  });
}

export function createTTSProviderStub(type = TTS_PROVIDER_TYPE.ELEVENLABS) {
  return Object.freeze({
    type,
    status:     TTS_PROVIDER_STATUS.NOT_CONFIGURED,
    synthesize: (text, voice, options) => { throw new Error(`${type} TTS not configured`); },
    isReal: false,
  });
}

export const TTS_PROVIDER_VERSION = '1.0.0';
