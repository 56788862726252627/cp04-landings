// Objection Engine — ADV-03
// handleObjection(): responde objeciones de forma consultiva, sin discutir.

export const OBJECTION_TYPE = Object.freeze({
  PRICE:       'PRICE',
  TIMING:      'TIMING',
  TRUST:       'TRUST',
  NEED:        'NEED',
  COMPETITOR:  'COMPETITOR',
  COMPLEXITY:  'COMPLEXITY',
  RISK:        'RISK',
  NO_DECISION: 'NO_DECISION',
  OTHER:       'OTHER',
});

export const OBJECTION_RESPONSE_STEP = Object.freeze({
  ACKNOWLEDGE: 'ACKNOWLEDGE',
  CLARIFY:     'CLARIFY',
  RESPOND:     'RESPOND',
  VALUE:       'VALUE',
  NEXT_ACTION: 'NEXT_ACTION',
});

const OBJECTION_TEMPLATES = Object.freeze({
  [OBJECTION_TYPE.PRICE]: Object.freeze({
    acknowledge: 'El precio es una consideración importante, lo entiendo.',
    clarify:     '¿Hay algo concreto que no encaja o es la cifra total?',
    respond:     'Permíteme explicar qué incluye y qué valor genera a cambio.',
    value:       'El retorno concreto que nuestros clientes experimentan es...',
    nextAction:  'Puedo mostrarte opciones según lo que más te interesa.',
  }),
  [OBJECTION_TYPE.TIMING]: Object.freeze({
    acknowledge: 'Tiene sentido que el momento importa.',
    clarify:     '¿Qué cambiará más adelante que no esté presente ahora?',
    respond:     'Hay aspectos que pueden avanzarse sin compromiso total.',
    value:       'Empezar cuando hay interés real suele dar mejores resultados.',
    nextAction:  'Si quieres, vemos juntos qué encajaría en tu situación actual.',
  }),
  [OBJECTION_TYPE.TRUST]: Object.freeze({
    acknowledge: 'La confianza se gana, no se declara. Lo entiendo perfectamente.',
    clarify:     '¿Qué información necesitarías para sentirte más seguro/a?',
    respond:     'Puedo darte referencias concretas o documentación.',
    value:       'Trabajamos con garantías claras desde el principio.',
    nextAction:  '¿Te parece bien empezar con algo pequeño sin compromiso?',
  }),
  [OBJECTION_TYPE.NEED]: Object.freeze({
    acknowledge: 'Puede que no sea el momento adecuado, lo respeto.',
    clarify:     '¿Qué tendría que cambiar para que tuviese más sentido?',
    respond:     'A veces el problema no es evidente hasta que se analiza mejor.',
    value:       'Te cuento lo que otros en tu situación han descubierto.',
    nextAction:  'Si hay algo en lo que pueda ayudarte hoy, dímelo.',
  }),
  [OBJECTION_TYPE.COMPETITOR]: Object.freeze({
    acknowledge: 'Es lógico comparar opciones antes de decidir.',
    clarify:     '¿Qué aspectos valoras más en esta comparativa?',
    respond:     'Cada opción tiene sus puntos fuertes. Te digo en qué nos diferenciamos.',
    value:       'Lo que nuestros clientes destacan más frente a otras opciones es...',
    nextAction:  '¿Qué información adicional te ayudaría a decidir?',
  }),
  [OBJECTION_TYPE.NO_DECISION]: Object.freeze({
    acknowledge: 'No hay ningún problema. No hay prisa.',
    clarify:     '¿Hay algo que te genere duda o que no haya quedado claro?',
    respond:     'Mi objetivo no es que decidas ahora, sino que tengas la información correcta.',
    value:       'Si en algún momento tiene sentido retomarlo, estaré aquí.',
    nextAction:  '¿Puedo dejarte algo útil mientras tanto?',
  }),
});

const DEFAULT_TEMPLATE = Object.freeze({
  acknowledge: 'Entendido.',
  clarify:     '¿Puedes contarme más sobre lo que te preocupa?',
  respond:     'Déjame explicarte mejor.',
  value:       'Lo que nuestros clientes valoran es...',
  nextAction:  '¿Cómo podemos ayudarte de la mejor forma posible?',
});

/**
 * Handle an objection following the 5-step framework.
 * Returns a structured response guide (not an LLM response).
 */
export function handleObjection(params = {}) {
  const {
    objectionType  = OBJECTION_TYPE.OTHER,
    context        = {},
  } = params;

  if (!OBJECTION_TYPE[objectionType]) {
    return { valid: false, error: `Unknown objection type: ${objectionType}` };
  }

  const template   = OBJECTION_TEMPLATES[objectionType] ?? DEFAULT_TEMPLATE;
  const steps      = [
    { step: OBJECTION_RESPONSE_STEP.ACKNOWLEDGE, guidance: template.acknowledge },
    { step: OBJECTION_RESPONSE_STEP.CLARIFY,     guidance: template.clarify },
    { step: OBJECTION_RESPONSE_STEP.RESPOND,     guidance: template.respond },
    { step: OBJECTION_RESPONSE_STEP.VALUE,       guidance: template.value },
    { step: OBJECTION_RESPONSE_STEP.NEXT_ACTION, guidance: template.nextAction },
  ];

  return Object.freeze({
    valid:         true,
    objectionType,
    steps:         Object.freeze(steps),
    prohibitions:  Object.freeze(['Do not argue', 'Do not dismiss', 'Do not pressure after NO']),
    context:       Object.freeze(context),
  });
}

/**
 * Detect the most likely objection type from a message.
 * Deterministic heuristic — LLM can improve later.
 */
export function detectObjectionType(message = '') {
  const lower = message.toLowerCase();
  if (/precio|caro|barato|coste|tarifa|presupuesto/.test(lower)) return OBJECTION_TYPE.PRICE;
  if (/ahora no|más adelante|esperar|momento|todavía no/.test(lower)) return OBJECTION_TYPE.TIMING;
  if (/no sé|no confío|referencia|garantía|seguro/.test(lower))      return OBJECTION_TYPE.TRUST;
  if (/no lo necesito|no me hace falta|no es para mí/.test(lower))   return OBJECTION_TYPE.NEED;
  if (/competencia|otro|comparar|diferencia/.test(lower))             return OBJECTION_TYPE.COMPETITOR;
  if (/complicado|difícil|no entiendo/.test(lower))                   return OBJECTION_TYPE.COMPLEXITY;
  if (/riesgo|miedo|equivocarme/.test(lower))                        return OBJECTION_TYPE.RISK;
  if (/lo pienso|ya veremos|te llamo/.test(lower))                   return OBJECTION_TYPE.NO_DECISION;
  return OBJECTION_TYPE.OTHER;
}

export const OBJECTION_ENGINE_VERSION = '1.0.0';
