// Voice Business Info Flow — ADV-11

export const INFO_QUERY_TYPE = Object.freeze({
  HOURS:    'HOURS',
  LOCATION: 'LOCATION',
  SERVICES: 'SERVICES',
  PRICES:   'PRICES',
  CONTACT:  'CONTACT',
  GENERAL:  'GENERAL',
});

const QUERY_PATTERNS = Object.freeze({
  [INFO_QUERY_TYPE.HOURS]:    [/horario/i, /cuándo abr/i, /hasta qué hora/i],
  [INFO_QUERY_TYPE.LOCATION]: [/dónde est/i, /cómo llego/i, /dirección/i],
  [INFO_QUERY_TYPE.SERVICES]: [/qué ofrecéis/i, /qué servicio/i, /qué hacéis/i],
  [INFO_QUERY_TYPE.PRICES]:   [/cuánto cuesta/i, /precio/i, /tarifa/i],
  [INFO_QUERY_TYPE.CONTACT]:  [/teléfono/i, /email/i, /contacto/i],
});

export function detectInfoQueryType(text = '') {
  for (const [type, patterns] of Object.entries(QUERY_PATTERNS)) {
    if (patterns.some(p => p.test(text))) return type;
  }
  return INFO_QUERY_TYPE.GENERAL;
}

export function buildGroundedInfoResponse(queryType = '', facts = {}) {
  if (!facts || Object.keys(facts).length === 0) {
    return 'No tengo esa información verificada ahora mismo. ¿Puedo ayudarte en algo más?';
  }
  if (queryType === INFO_QUERY_TYPE.HOURS && facts.opening_hours) {
    return `Nuestro horario es: ${facts.opening_hours}.`;
  }
  if (queryType === INFO_QUERY_TYPE.LOCATION && facts.address) {
    return `Estamos en ${facts.address}.`;
  }
  if (queryType === INFO_QUERY_TYPE.PRICES && facts.price_range) {
    return `Los precios van desde ${facts.price_range}.`;
  }
  return 'Déjame consultarlo y te confirmo. ¿Me das un momento?';
}

export const VOICE_BUSINESS_INFO_FLOW_VERSION = '1.0.0';
