// Premium Loading Experience — ADV-07

export const LOADING_PATTERN = Object.freeze({
  SKELETON:     'SKELETON',
  PROGRESSIVE:  'PROGRESSIVE',
  INLINE:       'INLINE',
  PAGE:         'PAGE',
  OPTIMISTIC:   'OPTIMISTIC',
});

export const LOADING_THRESHOLD = Object.freeze({
  INSTANT:     200,
  FAST:        500,
  NORMAL:      1000,
  SLOW:        2000,
  CRITICAL:    3000,
});

const PATTERN_RULES = Object.freeze({
  SKELETON:    { showAfterMs: 100, avoidSpinner: true,  hasProgress: false, usesOptimistic: false },
  PROGRESSIVE: { showAfterMs: 100, avoidSpinner: true,  hasProgress: true,  usesOptimistic: false },
  INLINE:      { showAfterMs: 0,   avoidSpinner: false, hasProgress: false, usesOptimistic: false },
  PAGE:        { showAfterMs: 300, avoidSpinner: false, hasProgress: true,  usesOptimistic: false },
  OPTIMISTIC:  { showAfterMs: 0,   avoidSpinner: true,  hasProgress: false, usesOptimistic: true  },
});

export function createLoadingExperience(options = {}) {
  const {
    pattern  = LOADING_PATTERN.SKELETON,
    context  = 'list',
    duration = 0,
  } = options;

  const rule = PATTERN_RULES[pattern] ?? PATTERN_RULES.SKELETON;
  const speedClass = duration < LOADING_THRESHOLD.INSTANT ? 'INSTANT'
    : duration < LOADING_THRESHOLD.FAST    ? 'FAST'
    : duration < LOADING_THRESHOLD.NORMAL  ? 'NORMAL'
    : duration < LOADING_THRESHOLD.SLOW    ? 'SLOW'
    : 'CRITICAL';

  return Object.freeze({
    pattern,
    context,
    ...rule,
    speedClass,
    noInfiniteSpinner: true,
    isReal: false,
  });
}

export function evaluateLoadingQuality(loadingMs = 0) {
  if (loadingMs < LOADING_THRESHOLD.FAST)    return Object.freeze({ grade: 'EXCELLENT', isReal: false });
  if (loadingMs < LOADING_THRESHOLD.NORMAL)  return Object.freeze({ grade: 'GOOD',      isReal: false });
  if (loadingMs < LOADING_THRESHOLD.SLOW)    return Object.freeze({ grade: 'ACCEPTABLE',isReal: false });
  if (loadingMs < LOADING_THRESHOLD.CRITICAL)return Object.freeze({ grade: 'SLOW',      isReal: false });
  return Object.freeze({ grade: 'CRITICAL', isReal: false });
}

export const LOADING_EXPERIENCE_VERSION = '1.0.0';
