// Container Build Cache Policy — ADV-15

export const CACHE_SCOPE = Object.freeze({
  LOCAL:     'local',
  REGISTRY:  'registry',
  INLINE:    'inline',
  DISABLED:  'disabled',
});

export function createContainerBuildCachePolicy(config = {}) {
  return Object.freeze({
    scope:          config.scope ?? CACHE_SCOPE.LOCAL,
    cacheFrom:      config.cacheFrom ?? [],
    cacheTo:        config.cacheTo ?? [],
    noSecretCache:  true,
    invalidateOn: Object.freeze([
      'lockfile-change',
      'dockerfile-change',
      'base-image-update',
    ]),
    isReal: false,
  });
}

export function validateCacheSafety(cacheConfig = {}) {
  // Check values only, not property names
  const values = Object.values(cacheConfig).join(' ');
  const secretInValue = /secret|password|token|api_key/i.test(values);
  return Object.freeze({
    safe:   !secretInValue,
    reason: secretInValue ? 'Cache key contains secret-like data' : null,
    isReal: false,
  });
}

export const CONTAINER_BUILD_CACHE_POLICY_VERSION = '1.0.0';
