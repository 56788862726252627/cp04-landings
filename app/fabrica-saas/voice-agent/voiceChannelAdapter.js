// Voice Channel Adapter — ADV-11

export const CHANNEL_TYPE = Object.freeze({
  VOICE: 'VOICE',
  CHAT:  'CHAT',
});

export function adaptResponseForChannel(text = '', channel = CHANNEL_TYPE.VOICE) {
  if (channel === CHANNEL_TYPE.VOICE) {
    return text
      .replace(/\*\*/g, '')        // no markdown bold in voice
      .replace(/#+\s/g, '')        // no markdown headers
      .replace(/\n{2,}/g, '. ')   // paragraph breaks → sentence break
      .replace(/\n/g, ', ');       // line breaks → natural pause
  }
  return text;
}

export function isVoiceCompatible(text = '', maxWords = 50) {
  const words = text.trim().split(/\s+/).length;
  return words <= maxWords;
}

export function createVoiceChannelAdapter(channel = CHANNEL_TYPE.VOICE) {
  return Object.freeze({
    channel,
    adapt:          (text) => adaptResponseForChannel(text, channel),
    isCompatible:   (text) => isVoiceCompatible(text),
    isReal: false,
  });
}

export const VOICE_CHANNEL_ADAPTER_VERSION = '1.0.0';
