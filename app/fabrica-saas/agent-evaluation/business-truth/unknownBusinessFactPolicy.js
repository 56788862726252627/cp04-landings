// Unknown Business Fact Policy — ADV-10b

export const UNKNOWN_FACT_ACTION = Object.freeze({
  ASK_USER:                'ASK_USER',
  ASK_ADMIN:               'ASK_ADMIN',
  USE_SAFE_UNKNOWN_RESPONSE: 'USE_SAFE_UNKNOWN_RESPONSE',
  REQUIRE_CONFIGURATION:   'REQUIRE_CONFIGURATION',
});

export const SAFE_UNKNOWN_RESPONSES = Object.freeze({
  availability: 'No tengo confirmación de disponibilidad para ese horario. Te recomiendo contactar directamente con nosotros.',
  price:        'No tengo el precio exacto disponible ahora mismo. Puedo gestionar que te lo confirmemos.',
  hours:        'No tengo confirmación del horario para ese día. Consulta nuestra web o contáctanos.',
  facility:     'No tengo información confirmada sobre esa instalación. Podemos verificarlo.',
  service:      'No puedo confirmar ese servicio en este momento. Podemos verificarlo.',
  generic:      'No dispongo de esa información confirmada ahora mismo. ¿Puedo ayudarte de otra forma?',
});

export function createUnknownBusinessFactPolicy(fields = {}) {
  return Object.freeze({
    defaultAction:     fields.defaultAction ?? UNKNOWN_FACT_ACTION.USE_SAFE_UNKNOWN_RESPONSE,
    askUserCategories: Object.freeze(fields.askUserCategories ?? []),
    askAdminCategories: Object.freeze(fields.askAdminCategories ?? ['PRICES', 'AVAILABILITY']),
    neverInvent:       true,
    safeResponses:     SAFE_UNKNOWN_RESPONSES,
    isReal: false,
  });
}

export function getSafeUnknownResponse(category = 'generic') {
  const key = category.toLowerCase();
  return SAFE_UNKNOWN_RESPONSES[key] ?? SAFE_UNKNOWN_RESPONSES.generic;
}

export const DEFAULT_UNKNOWN_FACT_POLICY = createUnknownBusinessFactPolicy({});
export const UNKNOWN_BUSINESS_FACT_POLICY_VERSION = '1.0.0';
