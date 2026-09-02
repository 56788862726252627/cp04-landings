// Failure Fixtures — ADV-13

import { MEDIA_CRITICAL_FAILURE } from '../quality/mediaQualityGate.js';

export const FAILURE_UNAPPROVED_REAL_FACE = Object.freeze({
  id: 'fail_unapproved_real_face',
  description: 'Avatar con rostro real sin consentimiento',
  avatarIsRealPerson: true, consentStatus: 'PENDING',
  expectedCriticalFailure: MEDIA_CRITICAL_FAILURE.MISSING_CONSENT,
  expectedGate: 'BLOCKED', isReal: false,
});

export const FAILURE_CLONED_VOICE_NO_CONSENT = Object.freeze({
  id: 'fail_cloned_voice_no_consent',
  description: 'Voz clonada sin consentimiento del sujeto',
  voiceSource: 'CLONED', consentRequired: true, consentStatus: 'PENDING',
  expectedCriticalFailure: MEDIA_CRITICAL_FAILURE.MISSING_CONSENT,
  expectedGate: 'BLOCKED', isReal: false,
});

export const FAILURE_INVENTED_PRICE = Object.freeze({
  id: 'fail_invented_price',
  description: 'Script con precio inventado no verificado',
  scriptText: 'Solo €9 al mes, oferta garantizada para siempre',
  expectedCriticalFailure: MEDIA_CRITICAL_FAILURE.UNVERIFIED_CLAIM,
  expectedGate: 'BLOCKED', isReal: false,
});

export const FAILURE_WRONG_HOURS = Object.freeze({
  id: 'fail_wrong_hours',
  description: 'Script menciona horario incorrecto',
  scriptText: 'Abiertos 24 horas todos los días',
  businessHours: 'L-V 9-20h',
  expectedCriticalFailure: MEDIA_CRITICAL_FAILURE.WRONG_FACTS,
  expectedGate: 'BLOCKED', isReal: false,
});

export const FAILURE_CLIENT_A_BRAND_IN_B = Object.freeze({
  id: 'fail_client_a_brand_in_b',
  description: 'Branding del cliente A incluido en vídeo del cliente B',
  outputClientId: 'client_physio', brandClientId: 'client_padel',
  expectedCriticalFailure: MEDIA_CRITICAL_FAILURE.WRONG_BRAND,
  expectedGate: 'BLOCKED', isReal: false,
});

export const FAILURE_UNSUPPORTED_CLAIM = Object.freeze({
  id: 'fail_unsupported_claim',
  description: 'Claim sin evidencia: mejor clínica de la región',
  scriptText: 'Somos la mejor clínica de Andalucía',
  expectedCriticalFailure: MEDIA_CRITICAL_FAILURE.UNVERIFIED_CLAIM,
  expectedGate: 'BLOCKED', isReal: false,
});

export const FAILURE_WRONG_ASPECT_RATIO = Object.freeze({
  id: 'fail_wrong_aspect_ratio',
  description: 'Vídeo 16:9 publicado en canal 9:16',
  channel: 'TIKTOK', expectedAspect: '9:16', actualAspect: '16:9',
  expectedGate: 'FAIL', isReal: false,
});

export const FAILURE_MISSING_CAPTIONS = Object.freeze({
  id: 'fail_missing_captions',
  description: 'Vídeo sin subtítulos ni captions',
  hasCaptions: false,
  expectedAccessibilityViolation: 'CAPTIONS',
  expectedGate: 'FAIL', isReal: false,
});

export const FAILURE_COST_WITHOUT_APPROVAL = Object.freeze({
  id: 'fail_cost_without_approval',
  description: 'Coste real sin aprobación humana',
  totalEstimatedCents: 1500, approvedByHuman: false,
  expectedCriticalFailure: MEDIA_CRITICAL_FAILURE.COST_WITHOUT_APPROVAL,
  expectedGate: 'BLOCKED', isReal: false,
});

export const FAILURE_FAKE_TESTIMONIAL = Object.freeze({
  id: 'fail_fake_testimonial',
  description: 'Testimonial fabricado sin persona real',
  scriptText: 'Un cliente satisfecho dice: este servicio es el mejor',
  expectedCriticalFailure: MEDIA_CRITICAL_FAILURE.FAKE_TESTIMONIAL,
  expectedGate: 'BLOCKED', isReal: false,
});

export const FAILURE_FALSE_HUMAN_REPR = Object.freeze({
  id: 'fail_false_human_repr',
  description: 'Avatar afirma ser persona humana real',
  avatarText: 'Soy una persona humana real y os recomiendo este servicio',
  expectedCriticalFailure: MEDIA_CRITICAL_FAILURE.FALSE_HUMAN_REPR,
  expectedGate: 'BLOCKED', isReal: false,
});

export const FAILURE_UNLICENSED_MUSIC = Object.freeze({
  id: 'fail_unlicensed_music',
  description: 'Música sin licencia comercial',
  musicRightsStatus: 'NOT_CLEARED', commercialUse: true,
  expectedCriticalFailure: MEDIA_CRITICAL_FAILURE.UNLICENSED_ASSET,
  expectedGate: 'BLOCKED', isReal: false,
});

export const FAILURE_MISSING_APPROVAL_SOCIAL = Object.freeze({
  id: 'fail_missing_approval_social',
  description: 'Publicación social sin aprobación humana',
  channel: 'INSTAGRAM_REEL', approvedByHuman: false,
  expectedCriticalFailure: MEDIA_CRITICAL_FAILURE.MISSING_APPROVAL,
  expectedGate: 'BLOCKED', isReal: false,
});

export const FAILURE_FIXTURES = Object.freeze([
  FAILURE_UNAPPROVED_REAL_FACE,
  FAILURE_CLONED_VOICE_NO_CONSENT,
  FAILURE_INVENTED_PRICE,
  FAILURE_WRONG_HOURS,
  FAILURE_CLIENT_A_BRAND_IN_B,
  FAILURE_UNSUPPORTED_CLAIM,
  FAILURE_WRONG_ASPECT_RATIO,
  FAILURE_MISSING_CAPTIONS,
  FAILURE_COST_WITHOUT_APPROVAL,
  FAILURE_FAKE_TESTIMONIAL,
  FAILURE_FALSE_HUMAN_REPR,
  FAILURE_UNLICENSED_MUSIC,
  FAILURE_MISSING_APPROVAL_SOCIAL,
]);
