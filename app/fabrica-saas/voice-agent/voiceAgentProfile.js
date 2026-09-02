// Voice Agent Profile — ADV-11

export const VOICE_PERSONALITY = Object.freeze({
  WARM_PROFESSIONAL: 'WARM_PROFESSIONAL',
  CALM_PRECISE:      'CALM_PRECISE',
  FRIENDLY_ENERGETIC:'FRIENDLY_ENERGETIC',
  WARM_PREMIUM:      'WARM_PREMIUM',
  EMPATHETIC:        'EMPATHETIC',
  NEUTRAL:           'NEUTRAL',
});

export const SPEAKING_STYLE = Object.freeze({
  CONVERSATIONAL: 'CONVERSATIONAL',
  CONSULTIVE:     'CONSULTIVE',
  SUPPORTIVE:     'SUPPORTIVE',
  TRANSACTIONAL:  'TRANSACTIONAL',
});

export const SPEECH_RATE = Object.freeze({
  SLOW:    'SLOW',
  NATURAL: 'NATURAL',
  FAST:    'FAST',
});

export const FORMALITY = Object.freeze({
  INFORMAL:  'INFORMAL',
  NEUTRAL:   'NEUTRAL',
  FORMAL:    'FORMAL',
});

export const INTERRUPTION_POLICY = Object.freeze({
  ALLOW_IMMEDIATE:   'ALLOW_IMMEDIATE',
  ALLOW_AT_PAUSE:    'ALLOW_AT_PAUSE',
  COMPLETE_SENTENCE: 'COMPLETE_SENTENCE',
});

export const CHANNEL = Object.freeze({
  VOICE: 'VOICE',
  CHAT:  'CHAT',
  BOTH:  'BOTH',
});

export function createVoiceAgentProfile(config = {}) {
  return Object.freeze({
    name:                config.name                ?? 'Asistente IA',
    businessName:        config.businessName        ?? 'Negocio',
    id:                  config.id                  ?? 'fixture-voice-agent',
    clientId:            config.clientId            ?? 'fixture-client',
    businessId:          config.businessId          ?? 'fixture-business',
    vertical:            config.vertical            ?? 'general',
    language:            config.language            ?? 'es',
    locale:              config.locale              ?? 'es-ES',
    accentProfile:       config.accentProfile       ?? 'es-ES-neutral',
    voicePersonality:    config.voicePersonality    ?? VOICE_PERSONALITY.WARM_PROFESSIONAL,
    speakingStyle:       config.speakingStyle       ?? SPEAKING_STYLE.CONVERSATIONAL,
    speechRate:          config.speechRate          ?? SPEECH_RATE.NATURAL,
    pauseStyle:          config.pauseStyle          ?? 'natural',
    formality:           config.formality           ?? FORMALITY.NEUTRAL,
    warmth:              config.warmth              ?? 80,
    energy:              config.energy              ?? 60,
    salesStyle:          config.salesStyle          ?? 'consultive',
    supportStyle:        config.supportStyle        ?? 'empathetic',
    brevity:             config.brevity             ?? 'high',
    interruptionPolicy:  config.interruptionPolicy  ?? INTERRUPTION_POLICY.ALLOW_IMMEDIATE,
    confirmationPolicy:  config.confirmationPolicy  ?? 'explicit-for-bookings',
    escalationPolicy:    config.escalationPolicy    ?? 'proactive',
    businessTruthProfile:config.businessTruthProfile ?? null,
    tools:               Object.freeze(config.tools   ?? []),
    channels:            Object.freeze(config.channels ?? [CHANNEL.VOICE]),
    status:              config.status              ?? 'active',
    isReal:              false,
  });
}

export const VOICE_AGENT_PROFILE_VERSION = '1.0.0';
