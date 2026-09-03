// Multi-Agent Idempotency Policy — ADV-17
// Critical for CRM, booking, communications, automations, and deploys.

export const IDEMPOTENCY_DOMAIN = Object.freeze({
  CRM:           'CRM',
  BOOKING:       'BOOKING',
  COMMUNICATION: 'COMMUNICATION',
  AUTOMATION:    'AUTOMATION',
  DEPLOY:        'DEPLOY',
});

export function createMultiAgentIdempotencyPolicy(config = {}) {
  const {
    domains  = Object.values(IDEMPOTENCY_DOMAIN),
    ttlMs    = 86400000,
  } = config;

  const store = new Map();

  return Object.freeze({
    domains:    Object.freeze([...domains]),
    ttlMs,

    generateKey(domain, action, params = {}) {
      return `${domain}:${action}:${JSON.stringify(params)}`;
    },

    isIdempotent(domain) {
      return domains.includes(domain);
    },

    record(key, result) {
      store.set(key, { result, timestamp: Date.now() });
    },

    check(key) {
      const entry = store.get(key);
      if (!entry) return Object.freeze({ duplicate: false, isReal: false });
      if (Date.now() - entry.timestamp > ttlMs) { store.delete(key); return Object.freeze({ duplicate: false, isReal: false }); }
      return Object.freeze({ duplicate: true, result: entry.result, isReal: false });
    },

    size() { return store.size; },

    isReal: false,
  });
}

export const IDEMPOTENCY_POLICY_VERSION = '1.0.0';
