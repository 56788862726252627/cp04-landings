// Voice Fallback Policy — ADV-11

export const FAILURE_COMPONENT = Object.freeze({
  STT:   'STT',
  TTS:   'TTS',
  LLM:   'LLM',
  TOOL:  'TOOL',
});

export const FALLBACK_ACTION = Object.freeze({
  RETRY:       'RETRY',
  DEGRADED:    'DEGRADED',   // simpler response without the failed component
  HUMAN_HANDOFF:'HUMAN_HANDOFF',
  CLOSE_CALL:  'CLOSE_CALL',
});

const FALLBACK_RULES = Object.freeze({
  [FAILURE_COMPONENT.STT]:  { maxRetries: 2, afterMax: FALLBACK_ACTION.HUMAN_HANDOFF },
  [FAILURE_COMPONENT.TTS]:  { maxRetries: 1, afterMax: FALLBACK_ACTION.DEGRADED },
  [FAILURE_COMPONENT.LLM]:  { maxRetries: 1, afterMax: FALLBACK_ACTION.HUMAN_HANDOFF },
  [FAILURE_COMPONENT.TOOL]: { maxRetries: 2, afterMax: FALLBACK_ACTION.DEGRADED },
});

export function selectFallback(component = '', failureCount = 1) {
  const rule   = FALLBACK_RULES[component];
  if (!rule)   return FALLBACK_ACTION.HUMAN_HANDOFF;
  if (failureCount <= rule.maxRetries) return FALLBACK_ACTION.RETRY;
  return rule.afterMax;
}

export function createVoiceFallbackPolicy(config = {}) {
  return Object.freeze({
    rules:   Object.freeze({ ...FALLBACK_RULES, ...(config.rules ?? {}) }),
    isReal: false,
  });
}

export const DEFAULT_FALLBACK_POLICY = createVoiceFallbackPolicy();

export const VOICE_FALLBACK_POLICY_VERSION = '1.0.0';
