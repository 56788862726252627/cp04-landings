// Media Visual Style — ADV-13

export const VISUAL_STYLE = Object.freeze({
  PREMIUM:     'PREMIUM',
  LOCAL_WARM:  'LOCAL_WARM',
  PROFESSIONAL:'PROFESSIONAL',
  SPORTY:      'SPORTY',
  CLINICAL:    'CLINICAL',
  BEAUTY:      'BEAUTY',
  LEGAL:       'LEGAL',
  EDUCATION:   'EDUCATION',
  TECH:        'TECH',
  MINIMAL:     'MINIMAL',
  ENERGETIC:   'ENERGETIC',
});

export const VISUAL_STYLE_META = Object.freeze({
  [VISUAL_STYLE.PREMIUM]:     { colorTemp: 'COOL', contrast: 'HIGH',   motion: 'SMOOTH',  fontWeight: 'THIN' },
  [VISUAL_STYLE.LOCAL_WARM]:  { colorTemp: 'WARM', contrast: 'MEDIUM', motion: 'GENTLE',  fontWeight: 'MEDIUM' },
  [VISUAL_STYLE.PROFESSIONAL]:{ colorTemp: 'NEUTRAL', contrast: 'HIGH', motion: 'MINIMAL', fontWeight: 'REGULAR' },
  [VISUAL_STYLE.SPORTY]:      { colorTemp: 'COOL', contrast: 'HIGH',   motion: 'DYNAMIC', fontWeight: 'BOLD' },
  [VISUAL_STYLE.CLINICAL]:    { colorTemp: 'COOL', contrast: 'MEDIUM', motion: 'MINIMAL', fontWeight: 'LIGHT' },
  [VISUAL_STYLE.BEAUTY]:      { colorTemp: 'WARM', contrast: 'SOFT',   motion: 'GENTLE',  fontWeight: 'THIN' },
  [VISUAL_STYLE.LEGAL]:       { colorTemp: 'NEUTRAL', contrast: 'HIGH', motion: 'NONE',   fontWeight: 'REGULAR' },
  [VISUAL_STYLE.EDUCATION]:   { colorTemp: 'WARM', contrast: 'MEDIUM', motion: 'GENTLE',  fontWeight: 'MEDIUM' },
  [VISUAL_STYLE.TECH]:        { colorTemp: 'COOL', contrast: 'HIGH',   motion: 'SMOOTH',  fontWeight: 'THIN' },
  [VISUAL_STYLE.MINIMAL]:     { colorTemp: 'NEUTRAL', contrast: 'LOW', motion: 'NONE',    fontWeight: 'LIGHT' },
  [VISUAL_STYLE.ENERGETIC]:   { colorTemp: 'VIBRANT', contrast: 'HIGH', motion: 'DYNAMIC', fontWeight: 'BOLD' },
});

export function getVisualStyleProfile(style) {
  const meta = VISUAL_STYLE_META[style];
  if (!meta) throw new Error(`Unknown visual style: ${style}`);
  return Object.freeze({ style, ...meta, isReal: false });
}

export const MEDIA_VISUAL_STYLE_VERSION = '1.0.0';
