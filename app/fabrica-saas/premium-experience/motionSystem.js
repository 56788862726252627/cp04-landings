// Premium Motion System — ADV-07

export const MOTION_POLICY_LEVEL = Object.freeze({
  NONE:     'NONE',
  LOW:      'LOW',
  STANDARD: 'STANDARD',
  RICH:     'RICH',
});

const MOTION_CONFIGS = Object.freeze({
  NONE: {
    transitions:      false,
    animations:       false,
    parallax:         false,
    stagger:          false,
    heroMotion:       false,
    scrollEffects:    false,
    durationMultiplier: 0,
  },
  LOW: {
    transitions:      true,
    animations:       false,
    parallax:         false,
    stagger:          false,
    heroMotion:       false,
    scrollEffects:    false,
    durationMultiplier: 0.5,
    allowedTransitions: ['opacity', 'color', 'background-color', 'border-color'],
  },
  STANDARD: {
    transitions:      true,
    animations:       true,
    parallax:         false,
    stagger:          true,
    heroMotion:       false,
    scrollEffects:    true,
    durationMultiplier: 1,
    allowedScrollEffects: ['fade-in', 'slide-up', 'stagger-reveal'],
  },
  RICH: {
    transitions:      true,
    animations:       true,
    parallax:         true,
    stagger:          true,
    heroMotion:       true,
    scrollEffects:    true,
    durationMultiplier: 1.2,
    allowedScrollEffects: ['fade-in', 'slide-up', 'stagger-reveal', 'parallax-subtle', 'counter-on-visible'],
  },
});

export function createMotionPolicy(level = MOTION_POLICY_LEVEL.STANDARD) {
  const config = MOTION_CONFIGS[level] ?? MOTION_CONFIGS.STANDARD;
  return Object.freeze({
    level,
    ...config,
    respectsReducedMotion: true,
    reducedMotionFallback: MOTION_POLICY_LEVEL.NONE,
    isNotDemoApp:          true,
    isReal:                false,
  });
}

export function evaluateMotionPolicy(policy = {}) {
  const warnings = [];
  if (policy.level === MOTION_POLICY_LEVEL.RICH && !policy.respectsReducedMotion) {
    warnings.push('RICH motion must respect prefers-reduced-motion');
  }
  if (policy.parallax && policy.level === MOTION_POLICY_LEVEL.LOW) {
    warnings.push('parallax should not be used with LOW motion level');
  }
  return Object.freeze({ valid: warnings.length === 0, warnings, isReal: false });
}

export const MOTION_SYSTEM_VERSION = '1.0.0';
