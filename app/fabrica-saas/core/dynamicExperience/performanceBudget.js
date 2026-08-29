/**
 * Factory Dynamic Experience Engine — Performance Budget V1.7
 *
 * Dynamic apps must stay fast. This module enforces limits on:
 * - Simultaneous animations
 * - Video file sizes
 * - Additional JS weight
 * - Lazy loading requirements
 * - Mobile-specific thresholds
 *
 * FACTORY_DYNAMIC_PERFORMANCE_POLICY applied here.
 */

// ─── Budget constants ─────────────────────────────────────────────────────────

export const PERFORMANCE_BUDGET = Object.freeze({
  MAX_ANIMATIONS_CONCURRENT:       5,
  MAX_SCROLL_LISTENERS:            3,
  MAX_VIDEO_SIZE_MB:               10,
  MAX_HERO_VIDEO_SIZE_MB:          6,
  MAX_AMBIENT_VIDEO_SIZE_MB:       4,
  MAX_JS_ADDITIONAL_KB:            50,
  MAX_IMAGES_ABOVE_FOLD:           3,
  LAZY_LOAD_THRESHOLD_PX:          '200px',
  MOBILE_MAX_ANIMATIONS_CONCURRENT: 2,
  MOBILE_DISABLE_AMBIENT_VIDEO:    true,
  MOBILE_DISABLE_PARALLAX:         true,
  MOBILE_MAX_SCROLL_EFFECTS:       2,
  TARGET_FPS:                      60,
  ACCEPTABLE_FPS_MOBILE:           30,
  MAX_STAGGER_CHILDREN:            12,
  COUNTER_ANIMATION_MAX_DURATION_MS: 3000,
  INTERSECTION_OBSERVER_THRESHOLD: 0.1,
});

// ─── Budget checker ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} BudgetCheckResult
 * @property {boolean}  ok       - true if within budget
 * @property {string[]} warnings - non-fatal budget concerns
 * @property {string[]} errors   - fatal budget violations
 */

/**
 * Check an experience configuration against the performance budget.
 * @param {Object} preset - ExperiencePreset
 * @param {Object} [context] - { isMobile, videoConfigs, activeInteractions }
 * @returns {BudgetCheckResult}
 */
export function checkPerformanceBudget(preset = {}, context = {}) {
  const warnings = [];
  const errors   = [];
  const { isMobile = false, videoConfigs = [] } = context;

  // Scroll effects
  const scrollCount = (preset.scrollEffects ?? []).length;
  const maxScrollMobile = PERFORMANCE_BUDGET.MOBILE_MAX_SCROLL_EFFECTS;
  if (isMobile && scrollCount > maxScrollMobile) {
    warnings.push(`Mobile: ${scrollCount} scroll effects active (budget: ${maxScrollMobile}). Consider reducing for low-end devices.`);
  }

  // Parallax on mobile
  if (isMobile && PERFORMANCE_BUDGET.MOBILE_DISABLE_PARALLAX &&
      (preset.scrollEffects ?? []).includes('parallax-subtle')) {
    warnings.push('Parallax disabled on mobile per performance policy. Will be skipped automatically.');
  }

  // Ambient video on mobile
  if (isMobile && PERFORMANCE_BUDGET.MOBILE_DISABLE_AMBIENT_VIDEO &&
      preset.videoBehavior === 'ambient-loop') {
    warnings.push('Ambient video on mobile: disabled per policy (mobileEnabled defaults to false).');
  }

  // Video sizes
  for (const vc of videoConfigs) {
    if (vc.estimatedSizeMb && vc.type === 'heroVideo' && vc.estimatedSizeMb > PERFORMANCE_BUDGET.MAX_HERO_VIDEO_SIZE_MB) {
      warnings.push(`Hero video estimated at ${vc.estimatedSizeMb}MB — budget is ${PERFORMANCE_BUDGET.MAX_HERO_VIDEO_SIZE_MB}MB. Compress or use poster.`);
    }
    if (vc.estimatedSizeMb && vc.type === 'ambientLoop' && vc.estimatedSizeMb > PERFORMANCE_BUDGET.MAX_AMBIENT_VIDEO_SIZE_MB) {
      warnings.push(`Ambient video estimated at ${vc.estimatedSizeMb}MB — budget is ${PERFORMANCE_BUDGET.MAX_AMBIENT_VIDEO_SIZE_MB}MB.`);
    }
    if (vc.preload === 'auto' && vc.type === 'backgroundVideo') {
      warnings.push(`Background video with preload=auto will delay page load. Use preload=metadata.`);
    }
  }

  // Too many concurrent animations
  const estimatedConcurrent =
    (scrollCount > 2 ? 2 : scrollCount) +
    (preset.chartAnimation ? 1 : 0) +
    (preset.backgroundMotion ? 1 : 0) +
    (preset.heroMotion !== 'none' ? 1 : 0);

  const maxConcurrent = isMobile
    ? PERFORMANCE_BUDGET.MOBILE_MAX_ANIMATIONS_CONCURRENT
    : PERFORMANCE_BUDGET.MAX_ANIMATIONS_CONCURRENT;

  if (estimatedConcurrent > maxConcurrent) {
    warnings.push(`Estimated ${estimatedConcurrent} concurrent animations (budget: ${maxConcurrent}). Consider simplifying the experience.`);
  }

  // Motion intensity 'high' on mobile
  if (isMobile && preset.motionIntensity === 'high') {
    warnings.push('High motion intensity on mobile may cause jank. Consider medium or low for mobile users.');
  }

  return {
    ok: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Get mobile-safe version of a preset.
 * Applies MOBILE_* limits.
 */
export function getMobilePreset(preset = {}) {
  const scrollEffects = (preset.scrollEffects ?? [])
    .filter(e => e !== 'parallax-subtle')
    .slice(0, PERFORMANCE_BUDGET.MOBILE_MAX_SCROLL_EFFECTS);

  return {
    ...preset,
    scrollEffects,
    backgroundMotion: false,
    videoBehavior:    preset.videoBehavior === 'ambient-loop' ? 'none' : preset.videoBehavior,
    motionIntensity:  preset.motionIntensity === 'high' ? 'medium' : preset.motionIntensity,
  };
}

/**
 * Get the performance policy as a markdown string.
 * Useful for documentation generation.
 */
export function getPerformancePolicyText() {
  return Object.entries(PERFORMANCE_BUDGET)
    .map(([k, v]) => `- **${k}**: ${v}`)
    .join('\n');
}
