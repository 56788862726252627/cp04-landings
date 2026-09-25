// Premium Empty State Experience — ADV-07

export const EMPTY_STATE_TYPE = Object.freeze({
  EMPTY_LIST:    'EMPTY_LIST',
  EMPTY_INBOX:   'EMPTY_INBOX',
  EMPTY_DATA:    'EMPTY_DATA',
  EMPTY_SEARCH:  'EMPTY_SEARCH',
  ONBOARDING:    'ONBOARDING',
});

export const EMPTY_STATE_TONE = Object.freeze({
  HELPFUL:    'HELPFUL',
  NEUTRAL:    'NEUTRAL',
  ENCOURAGING:'ENCOURAGING',
  FORMAL:     'FORMAL',
});

const EMPTY_STATE_SPECS = Object.freeze({
  [EMPTY_STATE_TYPE.EMPTY_LIST]:    { hasCTA: true,  hasIllustration: true,  toneDefault: 'HELPFUL' },
  [EMPTY_STATE_TYPE.EMPTY_INBOX]:   { hasCTA: false, hasIllustration: true,  toneDefault: 'ENCOURAGING' },
  [EMPTY_STATE_TYPE.EMPTY_DATA]:    { hasCTA: true,  hasIllustration: false, toneDefault: 'NEUTRAL' },
  [EMPTY_STATE_TYPE.EMPTY_SEARCH]:  { hasCTA: false, hasIllustration: false, toneDefault: 'HELPFUL' },
  [EMPTY_STATE_TYPE.ONBOARDING]:    { hasCTA: true,  hasIllustration: true,  toneDefault: 'ENCOURAGING' },
});

const COPY_BY_TONE = Object.freeze({
  HELPFUL:     { body: 'Añade tu primer elemento para empezar.', cta: 'Añadir ahora' },
  NEUTRAL:     { body: 'No hay datos que mostrar.',              cta: 'Crear registro' },
  ENCOURAGING: { body: '¡Bienvenido! Empieza aquí.',             cta: 'Comenzar' },
  FORMAL:      { body: 'No se encontraron registros.',           cta: 'Crear nuevo' },
});

export function createPremiumEmptyState(type = EMPTY_STATE_TYPE.EMPTY_LIST, options = {}) {
  const spec = EMPTY_STATE_SPECS[type] ?? EMPTY_STATE_SPECS[EMPTY_STATE_TYPE.EMPTY_LIST];
  const tone = options.tone ?? spec.toneDefault;
  const copy = COPY_BY_TONE[tone] ?? COPY_BY_TONE.NEUTRAL;

  return Object.freeze({
    type,
    tone,
    hasCTA:          options.hasCTA ?? spec.hasCTA,
    hasIllustration: options.hasIllustration ?? spec.hasIllustration,
    heading:         options.heading ?? copy.cta,
    body:            options.body ?? copy.body,
    ctaLabel:        options.ctaLabel ?? copy.cta,
    noTechnicalText: true,
    isReal:          false,
  });
}

export function buildDefaultEmptyStates() {
  return Object.values(EMPTY_STATE_TYPE).map(type => createPremiumEmptyState(type));
}

export const EMPTY_STATE_EXPERIENCE_VERSION = '1.0.0';
