// Good Fixtures — ADV-13

export const GOOD_CORRECT_BRAND = Object.freeze({
  id: 'good_correct_brand',
  description: 'Vídeo con branding correcto del cliente',
  clientId: 'client_padel', businessId: 'biz_pad_01',
  avatarType: 'SYNTHETIC', identityDisclosure: 'AI_GENERATED',
  voiceSource: 'SYNTHETIC_TTS', rightsStatus: 'SYNTHETIC_FREE',
  expectedQualityGate: 'PASS', isReal: false,
});

export const GOOD_GROUNDED_FACTS = Object.freeze({
  id: 'good_grounded_facts',
  description: 'Script con hechos verificados del negocio',
  clientId: 'client_physio', businessId: 'biz_fis_01',
  claimsValidated: true, businessFactSources: ['AIRTABLE_RECORD_123'],
  expectedQualityGate: 'PASS', isReal: false,
});

export const GOOD_SYNTHETIC_AVATAR = Object.freeze({
  id: 'good_synthetic_avatar',
  description: 'Avatar sintético aprobado con disclosure correcto',
  avatarType: 'SYNTHETIC', isRealPerson: false,
  identityDisclosure: 'AI_GENERATED', consentStatus: 'NOT_REQUIRED',
  expectedAvatarCheck: 'PASS', isReal: false,
});

export const GOOD_SAFE_VOICE = Object.freeze({
  id: 'good_safe_voice',
  description: 'Voz sintética sin necesidad de consentimiento',
  voiceId: 'es_es_neutral', source: 'SYNTHETIC',
  consentRequired: false, commercialRightsStatus: 'SYNTHETIC_FREE',
  expectedVoiceCheck: 'PASS', isReal: false,
});

export const GOOD_CORRECT_FORMAT = Object.freeze({
  id: 'good_correct_format',
  description: 'Formato 9:16 correcto para Instagram Reel',
  channel: 'INSTAGRAM_REEL', aspectRatio: '9:16',
  expectedFormat: 'VERTICAL_9_16', expectedFormatCheck: 'PASS', isReal: false,
});

export const GOOD_SUBTITLES_PRESENT = Object.freeze({
  id: 'good_subtitles_present',
  description: 'Vídeo con subtítulos y captions accesibles',
  hasCaptions: true, hasSubtitles: true, subtitleFormats: ['VTT', 'BURNED_IN'],
  expectedAccessibility: 'PASS', isReal: false,
});

export const GOOD_CLEAR_CTA = Object.freeze({
  id: 'good_clear_cta',
  description: 'CTA claro, sin clickbait ni promesas falsas',
  ctaText: 'Reserva tu pista ahora', isClickbait: false, isUnsafe: false,
  expectedCtaEval: 'PASS', isReal: false,
});

export const GOOD_FIXTURES = Object.freeze([
  GOOD_CORRECT_BRAND, GOOD_GROUNDED_FACTS, GOOD_SYNTHETIC_AVATAR,
  GOOD_SAFE_VOICE, GOOD_CORRECT_FORMAT, GOOD_SUBTITLES_PRESENT, GOOD_CLEAR_CTA,
]);
