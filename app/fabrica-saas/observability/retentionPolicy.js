// Retention Policy — ADV-01 Transversal Observability
// Declarative retention and privacy model. No real deletion yet — returns policy object.

export const RETENTION_ENVIRONMENT = Object.freeze({
  DEVELOPMENT: 'development',
  STAGING:     'staging',
  PRODUCTION:  'production',
  TEST:        'test',
});

export const EVENT_RETENTION_DAYS = Object.freeze({
  DEBUG:    3,
  INFO:     30,
  WARNING:  90,
  ERROR:    180,
  CRITICAL: 365,
  SECURITY: 730, // 2 years (audit trail)
  AUDIT:    730,
});

/**
 * Create a declarative ObservabilityRetentionPolicy.
 */
export function createRetentionPolicy(config = {}) {
  const environment = config.environment ?? RETENTION_ENVIRONMENT.PRODUCTION;

  const isDev  = environment === RETENTION_ENVIRONMENT.DEVELOPMENT || environment === RETENTION_ENVIRONMENT.TEST;
  const isProd = environment === RETENTION_ENVIRONMENT.PRODUCTION;

  const policy = Object.freeze({
    environment,
    piiRedaction:     config.piiRedaction    ?? true,
    secretRedaction:  config.secretRedaction ?? true,

    retentionDays: Object.freeze({
      debug:    isDev ? 1 : (config.retentionDays?.debug    ?? EVENT_RETENTION_DAYS.DEBUG),
      info:     isDev ? 7 : (config.retentionDays?.info     ?? EVENT_RETENTION_DAYS.INFO),
      warning:  config.retentionDays?.warning  ?? EVENT_RETENTION_DAYS.WARNING,
      error:    config.retentionDays?.error    ?? EVENT_RETENTION_DAYS.ERROR,
      critical: config.retentionDays?.critical ?? EVENT_RETENTION_DAYS.CRITICAL,
      security: config.retentionDays?.security ?? EVENT_RETENTION_DAYS.SECURITY,
      audit:    config.retentionDays?.audit    ?? EVENT_RETENTION_DAYS.AUDIT,
    }),

    storePII:           config.storePII         ?? false,
    storeStackTraces:   config.storeStackTraces ?? false,  // never in prod
    compressOlderThan:  config.compressOlderThan ?? (isProd ? 30 : null),

    eventTypes: Object.freeze({
      debug:      config.eventTypes?.debug    ?? !isProd,  // no DEBUG in prod
      info:       config.eventTypes?.info     ?? true,
      warning:    config.eventTypes?.warning  ?? true,
      error:      config.eventTypes?.error    ?? true,
      critical:   config.eventTypes?.critical ?? true,
      security:   config.eventTypes?.security ?? true,
    }),

    securityRetention:  config.securityRetention ?? EVENT_RETENTION_DAYS.SECURITY,
    auditRetention:     config.auditRetention    ?? EVENT_RETENTION_DAYS.AUDIT,

    gdprCompliant:      config.gdprCompliant ?? true,
    dataResidency:      config.dataResidency ?? 'EU',

    disclaimer: 'This policy is declarative. Apply it when connecting a real store (Supabase/PostgreSQL).',
  });

  return { valid: true, policy };
}

/**
 * Check if an event should be stored based on the policy.
 */
export function shouldStoreEvent(event, policy) {
  if (!event || !policy) return false;
  const level = event.severity?.toLowerCase?.() ?? 'info';
  return policy.eventTypes[level] !== false;
}

/**
 * Calculate the retention expiry date for an event.
 */
export function getRetentionExpiry(event, policy) {
  if (!event || !policy) return null;

  let days;
  if (event.eventType === 'SECURITY' || event.eventType === 'AUDIT') {
    days = policy.securityRetention ?? EVENT_RETENTION_DAYS.SECURITY;
  } else {
    const level = event.severity?.toLowerCase?.() ?? 'info';
    days = policy.retentionDays[level] ?? EVENT_RETENTION_DAYS.INFO;
  }

  const ts = new Date(event.timestamp ?? Date.now());
  ts.setDate(ts.getDate() + days);
  return ts.toISOString();
}

export const RETENTION_POLICY_VERSION = '1.0.0';
