// Evaluation Retention Policy — ADV-10

export const RETENTION_TIER = Object.freeze({
  EPHEMERAL:   'EPHEMERAL',   // session only
  SHORT_TERM:  'SHORT_TERM',  // up to 7 days
  STANDARD:    'STANDARD',    // up to 30 days
  LONG_TERM:   'LONG_TERM',   // up to 90 days
  PERMANENT:   'PERMANENT',   // golden dataset fixtures
});

const RETENTION_DAYS = Object.freeze({
  EPHEMERAL:   0,
  SHORT_TERM:  7,
  STANDARD:    30,
  LONG_TERM:   90,
  PERMANENT:   null,
});

export function createEvaluationRetentionPolicy(fields = {}) {
  const tier  = fields.tier ?? RETENTION_TIER.STANDARD;
  const days  = RETENTION_DAYS[tier] ?? 30;
  return Object.freeze({
    tier,
    retentionDays: days,
    autoDelete:    fields.autoDelete ?? (tier !== RETENTION_TIER.PERMANENT),
    applyRedaction: fields.applyRedaction ?? true,
    note: 'No real data stored — fixture/synthetic only',
    isReal: false,
  });
}

export function getRetentionTierForData(data = {}) {
  if (data.isGolden || data.isFixture) return RETENTION_TIER.PERMANENT;
  if (data.containsPII)                return RETENTION_TIER.EPHEMERAL;
  if (data.isRegression)               return RETENTION_TIER.LONG_TERM;
  return RETENTION_TIER.STANDARD;
}

export const RETENTION_POLICY_VERSION = '1.0.0';
