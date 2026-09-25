// Premium Card System — ADV-07

export const CARD_VARIANT = Object.freeze({
  METRIC:      'METRIC',
  ACTION:      'ACTION',
  ENTITY:      'ENTITY',
  STATUS:      'STATUS',
  SUMMARY:     'SUMMARY',
  PROGRESS:    'PROGRESS',
  APPOINTMENT: 'APPOINTMENT',
  LEAD:        'LEAD',
  CLIENT:      'CLIENT',
  TASK:        'TASK',
  INSIGHT:     'INSIGHT',
  VISUAL_SERVICE: 'VISUAL_SERVICE',
});

export const CARD_STATE = Object.freeze({
  DEFAULT:  'DEFAULT',
  HOVER:    'HOVER',
  ACTIVE:   'ACTIVE',
  DISABLED: 'DISABLED',
  LOADING:  'LOADING',
  ERROR:    'ERROR',
});

const CARD_SPECS = Object.freeze({
  METRIC:      { interactive: false, hasImage: false, hasCTA: false, gridSpan: 1 },
  ACTION:      { interactive: true,  hasImage: false, hasCTA: true,  gridSpan: 1 },
  ENTITY:      { interactive: true,  hasImage: false, hasCTA: true,  gridSpan: 2 },
  STATUS:      { interactive: false, hasImage: false, hasCTA: false, gridSpan: 1 },
  SUMMARY:     { interactive: false, hasImage: false, hasCTA: true,  gridSpan: 2 },
  PROGRESS:    { interactive: false, hasImage: false, hasCTA: false, gridSpan: 1 },
  APPOINTMENT: { interactive: true,  hasImage: false, hasCTA: true,  gridSpan: 2 },
  LEAD:        { interactive: true,  hasImage: false, hasCTA: true,  gridSpan: 2 },
  CLIENT:      { interactive: true,  hasImage: true,  hasCTA: true,  gridSpan: 2 },
  TASK:        { interactive: true,  hasImage: false, hasCTA: true,  gridSpan: 1 },
  INSIGHT:     { interactive: false, hasImage: false, hasCTA: false, gridSpan: 2 },
  VISUAL_SERVICE: { interactive: true, hasImage: true, hasCTA: true, gridSpan: 2 },
});

export function createCard(variant = CARD_VARIANT.ENTITY, state = CARD_STATE.DEFAULT, data = {}) {
  const spec = CARD_SPECS[variant] ?? CARD_SPECS.ENTITY;
  return Object.freeze({
    variant,
    state,
    ...spec,
    data: { ...data, isReal: false },
    accessible: true,
    hasAriaLabel: true,
    isReal: false,
  });
}

export function buildCardGrid(variant = CARD_VARIANT.ENTITY, count = 4) {
  const cards = Array.from({ length: count }, (_, i) =>
    createCard(variant, CARD_STATE.DEFAULT, { index: i })
  );
  const spec    = CARD_SPECS[variant] ?? CARD_SPECS.ENTITY;
  const columns = spec.gridSpan === 2 ? 2 : 3;
  return Object.freeze({ cards, columns, variant, isReal: false });
}

export const CARD_SYSTEM_VERSION = '1.0.0';
