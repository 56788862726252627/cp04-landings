// Voice Provider Router — ADV-11

import { createSimulatedTTSProvider, TTS_PROVIDER_TYPE } from './ttsProvider.js';
import { createSimulatedSTTProvider, STT_PROVIDER_TYPE } from './sttProvider.js';

export const ROUTING_CRITERION = Object.freeze({
  QUALITY:   'QUALITY',
  COST:      'COST',
  LATENCY:   'LATENCY',
  LANGUAGE:  'LANGUAGE',
});

export function createVoiceProviderRouter(config = {}) {
  const criterion = config.criterion ?? ROUTING_CRITERION.LATENCY;

  function selectTTS(language = 'es-ES') {
    return Object.freeze({
      provider:   createSimulatedTTSProvider(),
      type:       TTS_PROVIDER_TYPE.SIMULATED,
      criterion,
      language,
      isReal: false,
    });
  }

  function selectSTT(language = 'es-ES') {
    return Object.freeze({
      provider:   createSimulatedSTTProvider(),
      type:       STT_PROVIDER_TYPE.SIMULATED,
      criterion,
      language,
      isReal: false,
    });
  }

  return Object.freeze({ selectTTS, selectSTT, criterion, isReal: false });
}

export const VOICE_PROVIDER_ROUTER_VERSION = '1.0.0';
