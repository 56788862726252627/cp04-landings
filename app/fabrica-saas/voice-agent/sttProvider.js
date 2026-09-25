// STT Provider — ADV-11
// Foundation stubs: Whisper/Google/Azure — SIMULATION ONLY

/* eslint-disable no-unused-vars */

export const STT_PROVIDER_TYPE = Object.freeze({
  WHISPER:    'WHISPER',
  GOOGLE_STT: 'GOOGLE_STT',
  AZURE_STT:  'AZURE_STT',
  SIMULATED:  'SIMULATED',
});

export function createSimulatedSTTProvider() {
  return Object.freeze({
    type: STT_PROVIDER_TYPE.SIMULATED,
    transcribe: (audioData, language, options) => Object.freeze({
      text:       audioData?.simulatedText ?? '',
      confidence: 0.90,
      language:   language ?? 'es-ES',
      simulated:  true,
      latencyMs:  120,
      isReal: false,
    }),
    isReal: false,
  });
}

export function createSTTProviderStub(type = STT_PROVIDER_TYPE.WHISPER) {
  return Object.freeze({
    type,
    transcribe: (audioData, language, options) => { throw new Error(`${type} STT not configured`); },
    isReal: false,
  });
}

export const STT_PROVIDER_VERSION = '1.0.0';
