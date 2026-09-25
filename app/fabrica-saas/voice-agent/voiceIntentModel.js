// Voice Intent Model — ADV-11

export const VOICE_INTENT = Object.freeze({
  BOOKING:     'BOOKING',
  RESCHEDULE:  'RESCHEDULE',
  CANCEL:      'CANCEL',
  INFORMATION: 'INFORMATION',
  PRICE:       'PRICE',
  SUPPORT:     'SUPPORT',
  COMPLAINT:   'COMPLAINT',
  SALES:       'SALES',
  LEAD:        'LEAD',
  PAYMENT:     'PAYMENT',
  HUMAN:       'HUMAN',
  UNKNOWN:     'UNKNOWN',
});

const INTENT_PATTERNS = Object.freeze({
  [VOICE_INTENT.BOOKING]:     [/reserv/i, /cit[ae]/i, /apunt/i, /plaz[ao]/i],
  [VOICE_INTENT.RESCHEDULE]:  [/cambi[ao]/i, /mover/i, /retrasa/i, /adelant/i, /otra hora/i],
  [VOICE_INTENT.CANCEL]:      [/cancel/i, /anula/i, /quitar.*cita/i, /no voy a ir/i],
  [VOICE_INTENT.INFORMATION]: [/horario/i, /cuándo/i, /dónde/i, /cómo funciona/i, /información/i],
  [VOICE_INTENT.PRICE]:       [/cuánto cuesta/i, /precio/i, /tarifa/i, /coste/i, /cuánto vale/i],
  [VOICE_INTENT.SUPPORT]:     [/problema/i, /ayuda/i, /no funciona/i, /error/i, /issue/i],
  [VOICE_INTENT.COMPLAINT]:   [/queja/i, /mal servicio/i, /reclamación/i, /indignado/i],
  [VOICE_INTENT.SALES]:       [/interesa/i, /contratar/i, /servicio nuevo/i, /más información/i],
  [VOICE_INTENT.LEAD]:        [/interesado/i, /necesito/i, /busco/i, /quiero saber/i],
  [VOICE_INTENT.PAYMENT]:     [/pagar/i, /factura/i, /cobro/i, /cargo/i, /reembolso/i],
  [VOICE_INTENT.HUMAN]:       [/persona real/i, /hablar con alguien/i, /agente humano/i, /operador/i],
});

export function detectVoiceIntent(text = '') {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some(p => p.test(text))) {
      return Object.freeze({ intent, confidence: 0.8, isReal: false });
    }
  }
  return Object.freeze({ intent: VOICE_INTENT.UNKNOWN, confidence: 0.1, isReal: false });
}

export function getIntentLabel(intent = '') {
  const labels = {
    [VOICE_INTENT.BOOKING]:     'reserva',
    [VOICE_INTENT.RESCHEDULE]:  'cambio de cita',
    [VOICE_INTENT.CANCEL]:      'cancelación',
    [VOICE_INTENT.INFORMATION]: 'información',
    [VOICE_INTENT.PRICE]:       'precio',
    [VOICE_INTENT.SUPPORT]:     'soporte',
    [VOICE_INTENT.COMPLAINT]:   'queja',
    [VOICE_INTENT.SALES]:       'venta',
    [VOICE_INTENT.LEAD]:        'cualificación',
    [VOICE_INTENT.PAYMENT]:     'pago',
    [VOICE_INTENT.HUMAN]:       'transferir a persona',
    [VOICE_INTENT.UNKNOWN]:     'desconocido',
  };
  return labels[intent] ?? 'desconocido';
}

export const VOICE_INTENT_MODEL_VERSION = '1.0.0';
