// Provider Fixtures — ADV-16
import { createAIProviderDefinition, PROVIDER_TYPE, PROVIDER_STATUS, PROVIDER_AUTH_TYPE } from '../providers/aiProviderDefinition.js';

export const FIXTURE_DIRECT_PREMIUM = createAIProviderDefinition({
  id: 'direct-premium', name: 'Direct Premium Provider', type: PROVIDER_TYPE.DIRECT,
  status: PROVIDER_STATUS.ACTIVE, capabilities: ['CHAT','REASONING','CODING','VISION','STRUCTURED_OUTPUT','TOOLS','PREMIUM_QUALITY'],
  authType: PROVIDER_AUTH_TYPE.SECRET_REF, costProfile: 'HIGH', latencyProfile: 'NORMAL',
  privacyProfile: 'BUSINESS_INTERNAL', supportsTools: true, supportsVision: true,
  supportsStructuredOutput: true, priority: 90, fallbackPriority: 80,
});

export const FIXTURE_DIRECT_FAST = createAIProviderDefinition({
  id: 'direct-fast', name: 'Direct Fast Provider', type: PROVIDER_TYPE.DIRECT,
  status: PROVIDER_STATUS.ACTIVE, capabilities: ['CHAT','TOOLS','FAST_RESPONSE','LOW_COST'],
  authType: PROVIDER_AUTH_TYPE.SECRET_REF, costProfile: 'LOW', latencyProfile: 'VERY_FAST',
  privacyProfile: 'PUBLIC_SAFE', supportsTools: true, priority: 70, fallbackPriority: 60,
});

export const FIXTURE_OPENROUTER = createAIProviderDefinition({
  id: 'openrouter', name: 'OpenRouter (Fixture)', type: PROVIDER_TYPE.OPENROUTER,
  status: PROVIDER_STATUS.INACTIVE, capabilities: ['CHAT','REASONING','CODING','VISION','MULTILINGUAL','LONG_CONTEXT'],
  authType: PROVIDER_AUTH_TYPE.SECRET_REF, costProfile: 'VARIABLE', latencyProfile: 'VARIABLE',
  privacyProfile: 'PUBLIC_SAFE', supportsTools: true, supportsVision: true,
  supportsStructuredOutput: true, priority: 40, fallbackPriority: 30,
});

export const FIXTURE_LOCAL = createAIProviderDefinition({
  id: 'local', name: 'Local Model (Ollama)', type: PROVIDER_TYPE.LOCAL,
  status: PROVIDER_STATUS.ACTIVE, capabilities: ['CHAT','CODING','FAST_RESPONSE','LOW_COST','VOICE_PLANNING'],
  authType: PROVIDER_AUTH_TYPE.NONE, costProfile: 'FREE', latencyProfile: 'FAST',
  privacyProfile: 'RESTRICTED', supportsTools: false, priority: 60, fallbackPriority: 50,
});

export const FIXTURE_UNAVAILABLE_PROVIDER = createAIProviderDefinition({
  id: 'unavailable', name: 'Unavailable Provider', type: PROVIDER_TYPE.DIRECT,
  status: PROVIDER_STATUS.UNAVAILABLE, capabilities: ['CHAT'],
  authType: PROVIDER_AUTH_TYPE.SECRET_REF, costProfile: 'MEDIUM', latencyProfile: 'UNKNOWN',
  privacyProfile: 'PUBLIC_SAFE', priority: 30, fallbackPriority: 10,
});

export const FIXTURE_EXPENSIVE_PROVIDER = createAIProviderDefinition({
  id: 'expensive', name: 'Very Expensive Provider', type: PROVIDER_TYPE.DIRECT,
  status: PROVIDER_STATUS.ACTIVE, capabilities: ['CHAT','REASONING','PREMIUM_QUALITY'],
  authType: PROVIDER_AUTH_TYPE.SECRET_REF, costProfile: 'HIGH', latencyProfile: 'SLOW',
  privacyProfile: 'BUSINESS_INTERNAL', priority: 50, fallbackPriority: 40,
});

export const ALL_PROVIDER_FIXTURES = Object.freeze([
  FIXTURE_DIRECT_PREMIUM,
  FIXTURE_DIRECT_FAST,
  FIXTURE_OPENROUTER,
  FIXTURE_LOCAL,
  FIXTURE_UNAVAILABLE_PROVIDER,
  FIXTURE_EXPENSIVE_PROVIDER,
]);

export const PROVIDER_FIXTURES_VERSION = '1.0.0';
