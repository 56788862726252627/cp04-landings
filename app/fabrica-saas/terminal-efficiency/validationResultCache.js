// Validation Result Cache — ADV-05
// Memoizes non-sensitive test/lint/build results by content hash.
// Never caches security-critical results.

export const CACHE_STATUS = Object.freeze({
  HIT:       'HIT',
  MISS:      'MISS',
  STALE:     'STALE',
  BYPASSED:  'BYPASSED',
});

export const CACHEABLE_OPERATIONS = Object.freeze(['TESTS', 'LINT', 'BUILD', 'DOCS_CHECK']);
export const NEVER_CACHE = Object.freeze(['SECRET_SCAN', 'SECURITY_AUDIT', 'DEPLOY', 'BILLING']);

function makeKey(operation, fileHash) {
  return `CACHE-${operation.toUpperCase()}::${fileHash}`;
}

export function createValidationResultCache(options = {}) {
  const ttlMs = options.ttlMs ?? 5 * 60 * 1000; // 5 min default
  const store = new Map();
  let hits = 0, misses = 0, bypasses = 0;

  function canCache(operation) {
    return CACHEABLE_OPERATIONS.includes(operation) && !NEVER_CACHE.includes(operation);
  }

  function tryGet(operation, fileHash) {
    if (!canCache(operation)) {
      bypasses++;
      return { status: CACHE_STATUS.BYPASSED, result: null, reason: 'operation not cacheable' };
    }
    const key = makeKey(operation, fileHash);
    const entry = store.get(key);
    if (!entry) { misses++; return { status: CACHE_STATUS.MISS, result: null }; }
    const age = Date.now() - entry.timestamp;
    if (age > ttlMs) {
      store.delete(key);
      misses++;
      return { status: CACHE_STATUS.STALE, result: null, ageMs: age };
    }
    hits++;
    return { status: CACHE_STATUS.HIT, result: entry.result, ageMs: age, isReal: false };
  }

  function store_(operation, fileHash, result) {
    if (!canCache(operation)) return false;
    const key = makeKey(operation, fileHash);
    store.set(key, { result, timestamp: Date.now(), operation, fileHash });
    return true;
  }

  function invalidate(fileHash) {
    let count = 0;
    for (const key of store.keys()) {
      if (key.includes(fileHash)) { store.delete(key); count++; }
    }
    return count;
  }

  function stats() {
    return { hits, misses, bypasses, size: store.size, hitRate: hits + misses > 0 ? Math.round(hits / (hits + misses) * 100) : 0, isReal: false };
  }

  return Object.freeze({ tryGet, store: store_, invalidate, stats, canCache });
}

export const VALIDATION_RESULT_CACHE_VERSION = '1.0.0';
