// Spacing Rhythm Engine — ADV-07

export const SPACING_PROFILE = Object.freeze({
  COMPACT:  'COMPACT',
  BALANCED: 'BALANCED',
  SPACIOUS: 'SPACIOUS',
});

export const SPACING_ISSUE = Object.freeze({
  TOO_TIGHT:       'TOO_TIGHT',
  TOO_LOOSE:       'TOO_LOOSE',
  INCONSISTENT:    'INCONSISTENT',
  FORM_CROWDED:    'FORM_CROWDED',
  CARD_MISALIGNED: 'CARD_MISALIGNED',
});

const SPACING_SCALES = Object.freeze({
  COMPACT:  { 0: 0, 1: 4,  2: 8,  3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80 },
  BALANCED: { 0: 0, 1: 4,  2: 8,  3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96 },
  SPACIOUS: { 0: 0, 1: 4,  2: 8,  3: 16, 4: 24, 5: 32, 6: 40, 8: 56, 10: 72, 12: 96, 16: 128, 20: 160 },
});

const RECOMMENDED_GAPS = Object.freeze({
  COMPACT:  { section: 32, card: 16, form: 12, inline: 8 },
  BALANCED: { section: 48, card: 24, form: 16, inline: 12 },
  SPACIOUS: { section: 80, card: 32, form: 24, inline: 16 },
});

export function createSpacingProfile(visualDensity = 'BALANCED') {
  const profile = SPACING_PROFILE[visualDensity] ?? SPACING_PROFILE.BALANCED;
  const scale   = SPACING_SCALES[profile] ?? SPACING_SCALES.BALANCED;
  const gaps    = RECOMMENDED_GAPS[profile] ?? RECOMMENDED_GAPS.BALANCED;
  return Object.freeze({ profile, scale, gaps, isReal: false });
}

export function evaluateSpacingConsistency(measurements = []) {
  const issues = [];
  if (!measurements.length) return Object.freeze({ valid: true, issues, isReal: false });

  const spacings = measurements.map(m => m.gap ?? m.padding ?? 0);
  const min = Math.min(...spacings);
  const max = Math.max(...spacings);

  if (min < 4) issues.push({ type: SPACING_ISSUE.TOO_TIGHT, value: min });
  if (max > 160) issues.push({ type: SPACING_ISSUE.TOO_LOOSE, value: max });
  if (max / Math.max(min, 1) > 8) issues.push({ type: SPACING_ISSUE.INCONSISTENT, ratio: max / min });

  return Object.freeze({ valid: issues.length === 0, issues, min, max, isReal: false });
}

export const SPACING_RHYTHM_ENGINE_VERSION = '1.0.0';
