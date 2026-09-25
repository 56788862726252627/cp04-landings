// CRM Retention Policy — ADV-09 CRM

export const RETENTION_PERIOD = Object.freeze({
  ACTIVE_LEAD:   365,
  NURTURE_LEAD:  730,
  LOST_DEAL:     1095,
  WON_DEAL:      2555,
  CONTACT_LOG:   365,
  ACTIVITY_LOG:  180,
});

export function createRetentionPolicy(overrides = {}) {
  return Object.freeze({
    version:       '1.0.0',
    periods:       Object.freeze({ ...RETENTION_PERIOD, ...overrides }),
    purgeOnDelete: true,
    archiveOnExpiry: true,
    note:          'Retention periods in days. Data purged after expiry unless legal hold applies.',
    isReal: false,
  });
}

export function evaluateRetentionEligibility(record = {}, policy = createRetentionPolicy()) {
  const { type, createdAt, closedAt } = record;
  const refDate = closedAt || createdAt;
  if (!refDate) return Object.freeze({ eligible: false, reason: 'No reference date', isReal: false });

  const retentionDays = policy.periods[type] ?? 365;
  const ageMs   = Date.now() - new Date(refDate).getTime();
  const ageDays = Math.floor(ageMs / 86400000);
  const eligible = ageDays > retentionDays;

  return Object.freeze({
    eligible,
    ageDays,
    retentionDays,
    reason: eligible ? 'Past retention period' : 'Within retention period',
    isReal: false,
  });
}

export const RETENTION_POLICY_VERSION = '1.0.0';
