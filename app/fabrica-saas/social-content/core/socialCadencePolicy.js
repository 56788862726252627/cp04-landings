// Social Cadence Policy — defines posting frequency rules per channel

export const CADENCE_PRESET = Object.freeze({
  LIGHT:    'LIGHT',     // 2–3 posts/week
  STANDARD: 'STANDARD',  // 4–5 posts/week
  HEAVY:    'HEAVY',     // 6+ posts/week
  CUSTOM:   'CUSTOM',
});

const CADENCE_DEFAULTS = Object.freeze({
  LIGHT:    { postsPerWeek: 2, minDaysBetweenPosts: 2, maxPerDay: 1 },
  STANDARD: { postsPerWeek: 4, minDaysBetweenPosts: 1, maxPerDay: 1 },
  HEAVY:    { postsPerWeek: 7, minDaysBetweenPosts: 1, maxPerDay: 2 },
  CUSTOM:   { postsPerWeek: 3, minDaysBetweenPosts: 1, maxPerDay: 1 },
});

export function createSocialCadencePolicy(config = {}) {
  const preset = config.preset ?? CADENCE_PRESET.STANDARD;
  if (!CADENCE_DEFAULTS[preset]) throw new Error(`Unknown cadence preset: ${preset}`);

  const defaults = CADENCE_DEFAULTS[preset];
  return Object.freeze({
    preset,
    postsPerWeek:          config.postsPerWeek          ?? defaults.postsPerWeek,
    minDaysBetweenPosts:   config.minDaysBetweenPosts   ?? defaults.minDaysBetweenPosts,
    maxPerDay:             config.maxPerDay             ?? defaults.maxPerDay,
    preferredDays:         Object.freeze(config.preferredDays ?? ['TUE', 'THU', 'SAT']),
    preferredTimeSlots:    Object.freeze(config.preferredTimeSlots ?? ['09:00', '18:00']),
    noRealSchedule:        true,
    isReal:                false,
  });
}

export function evaluateCadenceCompliance(entry, policy) {
  const issues = [];
  if (policy.postsPerWeek < 1) issues.push('CADENCE_TOO_LOW');
  if (policy.maxPerDay < 1)    issues.push('MAX_PER_DAY_TOO_LOW');
  return Object.freeze({ compliant: issues.length === 0, issues, isReal: false });
}
