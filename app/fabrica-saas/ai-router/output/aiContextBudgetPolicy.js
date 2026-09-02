// AI Context Budget Policy — ADV-16

export const CONTEXT_CLASS = Object.freeze({
  SMALL:     'SMALL',      // <4k tokens
  MEDIUM:    'MEDIUM',     // 4-32k
  LARGE:     'LARGE',      // 32-128k
  VERY_LARGE:'VERY_LARGE', // 128k+
});

const CLASS_TOKENS = Object.freeze({
  [CONTEXT_CLASS.SMALL]:     4_000,
  [CONTEXT_CLASS.MEDIUM]:   32_000,
  [CONTEXT_CLASS.LARGE]:   128_000,
  [CONTEXT_CLASS.VERY_LARGE]: 300_000,
});

export function classifyContextSize(tokens) {
  if (tokens <= CLASS_TOKENS[CONTEXT_CLASS.SMALL])      return CONTEXT_CLASS.SMALL;
  if (tokens <= CLASS_TOKENS[CONTEXT_CLASS.MEDIUM])     return CONTEXT_CLASS.MEDIUM;
  if (tokens <= CLASS_TOKENS[CONTEXT_CLASS.LARGE])      return CONTEXT_CLASS.LARGE;
  return CONTEXT_CLASS.VERY_LARGE;
}

export function createAIContextBudgetPolicy(config = {}) {
  const {
    maxContextClass = CONTEXT_CLASS.MEDIUM,
    warnAtPercent   = 80,
  } = config;

  return Object.freeze({
    maxContextClass,
    maxTokens: CLASS_TOKENS[maxContextClass],

    evaluate(estimatedTokens) {
      const usedClass = classifyContextSize(estimatedTokens);
      const maxIdx    = Object.keys(CLASS_TOKENS).indexOf(maxContextClass);
      const usedIdx   = Object.keys(CLASS_TOKENS).indexOf(usedClass);
      const warn      = estimatedTokens > CLASS_TOKENS[maxContextClass] * (warnAtPercent / 100);

      return Object.freeze({
        estimatedTokens,
        usedClass,
        within:  usedIdx <= maxIdx,
        warn,
        isReal:  false,
      });
    },
    isReal: false,
  });
}

export const AI_CONTEXT_BUDGET_POLICY_VERSION = '1.0.0';
