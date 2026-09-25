// Tone Match Evaluator — ADV-10

export const TONE_PROFILE = Object.freeze({
  FORMAL:       'FORMAL',
  FRIENDLY:     'FRIENDLY',
  EMPATHETIC:   'EMPATHETIC',
  PROFESSIONAL: 'PROFESSIONAL',
  CONSULTATIVE: 'CONSULTATIVE',
  NEUTRAL:      'NEUTRAL',
});

const VERTICAL_TONE = Object.freeze({
  dental:       TONE_PROFILE.PROFESSIONAL,
  physio:       TONE_PROFILE.EMPATHETIC,
  psychology:   TONE_PROFILE.EMPATHETIC,
  padel:        TONE_PROFILE.FRIENDLY,
  veterinary:   TONE_PROFILE.EMPATHETIC,
  beauty:       TONE_PROFILE.FRIENDLY,
  legal:        TONE_PROFILE.FORMAL,
  education:    TONE_PROFILE.PROFESSIONAL,
  fitness:      TONE_PROFILE.FRIENDLY,
  general:      TONE_PROFILE.NEUTRAL,
});

function detectTone(text = '') {
  if (/entiendo|comprendo|lamento|cómo te (puedo|podemos) ayudar/i.test(text)) return TONE_PROFILE.EMPATHETIC;
  if (/estimado|le informamos|según nuestras condiciones/i.test(text)) return TONE_PROFILE.FORMAL;
  if (/¡(hola|genial|perfecto|vamos)/i.test(text)) return TONE_PROFILE.FRIENDLY;
  if (/¿cuál es su presupuesto|necesita saber|analizamos su caso/i.test(text)) return TONE_PROFILE.CONSULTATIVE;
  return TONE_PROFILE.NEUTRAL;
}

export function evaluateToneMatch(response = {}) {
  const vertical    = response.vertical ?? 'general';
  const expected    = VERTICAL_TONE[vertical] ?? TONE_PROFILE.NEUTRAL;
  const detected    = detectTone(response.text ?? '');
  const match       = detected === expected || detected === TONE_PROFILE.NEUTRAL;
  const score       = match ? 90 : 55;
  return Object.freeze({ score, expected, detected, match, isReal: false });
}

export const TONE_MATCH_VERSION = '1.0.0';
