// OpenRouter Provider — ADV-16
// Implements AI Router provider interface.
// execute() is BLOCKED — fixture simulation only.
// NO_REAL_OPENROUTER_CALLS=SI

import { PROVIDER_TYPE, PROVIDER_STATUS, PROVIDER_AUTH_TYPE, createAIProviderDefinition } from './aiProviderDefinition.js';
import { createOpenRouterAuthProfile, validateAuthProfile } from './openRouterAuthProfile.js';

export const OPENROUTER_EXECUTE_STATUS = Object.freeze({
  FIXTURE_ONLY: 'FIXTURE_ONLY',
  BLOCKED:      'BLOCKED',
  AUTH_MISSING: 'AUTH_MISSING',
  POLICY_BLOCK: 'POLICY_BLOCK',
});

export function createOpenRouterProvider(config = {}) {
  const {
    secretConfigured = false,
    enabledModels    = [],
    routingRole      = 'FALLBACK', // PRIMARY | SECONDARY | FALLBACK | DISABLED
    priority         = 40,
    fallbackPriority = 20,
  } = config;

  const authProfile = createOpenRouterAuthProfile({ secretConfigured });

  const definition = createAIProviderDefinition({
    id:                      'openrouter',
    name:                    'OpenRouter',
    type:                    PROVIDER_TYPE.OPENROUTER,
    status:                  secretConfigured ? PROVIDER_STATUS.ACTIVE : PROVIDER_STATUS.INACTIVE,
    capabilities:            ['CHAT', 'REASONING', 'CODING', 'VISION', 'LONG_CONTEXT', 'MULTILINGUAL'],
    models:                  enabledModels,
    authType:                PROVIDER_AUTH_TYPE.SECRET_REF,
    costProfile:             'VARIABLE',
    latencyProfile:          'VARIABLE',
    privacyProfile:          'PUBLIC_SAFE',
    supportsStreaming:        true,
    supportsTools:            true,
    supportsVision:           true,
    supportsStructuredOutput: true,
    priority,
    fallbackPriority,
  });

  return Object.freeze({
    definition,
    authProfile,
    routingRole,

    validateConfig() {
      return validateAuthProfile(authProfile);
    },

    listConfiguredModels() {
      return Object.freeze([...enabledModels]);
    },

    estimateRequest(requestProfile = {}) {
      return Object.freeze({
        provider:          'openrouter',
        estimatedCostClass: requestProfile.costSensitivity === 'LOW' ? 'HIGH' : 'MEDIUM',
        confidence:        'LOW',
        source:            'FIXTURE',
        isReal:            false,
      });
    },

    prepareRequest(requestProfile = {}) {
      const authCheck = validateAuthProfile(authProfile);
      if (!authCheck.valid) {
        return Object.freeze({ prepared: false, reason: authCheck.reason, isReal: false });
      }
      return Object.freeze({
        prepared: true,
        provider: 'openrouter',
        secretRef: authProfile.secretReference,
        model:    requestProfile.preferredModel ?? 'auto',
        isReal:   false,
      });
    },

    execute() {
      // BLOCKED — no real calls in ADV-16
      return Object.freeze({
        status:  OPENROUTER_EXECUTE_STATUS.BLOCKED,
        reason:  'Real OpenRouter execution not enabled in ADV-16. Use fixture simulation.',
        isReal:  false,
      });
    },

    normalizeResponse(raw = {}) {
      return Object.freeze({
        provider: 'openrouter',
        model:    raw.model ?? 'unknown',
        content:  raw.choices?.[0]?.message?.content ?? '',
        usage:    raw.usage ?? {},
        isReal:   false,
      });
    },

    health() {
      return Object.freeze({
        provider:  'openrouter',
        status:    secretConfigured ? 'HEALTHY' : 'UNAVAILABLE',
        reason:    secretConfigured ? null : 'AUTH_NOT_CONFIGURED',
        isReal:    false,
      });
    },
  });
}

export const OPENROUTER_PROVIDER_VERSION = '1.0.0';
