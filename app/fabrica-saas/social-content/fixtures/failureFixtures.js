// Failure Fixtures — content that should be BLOCKED by quality gate or policies

export const FAILURE_INVENTED_PRICE = Object.freeze({
  id:          'fail_001',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  channel:     'INSTAGRAM_REEL',
  fullText:    'Clases de pádel por solo 5€. ¡La tarifa más barata del mundo!',
  mentionsPrice:    true,
  priceVerified:    false,
  hasSuspectedClaim: true,
  expectedViolation: 'INVENTED_PRICE',
  noRealPublish: true,
  isReal:      false,
});

export const FAILURE_INVENTED_HOURS = Object.freeze({
  id:          'fail_002',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  channel:     'FACEBOOK',
  fullText:    'Abrimos de 6:00 a 24:00 todos los días.',
  mentionsHours:    true,
  hoursVerified:    false,
  expectedViolation: 'INVENTED_HOURS',
  noRealPublish: true,
  isReal:      false,
});

export const FAILURE_FAKE_TESTIMONIAL = Object.freeze({
  id:          'fail_003',
  businessId:  'biz_fisio_nova',
  clientId:    'client_fisionova',
  channel:     'INSTAGRAM_REEL',
  fullText:    '"Gracias a FisioNova perdí 30kg en 2 semanas." — María García',
  hasFakeTestimonial: true,
  expectedViolation: 'FAKE_TESTIMONIAL',
  noRealPublish: true,
  isReal:      false,
});

export const FAILURE_INVENTED_RESULTS = Object.freeze({
  id:          'fail_004',
  businessId:  'biz_gym_elite',
  clientId:    'client_gym',
  channel:     'TIKTOK',
  fullText:    'Garantizamos que pierdes 10kg en 30 días o te devolvemos el dinero.',
  hasInventedResults: true,
  expectedViolation: 'INVENTED_RESULTS',
  noRealPublish: true,
  isReal:      false,
});

export const FAILURE_CLIENT_ISOLATION = Object.freeze({
  id:          'fail_005',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  requestingClientId: 'client_fisionova',
  channel:     'INSTAGRAM_REEL',
  fullText:    'Contenido de CP04 visto desde FisioNova.',
  expectedViolation: 'CLIENT_DATA_CROSS_LEAK',
  noRealPublish: true,
  isReal:      false,
});

export const FAILURE_REAL_PUBLISH_ATTEMPT = Object.freeze({
  id:          'fail_006',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  channel:     'INSTAGRAM_REEL',
  noRealPublish: false,
  executeReal:   true,
  expectedError: 'NO_REAL_SOCIAL_PUBLISH=SI',
  isReal:      false,
});

export const FAILURE_REAL_AD_SPEND = Object.freeze({
  id:          'fail_007',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  adsRequested: true,
  autoActivateAds: true,
  expectedViolation: 'REAL_AD_SPEND',
  noRealPublish: true,
  isReal:      false,
});

export const FAILURE_SECRET_VALUE = Object.freeze({
  id:          'fail_008',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  secretValue:   'sk_live_REAL_TOKEN_HERE',
  expectedError: 'SocialMCPRequest must use secretRef, not secretValue',
  isReal:      false,
});

export const FAILURE_REAL_WEBHOOK = Object.freeze({
  id:          'fail_009',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  realWebhookUrl: 'https://hook.make.com/real-webhook',
  expectedError:  'SocialMakePayload must use webhookRef, not realWebhookUrl',
  isReal:      false,
});

export const FAILURE_REAL_OAUTH_TOKEN = Object.freeze({
  id:          'fail_010',
  channel:     'INSTAGRAM_REEL',
  realOAuthToken: 'EAABwz...',
  expectedError:  'CHANNEL_AUTH_SAFETY: real OAuth token must not be passed',
  isReal:      false,
});

export const FAILURE_FALSE_HUMAN_REPR = Object.freeze({
  id:          'fail_011',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  channel:     'INSTAGRAM_REEL',
  fullText:    'Soy el entrenador Juan García y os cuento mi experiencia real.',
  isRealPerson: true,
  personConsentRef: null,
  expectedViolation: 'FALSE_HUMAN_REPR',
  noRealPublish: true,
  isReal:      false,
});

export const FAILURE_GDPR_VIOLATION = Object.freeze({
  id:          'fail_012',
  businessId:  'biz_clinica_salud',
  clientId:    'client_clinica',
  channel:     'FACEBOOK',
  fullText:    'El paciente con DNI 12345678A ha mejorado gracias a nuestro tratamiento.',
  expectedViolation: 'GDPR_VIOLATION',
  noRealPublish: true,
  isReal:      false,
});

export const FAILURE_REAL_EXECUTE = Object.freeze({
  id:          'fail_013',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  executeReal:   true,
  expectedError: 'SocialMakeBridge: executeReal=true is not allowed — DRY_RUN_ONLY',
  isReal:      false,
});

export const ALL_FAILURE_FIXTURES = Object.freeze([
  FAILURE_INVENTED_PRICE, FAILURE_INVENTED_HOURS, FAILURE_FAKE_TESTIMONIAL,
  FAILURE_INVENTED_RESULTS, FAILURE_CLIENT_ISOLATION, FAILURE_REAL_PUBLISH_ATTEMPT,
  FAILURE_REAL_AD_SPEND, FAILURE_SECRET_VALUE, FAILURE_REAL_WEBHOOK,
  FAILURE_REAL_OAUTH_TOKEN, FAILURE_FALSE_HUMAN_REPR, FAILURE_GDPR_VIOLATION,
  FAILURE_REAL_EXECUTE,
]);
