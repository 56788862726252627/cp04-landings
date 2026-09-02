// AI Response Budget — ADV-16

export const RESPONSE_LENGTH = Object.freeze({
  SHORT:      'SHORT',     // 1-2 sentences
  NORMAL:     'NORMAL',    // paragraph
  DETAILED:   'DETAILED',  // multi-paragraph
  MAX_NEEDED: 'MAX_NEEDED',
});

const LENGTH_TOKENS = Object.freeze({
  [RESPONSE_LENGTH.SHORT]:      150,
  [RESPONSE_LENGTH.NORMAL]:     500,
  [RESPONSE_LENGTH.DETAILED]:  1500,
  [RESPONSE_LENGTH.MAX_NEEDED]: null,
});

export function createAIResponseBudget(config = {}) {
  const {
    taskType        = 'SIMPLE_CHAT',
    channel         = 'WEB_CHAT',
    override        = null,
  } = config;

  const defaults = {
    VOICE_PLANNING: RESPONSE_LENGTH.SHORT,
    SIMPLE_CHAT:    RESPONSE_LENGTH.NORMAL,
    SOCIAL_COPY:    RESPONSE_LENGTH.SHORT,
    CODING:         RESPONSE_LENGTH.DETAILED,
    REASONING:      RESPONSE_LENGTH.DETAILED,
    MEDIA_SCRIPT:   RESPONSE_LENGTH.MAX_NEEDED,
  };

  const resolved  = override ?? defaults[taskType] ?? RESPONSE_LENGTH.NORMAL;
  const maxTokens = LENGTH_TOKENS[resolved];

  return Object.freeze({
    taskType,
    channel,
    length:    resolved,
    maxTokens,
    isReal:    false,
  });
}

export const AI_RESPONSE_BUDGET_VERSION = '1.0.0';
