/**
 * Factory Registry — Compatibility Registry V2
 * Backward compatibility guarantees and version migration paths.
 */

export const COMPAT_REGISTRY = Object.freeze({
  versions: {
    '1.0': { status: 'deprecated', migratesTo: '1.7' },
    '1.5': { status: 'supported',  migratesTo: '2.0' },
    '1.6': { status: 'supported',  migratesTo: '2.0' },
    '1.7': { status: 'supported',  migratesTo: '2.0' },
    '1.8': { status: 'supported',  migratesTo: '2.0' },
    '2.0': { status: 'current',    migratesTo: null },
  },
  v1PresetToV2: {
    subtle:       'minimal-premium',
    professional: 'professional-authority',
    clinical:     'clinical-premium',
    calm:         'clinical-premium',
    editorial:    'luxury-editorial',
    luxury:       'luxury-editorial',
    friendly:     'friendly-human',
    energetic:    'sports-dynamic',
    sports:       'sports-dynamic',
    'tech-premium': 'tech-futuristic',
    immersive:    'immersive-showcase',
    fresh:        'education-interactive',
  },
  breakingChanges: {
    '2.0': [
      'EXPERIENCE_PRESETS_V2 replaces V1 presets for new generation (V1 still exported)',
      'motionLibrary field added — CSS presets no longer import motion/react',
      'density field required for V2 layout engine',
      'glassEffect flag controls backdrop-filter usage',
    ],
  },
  nonBreaking: [
    'All V1 exports remain available from dynamicExperience/index.js',
    'V1 presets still work with V1.7 components unchanged',
    'New V2 exports are additive — no removal of existing APIs',
    'motionConfig.js, interactionEngine.js, videoEngine.js untouched',
    'performanceBudget.js untouched (extended in performanceBudgetV2.js)',
  ],
});

export function migrateV1PresetId(v1Id) {
  return COMPAT_REGISTRY.v1PresetToV2[v1Id] ?? null;
}

export function isV2Compatible(version) {
  return version in COMPAT_REGISTRY.versions && COMPAT_REGISTRY.versions[version].status !== 'deprecated';
}
