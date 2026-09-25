// Next Best Action Engine — ADV-03
// resolveNextBestAction(): devuelve la acción más apropiada de forma natural.

export const NEXT_ACTION = Object.freeze({
  ANSWER_ONLY:            'ANSWER_ONLY',
  ASK_CLARIFYING_QUESTION:'ASK_CLARIFYING_QUESTION',
  BOOK:                   'BOOK',
  REQUEST_CONTACT:        'REQUEST_CONTACT',
  SHOW_PRICING:           'SHOW_PRICING',
  SHOW_SERVICE:           'SHOW_SERVICE',
  TRANSFER_HUMAN:         'TRANSFER_HUMAN',
  FOLLOW_UP:              'FOLLOW_UP',
  CLOSE_CONVERSATION:     'CLOSE_CONVERSATION',
  HANDLE_OBJECTION:       'HANDLE_OBJECTION',
  QUALIFY_FURTHER:        'QUALIFY_FURTHER',
});

const SOFT_CTA = Object.freeze({
  [NEXT_ACTION.BOOK]:             'Si quieres, podemos ver juntos cuándo encajaría mejor.',
  [NEXT_ACTION.REQUEST_CONTACT]:  'Si prefieres, puedes dejarme un contacto y te llamamos cuando te vaya bien.',
  [NEXT_ACTION.SHOW_PRICING]:     '¿Te explico cómo funciona el precio según lo que necesitas?',
  [NEXT_ACTION.SHOW_SERVICE]:     '¿Te cuento más sobre cómo funciona?',
  [NEXT_ACTION.TRANSFER_HUMAN]:   'Si lo prefieres, te pongo en contacto con alguien del equipo.',
  [NEXT_ACTION.FOLLOW_UP]:        'Si surge algo, aquí estoy.',
  [NEXT_ACTION.CLOSE_CONVERSATION]:'Si no hay nada más en lo que pueda ayudarte, que tengas un buen día.',
  [NEXT_ACTION.QUALIFY_FURTHER]:  '¿Puedo hacerte una pregunta para entender mejor tu situación?',
  [NEXT_ACTION.ANSWER_ONLY]:      null,
  [NEXT_ACTION.ASK_CLARIFYING_QUESTION]: null,
  [NEXT_ACTION.HANDLE_OBJECTION]: null,
});

/**
 * Resolve the next best action based on conversation context.
 * Returns action + soft CTA wording.
 */
export function resolveNextBestAction(params = {}) {
  const {
    intent             = 'INFORMATION',
    conversationStage  = 'DISCOVERY',
    escalationNeeded   = false,
    clarificationNeeded = false,
    hasObjection       = false,
    readyToBook        = false,
    readyToClose       = false,
    leadTemperature    = 'WARM',
  } = params;

  let action = NEXT_ACTION.ANSWER_ONLY;

  if (escalationNeeded)    action = NEXT_ACTION.TRANSFER_HUMAN;
  else if (clarificationNeeded) action = NEXT_ACTION.ASK_CLARIFYING_QUESTION;
  else if (hasObjection)   action = NEXT_ACTION.HANDLE_OBJECTION;
  else if (readyToBook)    action = NEXT_ACTION.BOOK;
  else if (readyToClose)   action = NEXT_ACTION.CLOSE_CONVERSATION;
  else if (intent === 'PRICE')       action = NEXT_ACTION.SHOW_PRICING;
  else if (intent === 'BOOKING')     action = NEXT_ACTION.BOOK;
  else if (intent === 'HUMAN_REQUEST') action = NEXT_ACTION.TRANSFER_HUMAN;
  else if (leadTemperature === 'HOT')  action = NEXT_ACTION.REQUEST_CONTACT;
  else if (conversationStage === 'DISCOVERY') action = NEXT_ACTION.QUALIFY_FURTHER;
  else if (conversationStage === 'ACTION')    action = NEXT_ACTION.BOOK;

  const softCTA = SOFT_CTA[action];

  return Object.freeze({
    valid:         true,
    action,
    softCTA,
    isHardCTA:     false,
    prohibitions:  Object.freeze(['NO aggressive CTA', 'NO repeated same CTA', 'NO "RESERVA AHORA"']),
  });
}

export const NEXT_BEST_ACTION_VERSION = '1.0.0';
