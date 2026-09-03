// Consent Management Platform Foundation — ADV-19

export const CMP_REGION = Object.freeze({
  EU_EEA:   'EU_EEA',
  UK:       'UK',
  GLOBAL:   'GLOBAL',
  UNKNOWN:  'UNKNOWN',
});

export const CMP_CONSENT_STATE = Object.freeze({
  FULL:    'FULL',
  PARTIAL: 'PARTIAL',
  DENIED:  'DENIED',
  PENDING: 'PENDING',
  UNKNOWN: 'UNKNOWN',
});

export function createConsentManagementPlatformFoundation(config = {}) {
  const {
    categories = [],
    vendors = [],
    purposes = [],
    consentState = CMP_CONSENT_STATE.UNKNOWN,
    policyVersion = '1.0.0',
    regionProfile = CMP_REGION.EU_EEA,
    bannerConfiguration = null,
    preferenceCenter = false,
    realProviderConnected = false,
    clientId = null,
  } = config;

  const warnings = [];
  if (realProviderConnected) warnings.push('REAL_CMP_PROVIDER_NOT_ACTIVE_IN_ADV19');
  if (categories.length === 0) warnings.push('NO_CATEGORIES_DEFINED');
  if (consentState === CMP_CONSENT_STATE.UNKNOWN) warnings.push('CONSENT_STATE_UNKNOWN');

  return Object.freeze({
    clientId,
    categories: Object.freeze([...categories]),
    vendors: Object.freeze([...vendors]),
    purposes: Object.freeze([...purposes]),
    consentState,
    policyVersion,
    regionProfile,
    bannerConfiguration,
    preferenceCenter,
    realProviderConnected: false,
    warnings: Object.freeze([...warnings]),
    isReal: false,
  });
}

export const CMP_FOUNDATION_VERSION = '1.0.0';
