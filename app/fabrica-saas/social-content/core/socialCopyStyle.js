// Social Copy Style — 10 profiles defining voice and tone for post copy

export const SOCIAL_COPY_STYLE = Object.freeze({
  CONVERSATIONAL:   'CONVERSATIONAL',
  PROFESSIONAL:     'PROFESSIONAL',
  EDUCATIONAL:      'EDUCATIONAL',
  MOTIVATIONAL:     'MOTIVATIONAL',
  PLAYFUL:          'PLAYFUL',
  STORYTELLING:     'STORYTELLING',
  DIRECT:           'DIRECT',
  EMPATHETIC:       'EMPATHETIC',
  LOCAL_PRIDE:      'LOCAL_PRIDE',
  EXPERT:           'EXPERT',
});

const STYLE_META = Object.freeze({
  CONVERSATIONAL: {
    label: 'Conversacional',
    description: 'Cercano, informal, como hablar con un amigo',
    emojiUsage: 'MODERATE',
    sentenceLength: 'SHORT',
    hashtagCount: [3, 5],
  },
  PROFESSIONAL: {
    label: 'Profesional',
    description: 'Formal y claro, inspira confianza',
    emojiUsage: 'MINIMAL',
    sentenceLength: 'MEDIUM',
    hashtagCount: [1, 3],
  },
  EDUCATIONAL: {
    label: 'Educativo',
    description: 'Informativo, usa listas y estructura',
    emojiUsage: 'MODERATE',
    sentenceLength: 'MEDIUM',
    hashtagCount: [3, 6],
  },
  MOTIVATIONAL: {
    label: 'Motivacional',
    description: 'Energético, inspira a la acción',
    emojiUsage: 'HIGH',
    sentenceLength: 'SHORT',
    hashtagCount: [5, 8],
  },
  PLAYFUL: {
    label: 'Juguetón',
    description: 'Divertido, usa humor y creatividad',
    emojiUsage: 'HIGH',
    sentenceLength: 'SHORT',
    hashtagCount: [4, 7],
  },
  STORYTELLING: {
    label: 'Narrativo',
    description: 'Cuenta historias reales (sin inventar)',
    emojiUsage: 'LOW',
    sentenceLength: 'LONG',
    hashtagCount: [2, 4],
  },
  DIRECT: {
    label: 'Directo',
    description: 'Claro y al grano, orientado a acción',
    emojiUsage: 'MINIMAL',
    sentenceLength: 'SHORT',
    hashtagCount: [1, 3],
  },
  EMPATHETIC: {
    label: 'Empático',
    description: 'Comprensivo, conecta emocionalmente',
    emojiUsage: 'MODERATE',
    sentenceLength: 'MEDIUM',
    hashtagCount: [2, 4],
  },
  LOCAL_PRIDE: {
    label: 'Orgullo local',
    description: 'Referencia a la comunidad y territorio',
    emojiUsage: 'MODERATE',
    sentenceLength: 'MEDIUM',
    hashtagCount: [4, 8],
  },
  EXPERT: {
    label: 'Experto',
    description: 'Autoridad en el sector, datos y credibilidad',
    emojiUsage: 'LOW',
    sentenceLength: 'MEDIUM',
    hashtagCount: [2, 5],
  },
});

export function getCopyStyleMeta(style) {
  if (!STYLE_META[style]) throw new Error(`Unknown copy style: ${style}`);
  return Object.freeze({ ...STYLE_META[style], style, isReal: false });
}

export function listCopyStyles() {
  return Object.values(SOCIAL_COPY_STYLE).map(s =>
    Object.freeze({ style: s, ...STYLE_META[s], isReal: false })
  );
}
