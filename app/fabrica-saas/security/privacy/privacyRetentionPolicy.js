// Privacy Retention Policy — ADV-19

export const PRIVACY_RETENTION_PRESET = Object.freeze({
  SESSION:              { days: 1,        label: 'SESSION' },
  SHORT:                { days: 7,        label: 'SHORT' },
  STANDARD:             { days: 30,       label: 'STANDARD' },
  EXTENDED:             { days: 365,      label: 'EXTENDED' },
  LEGAL_HOLD_FOUNDATION:{ days: Infinity, label: 'LEGAL_HOLD_FOUNDATION' },
  CUSTOM:               { days: null,     label: 'CUSTOM' },
});

export const RETENTION_STATE = Object.freeze({
  ACTIVE:   'ACTIVE',
  EXPIRING: 'EXPIRING',
  EXPIRED:  'EXPIRED',
  HOLD:     'HOLD',
});

export function createPrivacyRetentionPolicy(config = {}) {
  const {
    preset = 'STANDARD',
    customDays = null,
    dataType = 'UNKNOWN',
    legalHold = false,
    clientId = null,
  } = config;

  const presetConfig = PRIVACY_RETENTION_PRESET[preset] ?? PRIVACY_RETENTION_PRESET.STANDARD;
  const retentionDays = preset === 'CUSTOM' ? customDays : presetConfig.days;

  return Object.freeze({
    clientId,
    dataType,
    preset,
    retentionDays,
    legalHold,
    effectiveLabel: legalHold ? 'LEGAL_HOLD_FOUNDATION' : preset,
    isReal: false,
  });
}

export function evaluateRetentionState(policy, referenceDate = new Date()) {
  if (policy.legalHold || policy.retentionDays === Infinity) {
    return Object.freeze({ state: RETENTION_STATE.HOLD, daysRemaining: Infinity, isReal: false });
  }
  const createdAt = policy.createdAt ? new Date(policy.createdAt) : new Date();
  const expiresAt = new Date(createdAt.getTime() + (policy.retentionDays ?? 30) * 86400000);
  const ref = new Date(referenceDate);
  const msRemaining = expiresAt.getTime() - ref.getTime();
  const daysRemaining = Math.ceil(msRemaining / 86400000);

  const state = daysRemaining <= 0
    ? RETENTION_STATE.EXPIRED
    : daysRemaining <= 7
      ? RETENTION_STATE.EXPIRING
      : RETENTION_STATE.ACTIVE;

  return Object.freeze({ state, daysRemaining, isReal: false });
}

export const PRIVACY_RETENTION_VERSION = '1.0.0';
