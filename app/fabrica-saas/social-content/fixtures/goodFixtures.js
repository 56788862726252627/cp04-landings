// Good Fixtures — verified safe content examples

export const GOOD_POST_EDUCATIONAL = Object.freeze({
  id:          'good_001',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  channel:     'INSTAGRAM_REEL',
  objective:   'EDUCATION',
  pillar:      'EDUCATIONAL',
  topic:       'técnica de revés',
  hook:        'Cómo mejorar tu revés en 3 pasos.',
  body:        'El revés es una de las jugadas más importantes del pádel. Aquí te enseñamos los fundamentos.',
  cta:         'Guarda este post para consultarlo cuando lo necesites. 🔖',
  hashtags:    Object.freeze(['#padel', '#tecnica', '#reves']),
  fullText:    'Cómo mejorar tu revés en 3 pasos.\n\nEl revés es una de las jugadas más importantes del pádel.\n\nGuarda este post. 🔖',
  wordCount:   25,
  noRealPublish: true,
  isReal:      false,
});

export const GOOD_CAMPAIGN_PLAN = Object.freeze({
  id:          'good_camp_001',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  name:        'Q1 Booking Campaign',
  objective:   'BOOKING_CONVERSION',
  type:        'ORGANIC_ONLY',
  channels:    Object.freeze(['INSTAGRAM_REEL', 'FACEBOOK']),
  postsPlanned: 12,
  durationWeeks: 4,
  status:      'PLANNING',
  adsBlocked:  true,
  noRealPublish: true,
  isReal:      false,
});

export const GOOD_MAKE_PAYLOAD = Object.freeze({
  payloadVersion: '1.0',
  businessId:  'biz_padel_cp04',
  clientId:    'client_cp04',
  channel:     'INSTAGRAM_REEL',
  postContent: Object.freeze({
    text:     'Reserva tu plaza de pádel ahora.',
    hashtags: Object.freeze(['#padel', '#reserva']),
    mediaRef: 'fixture://media/reel_001.mp4',
    hook:     'Cómo mejorar tu revés.',
    cta:      'Reserva ya — enlace en bio.',
  }),
  dryRun:      true,
  noRealPublish: true,
  isReal:      false,
});

export const GOOD_STRATEGY_PROFILE = Object.freeze({
  businessId:    'biz_padel_cp04',
  clientId:      'client_cp04',
  objectives:    Object.freeze(['BOOKING_CONVERSION', 'COMMUNITY_BUILDING']),
  pillars:       Object.freeze(['EDUCATIONAL', 'SOCIAL_PROOF', 'LOCAL_EVENTS']),
  channels:      Object.freeze(['INSTAGRAM_REEL', 'INSTAGRAM_STORY', 'FACEBOOK']),
  postsPerWeek:  4,
  maturity:      'GROWING',
  organicFirst:  true,
  adsEnabled:    false,
  noRealPublish: true,
  isReal:        false,
});
