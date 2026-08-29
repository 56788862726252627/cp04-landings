/**
 * Factory Dynamic Experience Engine — Motion Config V1.7
 *
 * Utilities for:
 * - Building motion CSS custom properties
 * - Detecting prefers-reduced-motion
 * - Generating scroll effect configurations
 * - Managing reduced motion fallbacks
 *
 * All values are CSS-compatible. No external animation libraries.
 * Works in Node (for generation) and browser (for runtime).
 */

// ─── Motion tokens ────────────────────────────────────────────────────────────

export const TRANSITION_DURATION = Object.freeze({
  instant:   0,
  fast:      150,
  normal:    250,
  slow:      400,
  'very-slow': 700,
});

export const EASING = Object.freeze({
  linear:      'linear',
  ease:        'ease',
  easeIn:      'ease-in',
  easeOut:     'ease-out',
  easeInOut:   'ease-in-out',
  spring:      'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth:      'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate:  'cubic-bezier(0, 0, 0.2, 1)',
  accelerate:  'cubic-bezier(0.4, 0, 1, 1)',
  sharp:       'cubic-bezier(0.4, 0, 0.6, 1)',
});

export const MOTION_INTENSITY_LEVELS = ['none', 'low', 'medium', 'high'];

// ─── Scroll effect definitions ────────────────────────────────────────────────

export const SCROLL_EFFECTS = Object.freeze({
  'fade-in': {
    initial:   { opacity: 0 },
    animate:   { opacity: 1 },
    threshold: 0.1,
    once:      true,
  },
  'slide-up': {
    initial:   { opacity: 0, transform: 'translateY(32px)' },
    animate:   { opacity: 1, transform: 'translateY(0)' },
    threshold: 0.1,
    once:      true,
  },
  'stagger-reveal': {
    initial:   { opacity: 0, transform: 'translateY(24px)' },
    animate:   { opacity: 1, transform: 'translateY(0)' },
    threshold: 0.05,
    staggerMs: 80,
    once:      true,
  },
  'parallax-subtle': {
    type:        'parallax',
    speed:       0.15,
    threshold:   0,
    once:        false,
    requiresJS:  true,
  },
  'sticky-section': {
    type:       'sticky',
    threshold:  0,
    once:       false,
    requiresJS: true,
  },
  'progress-on-scroll': {
    type:       'progress',
    target:     'document',
    threshold:  0,
    once:       false,
    requiresJS: true,
  },
  'counter-on-visible': {
    type:       'counter',
    duration:   2000,
    threshold:  0.3,
    once:       true,
    requiresJS: true,
  },
});

// ─── CSS generation ───────────────────────────────────────────────────────────

/**
 * Build CSS custom properties for a given motion preset.
 * Returns an object of CSS variable name → value.
 *
 * @param {Object} preset - ExperiencePreset object
 * @returns {Object} CSS vars map
 */
export function buildMotionCss(preset = {}) {
  const speed     = preset.transitionSpeed ?? 'normal';
  const intensity = preset.motionIntensity ?? 'low';

  const duration = TRANSITION_DURATION[speed] ?? 250;
  const easing   = intensity === 'high'
    ? EASING.spring
    : intensity === 'medium'
      ? EASING.smooth
      : EASING.decelerate;

  return {
    '--motion-duration':      `${duration}ms`,
    '--motion-easing':        easing,
    '--motion-scale-hover':   intensity === 'high' ? '1.04' : intensity === 'medium' ? '1.02' : '1.01',
    '--motion-fade-distance': intensity === 'high' ? '40px' : intensity === 'medium' ? '24px' : '16px',
    '--motion-stagger-delay': `${intensity === 'high' ? 60 : intensity === 'medium' ? 80 : 100}ms`,
    '--motion-parallax-speed': intensity === 'high' ? '0.25' : intensity === 'medium' ? '0.15' : '0.08',
  };
}

/**
 * Build the reduced-motion override CSS string.
 * Should be injected into a <style> tag.
 */
export function buildReducedMotionCss() {
  return `
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .parallax, [data-parallax] { transform: none !important; }
  .animate-on-scroll { opacity: 1 !important; transform: none !important; }
  video[autoplay] { display: none; }
  .ambient-video { display: none; }
}`.trim();
}

/**
 * Build the full motion CSS string for injection.
 * @param {Object} preset - ExperiencePreset
 * @param {string} presetName
 */
export function buildMotionStyleSheet(preset, presetName = '') {
  const vars = buildMotionCss(preset);
  const varDecls = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  const reducedMotion = buildReducedMotionCss();

  return `:root[data-experience="${presetName}"], :root {\n${varDecls}\n}\n\n${reducedMotion}`;
}

// ─── Runtime utilities ────────────────────────────────────────────────────────

/**
 * Detect if the user prefers reduced motion.
 * Safe to call in both Node and browser (returns false in Node).
 */
export function detectReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get the appropriate fallback config when reduced motion is active.
 * @param {Object} preset
 * @returns {Object} simplified preset safe for reduced motion
 */
export function getReducedMotionPreset(preset = {}) {
  const fallback = preset.reducedMotionFallback ?? 'static';

  if (fallback === 'static') {
    return {
      ...preset,
      motionIntensity:       'none',
      scrollEffects:         [],
      heroMotion:            'none',
      backgroundMotion:      false,
      videoBehavior:         'none',
      cardMotion:            'none',
      chartAnimation:        false,
      navigationTransitions: 'instant',
    };
  }

  if (fallback === 'fade-only') {
    return {
      ...preset,
      motionIntensity:       'low',
      scrollEffects:         ['fade-in'],
      heroMotion:            'fade',
      backgroundMotion:      false,
      videoBehavior:         'none',
      cardMotion:            'none',
      chartAnimation:        false,
      navigationTransitions: 'fade',
    };
  }

  // 'minimal'
  return {
    ...preset,
    motionIntensity:       'low',
    scrollEffects:         ['fade-in', 'slide-up'],
    backgroundMotion:      false,
    videoBehavior:         'on-demand',
  };
}

/**
 * Get scroll effect config for active effects in a preset.
 * @param {string[]} effectNames
 * @returns {Object[]}
 */
export function getActiveScrollEffects(effectNames = []) {
  return effectNames
    .filter(name => Object.prototype.hasOwnProperty.call(SCROLL_EFFECTS, name))
    .map(name => ({ name, ...SCROLL_EFFECTS[name] }));
}
