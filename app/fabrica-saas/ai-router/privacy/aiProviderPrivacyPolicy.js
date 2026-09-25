// AI Provider Privacy Policy — ADV-16

export const PRIVACY_CLASS = Object.freeze({
  PUBLIC_SAFE:       'PUBLIC_SAFE',
  BUSINESS_INTERNAL: 'BUSINESS_INTERNAL',
  PERSONAL:          'PERSONAL',
  SENSITIVE:         'SENSITIVE',
  RESTRICTED:        'RESTRICTED',  // requires explicit provider policy
});

const PRIVACY_LEVEL_ORDER = [
  PRIVACY_CLASS.PUBLIC_SAFE,
  PRIVACY_CLASS.BUSINESS_INTERNAL,
  PRIVACY_CLASS.PERSONAL,
  PRIVACY_CLASS.SENSITIVE,
  PRIVACY_CLASS.RESTRICTED,
];

export function privacyLevelIndex(level) {
  const idx = PRIVACY_LEVEL_ORDER.indexOf(level);
  return idx >= 0 ? idx : 0;
}

export function createAIProviderPrivacyPolicy(config = {}) {
  const {
    providerId           = 'unknown',
    maxDataClass         = PRIVACY_CLASS.BUSINESS_INTERNAL,
    requiresExplicitPolicy = false,
    dataRetentionPolicy  = null,
    gdprCompliant        = null,
  } = config;

  return Object.freeze({
    providerId,
    maxDataClass,
    requiresExplicitPolicy,
    dataRetentionPolicy,
    gdprCompliant,

    allows(dataClass) {
      const dataIdx = privacyLevelIndex(dataClass);
      const maxIdx  = privacyLevelIndex(maxDataClass);
      if (dataClass === PRIVACY_CLASS.RESTRICTED && !requiresExplicitPolicy) return false;
      return dataIdx <= maxIdx;
    },
    isReal: false,
  });
}

export function routePrivacy(requestPrivacy, providerPolicy) {
  const allowed = providerPolicy.allows(requestPrivacy);
  return Object.freeze({
    allowed,
    reason: allowed ? null : `Provider does not support ${requestPrivacy} data class`,
    isReal: false,
  });
}

export const AI_PROVIDER_PRIVACY_POLICY_VERSION = '1.0.0';
