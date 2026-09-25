// Make Payload Fixtures — sample SocialMakePayload instances for testing

export const MAKE_PAYLOAD_PADEL_REEL = Object.freeze({
  payloadVersion: '1.0',
  businessId:   'biz_padel_cp04',
  clientId:     'client_cp04',
  channel:      'INSTAGRAM_REEL',
  postContent: Object.freeze({
    text:     '¿Sabías que mejorar tu volea puede cambiar tu juego?\n\nClase magistral este sábado.\n\nReserva tu plaza — enlace en bio. 📲',
    hashtags: Object.freeze(['#padel', '#volea', '#clasesdepadel', '#archidona']),
    mediaRef: 'fixture://media/reel_volea_001.mp4',
    hook:     '¿Sabías que mejorar tu volea puede cambiar tu juego?',
    cta:      'Reserva tu plaza — enlace en bio. 📲',
  }),
  scheduledDate: '2026-10-15',
  scheduledTime: '09:00',
  objective:    'BOOKING_CONVERSION',
  pillar:       'EDUCATIONAL',
  webhookRef:   'webhook_ref_cp04_social',
  dryRun:       true,
  noRealPublish: true,
  noRealAdSpend: true,
  isReal:       false,
});

export const MAKE_PAYLOAD_FISIO_FACEBOOK = Object.freeze({
  payloadVersion: '1.0',
  businessId:   'biz_fisio_nova',
  clientId:     'client_fisionova',
  channel:      'FACEBOOK',
  postContent: Object.freeze({
    text:     'Lo que nadie te cuenta sobre el dolor lumbar.\n\nHoy explicamos las 3 causas más comunes.\n\nGuarda este post. 🔖',
    hashtags: Object.freeze(['#fisioterapia', '#lumbar', '#salud']),
    mediaRef: null,
    hook:     'Lo que nadie te cuenta sobre el dolor lumbar.',
    cta:      'Guarda este post para consultarlo. 🔖',
  }),
  scheduledDate: '2026-10-16',
  scheduledTime: '18:00',
  objective:    'EDUCATION',
  pillar:       'EDUCATIONAL',
  webhookRef:   'webhook_ref_fisio_social',
  dryRun:       true,
  noRealPublish: true,
  noRealAdSpend: true,
  isReal:       false,
});

export const MAKE_PAYLOAD_GYM_TIKTOK = Object.freeze({
  payloadVersion: '1.0',
  businessId:   'biz_gym_elite',
  clientId:     'client_gym',
  channel:      'TIKTOK',
  postContent: Object.freeze({
    text:     'La semana empieza hoy. ¿Empiezas tú también?\n\n#lunes #motivacion #gym',
    hashtags: Object.freeze(['#lunes', '#motivacion', '#gym']),
    mediaRef: 'fixture://media/tiktok_lunes_001.mp4',
    hook:     'La semana empieza hoy.',
    cta:      'Únete a Gym Elite — enlace en bio.',
  }),
  scheduledDate: '2026-10-19',
  scheduledTime: '07:00',
  objective:    'BRAND_AWARENESS',
  pillar:       'EDUCATIONAL',
  webhookRef:   'webhook_ref_gym_social',
  dryRun:       true,
  noRealPublish: true,
  noRealAdSpend: true,
  isReal:       false,
});

export const ALL_MAKE_PAYLOAD_FIXTURES = Object.freeze([
  MAKE_PAYLOAD_PADEL_REEL,
  MAKE_PAYLOAD_FISIO_FACEBOOK,
  MAKE_PAYLOAD_GYM_TIKTOK,
]);
