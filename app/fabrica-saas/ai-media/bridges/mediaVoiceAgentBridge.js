// Media Voice Agent Bridge — ADV-13 (bridges ADV-11 Voice Agent)

export function reuseVoicePersonality(voiceAgentProfile) {
  if (!voiceAgentProfile) throw new Error('reuseVoicePersonality requires voiceAgentProfile');
  return Object.freeze({
    voiceId:       voiceAgentProfile.id ?? 'default',
    accent:        voiceAgentProfile.accent        ?? 'NEUTRAL',
    speechStyle:   voiceAgentProfile.speechStyle   ?? 'PROFESSIONAL',
    pace:          voiceAgentProfile.pace          ?? 'NORMAL',
    expressiveness:voiceAgentProfile.expressiveness ?? 'MODERATE',
    adv11Bridge:   'VOICE_AGENT_CONNECTED',
    isReal: false,
  });
}

export const MEDIA_VOICE_AGENT_BRIDGE_VERSION = '1.0.0';
