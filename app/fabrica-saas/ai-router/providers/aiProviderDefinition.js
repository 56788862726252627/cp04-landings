// AI Provider Definition — ADV-16
// FACTORY_AGENCY_SCOPE_ONLY=SI | NO_REAL_OPENROUTER_CALLS=SI

export const PROVIDER_TYPE = Object.freeze({
  DIRECT:      'DIRECT',
  OPENROUTER:  'OPENROUTER',
  LOCAL:       'LOCAL',
  CUSTOM:      'CUSTOM',
});

export const PROVIDER_STATUS = Object.freeze({
  ACTIVE:       'ACTIVE',
  INACTIVE:     'INACTIVE',
  DEGRADED:     'DEGRADED',
  UNAVAILABLE:  'UNAVAILABLE',
  BLOCKED:      'BLOCKED',
});

export const PROVIDER_AUTH_TYPE = Object.freeze({
  API_KEY:     'API_KEY',
  OAUTH2:      'OAUTH2',
  NONE:        'NONE',
  SECRET_REF:  'SECRET_REF',
});

export function createAIProviderDefinition(config = {}) {
  const {
    id                      = 'unknown',
    name                    = 'Unknown Provider',
    type                    = PROVIDER_TYPE.DIRECT,
    status                  = PROVIDER_STATUS.ACTIVE,
    capabilities            = [],
    models                  = [],
    authType                = PROVIDER_AUTH_TYPE.API_KEY,
    costProfile             = 'UNKNOWN',
    latencyProfile          = 'UNKNOWN',
    privacyProfile          = 'UNKNOWN',
    supportsStreaming        = false,
    supportsTools           = false,
    supportsVision          = false,
    supportsStructuredOutput = false,
    supportsAudio           = false,
    supportsEmbeddings      = false,
    priority                = 50,
    fallbackPriority        = 50,
  } = config;

  return Object.freeze({
    id,
    name,
    type,
    status,
    capabilities:            Object.freeze([...capabilities]),
    models:                  Object.freeze([...models]),
    authType,
    costProfile,
    latencyProfile,
    privacyProfile,
    supportsStreaming,
    supportsTools,
    supportsVision,
    supportsStructuredOutput,
    supportsAudio,
    supportsEmbeddings,
    priority,
    fallbackPriority,
    isReal: false,
  });
}

export function isProviderAvailable(provider) {
  return provider.status === PROVIDER_STATUS.ACTIVE ||
         provider.status === PROVIDER_STATUS.DEGRADED;
}

export const AI_PROVIDER_DEFINITION_VERSION = '1.0.0';
