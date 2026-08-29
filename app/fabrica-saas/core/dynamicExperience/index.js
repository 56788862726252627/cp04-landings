/**
 * Factory Dynamic Experience Engine — V1.7
 * Central entry point for all dynamic experience functionality.
 */

// Presets
export {
  EXPERIENCE_PRESETS,
  MOTION_INTENSITY_VALUES,
  TRANSITION_SPEED_VALUES,
  HOVER_DEPTH_VALUES,
  CARD_MOTION_VALUES,
  HERO_MOTION_VALUES,
  VIDEO_BEHAVIOR_VALUES,
  REDUCED_MOTION_FALLBACK_VALUES,
  SCROLL_EFFECT_CATALOG,
  buildPresetCssVars,
  resolvePreset,
  getSupportedPresets,
  isValidPreset,
} from './presets.js';

// Vertical mapping
export {
  VERTICAL_EXPERIENCE_MAP,
  HERO_TYPES,
  INTERACTION_CATALOG,
  getVerticalExperience,
  getMappedVerticals,
  getDefaultPresetForVertical,
} from './verticalMapping.js';

// Motion config
export {
  TRANSITION_DURATION,
  EASING,
  MOTION_INTENSITY_LEVELS,
  SCROLL_EFFECTS,
  buildMotionCss,
  buildReducedMotionCss,
  buildMotionStyleSheet,
  detectReducedMotion,
  getReducedMotionPreset,
  getActiveScrollEffects,
} from './motionConfig.js';

// Video engine
export {
  VIDEO_TYPES,
  buildVideoConfig,
  resolveVideoManifest,
  getVideoElementProps,
  shouldDisableVideo,
  getVideoFallback,
  validateVideoPerformance,
} from './videoEngine.js';

// Interaction engine
export {
  INTERACTION_DEFINITIONS,
  getInteractionDefinition,
  isInteractionCompatibleWithPreset,
  getInteractionsForPreset,
  buildInteractionClasses,
  buildInteractionReducedMotionCss,
  validateInteractionList,
} from './interactionEngine.js';

// Performance budget
export {
  PERFORMANCE_BUDGET,
  checkPerformanceBudget,
  getMobilePreset,
  getPerformancePolicyText,
} from './performanceBudget.js';

// ─── Convenience: getExperienceConfig ────────────────────────────────────────

import { resolvePreset } from './presets.js';
import { VERTICAL_EXPERIENCE_MAP, getDefaultPresetForVertical } from './verticalMapping.js';
import { buildMotionCss, getReducedMotionPreset } from './motionConfig.js';
import { resolveVideoManifest } from './videoEngine.js';
import { getMobilePreset } from './performanceBudget.js';

/**
 * Main entry point for getting a complete dynamic experience configuration
 * from a manifest.
 *
 * @param {Object} manifest - client manifest
 * @param {Object} [context] - { isMobile, reducedMotion }
 * @returns {Object} complete experience config
 */
export function getExperienceConfig(manifest = {}, context = {}) {
  const vertical       = manifest.vertical ?? manifest.sector ?? 'dental';
  const expSection     = manifest.experience ?? {};
  const { isMobile = false, reducedMotion = false } = context;

  // Resolve preset
  const presetName = expSection.preset ?? getDefaultPresetForVertical(vertical);
  let preset = resolvePreset(presetName, {
    motionIntensity:       expSection.motion       ?? undefined,
    scrollEffects:         expSection.scrollEffects ?? undefined,
    videoBehavior:         expSection.videoBehavior ?? undefined,
  });

  // Apply reduced motion
  if (reducedMotion) {
    preset = getReducedMotionPreset(preset);
  }

  // Apply mobile budget
  if (isMobile) {
    preset = getMobilePreset(preset);
  }

  // Resolve video
  const video = resolveVideoManifest(manifest, vertical);

  // Motion CSS vars
  const motionCss = buildMotionCss(preset);

  // Vertical experience metadata
  const verticalExp = VERTICAL_EXPERIENCE_MAP[vertical] ?? {};

  return {
    preset,
    presetName,
    vertical,
    motionCss,
    video,
    heroType:             verticalExp.heroType   ?? 'split-content',
    emotionalTone:        verticalExp.emotionalTone ?? '',
    recommendedInteractions: verticalExp.recommendedInteractions ?? [],
    activeInteractions:   expSection.interactions ?? verticalExp.recommendedInteractions ?? [],
    isMobile,
    reducedMotion,
  };
}
