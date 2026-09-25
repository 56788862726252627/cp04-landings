// Voice Sales Behavior — ADV-11

export const SALES_STAGE = Object.freeze({
  DISCOVERY:       'DISCOVERY',
  INTEREST_SHOWN:  'INTEREST_SHOWN',
  OBJECTION:       'OBJECTION',
  CLOSING:         'CLOSING',
  FOLLOW_UP:       'FOLLOW_UP',
  NOT_INTERESTED:  'NOT_INTERESTED',
});

export const OBJECTION_TYPE = Object.freeze({
  PRICE:        'PRICE',
  TIME:         'TIME',
  COMPETITOR:   'COMPETITOR',
  NOT_READY:    'NOT_READY',
  NEED_MORE_INFO:'NEED_MORE_INFO',
});

export function detectSalesObjection(text = '') {
  if (/caro|precio|coste|presupuesto/i.test(text))     return OBJECTION_TYPE.PRICE;
  if (/no tengo tiempo|ocupado|después/i.test(text))   return OBJECTION_TYPE.TIME;
  if (/otra empresa|competencia|ya tengo/i.test(text)) return OBJECTION_TYPE.COMPETITOR;
  if (/no estoy listo|luego|mañana/i.test(text))       return OBJECTION_TYPE.NOT_READY;
  return null;
}

export function buildSalesResponse(stage = '', objectionType = null) {
  if (objectionType === OBJECTION_TYPE.PRICE)      return 'Entiendo la preocupación por el precio. Tenemos opciones flexibles. ¿Qué presupuesto manejas?';
  if (objectionType === OBJECTION_TYPE.TIME)       return 'Sin problema. ¿Te llamo en un momento más conveniente?';
  if (objectionType === OBJECTION_TYPE.COMPETITOR) return 'Podemos hacer una comparativa. ¿Qué valoras más de tu servicio actual?';
  if (stage === SALES_STAGE.DISCOVERY)             return '¿Qué es lo que más te interesa de nuestros servicios?';
  if (stage === SALES_STAGE.CLOSING)               return '¿Quieres que lo dejemos reservado ahora mismo?';
  return '¿En qué más puedo ayudarte?';
}

export function createVoiceSalesBehavior(config = {}) {
  return Object.freeze({
    consultative:    true,
    noHighPressure:  true,
    maxFollowUps:    config.maxFollowUps ?? 2,
    isReal: false,
  });
}

export const VOICE_SALES_BEHAVIOR_VERSION = '1.0.0';
