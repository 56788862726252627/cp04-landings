// Differentiation Engine — ADV-07

export const DIFFERENTIATION_LEVEL = Object.freeze({
  COPY:              'COPY',
  MINOR_VARIATION:   'MINOR_VARIATION',
  GENUINELY_DIFFERENT:'GENUINELY_DIFFERENT',
});

const DIFFERENTIATING_DIMENSIONS = [
  'typographyProfile',
  'surfaceProfile',
  'brandPersonality',
  'motionLevel',
  'navigationPattern',
  'dashboardPattern',
  'heroPattern',
  'contentTone',
  'visualDensity',
];

export function evaluateExperienceDifferentiation(profiles = []) {
  if (profiles.length < 2) {
    return Object.freeze({ level: DIFFERENTIATION_LEVEL.GENUINELY_DIFFERENT, reason: 'single profile', score: 100, isReal: false });
  }

  let totalDifferent = 0;
  let comparisons    = 0;

  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const a = profiles[i];
      const b = profiles[j];
      let diff = 0;
      for (const dim of DIFFERENTIATING_DIMENSIONS) {
        const va = JSON.stringify(a[dim] ?? null);
        const vb = JSON.stringify(b[dim] ?? null);
        if (va !== vb) diff++;
      }
      totalDifferent += diff;
      comparisons++;
    }
  }

  const avgDiff  = comparisons > 0 ? totalDifferent / comparisons : 0;
  const maxDiff  = DIFFERENTIATING_DIMENSIONS.length;
  const score    = Math.round((avgDiff / maxDiff) * 100);

  const level = score >= 50 ? DIFFERENTIATION_LEVEL.GENUINELY_DIFFERENT
    : score >= 20            ? DIFFERENTIATION_LEVEL.MINOR_VARIATION
    : DIFFERENTIATION_LEVEL.COPY;

  return Object.freeze({
    level,
    score,
    avgDifferentDimensions: Math.round(avgDiff * 10) / 10,
    totalDimensions: maxDiff,
    isReal: false,
  });
}

export const DIFFERENTIATION_ENGINE_VERSION = '1.0.0';
