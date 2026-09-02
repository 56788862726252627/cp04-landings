// Voice Pause Policy — ADV-11

export const PAUSE_TYPE = Object.freeze({
  MICRO:        'MICRO',        // <200ms — breathing space
  NORMAL:       'NORMAL',       // 300-500ms — natural sentence break
  THINKING:     'THINKING',     // 500-800ms — processing indicator
  EMPATHETIC:   'EMPATHETIC',   // 700-1000ms — after difficult topic
  CONFIRMATION: 'CONFIRMATION', // 400-600ms — before important info
});

const PAUSE_DURATION_MS = Object.freeze({
  MICRO:        150,
  NORMAL:       400,
  THINKING:     650,
  EMPATHETIC:   850,
  CONFIRMATION: 500,
});

export function createVoicePausePolicy(config = {}) {
  return Object.freeze({
    enabled:          config.enabled          ?? true,
    naturalPauses:    config.naturalPauses    ?? true,
    maxThinkingPause: config.maxThinkingPause ?? 1000,
    durationMs:       Object.freeze({ ...PAUSE_DURATION_MS, ...(config.durationMs ?? {}) }),
    isReal: false,
  });
}

export function getPauseDuration(type = PAUSE_TYPE.NORMAL, policy = {}) {
  const durations = policy.durationMs ?? PAUSE_DURATION_MS;
  return durations[type] ?? PAUSE_DURATION_MS.NORMAL;
}

export function selectPauseForContext(context = {}) {
  if (context.afterDifficultTopic)  return PAUSE_TYPE.EMPATHETIC;
  if (context.beforeConfirmation)   return PAUSE_TYPE.CONFIRMATION;
  if (context.toolCallPending)      return PAUSE_TYPE.THINKING;
  if (context.sentenceEnd)          return PAUSE_TYPE.NORMAL;
  return PAUSE_TYPE.MICRO;
}

export const DEFAULT_PAUSE_POLICY = createVoicePausePolicy();

export const VOICE_PAUSE_POLICY_VERSION = '1.0.0';
