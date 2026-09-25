// Spanish Voice Profiles — ADV-13

import { createMediaVoiceProfile, VOICE_TONE, VOICE_GENDER_PRESENTATION, COMMERCIAL_RIGHTS_STATUS } from './mediaVoiceProfile.js';

export const ES_ES_NEUTRAL = createMediaVoiceProfile({
  id: 'es_es_neutral', language: 'es', locale: 'es-ES', accent: 'NEUTRAL',
  genderPresentation: VOICE_GENDER_PRESENTATION.NEUTRAL,
  tone: VOICE_TONE.PROFESSIONAL, warmth: 5, energy: 5, pace: 'NORMAL',
  clarity: 'HIGH', expressiveness: 'MODERATE',
  source: 'SYNTHETIC', commercialRightsStatus: COMMERCIAL_RIGHTS_STATUS.SYNTHETIC_FREE,
});

export const ES_ES_WARM = createMediaVoiceProfile({
  id: 'es_es_warm', language: 'es', locale: 'es-ES', accent: 'NEUTRAL',
  genderPresentation: VOICE_GENDER_PRESENTATION.FEMININE,
  tone: VOICE_TONE.WARM, warmth: 8, energy: 5, pace: 'SLIGHTLY_SLOW',
  clarity: 'HIGH', expressiveness: 'HIGH',
  source: 'SYNTHETIC', commercialRightsStatus: COMMERCIAL_RIGHTS_STATUS.SYNTHETIC_FREE,
});

export const ES_ES_PROFESSIONAL = createMediaVoiceProfile({
  id: 'es_es_professional', language: 'es', locale: 'es-ES', accent: 'NEUTRAL',
  genderPresentation: VOICE_GENDER_PRESENTATION.MASCULINE,
  tone: VOICE_TONE.AUTHORITATIVE, warmth: 4, energy: 6, pace: 'NORMAL',
  clarity: 'VERY_HIGH', expressiveness: 'MODERATE',
  source: 'SYNTHETIC', commercialRightsStatus: COMMERCIAL_RIGHTS_STATUS.SYNTHETIC_FREE,
});

export const ES_ES_ENERGETIC = createMediaVoiceProfile({
  id: 'es_es_energetic', language: 'es', locale: 'es-ES', accent: 'NEUTRAL',
  genderPresentation: VOICE_GENDER_PRESENTATION.NEUTRAL,
  tone: VOICE_TONE.ENERGETIC, warmth: 6, energy: 9, pace: 'SLIGHTLY_FAST',
  clarity: 'HIGH', expressiveness: 'VERY_HIGH',
  source: 'SYNTHETIC', commercialRightsStatus: COMMERCIAL_RIGHTS_STATUS.SYNTHETIC_FREE,
});

export const ANDALUSIAN_SOFT = createMediaVoiceProfile({
  id: 'es_and_soft', language: 'es', locale: 'es-ES', accent: 'ANDALUSIAN_SOFT',
  genderPresentation: VOICE_GENDER_PRESENTATION.NEUTRAL,
  tone: VOICE_TONE.WARM, warmth: 7, energy: 5, pace: 'NORMAL',
  clarity: 'HIGH', expressiveness: 'MODERATE',
  source: 'SYNTHETIC', commercialRightsStatus: COMMERCIAL_RIGHTS_STATUS.SYNTHETIC_FREE,
});

export const SPANISH_VOICE_PROFILES = Object.freeze([
  ES_ES_NEUTRAL, ES_ES_WARM, ES_ES_PROFESSIONAL, ES_ES_ENERGETIC, ANDALUSIAN_SOFT,
]);

export const SPANISH_VOICE_PROFILES_VERSION = '1.0.0';
