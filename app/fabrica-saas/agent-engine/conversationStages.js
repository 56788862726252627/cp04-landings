// Conversation Stages — ADV-03
// Estados de conversación. Nunca saltar directamente a venta.

export const STAGE = Object.freeze({
  GREETING:      'GREETING',
  DISCOVERY:     'DISCOVERY',
  QUALIFICATION: 'QUALIFICATION',
  VALUE:         'VALUE',
  OBJECTION:     'OBJECTION',
  DECISION:      'DECISION',
  ACTION:        'ACTION',
  FOLLOW_UP:     'FOLLOW_UP',
  CLOSED:        'CLOSED',
});

const STAGE_TRANSITIONS = Object.freeze({
  [STAGE.GREETING]:      Object.freeze([STAGE.DISCOVERY, STAGE.ACTION]),
  [STAGE.DISCOVERY]:     Object.freeze([STAGE.QUALIFICATION, STAGE.VALUE, STAGE.OBJECTION, STAGE.ACTION]),
  [STAGE.QUALIFICATION]: Object.freeze([STAGE.VALUE, STAGE.OBJECTION, STAGE.DISCOVERY, STAGE.CLOSED]),
  [STAGE.VALUE]:         Object.freeze([STAGE.OBJECTION, STAGE.DECISION, STAGE.QUALIFICATION]),
  [STAGE.OBJECTION]:     Object.freeze([STAGE.VALUE, STAGE.DECISION, STAGE.CLOSED, STAGE.FOLLOW_UP]),
  [STAGE.DECISION]:      Object.freeze([STAGE.ACTION, STAGE.OBJECTION, STAGE.FOLLOW_UP, STAGE.CLOSED]),
  [STAGE.ACTION]:        Object.freeze([STAGE.FOLLOW_UP, STAGE.CLOSED]),
  [STAGE.FOLLOW_UP]:     Object.freeze([STAGE.DISCOVERY, STAGE.CLOSED]),
  [STAGE.CLOSED]:        Object.freeze([]),
});

/**
 * Resolve the current conversation stage from signals.
 */
export function resolveConversationStage(params = {}) {
  const {
    intent              = 'INFORMATION',
    turnCount           = 0,
    hasObjection        = false,
    readyToAct          = false,
    userSaidGoodbye     = false,
    priceAsked          = false,
    bookingRequested    = false,
    currentStage        = STAGE.GREETING,
  } = params;

  if (userSaidGoodbye)    return stageResult(STAGE.CLOSED,        currentStage);
  if (readyToAct)         return stageResult(STAGE.ACTION,        currentStage);
  if (bookingRequested)   return stageResult(STAGE.ACTION,        currentStage);
  if (hasObjection)       return stageResult(STAGE.OBJECTION,     currentStage);
  if (priceAsked && turnCount > 1) return stageResult(STAGE.VALUE, currentStage);

  if (intent === 'GREETING' || turnCount === 0) return stageResult(STAGE.GREETING, currentStage);
  if (intent === 'INFORMATION' && turnCount < 3) return stageResult(STAGE.DISCOVERY, currentStage);
  if (intent === 'PURCHASE_INTENT')  return stageResult(STAGE.DECISION, currentStage);
  if (intent === 'CANCELLATION')     return stageResult(STAGE.CLOSED, currentStage);
  if (turnCount >= 8)                return stageResult(STAGE.FOLLOW_UP, currentStage);

  return stageResult(STAGE.DISCOVERY, currentStage);
}

function stageResult(stage, previous) {
  const allowed = STAGE_TRANSITIONS[previous] ?? Object.values(STAGE);
  const isValidTransition = stage === previous || allowed.includes(stage);
  return Object.freeze({
    stage,
    previous,
    isValidTransition,
    allowedTransitions: STAGE_TRANSITIONS[stage] ?? [],
  });
}

/**
 * Check if a transition is allowed.
 */
export function isValidStageTransition(from, to) {
  const allowed = STAGE_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export const CONVERSATION_STAGES_VERSION = '1.0.0';
