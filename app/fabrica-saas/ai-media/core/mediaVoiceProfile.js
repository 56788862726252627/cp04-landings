// Media Voice Profile — ADV-13

export const VOICE_GENDER_PRESENTATION = Object.freeze({
  MASCULINE: 'MASCULINE',
  FEMININE:  'FEMININE',
  NEUTRAL:   'NEUTRAL',
});

export const VOICE_TONE = Object.freeze({
  WARM:         'WARM',
  PROFESSIONAL: 'PROFESSIONAL',
  ENERGETIC:    'ENERGETIC',
  CALM:         'CALM',
  FRIENDLY:     'FRIENDLY',
  AUTHORITATIVE:'AUTHORITATIVE',
});

export const COMMERCIAL_RIGHTS_STATUS = Object.freeze({
  CLEARED:        'CLEARED',
  NOT_CLEARED:    'NOT_CLEARED',
  UNKNOWN:        'UNKNOWN',
  SYNTHETIC_FREE: 'SYNTHETIC_FREE',
});

export function createMediaVoiceProfile(config = {}) {
  if (!config.id) throw new Error('MediaVoiceProfile requires id');
  return Object.freeze({
    id:                   config.id,
    language:             config.language              ?? 'es',
    locale:               config.locale               ?? 'es-ES',
    accent:               config.accent               ?? 'NEUTRAL',
    genderPresentation:   config.genderPresentation   ?? VOICE_GENDER_PRESENTATION.NEUTRAL,
    tone:                 config.tone                 ?? VOICE_TONE.PROFESSIONAL,
    warmth:               config.warmth               ?? 5,
    energy:               config.energy               ?? 5,
    pace:                 config.pace                 ?? 'NORMAL',
    clarity:              config.clarity              ?? 'HIGH',
    expressiveness:       config.expressiveness       ?? 'MODERATE',
    provider:             config.provider             ?? 'fixture',
    source:               config.source               ?? 'SYNTHETIC',
    consentRequired:      config.consentRequired      ?? false,
    commercialRightsStatus: config.commercialRightsStatus ?? COMMERCIAL_RIGHTS_STATUS.SYNTHETIC_FREE,
    isReal: false,
  });
}

export const MEDIA_VOICE_PROFILE_VERSION = '1.0.0';
