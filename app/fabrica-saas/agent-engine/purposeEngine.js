// Purpose Engine — ADV-03
// resolveAgentPurpose(): propósito concreto de cada agente por tipo.

export const PURPOSE_STEP = Object.freeze({
  UNDERSTAND_NEED:   'UNDERSTAND_NEED',
  PROVIDE_VALUE:     'PROVIDE_VALUE',
  QUALIFY:           'QUALIFY',
  HANDLE_OBJECTIONS: 'HANDLE_OBJECTIONS',
  GUIDE_NEXT_ACTION: 'GUIDE_NEXT_ACTION',
  RESOLVE:           'RESOLVE',
  DIAGNOSE:          'DIAGNOSE',
  ESCALATE:          'ESCALATE',
  CHECK_AVAILABILITY:'CHECK_AVAILABILITY',
  PROPOSE_OPTIONS:   'PROPOSE_OPTIONS',
  CONFIRM_INTENT:    'CONFIRM_INTENT',
  GATHER_CONTEXT:    'GATHER_CONTEXT',
  ANSWER_QUESTION:   'ANSWER_QUESTION',
  QUALIFY_LEAD:      'QUALIFY_LEAD',
  PREPARE_HANDOFF:   'PREPARE_HANDOFF',
});

const AGENT_PURPOSE_FLOWS = Object.freeze({
  SALES: Object.freeze({
    primaryGoal: 'Comprender la necesidad real y conectar con el valor adecuado',
    steps: Object.freeze([
      PURPOSE_STEP.UNDERSTAND_NEED,
      PURPOSE_STEP.PROVIDE_VALUE,
      PURPOSE_STEP.QUALIFY,
      PURPOSE_STEP.HANDLE_OBJECTIONS,
      PURPOSE_STEP.GUIDE_NEXT_ACTION,
    ]),
    prohibitions: Object.freeze(['Vender antes de entender', 'Presionar con urgencias falsas', 'Ignorar objeciones']),
  }),
  BOOKING: Object.freeze({
    primaryGoal: 'Facilitar la reserva de forma natural, sin fricción',
    steps: Object.freeze([
      PURPOSE_STEP.ANSWER_QUESTION,
      PURPOSE_STEP.CHECK_AVAILABILITY,
      PURPOSE_STEP.PROPOSE_OPTIONS,
      PURPOSE_STEP.CONFIRM_INTENT,
      PURPOSE_STEP.PREPARE_HANDOFF,
    ]),
    prohibitions: Object.freeze(['Forzar una reserva sin aclarar dudas', 'Ignorar preferencias del cliente']),
  }),
  SUPPORT: Object.freeze({
    primaryGoal: 'Resolver el problema del cliente de forma rápida y clara',
    steps: Object.freeze([
      PURPOSE_STEP.GATHER_CONTEXT,
      PURPOSE_STEP.DIAGNOSE,
      PURPOSE_STEP.RESOLVE,
      PURPOSE_STEP.ESCALATE,
    ]),
    prohibitions: Object.freeze(['Dar respuestas genéricas sin diagnosticar', 'Ignorar solicitudes de humano']),
  }),
  CHAT: Object.freeze({
    primaryGoal: 'Responder preguntas y orientar al usuario hacia el valor correcto',
    steps: Object.freeze([
      PURPOSE_STEP.UNDERSTAND_NEED,
      PURPOSE_STEP.ANSWER_QUESTION,
      PURPOSE_STEP.GUIDE_NEXT_ACTION,
    ]),
    prohibitions: Object.freeze(['Conversar sin objetivo indefinidamente']),
  }),
  LEAD: Object.freeze({
    primaryGoal: 'Cualificar el interés y preparar el lead para el equipo de ventas',
    steps: Object.freeze([
      PURPOSE_STEP.GATHER_CONTEXT,
      PURPOSE_STEP.QUALIFY_LEAD,
      PURPOSE_STEP.PROVIDE_VALUE,
      PURPOSE_STEP.PREPARE_HANDOFF,
    ]),
    prohibitions: Object.freeze(['Comprometerse con promesas que no corresponden al agente']),
  }),
  VOICE: Object.freeze({
    primaryGoal: 'Gestionar la conversación telefónica de forma natural y eficiente',
    steps: Object.freeze([
      PURPOSE_STEP.UNDERSTAND_NEED,
      PURPOSE_STEP.ANSWER_QUESTION,
      PURPOSE_STEP.GUIDE_NEXT_ACTION,
      PURPOSE_STEP.ESCALATE,
    ]),
    prohibitions: Object.freeze(['Mensajes demasiado largos', 'Listas verbales', 'Preguntas múltiples a la vez']),
  }),
});

/**
 * Resolve agent purpose for a given agent type and context.
 */
export function resolveAgentPurpose(params = {}) {
  const { agentType = 'CHAT', vertical = 'default' } = params;
  const flow = AGENT_PURPOSE_FLOWS[agentType] ?? AGENT_PURPOSE_FLOWS.CHAT;

  return Object.freeze({
    valid:        true,
    agentType,
    vertical,
    primaryGoal:  flow.primaryGoal,
    steps:        flow.steps,
    prohibitions: flow.prohibitions,
    disclaimer:   'Agent must never drift from goal into open-ended chat.',
  });
}

export const PURPOSE_ENGINE_VERSION = '1.0.0';
