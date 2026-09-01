// Visual Complexity Score — ADV-07

export const COMPLEXITY_LEVEL = Object.freeze({
  SIMPLE:    'SIMPLE',    // 0-30
  MODERATE:  'MODERATE',  // 31-60
  COMPLEX:   'COMPLEX',   // 61-80
  OVERLOADED:'OVERLOADED',// 81-100
});

export const COMPLEXITY_FACTOR = Object.freeze({
  CARD_COUNT:       'CARD_COUNT',
  COLOR_COUNT:      'COLOR_COUNT',
  MOTION_ELEMENTS:  'MOTION_ELEMENTS',
  METRIC_DENSITY:   'METRIC_DENSITY',
  CTA_COUNT:        'CTA_COUNT',
  WIDGET_COUNT:     'WIDGET_COUNT',
});

const FACTOR_WEIGHTS = Object.freeze({
  CARD_COUNT:      { perUnit: 3,  threshold: 6  },
  COLOR_COUNT:     { perUnit: 5,  threshold: 5  },
  MOTION_ELEMENTS: { perUnit: 4,  threshold: 4  },
  METRIC_DENSITY:  { perUnit: 6,  threshold: 4  },
  CTA_COUNT:       { perUnit: 8,  threshold: 2  },
  WIDGET_COUNT:    { perUnit: 4,  threshold: 6  },
});

export function calculateVisualComplexity(factors = {}) {
  let score = 0;
  const breakdown = {};

  for (const [factor, config] of Object.entries(FACTOR_WEIGHTS)) {
    const value   = factors[factor] ?? 0;
    const excess  = Math.max(0, value - config.threshold);
    const points  = excess * config.perUnit;
    score        += points;
    breakdown[factor] = { value, excess, points };
  }

  const clampedScore = Math.min(100, Math.max(0, score));
  const level = clampedScore <= 30  ? COMPLEXITY_LEVEL.SIMPLE
    : clampedScore <= 60             ? COMPLEXITY_LEVEL.MODERATE
    : clampedScore <= 80             ? COMPLEXITY_LEVEL.COMPLEX
    : COMPLEXITY_LEVEL.OVERLOADED;

  return Object.freeze({
    score:     clampedScore,
    level,
    breakdown,
    overloaded: level === COMPLEXITY_LEVEL.OVERLOADED,
    isReal:    false,
  });
}

export const VISUAL_COMPLEXITY_SCORE_VERSION = '1.0.0';
