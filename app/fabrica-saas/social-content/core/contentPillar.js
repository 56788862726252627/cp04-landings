// Content Pillar — 15 types for local business social strategy

export const CONTENT_PILLAR = Object.freeze({
  EDUCATIONAL:        'EDUCATIONAL',
  BEHIND_THE_SCENES:  'BEHIND_THE_SCENES',
  SOCIAL_PROOF:       'SOCIAL_PROOF',
  PROMOTIONS:         'PROMOTIONS',
  COMMUNITY:          'COMMUNITY',
  TIPS_AND_TRICKS:    'TIPS_AND_TRICKS',
  TEAM:               'TEAM',
  FAQ:                'FAQ',
  LOCAL_EVENTS:       'LOCAL_EVENTS',
  TRANSFORMATIONS:    'TRANSFORMATIONS',
  USER_CONTENT:       'USER_CONTENT',
  PRODUCT_SHOWCASE:   'PRODUCT_SHOWCASE',
  VALUES:             'VALUES',
  SEASONAL:           'SEASONAL',
  INTERACTIVE:        'INTERACTIVE',
});

const PILLAR_META = Object.freeze({
  EDUCATIONAL:       { label: 'Educación', recommendedWeight: 0.20 },
  BEHIND_THE_SCENES: { label: 'Detrás de cámaras', recommendedWeight: 0.10 },
  SOCIAL_PROOF:      { label: 'Prueba social', recommendedWeight: 0.15 },
  PROMOTIONS:        { label: 'Promociones', recommendedWeight: 0.10 },
  COMMUNITY:         { label: 'Comunidad', recommendedWeight: 0.10 },
  TIPS_AND_TRICKS:   { label: 'Tips y consejos', recommendedWeight: 0.10 },
  TEAM:              { label: 'Equipo', recommendedWeight: 0.05 },
  FAQ:               { label: 'Preguntas frecuentes', recommendedWeight: 0.05 },
  LOCAL_EVENTS:      { label: 'Eventos locales', recommendedWeight: 0.05 },
  TRANSFORMATIONS:   { label: 'Transformaciones', recommendedWeight: 0.05 },
  USER_CONTENT:      { label: 'Contenido de usuarios', recommendedWeight: 0.05 },
  PRODUCT_SHOWCASE:  { label: 'Presentación de servicio', recommendedWeight: 0.05 },
  VALUES:            { label: 'Valores de marca', recommendedWeight: 0.03 },
  SEASONAL:          { label: 'Estacional', recommendedWeight: 0.02 },
  INTERACTIVE:       { label: 'Interactivo (encuestas, retos)', recommendedWeight: 0.05 },
});

export function createContentPillar(config = {}) {
  if (!config.type) throw new Error('ContentPillar requires type');
  if (!PILLAR_META[config.type]) throw new Error(`Unknown pillar type: ${config.type}`);
  const meta = PILLAR_META[config.type];
  return Object.freeze({
    type: config.type,
    label: meta.label,
    weight: config.weight ?? meta.recommendedWeight,
    topics: Object.freeze(config.topics ?? []),
    isReal: false,
  });
}

export function getRecommendedPillarSet(objectives = []) {
  const allPillars = Object.values(CONTENT_PILLAR);
  const selected = objectives.includes('SOCIAL_PROOF')
    ? allPillars.filter(p => p !== CONTENT_PILLAR.PROMOTIONS)
    : allPillars;
  return Object.freeze(selected.map(type => createContentPillar({ type })));
}
