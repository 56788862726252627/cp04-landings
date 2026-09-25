// AI Routing Policy — ADV-16
// Selects provider+model considering ALL factors. Never selects on price alone.

import { ROUTING_MODE, DEFAULT_ROUTING_MODE } from './aiRoutingMode.js';
import { selectAIModel }    from './aiModelSelector.js';
import { QUALITY_TARGET_LEVEL } from './aiRequestProfile.js';

export function createAIRoutingPolicy(config = {}) {
  const {
    defaultMode          = DEFAULT_ROUTING_MODE,
    allowedProviders     = null,   // null = all
    blockedProviders     = [],
    localPreference      = false,
    qualityFloor         = QUALITY_TARGET_LEVEL.BASIC,
  } = config;

  return Object.freeze({
    defaultMode,
    allowedProviders: allowedProviders ? Object.freeze([...allowedProviders]) : null,
    blockedProviders: Object.freeze([...blockedProviders]),
    localPreference,
    qualityFloor,

    route(catalog = [], requestProfile = {}, overrideMode = null) {
      const mode = overrideMode ?? defaultMode;

      // Filter by allowed/blocked providers
      let filtered = catalog;
      if (blockedProviders.length) {
        filtered = filtered.filter(m => !blockedProviders.includes(m.provider));
      }
      if (allowedProviders) {
        filtered = filtered.filter(m => allowedProviders.includes(m.provider));
      }
      // LOCAL_FIRST: prefer local provider if capability match
      if (localPreference || mode === ROUTING_MODE.LOCAL_FIRST) {
        const local = filtered.filter(m => m.provider === 'local');
        if (local.length) filtered = local;
      }

      const result = selectAIModel(filtered, requestProfile, mode);

      // Quality floor check: CRITICAL tasks must not use BASIC models
      const qualityMap = { BASIC: 1, STANDARD: 2, HIGH: 3, PREMIUM: 4 };
      const targetMap  = { BASIC: 1, STANDARD: 2, HIGH: 3, CRITICAL: 4 };
      if (result.selectedModel) {
        const selected = catalog.find(m => m.modelId === result.selectedModel);
        if (selected) {
          const modelQ  = qualityMap[selected.qualityClass] ?? 1;
          const required = targetMap[requestProfile.qualityTarget] ?? 1;
          if (modelQ < required) {
            return Object.freeze({
              ...result,
              selectedProvider: null,
              selectedModel:    null,
              routingReasonSummary: `Quality floor not met: model=${selected.qualityClass}, required=${requestProfile.qualityTarget}`,
              policyBlocked: true,
              isReal: false,
            });
          }
        }
      }

      return Object.freeze({ ...result, policyBlocked: false, routingMode: mode, isReal: false });
    },
    isReal: false,
  });
}

export const AI_ROUTING_POLICY_VERSION = '1.0.0';
