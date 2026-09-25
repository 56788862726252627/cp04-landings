// AI Model Block Policy — ADV-16
// Blocks: deprecated, unsafe, unsupported, disabled, policy-incompatible.

export const BLOCK_REASON = Object.freeze({
  DEPRECATED:            'DEPRECATED',
  UNSAFE:                'UNSAFE',
  UNSUPPORTED:           'UNSUPPORTED',
  DISABLED:              'DISABLED',
  POLICY_INCOMPATIBLE:   'POLICY_INCOMPATIBLE',
  CAPABILITY_MISMATCH:   'CAPABILITY_MISMATCH',
});

export function createAIModelBlockPolicy(config = {}) {
  const {
    blockedModelIds  = [],
    blockedProviders = [],
    blockedStatuses  = ['DEPRECATED', 'DISABLED', 'UNAVAILABLE'],
  } = config;

  const modelSet    = new Set(blockedModelIds);
  const providerSet = new Set(blockedProviders);
  const statusSet   = new Set(blockedStatuses);

  return Object.freeze({
    isBlocked(model) {
      if (modelSet.has(model.modelId)) {
        return Object.freeze({ blocked: true, reason: BLOCK_REASON.DISABLED, isReal: false });
      }
      if (providerSet.has(model.provider)) {
        return Object.freeze({ blocked: true, reason: BLOCK_REASON.POLICY_INCOMPATIBLE, isReal: false });
      }
      if (statusSet.has(model.status)) {
        return Object.freeze({ blocked: true, reason: BLOCK_REASON.DEPRECATED, isReal: false });
      }
      return Object.freeze({ blocked: false, reason: null, isReal: false });
    },

    filterCatalog(catalog = []) {
      return catalog.filter(m => !this.isBlocked(m).blocked);
    },
    isReal: false,
  });
}

export const AI_MODEL_BLOCK_POLICY_VERSION = '1.0.0';
