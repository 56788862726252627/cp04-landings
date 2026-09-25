/**
 * Factory Dynamic Experience Engine — Experience Presets V1.7
 *
 * 11 presets that define the motion and interaction personality of a generated app.
 * Each preset is a set of configurable dimensions; vertical identity (colors, fonts)
 * is handled separately by the design system — these presets only affect behaviour.
 *
 * No external animation library required. All dimensions map to CSS custom properties
 * and vanilla JS interaction patterns.
 */

// ─── Valid enum values ────────────────────────────────────────────────────────

export const MOTION_INTENSITY_VALUES = ['none', 'low', 'medium', 'high'];
export const TRANSITION_SPEED_VALUES = ['instant', 'fast', 'normal', 'slow', 'very-slow'];
export const HOVER_DEPTH_VALUES      = ['none', 'minimal', 'moderate', 'deep'];
export const CARD_MOTION_VALUES      = ['none', 'subtle-lift', 'tilt', 'glow', 'scale-up'];
export const HERO_MOTION_VALUES      = ['none', 'fade', 'slide-up', 'gradient-shift', 'parallax', 'video'];
export const VIDEO_BEHAVIOR_VALUES   = ['none', 'on-demand', 'ambient-loop', 'autoplay-silent'];
export const REDUCED_MOTION_FALLBACK_VALUES = ['static', 'fade-only', 'minimal'];

/**
 * Scroll effects available per preset.
 * Applied progressively — lower intensity presets use fewer effects.
 */
export const SCROLL_EFFECT_CATALOG = [
  'fade-in',
  'slide-up',
  'stagger-reveal',
  'parallax-subtle',
  'sticky-section',
  'progress-on-scroll',
  'counter-on-visible',
];

// ─── Preset definitions ───────────────────────────────────────────────────────

/**
 * @typedef {Object} ExperiencePreset
 * @property {string}   motionIntensity       - 'none'|'low'|'medium'|'high'
 * @property {string}   transitionSpeed       - 'instant'|'fast'|'normal'|'slow'|'very-slow'
 * @property {string[]} scrollEffects         - effects from SCROLL_EFFECT_CATALOG
 * @property {string}   hoverDepth            - 'none'|'minimal'|'moderate'|'deep'
 * @property {string}   cardMotion            - 'none'|'subtle-lift'|'tilt'|'glow'|'scale-up'
 * @property {string}   heroMotion            - 'none'|'fade'|'slide-up'|'gradient-shift'|'parallax'|'video'
 * @property {boolean}  chartAnimation        - animate charts on visibility
 * @property {string}   navigationTransitions - 'fade'|'slide'|'instant'
 * @property {boolean}  backgroundMotion      - subtle background movement
 * @property {string}   videoBehavior         - 'none'|'on-demand'|'ambient-loop'|'autoplay-silent'
 * @property {string}   reducedMotionFallback - 'static'|'fade-only'|'minimal'
 */

export const EXPERIENCE_PRESETS = Object.freeze({

  subtle: {
    motionIntensity:       'low',
    transitionSpeed:       'slow',
    scrollEffects:         ['fade-in'],
    hoverDepth:            'minimal',
    cardMotion:            'none',
    heroMotion:            'fade',
    chartAnimation:        false,
    navigationTransitions: 'fade',
    backgroundMotion:      false,
    videoBehavior:         'none',
    reducedMotionFallback: 'static',
  },

  professional: {
    motionIntensity:       'low',
    transitionSpeed:       'normal',
    scrollEffects:         ['fade-in', 'slide-up'],
    hoverDepth:            'minimal',
    cardMotion:            'subtle-lift',
    heroMotion:            'fade',
    chartAnimation:        true,
    navigationTransitions: 'fade',
    backgroundMotion:      false,
    videoBehavior:         'on-demand',
    reducedMotionFallback: 'fade-only',
  },

  clinical: {
    motionIntensity:       'low',
    transitionSpeed:       'fast',
    scrollEffects:         ['fade-in', 'slide-up'],
    hoverDepth:            'minimal',
    cardMotion:            'subtle-lift',
    heroMotion:            'fade',
    chartAnimation:        true,
    navigationTransitions: 'instant',
    backgroundMotion:      false,
    videoBehavior:         'on-demand',
    reducedMotionFallback: 'static',
  },

  calm: {
    motionIntensity:       'low',
    transitionSpeed:       'very-slow',
    scrollEffects:         ['fade-in'],
    hoverDepth:            'minimal',
    cardMotion:            'subtle-lift',
    heroMotion:            'gradient-shift',
    chartAnimation:        false,
    navigationTransitions: 'fade',
    backgroundMotion:      false,
    videoBehavior:         'ambient-loop',
    reducedMotionFallback: 'static',
  },

  editorial: {
    motionIntensity:       'medium',
    transitionSpeed:       'slow',
    scrollEffects:         ['fade-in', 'slide-up', 'stagger-reveal'],
    hoverDepth:            'moderate',
    cardMotion:            'subtle-lift',
    heroMotion:            'slide-up',
    chartAnimation:        true,
    navigationTransitions: 'slide',
    backgroundMotion:      false,
    videoBehavior:         'on-demand',
    reducedMotionFallback: 'fade-only',
  },

  luxury: {
    motionIntensity:       'medium',
    transitionSpeed:       'very-slow',
    scrollEffects:         ['fade-in', 'slide-up', 'stagger-reveal', 'parallax-subtle'],
    hoverDepth:            'moderate',
    cardMotion:            'glow',
    heroMotion:            'gradient-shift',
    chartAnimation:        true,
    navigationTransitions: 'fade',
    backgroundMotion:      true,
    videoBehavior:         'ambient-loop',
    reducedMotionFallback: 'fade-only',
  },

  friendly: {
    motionIntensity:       'medium',
    transitionSpeed:       'normal',
    scrollEffects:         ['fade-in', 'slide-up', 'stagger-reveal'],
    hoverDepth:            'moderate',
    cardMotion:            'scale-up',
    heroMotion:            'slide-up',
    chartAnimation:        true,
    navigationTransitions: 'fade',
    backgroundMotion:      false,
    videoBehavior:         'on-demand',
    reducedMotionFallback: 'fade-only',
  },

  energetic: {
    motionIntensity:       'high',
    transitionSpeed:       'fast',
    scrollEffects:         ['fade-in', 'slide-up', 'stagger-reveal', 'counter-on-visible'],
    hoverDepth:            'deep',
    cardMotion:            'scale-up',
    heroMotion:            'slide-up',
    chartAnimation:        true,
    navigationTransitions: 'slide',
    backgroundMotion:      true,
    videoBehavior:         'autoplay-silent',
    reducedMotionFallback: 'fade-only',
  },

  sports: {
    motionIntensity:       'high',
    transitionSpeed:       'fast',
    scrollEffects:         ['fade-in', 'slide-up', 'stagger-reveal', 'counter-on-visible', 'progress-on-scroll'],
    hoverDepth:            'deep',
    cardMotion:            'scale-up',
    heroMotion:            'video',
    chartAnimation:        true,
    navigationTransitions: 'slide',
    backgroundMotion:      true,
    videoBehavior:         'autoplay-silent',
    reducedMotionFallback: 'minimal',
  },

  'tech-premium': {
    motionIntensity:       'medium',
    transitionSpeed:       'fast',
    scrollEffects:         ['fade-in', 'slide-up', 'stagger-reveal', 'sticky-section'],
    hoverDepth:            'moderate',
    cardMotion:            'subtle-lift',
    heroMotion:            'gradient-shift',
    chartAnimation:        true,
    navigationTransitions: 'instant',
    backgroundMotion:      true,
    videoBehavior:         'on-demand',
    reducedMotionFallback: 'fade-only',
  },

  immersive: {
    motionIntensity:       'high',
    transitionSpeed:       'slow',
    scrollEffects:         ['fade-in', 'slide-up', 'stagger-reveal', 'parallax-subtle', 'sticky-section'],
    hoverDepth:            'deep',
    cardMotion:            'tilt',
    heroMotion:            'video',
    chartAnimation:        true,
    navigationTransitions: 'slide',
    backgroundMotion:      true,
    videoBehavior:         'autoplay-silent',
    reducedMotionFallback: 'fade-only',
  },
});

// ─── CSS variable mapping ─────────────────────────────────────────────────────

const SPEED_MAP = {
  instant:   '0ms',
  fast:      '150ms',
  normal:    '250ms',
  slow:      '400ms',
  'very-slow': '700ms',
};

const INTENSITY_EASING_MAP = {
  none:   'linear',
  low:    'ease-out',
  medium: 'cubic-bezier(0.4, 0, 0.2, 1)',
  high:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

/**
 * Build CSS custom property map for a preset.
 * Inject into :root or a scoped element.
 */
export function buildPresetCssVars(presetName) {
  const preset = EXPERIENCE_PRESETS[presetName] ?? EXPERIENCE_PRESETS.subtle;
  return {
    '--exp-duration':       SPEED_MAP[preset.transitionSpeed]    ?? '250ms',
    '--exp-easing':         INTENSITY_EASING_MAP[preset.motionIntensity] ?? 'ease-out',
    '--exp-hover-scale':    preset.hoverDepth === 'deep' ? '1.04' : preset.hoverDepth === 'moderate' ? '1.02' : '1.01',
    '--exp-hover-shadow':   preset.hoverDepth === 'deep'
      ? '0 20px 60px rgba(0,0,0,0.15)'
      : preset.hoverDepth === 'moderate'
        ? '0 12px 40px rgba(0,0,0,0.10)'
        : '0 4px 16px rgba(0,0,0,0.06)',
    '--exp-card-motion':    preset.cardMotion,
    '--exp-bg-motion':      preset.backgroundMotion ? '1' : '0',
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get the full experience preset config, with optional client overrides.
 * Overrides are shallow-merged per field.
 *
 * @param {string} vertical - sector name
 * @param {Object} [clientOverrides] - partial preset fields to override
 * @param {string} [explicitPreset] - override preset name
 * @returns {ExperiencePreset & { presetName: string, cssVars: Object }}
 */
export async function getExperiencePreset(vertical, clientOverrides = {}, explicitPreset = null) {
  const { VERTICAL_EXPERIENCE_MAP } = await import('./verticalMapping.js').catch(() => ({ VERTICAL_EXPERIENCE_MAP: {} }));
  const verticalMap = VERTICAL_EXPERIENCE_MAP[vertical] ?? {};
  const presetName  = explicitPreset ?? verticalMap.defaultPreset ?? 'professional';
  const base        = EXPERIENCE_PRESETS[presetName] ?? EXPERIENCE_PRESETS.professional;
  const merged      = { ...base, ...clientOverrides };

  return {
    ...merged,
    presetName,
    cssVars: buildPresetCssVars(presetName),
  };
}

/**
 * Synchronous variant — use when verticalMapping is already imported.
 * @param {string} presetName - key from EXPERIENCE_PRESETS
 * @param {Object} [overrides]
 * @returns {ExperiencePreset & { presetName: string, cssVars: Object }}
 */
export function resolvePreset(presetName, overrides = {}) {
  const base   = EXPERIENCE_PRESETS[presetName] ?? EXPERIENCE_PRESETS.professional;
  const merged = { ...base, ...overrides };
  return {
    ...merged,
    presetName,
    cssVars: buildPresetCssVars(presetName),
  };
}

/**
 * List of all preset names.
 */
export function getSupportedPresets() {
  return Object.keys(EXPERIENCE_PRESETS);
}

/**
 * Validate a preset name.
 */
export function isValidPreset(name) {
  return Object.prototype.hasOwnProperty.call(EXPERIENCE_PRESETS, name);
}
