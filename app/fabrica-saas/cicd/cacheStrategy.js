// Cache Strategy — ADV-02 CI/CD Automatizado
// Estrategia de caché para CI. Solo cachea node_modules, nunca secretos ni datos de clientes.

export const CACHE_KEY_TYPE = Object.freeze({
  NODE_MODULES: 'NODE_MODULES',
  BUILD_OUTPUT: 'BUILD_OUTPUT',
});

export const CACHE_STATUS = Object.freeze({
  HIT:    'HIT',
  MISS:   'MISS',
  STALE:  'STALE',
  BYPASS: 'BYPASS',
});

const NEVER_CACHE = Object.freeze([
  '.env',
  '.secrets',
  'credentials',
  '*.key',
  '*.pem',
  'client-data',
  'real-client',
]);

/**
 * Generate cache key for node_modules.
 * Based on package-lock.json hash (simulated via lock content snippet).
 */
export function generateCacheKey(type, lockContent = '', options = {}) {
  if (!CACHE_KEY_TYPE[type]) {
    return { valid: false, error: `type must be one of: ${Object.keys(CACHE_KEY_TYPE).join(', ')}` };
  }

  const os     = options.os     ?? 'ubuntu-latest';
  const node   = options.node   ?? '20';
  const prefix = options.prefix ?? 'factory';

  const lockHash = lockContent
    ? String(lockContent.length) + '-' + lockContent.slice(0, 32).replace(/\s/g, '')
    : 'no-lock';

  const key = type === CACHE_KEY_TYPE.NODE_MODULES
    ? `${prefix}-node${node}-${os}-${lockHash}`
    : `${prefix}-build-${os}-${lockHash}`;

  return {
    valid: true,
    type,
    key,
    restoreKeys: [`${prefix}-node${node}-${os}-`, `${prefix}-node${node}-`],
  };
}

/**
 * Get the cache configuration for a standard Factory CI pipeline.
 */
export function getStandardCacheConfig(options = {}) {
  return Object.freeze({
    nodeModules: {
      path:       options.nodeModulesPath ?? 'node_modules',
      keyType:    CACHE_KEY_TYPE.NODE_MODULES,
      lockFile:   'package-lock.json',
      neverCache: NEVER_CACHE,
    },
    invalidation: {
      onLockFileChange: true,
      onSecretChange:   false,
      maxAgeHours:      24,
    },
    disclaimer: 'NEVER_CACHE_SECRETS. Cache is for performance only, never for security data.',
  });
}

/**
 * Validate that a cache path does not include sensitive directories.
 */
export function validateCachePath(cachePath) {
  const sensitive = NEVER_CACHE.some(pattern => {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return regex.test(cachePath);
  });

  return {
    valid:     !sensitive,
    cachePath,
    sensitive,
    message:   sensitive ? `Path "${cachePath}" matches never-cache pattern` : 'Cache path is safe',
  };
}

export const CACHE_STRATEGY_VERSION = '1.0.0';
