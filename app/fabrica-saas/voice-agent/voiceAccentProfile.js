// Voice Accent Profile — ADV-11

export const ACCENT_PROFILE = Object.freeze({
  ES_NEUTRAL:   'ES_NEUTRAL',    // Standard Spain Spanish
  ES_ANDALUZ:   'ES_ANDALUZ',    // Andalusian
  ES_CASTELLANO:'ES_CASTELLANO', // Castilian
  LATAM_NEUTRAL:'LATAM_NEUTRAL', // Latin American neutral
  CAT_BILINGUAL:'CAT_BILINGUAL', // Catalan/Spanish bilingual
});

export const ACCENT_VOICE_PARAMS = Object.freeze({
  [ACCENT_PROFILE.ES_NEUTRAL]:    { pace: 'NORMAL',  pitch: 'MEDIUM', locale: 'es-ES' },
  [ACCENT_PROFILE.ES_ANDALUZ]:    { pace: 'FAST',    pitch: 'MEDIUM', locale: 'es-ES' },
  [ACCENT_PROFILE.ES_CASTELLANO]: { pace: 'NORMAL',  pitch: 'LOW',    locale: 'es-ES' },
  [ACCENT_PROFILE.LATAM_NEUTRAL]: { pace: 'NORMAL',  pitch: 'MEDIUM', locale: 'es-419' },
  [ACCENT_PROFILE.CAT_BILINGUAL]: { pace: 'NORMAL',  pitch: 'MEDIUM', locale: 'es-ES' },
});

export function createVoiceAccentProfile(accent = ACCENT_PROFILE.ES_NEUTRAL) {
  const params = ACCENT_VOICE_PARAMS[accent] ?? ACCENT_VOICE_PARAMS[ACCENT_PROFILE.ES_NEUTRAL];
  return Object.freeze({ accent, ...params, isReal: false });
}

export const VOICE_ACCENT_PROFILE_VERSION = '1.0.0';
