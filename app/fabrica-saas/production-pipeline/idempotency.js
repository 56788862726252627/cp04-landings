// Idempotency — ADV-04
// Prevent duplicate external operations (deploy, DB migration, domain, etc.)

export const IDEMPOTENCY_OPERATION = Object.freeze({
  DEPLOY:       'DEPLOY',
  DB_MIGRATION: 'DB_MIGRATION',
  DOMAIN:       'DOMAIN',
  MAKE_SCENARIO:'MAKE_SCENARIO',
  STRIPE:       'STRIPE',
  EMAIL:        'EMAIL',
});

/**
 * Generate a stable idempotency key for an external operation.
 * Deterministic — same inputs always produce the same key.
 */
export function generateIdempotencyKey(operation, projectId, extra = '') {
  if (!operation)  return null;
  if (!projectId)  return null;
  const base = `${operation}::${projectId}::${extra}`.replace(/\s+/g, '-').toLowerCase();
  return `IDEM-${base}`;
}

/**
 * Create an IdempotencyRegistry (in-memory, for one pipeline run).
 * Prevents duplicate execution of the same external operation.
 */
export function createIdempotencyRegistry() {
  const executed = new Map();

  return {
    /**
     * Try to register an operation.
     * Returns { allowed: true } if first time, { allowed: false, existing } if duplicate.
     */
    tryRegister(key, meta = {}) {
      if (!key) return { allowed: false, error: 'key required' };
      if (executed.has(key)) {
        return { allowed: false, duplicate: true, existing: executed.get(key) };
      }
      const record = Object.freeze({ key, registeredAt: new Date().toISOString(), ...meta });
      executed.set(key, record);
      return { allowed: true, record };
    },

    isRegistered(key) {
      return executed.has(key);
    },

    list() {
      return [...executed.values()];
    },

    size() {
      return executed.size;
    },
  };
}

export const IDEMPOTENCY_VERSION = '1.0.0';
