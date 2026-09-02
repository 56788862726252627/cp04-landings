// Follow-Up Policy — ADV-09 CRM

export const FOLLOW_UP_CADENCE = Object.freeze({
  DAILY:      'DAILY',
  TWICE_WEEK: 'TWICE_WEEK',
  WEEKLY:     'WEEKLY',
  BIWEEKLY:   'BIWEEKLY',
  MONTHLY:    'MONTHLY',
  ON_TRIGGER: 'ON_TRIGGER',
});

export function createFollowUpPolicy(options = {}) {
  return Object.freeze({
    id:              options.id ?? 'default_followup_policy',
    name:            options.name ?? 'Agency Follow-Up Policy',
    cadenceByTemp:   Object.freeze({
      HOT:    options.hotCadence     ?? FOLLOW_UP_CADENCE.TWICE_WEEK,
      WARM:   options.warmCadence    ?? FOLLOW_UP_CADENCE.WEEKLY,
      COLD:   options.coldCadence    ?? FOLLOW_UP_CADENCE.BIWEEKLY,
      NURTURE:options.nurtureCadence ?? FOLLOW_UP_CADENCE.MONTHLY,
    }),
    maxFollowUps:     options.maxFollowUps ?? 5,
    cooldownDays:     options.cooldownDays ?? 3,
    antiSpam: true,
    note: 'Cadence recommendations only — no automated outreach triggered.',
    isReal: false,
  });
}

export function recommendFollowUpCadence(lead = {}, policy = createFollowUpPolicy()) {
  const temp    = lead.temperature ?? 'COLD';
  const cadence = policy.cadenceByTemp[temp] ?? FOLLOW_UP_CADENCE.BIWEEKLY;

  const cadenceDays = {
    [FOLLOW_UP_CADENCE.DAILY]:      1,
    [FOLLOW_UP_CADENCE.TWICE_WEEK]: 3,
    [FOLLOW_UP_CADENCE.WEEKLY]:     7,
    [FOLLOW_UP_CADENCE.BIWEEKLY]:   14,
    [FOLLOW_UP_CADENCE.MONTHLY]:    30,
    [FOLLOW_UP_CADENCE.ON_TRIGGER]: null,
  };

  return Object.freeze({
    temperature:   temp,
    cadence,
    recommendedIntervalDays: cadenceDays[cadence] ?? null,
    maxFollowUps:  policy.maxFollowUps,
    note:          'Recommendation only — no messages will be sent automatically.',
    isReal: false,
  });
}

export const FOLLOW_UP_POLICY_VERSION = '1.0.0';
