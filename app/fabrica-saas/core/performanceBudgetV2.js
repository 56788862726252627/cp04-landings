/**
 * Factory Performance Budget V2
 * Extends V1.7 budget with V2 motion library and glass effect considerations.
 */

import { checkPerformanceBudget, PERFORMANCE_BUDGET } from './dynamicExperience/performanceBudget.js';
import { getBudgetForPreset } from '../factory-registry/performance.js';

// ─── V2 budget extensions ─────────────────────────────────────────────────────

export const PERFORMANCE_BUDGET_V2 = Object.freeze({
  ...PERFORMANCE_BUDGET,
  // motion/react specifics
  MOTION_REACT_MAX_SIMULTANEOUS_SPRINGS: 8,
  MOTION_REACT_MAX_LAYOUT_ANIMATIONS:    4,
  MOTION_REACT_MOBILE_MAX_SPRINGS:       3,
  // Glass effect cost
  GLASS_EFFECT_MAX_CONCURRENT:           3,
  GLASS_EFFECT_MOBILE_DISABLED:          true,
  // V2 stagger
  MAX_STAGGER_ITEMS:                     20,
  STAGGER_FAST_THRESHOLD:                8,
  // Blur
  BLUR_EFFECT_MAX_CONCURRENT:            2,
  // Video in V2
  MAX_AMBIENT_VIDEOS:                    1,
  AMBIENT_VIDEO_MOBILE:                  false,
});

// ─── V2 budget check ──────────────────────────────────────────────────────────

/**
 * Full V2 budget check including motion library overhead.
 */
export function checkPerformanceBudgetV2(preset = {}, context = {}) {
  const v1Result = checkPerformanceBudget(preset, context);
  const warnings = [...v1Result.warnings];
  const errors   = [...v1Result.errors];

  const { isMobile = false, activeGlassComponents = 0, activeSprings = 0, activeLayoutAnimations = 0 } = context;
  const presetId = context.presetId;

  // Glass effect checks
  if (preset.glassEffect && isMobile) {
    warnings.push('Glass effect disabled on mobile — will fallback to solid background');
  }
  if (!isMobile && activeGlassComponents > PERFORMANCE_BUDGET_V2.GLASS_EFFECT_MAX_CONCURRENT) {
    warnings.push(`${activeGlassComponents} glass components active (budget: ${PERFORMANCE_BUDGET_V2.GLASS_EFFECT_MAX_CONCURRENT}). Consider limiting to hero/nav only.`);
  }

  // Motion/react spring checks
  const springLimit = isMobile
    ? PERFORMANCE_BUDGET_V2.MOTION_REACT_MOBILE_MAX_SPRINGS
    : PERFORMANCE_BUDGET_V2.MOTION_REACT_MAX_SIMULTANEOUS_SPRINGS;
  if (activeSprings > springLimit) {
    warnings.push(`${activeSprings} active springs (budget: ${springLimit}). Use CSS transitions for secondary animations.`);
  }

  // Layout animation checks
  if (activeLayoutAnimations > PERFORMANCE_BUDGET_V2.MOTION_REACT_MAX_LAYOUT_ANIMATIONS) {
    errors.push(`${activeLayoutAnimations} layout animations (hard limit: ${PERFORMANCE_BUDGET_V2.MOTION_REACT_MAX_LAYOUT_ANIMATIONS}). Layout animations are expensive — use sparingly.`);
  }

  // Preset-level budget
  if (presetId) {
    const budget = getBudgetForPreset(presetId, isMobile);
    if (context.jsKb > budget.maxJsKb) {
      warnings.push(`JS bundle ${context.jsKb}KB exceeds preset budget of ${budget.maxJsKb}KB for ${presetId}.`);
    }
  }

  return {
    ok:       errors.length === 0,
    warnings,
    errors,
    v2:       true,
  };
}

// ─── Motion library decision ──────────────────────────────────────────────────

/**
 * Decide whether to use motion/react or CSS for a given preset + context.
 */
export function shouldUseMotionReact(preset = {}, context = {}) {
  const { isMobile = false, prefersReducedMotion = false } = context;
  if (prefersReducedMotion)  return false;
  if (isMobile && preset.motionIntensity === 'high') return false;
  return preset.motionLibrary === 'motion';
}

export { checkPerformanceBudget, PERFORMANCE_BUDGET };
export const PERF_BUDGET_V2_VERSION = '2.0.0';
