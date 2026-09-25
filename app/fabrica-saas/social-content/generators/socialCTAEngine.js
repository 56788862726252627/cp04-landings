// Social CTA Engine — 10 CTA types for closing lines of social posts

export const CTA_TYPE = Object.freeze({
  BOOK:     'BOOK',
  CONTACT:  'CONTACT',
  LEARN:    'LEARN',
  COMMENT:  'COMMENT',
  SAVE:     'SAVE',
  SHARE:    'SHARE',
  VISIT:    'VISIT',
  DISCOVER: 'DISCOVER',
  DM_FUTURE: 'DM_FUTURE',
  NONE:     'NONE',
});

const CTA_TEMPLATES = Object.freeze({
  BOOK:     'Reserva tu plaza ahora — enlace en bio. 📲',
  CONTACT:  'Contáctanos y te asesoramos sin compromiso.',
  LEARN:    'Descubre más en nuestro perfil.',
  COMMENT:  '¿Y tú, qué opinas? Cuéntanoslo en comentarios 👇',
  SAVE:     'Guarda este post para consultarlo cuando lo necesites. 🔖',
  SHARE:    'Comparte si crees que le puede ayudar a alguien. 🙌',
  VISIT:    'Visítanos en {{address}} y compruébalo tú mismo.',
  DISCOVER:  'Explora todo lo que tenemos para ti en bio.',
  DM_FUTURE: 'Escríbenos cuando estés listo — estaremos aquí.',
  NONE:     '',
});

export function generateCTA(params = {}) {
  if (!params.type) throw new Error('generateCTA requires type');
  if (!Object.values(CTA_TYPE).includes(params.type)) throw new Error(`Unknown CTA type: ${params.type}`);

  const template = CTA_TEMPLATES[params.type];
  const text = template.replace('{{address}}', params.address ?? 'nuestra dirección');

  return Object.freeze({ type: params.type, text, isReal: false });
}

export function getBestCTAForObjective(objective) {
  const map = Object.freeze({
    BOOKING_CONVERSION: CTA_TYPE.BOOK,
    LEAD_GENERATION:    CTA_TYPE.CONTACT,
    EDUCATION:          CTA_TYPE.SAVE,
    COMMUNITY_BUILDING: CTA_TYPE.COMMENT,
    SOCIAL_PROOF:       CTA_TYPE.SHARE,
    RETENTION:          CTA_TYPE.DISCOVER,
    LOCAL_PRESENCE:     CTA_TYPE.VISIT,
    BRAND_AWARENESS:    CTA_TYPE.LEARN,
  });
  return map[objective] ?? CTA_TYPE.LEARN;
}
