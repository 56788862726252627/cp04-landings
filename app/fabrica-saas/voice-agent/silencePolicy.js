// Silence Policy — ADV-11

export const SILENCE_TYPE = Object.freeze({
  SHORT:        'SHORT',        // 0-2s — normal thinking pause
  NORMAL:       'NORMAL',       // 2-5s — prompting needed
  LONG:         'LONG',         // 5-15s — recovery prompt
  DISCONNECTED: 'DISCONNECTED', // > 15s — hang-up assumption
});

const SILENCE_THRESHOLDS_MS = Object.freeze({
  SHORT:        2000,
  NORMAL:       5000,
  LONG:        15000,
});

export function classifySilence(durationMs = 0) {
  if (durationMs <= SILENCE_THRESHOLDS_MS.SHORT)  return SILENCE_TYPE.SHORT;
  if (durationMs <= SILENCE_THRESHOLDS_MS.NORMAL)  return SILENCE_TYPE.NORMAL;
  if (durationMs <= SILENCE_THRESHOLDS_MS.LONG)    return SILENCE_TYPE.LONG;
  return SILENCE_TYPE.DISCONNECTED;
}

export const SILENCE_PROMPTS = Object.freeze({
  [SILENCE_TYPE.NORMAL]:       '¿Sigues ahí?',
  [SILENCE_TYPE.LONG]:         '¿Me escuchas? Si necesitas tiempo, estoy aquí.',
  [SILENCE_TYPE.DISCONNECTED]: 'Parece que la llamada se ha cortado. Hasta pronto.',
});

export function getSilencePrompt(type = '') {
  return SILENCE_PROMPTS[type] ?? null;
}

export function createSilencePolicy(config = {}) {
  return Object.freeze({
    thresholds:       SILENCE_THRESHOLDS_MS,
    prompts:          SILENCE_PROMPTS,
    endCallAfterType: config.endCallAfterType ?? SILENCE_TYPE.DISCONNECTED,
    isReal: false,
  });
}

export const DEFAULT_SILENCE_POLICY = createSilencePolicy();

export const SILENCE_POLICY_VERSION = '1.0.0';
