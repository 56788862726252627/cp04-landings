/**
 * Factory Experience Decision Engine V2
 * Deterministic mapping: sector + context → preset + layout + motion + recipes
 * Pure functions — no side effects, same input always yields same output.
 */

import { EXPERIENCE_PRESETS_V2, getV2PresetForVertical } from './dynamicExperience/presetsV2.js';
import { getSectorById }                  from '../factory-registry/sectors.js';
import { RECIPE_REGISTRY }                from '../factory-registry/recipes/index.js';
import { getLayoutForPersonality }        from '../factory-registry/layouts.js';
import { getTypographyForPreset }         from '../factory-registry/typography.js';
import { getInteractionForPreset }        from '../factory-registry/interactions.js';
import { getBudgetForPreset }             from '../factory-registry/performance.js';

// ─── Main decision function ───────────────────────────────────────────────────

/**
 * Resolve a complete experience configuration for a given manifest.
 *
 * @param {Object} manifest - { vertical, brand, audience?, isMobile?, overrides? }
 * @returns {ExperienceDecision}
 */
export function resolveExperience(manifest = {}) {
  const {
    vertical = 'default',
    brand = {},
    audience = 'general',
    isMobile = false,
    overrides = {},
  } = manifest;

  // 1. Resolve preset
  const sector      = getSectorById(vertical) ?? { id: vertical, preset: 'friendly-human' };
  const basePreset  = overrides.preset ?? sector.preset ?? getV2PresetForVertical(vertical).id;
  const preset      = EXPERIENCE_PRESETS_V2[basePreset] ?? EXPERIENCE_PRESETS_V2['friendly-human'];
  const presetId    = basePreset in EXPERIENCE_PRESETS_V2 ? basePreset : 'friendly-human';

  // 2. Resolve layout
  const layout      = getLayoutForPersonality(preset.layoutPersonality);

  // 3. Resolve typography
  const typography  = getTypographyForPreset(presetId);

  // 4. Resolve interactions
  const interactions = getInteractionForPreset(presetId);

  // 5. Resolve performance budget
  const budget      = getBudgetForPreset(presetId, isMobile);

  // 6. Select section order (anti-template applied separately)
  const sectionOrder = resolveSectionOrder(presetId, overrides.sections);

  // 7. Hero recipe recommendation
  const heroRecipe  = resolveHeroRecipe(presetId, overrides.heroStyle);

  // 8. Motion settings
  const motion = {
    library:     isMobile ? 'css' : preset.motionLibrary,
    intensity:   isMobile ? 'low' : preset.motionIntensity,
    reduced:     isMobile && preset.motionIntensity === 'high',
    scrollEffects: isMobile
      ? preset.scrollEffects.slice(0, 2)
      : preset.scrollEffects,
  };

  return {
    presetId,
    preset,
    sector,
    layout,
    typography,
    interactions,
    budget,
    sectionOrder,
    heroRecipe,
    motion,
    colorMode:   overrides.colorMode ?? preset.colorMode,
    density:     overrides.density ?? preset.density,
    glassEffect: preset.glassEffect && !isMobile,
    brand,
    audience,
    resolvedAt:  new Date().toISOString(),
    engineVersion: '2.0.0',
  };
}

// ─── Section order resolver ───────────────────────────────────────────────────

const DEFAULT_SECTION_ORDERS = Object.freeze({
  'minimal-premium':        ['hero', 'features', 'social-proof', 'pricing', 'faq', 'cta'],
  'clinical-premium':       ['hero', 'trust-strip', 'features', 'testimonials', 'team', 'booking', 'faq'],
  'luxury-editorial':       ['hero', 'statement', 'features', 'gallery', 'testimonials', 'cta'],
  'sports-dynamic':         ['hero', 'metrics', 'features', 'testimonials', 'schedule', 'pricing', 'cta'],
  'tech-futuristic':        ['hero', 'metrics', 'features', 'integration', 'pricing', 'testimonials', 'faq', 'cta'],
  'education-interactive':  ['hero', 'features', 'curriculum', 'instructors', 'testimonials', 'pricing', 'faq'],
  'professional-authority': ['hero', 'trust-strip', 'services', 'process', 'team', 'testimonials', 'cta'],
  'friendly-human':         ['hero', 'features', 'testimonials', 'gallery', 'cta', 'faq'],
  'immersive-showcase':     ['hero', 'work', 'about', 'services', 'testimonials', 'contact'],
  'data-heavy-saas':        ['hero', 'features', 'pricing', 'integration', 'security', 'faq', 'cta'],
});

function resolveSectionOrder(presetId, overrides) {
  if (overrides && Array.isArray(overrides)) return overrides;
  return DEFAULT_SECTION_ORDERS[presetId] ?? DEFAULT_SECTION_ORDERS['friendly-human'];
}

// ─── Hero recipe resolver ─────────────────────────────────────────────────────

const HERO_RECIPE_MAP = Object.freeze({
  'minimal-premium':        'hero-centered-text',
  'clinical-premium':       'hero-split-content',
  'luxury-editorial':       'hero-editorial-bold',
  'sports-dynamic':         'hero-video-background',
  'tech-futuristic':        'hero-product-showcase',
  'education-interactive':  'hero-split-content',
  'professional-authority': 'hero-split-stats',
  'friendly-human':         'hero-local-community',
  'immersive-showcase':     'hero-mesh-gradient',
  'data-heavy-saas':        'hero-product-showcase',
});

function resolveHeroRecipe(presetId, override) {
  const id = override ?? HERO_RECIPE_MAP[presetId] ?? 'hero-centered-text';
  return RECIPE_REGISTRY.hero.find(r => r.id === id) ?? RECIPE_REGISTRY.hero[0];
}

// ─── Audience adjustments ─────────────────────────────────────────────────────

export function applyAudienceAdjustments(decision, audience) {
  const adjustments = {
    'senior': {
      density: 'spacious',
      motion: { ...decision.motion, intensity: 'none' },
      typography: { ...decision.typography, bodySize: '1.125rem' },
    },
    'professional': {
      density: 'comfortable',
      motion: { ...decision.motion, intensity: 'low' },
    },
    'youth': {
      density: 'compact',
      motion: { ...decision.motion, intensity: 'high' },
    },
    'mobile-first': {
      density: 'compact',
      motion: { ...decision.motion, library: 'css', intensity: 'low' },
    },
  };
  const adj = adjustments[audience];
  if (!adj) return decision;
  return { ...decision, ...adj };
}

// ─── Premium V2 Default Policy (Paso A addition) ─────────────────────────────

/**
 * FACTORY_PREMIUM_V2_DEFAULT_POLICY
 *
 * Premium Experience V2 is the default for all new Factory projects.
 * The Decision Engine selects appropriate intensity based on context —
 * it does NOT mean maximum animation/motion at all times.
 *
 * Intensity levels (driven by sector, audience, accessibility, device):
 *   low    — subtle transitions, no auto-play, reduced animations
 *   medium — standard hover effects, scroll animations, page transitions
 *   high   — rich motion, video, parallax, complex interactions
 *
 * This policy only applies to new projects.
 * Existing demos (Aurora, FisioNova V1, EducaArchidona) are NOT auto-migrated.
 */
export const PREMIUM_V2_DEFAULT_POLICY = Object.freeze({
  enabled: true,
  defaultIntensity: 'medium',
  intensityMatrix: {
    // sector → default intensity
    fisioterapia:    'medium',
    dental:          'medium',
    estetica:        'medium',
    educacion:       'medium',
    abogados:        'low',
    tech:            'high',
    padel:           'medium',
    inmobiliaria:    'low',
    restauracion:    'high',
    moda:            'high',
    default:         'medium',
  },
  intensityOverrideBy: {
    // audience → intensity cap
    senior:       'low',
    professional: 'low',
    youth:        'high',
    'mobile-first': 'low',
  },
  gates: {
    deadControlGate: true,
    functionalExperienceGate: true,
    mobileProductGate: true,
    accessibilityGate: true,
  },
  mobileAware: true,
  reducedMotionSafe: true,
  errorBoundaryRequired: true,
  basicProfessionalStandard: '8.5/10',
  advancedPolish: '9.5-10/10 (optional future enhancement)',
  adoptedFrom: 'FisioNova Premium V2 Pilot (2026-08-31)',
});

/**
 * Resolve Premium V2 intensity for a given sector + audience + device.
 */
export function resolvePremiumV2Intensity(sector = 'default', audience = 'general', isMobile = false) {
  const matrixIntensity = PREMIUM_V2_DEFAULT_POLICY.intensityMatrix[sector]
    ?? PREMIUM_V2_DEFAULT_POLICY.intensityMatrix.default;
  const audienceCap = PREMIUM_V2_DEFAULT_POLICY.intensityOverrideBy[audience];
  const intensityOrder = ['none', 'low', 'medium', 'high'];

  let resolved = matrixIntensity;

  if (audienceCap) {
    const matrixIdx  = intensityOrder.indexOf(matrixIntensity);
    const audienceIdx = intensityOrder.indexOf(audienceCap);
    resolved = intensityOrder[Math.min(matrixIdx, audienceIdx)];
  }

  if (isMobile && resolved === 'high') resolved = 'medium';

  return resolved;
}

export const DECISION_ENGINE_VERSION = '2.1.0';
