/* eslint-disable no-unused-vars */
// Media TTS Bridge — ADV-13 (bridges ADV-11 voice agent)

export const TTS_PROVIDER_STATUS = Object.freeze({
  AVAILABLE:        'AVAILABLE',
  CONFIG_REQUIRED:  'CONFIG_REQUIRED',
  FIXTURE_ONLY:     'FIXTURE_ONLY',
});

export function createTTSRequest(config = {}) {
  if (!config.text)        throw new Error('TTSRequest requires text');
  if (!config.voiceProfile) throw new Error('TTSRequest requires voiceProfile');
  return Object.freeze({
    text:         config.text,
    voiceProfile: config.voiceProfile,
    language:     config.voiceProfile.locale ?? 'es-ES',
    outputFormat: config.outputFormat ?? 'mp3',
    isReal:       false,
  });
}

export function synthesizeSpeech(ttsRequest) {
  return Object.freeze({
    assetRef:  `fixture://tts/${ttsRequest.voiceProfile.id}/output.mp3`,
    durationMs: Math.ceil(ttsRequest.text.split(/\s+/).length * 400),
    voiceId:   ttsRequest.voiceProfile.id,
    isReal:    false,
  });
}

export const MEDIA_TTS_BRIDGE_VERSION = '1.0.0';
