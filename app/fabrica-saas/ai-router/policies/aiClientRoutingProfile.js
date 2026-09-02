// AI Client Routing Profile — ADV-16

import { DEFAULT_ROUTING_MODE } from '../routing/aiRoutingMode.js';

export function createAIClientRoutingProfile(config = {}) {
  const {
    clientId          = 'unknown',
    routingMode       = DEFAULT_ROUTING_MODE,
    allowedProviders  = null,
    blockedProviders  = [],
    allowedModels     = null,
    qualityTarget     = 'STANDARD',
    costPolicy        = null,
    privacyPolicy     = null,
    fallbackPolicy    = null,
    localPreference   = false,
  } = config;

  return Object.freeze({
    clientId,
    routingMode,
    allowedProviders:  allowedProviders  ? Object.freeze([...allowedProviders])  : null,
    blockedProviders:  Object.freeze([...blockedProviders]),
    allowedModels:     allowedModels     ? Object.freeze([...allowedModels])     : null,
    qualityTarget,
    costPolicy,
    privacyPolicy,
    fallbackPolicy,
    localPreference,
    isReal: false,
  });
}

export const AI_CLIENT_ROUTING_PROFILE_VERSION = '1.0.0';
