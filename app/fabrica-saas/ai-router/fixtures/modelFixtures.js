// Model Fixtures — ADV-16 — 20 fixture models
// None of these imply real models. Purely conceptual fixtures.
import { createAIModelDefinition, MODEL_STATUS, QUALITY_CLASS, SPEED_CLASS, COST_CLASS, PRIVACY_CLASS, CONTEXT_CLASS } from '../models/aiModelDefinition.js';

export const FIXTURE_MODEL_FAST_CHAT = createAIModelDefinition({
  provider: 'direct-fast', modelId: 'fixture-fast-chat-v1', displayName: 'Fast Chat (Fixture)',
  capabilities: ['CHAT','FAST_RESPONSE','LOW_COST'], contextClass: CONTEXT_CLASS.SMALL,
  qualityClass: QUALITY_CLASS.BASIC, speedClass: SPEED_CLASS.VERY_FAST, costClass: COST_CLASS.VERY_LOW,
  privacyClass: PRIVACY_CLASS.PUBLIC_SAFE, structuredOutput: false, tools: false, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_BALANCED_CHAT = createAIModelDefinition({
  provider: 'direct-fast', modelId: 'fixture-balanced-chat-v1', displayName: 'Balanced Chat (Fixture)',
  capabilities: ['CHAT','TOOLS','FAST_RESPONSE'], contextClass: CONTEXT_CLASS.MEDIUM,
  qualityClass: QUALITY_CLASS.STANDARD, speedClass: SPEED_CLASS.FAST, costClass: COST_CLASS.LOW,
  privacyClass: PRIVACY_CLASS.PUBLIC_SAFE, structuredOutput: true, tools: true, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_PREMIUM_REASON = createAIModelDefinition({
  provider: 'direct-premium', modelId: 'fixture-premium-reason-v1', displayName: 'Premium Reasoning (Fixture)',
  capabilities: ['CHAT','REASONING','CODING','TOOLS','STRUCTURED_OUTPUT','PREMIUM_QUALITY'], contextClass: CONTEXT_CLASS.LARGE,
  qualityClass: QUALITY_CLASS.PREMIUM, speedClass: SPEED_CLASS.NORMAL, costClass: COST_CLASS.HIGH,
  privacyClass: PRIVACY_CLASS.BUSINESS_INTERNAL, structuredOutput: true, tools: true, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_HIGH_QUALITY = createAIModelDefinition({
  provider: 'direct-premium', modelId: 'fixture-high-quality-v1', displayName: 'High Quality (Fixture)',
  capabilities: ['CHAT','REASONING','TOOLS','STRUCTURED_OUTPUT'], contextClass: CONTEXT_CLASS.MEDIUM,
  qualityClass: QUALITY_CLASS.HIGH, speedClass: SPEED_CLASS.NORMAL, costClass: COST_CLASS.MEDIUM,
  privacyClass: PRIVACY_CLASS.BUSINESS_INTERNAL, structuredOutput: true, tools: true, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_CODING = createAIModelDefinition({
  provider: 'direct-premium', modelId: 'fixture-coding-v1', displayName: 'Coding Specialist (Fixture)',
  capabilities: ['CODING','TOOLS','STRUCTURED_OUTPUT','REASONING'], contextClass: CONTEXT_CLASS.LARGE,
  qualityClass: QUALITY_CLASS.HIGH, speedClass: SPEED_CLASS.NORMAL, costClass: COST_CLASS.MEDIUM,
  privacyClass: PRIVACY_CLASS.BUSINESS_INTERNAL, structuredOutput: true, tools: true, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_VISION = createAIModelDefinition({
  provider: 'direct-premium', modelId: 'fixture-vision-v1', displayName: 'Vision Model (Fixture)',
  capabilities: ['VISION','CHAT','STRUCTURED_OUTPUT'], contextClass: CONTEXT_CLASS.MEDIUM,
  qualityClass: QUALITY_CLASS.HIGH, speedClass: SPEED_CLASS.NORMAL, costClass: COST_CLASS.HIGH,
  privacyClass: PRIVACY_CLASS.BUSINESS_INTERNAL, structuredOutput: true, tools: false, vision: true, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_LONG_CONTEXT = createAIModelDefinition({
  provider: 'openrouter', modelId: 'fixture-long-ctx-v1', displayName: 'Long Context (Fixture)',
  capabilities: ['CHAT','LONG_CONTEXT','REASONING'], contextClass: CONTEXT_CLASS.VERY_LARGE,
  qualityClass: QUALITY_CLASS.HIGH, speedClass: SPEED_CLASS.SLOW, costClass: COST_CLASS.HIGH,
  privacyClass: PRIVACY_CLASS.PUBLIC_SAFE, structuredOutput: false, tools: false, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_LOCAL_FAST = createAIModelDefinition({
  provider: 'local', modelId: 'fixture-local-fast-v1', displayName: 'Local Fast (Fixture)',
  capabilities: ['CHAT','FAST_RESPONSE','LOW_COST','VOICE_PLANNING'], contextClass: CONTEXT_CLASS.SMALL,
  qualityClass: QUALITY_CLASS.BASIC, speedClass: SPEED_CLASS.VERY_FAST, costClass: COST_CLASS.FREE,
  privacyClass: PRIVACY_CLASS.RESTRICTED, structuredOutput: false, tools: false, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_LOCAL_CODING = createAIModelDefinition({
  provider: 'local', modelId: 'fixture-local-coding-v1', displayName: 'Local Coding (Fixture)',
  capabilities: ['CODING','FAST_RESPONSE','LOW_COST'], contextClass: CONTEXT_CLASS.MEDIUM,
  qualityClass: QUALITY_CLASS.STANDARD, speedClass: SPEED_CLASS.FAST, costClass: COST_CLASS.FREE,
  privacyClass: PRIVACY_CLASS.RESTRICTED, structuredOutput: false, tools: false, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_MULTILINGUAL = createAIModelDefinition({
  provider: 'openrouter', modelId: 'fixture-multilingual-v1', displayName: 'Multilingual (Fixture)',
  capabilities: ['CHAT','MULTILINGUAL','CONTENT'], contextClass: CONTEXT_CLASS.MEDIUM,
  qualityClass: QUALITY_CLASS.STANDARD, speedClass: SPEED_CLASS.NORMAL, costClass: COST_CLASS.MEDIUM,
  privacyClass: PRIVACY_CLASS.PUBLIC_SAFE, structuredOutput: false, tools: false, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_CONTENT = createAIModelDefinition({
  provider: 'direct-fast', modelId: 'fixture-content-v1', displayName: 'Content Generator (Fixture)',
  capabilities: ['CHAT','CONTENT','MULTILINGUAL'], contextClass: CONTEXT_CLASS.MEDIUM,
  qualityClass: QUALITY_CLASS.STANDARD, speedClass: SPEED_CLASS.FAST, costClass: COST_CLASS.LOW,
  privacyClass: PRIVACY_CLASS.PUBLIC_SAFE, structuredOutput: false, tools: false, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_CHEAP_BATCH = createAIModelDefinition({
  provider: 'openrouter', modelId: 'fixture-cheap-batch-v1', displayName: 'Cheap Batch (Fixture)',
  capabilities: ['CHAT','LOW_COST','CONTENT'], contextClass: CONTEXT_CLASS.SMALL,
  qualityClass: QUALITY_CLASS.BASIC, speedClass: SPEED_CLASS.FAST, costClass: COST_CLASS.VERY_LOW,
  privacyClass: PRIVACY_CLASS.PUBLIC_SAFE, structuredOutput: false, tools: false, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_TOOL_SPECIALIST = createAIModelDefinition({
  provider: 'direct-premium', modelId: 'fixture-tool-spec-v1', displayName: 'Tool Specialist (Fixture)',
  capabilities: ['CHAT','TOOLS','STRUCTURED_OUTPUT','REASONING'], contextClass: CONTEXT_CLASS.MEDIUM,
  qualityClass: QUALITY_CLASS.HIGH, speedClass: SPEED_CLASS.NORMAL, costClass: COST_CLASS.MEDIUM,
  privacyClass: PRIVACY_CLASS.BUSINESS_INTERNAL, structuredOutput: true, tools: true, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_STRUCTURED_ONLY = createAIModelDefinition({
  provider: 'direct-fast', modelId: 'fixture-structured-v1', displayName: 'Structured Extraction (Fixture)',
  capabilities: ['STRUCTURED_OUTPUT','CHAT'], contextClass: CONTEXT_CLASS.SMALL,
  qualityClass: QUALITY_CLASS.STANDARD, speedClass: SPEED_CLASS.FAST, costClass: COST_CLASS.LOW,
  privacyClass: PRIVACY_CLASS.PUBLIC_SAFE, structuredOutput: true, tools: false, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_DEPRECATED = createAIModelDefinition({
  provider: 'direct-fast', modelId: 'fixture-deprecated-v0', displayName: 'Deprecated Model (Fixture)',
  capabilities: ['CHAT'], contextClass: CONTEXT_CLASS.SMALL,
  qualityClass: QUALITY_CLASS.BASIC, speedClass: SPEED_CLASS.NORMAL, costClass: COST_CLASS.LOW,
  privacyClass: PRIVACY_CLASS.PUBLIC_SAFE, status: MODEL_STATUS.DEPRECATED,
});

export const FIXTURE_MODEL_DISABLED = createAIModelDefinition({
  provider: 'direct-fast', modelId: 'fixture-disabled-v1', displayName: 'Disabled Model (Fixture)',
  capabilities: ['CHAT','TOOLS'], contextClass: CONTEXT_CLASS.MEDIUM,
  qualityClass: QUALITY_CLASS.STANDARD, speedClass: SPEED_CLASS.FAST, costClass: COST_CLASS.LOW,
  privacyClass: PRIVACY_CLASS.PUBLIC_SAFE, status: MODEL_STATUS.DISABLED,
});

export const FIXTURE_MODEL_TEXT_ONLY = createAIModelDefinition({
  provider: 'direct-fast', modelId: 'fixture-text-only-v1', displayName: 'Text Only (Fixture)',
  capabilities: ['CHAT','CONTENT'], contextClass: CONTEXT_CLASS.MEDIUM,
  qualityClass: QUALITY_CLASS.STANDARD, speedClass: SPEED_CLASS.FAST, costClass: COST_CLASS.LOW,
  privacyClass: PRIVACY_CLASS.PUBLIC_SAFE, structuredOutput: false, tools: false, vision: false, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_VOICE_FAST = createAIModelDefinition({
  provider: 'local', modelId: 'fixture-voice-fast-v1', displayName: 'Voice Fast (Fixture)',
  capabilities: ['VOICE_PLANNING','CHAT','FAST_RESPONSE','TOOLS'], contextClass: CONTEXT_CLASS.SMALL,
  qualityClass: QUALITY_CLASS.STANDARD, speedClass: SPEED_CLASS.VERY_FAST, costClass: COST_CLASS.FREE,
  privacyClass: PRIVACY_CLASS.RESTRICTED, structuredOutput: false, tools: true, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_BUSINESS_ANALYST = createAIModelDefinition({
  provider: 'direct-premium', modelId: 'fixture-biz-analyst-v1', displayName: 'Business Analyst (Fixture)',
  capabilities: ['REASONING','CHAT','TOOLS','STRUCTURED_OUTPUT','PREMIUM_QUALITY'], contextClass: CONTEXT_CLASS.LARGE,
  qualityClass: QUALITY_CLASS.PREMIUM, speedClass: SPEED_CLASS.SLOW, costClass: COST_CLASS.HIGH,
  privacyClass: PRIVACY_CLASS.BUSINESS_INTERNAL, structuredOutput: true, tools: true, status: MODEL_STATUS.AVAILABLE,
});

export const FIXTURE_MODEL_OPENROUTER_GENERIC = createAIModelDefinition({
  provider: 'openrouter', modelId: 'fixture-or-generic-v1', displayName: 'OpenRouter Generic (Fixture)',
  capabilities: ['CHAT','MULTILINGUAL','CONTENT','LOW_COST'], contextClass: CONTEXT_CLASS.MEDIUM,
  qualityClass: QUALITY_CLASS.STANDARD, speedClass: SPEED_CLASS.NORMAL, costClass: COST_CLASS.VERY_LOW,
  privacyClass: PRIVACY_CLASS.PUBLIC_SAFE, structuredOutput: false, tools: false, status: MODEL_STATUS.AVAILABLE,
});

export const ALL_MODEL_FIXTURES = Object.freeze([
  FIXTURE_MODEL_FAST_CHAT,
  FIXTURE_MODEL_BALANCED_CHAT,
  FIXTURE_MODEL_PREMIUM_REASON,
  FIXTURE_MODEL_HIGH_QUALITY,
  FIXTURE_MODEL_CODING,
  FIXTURE_MODEL_VISION,
  FIXTURE_MODEL_LONG_CONTEXT,
  FIXTURE_MODEL_LOCAL_FAST,
  FIXTURE_MODEL_LOCAL_CODING,
  FIXTURE_MODEL_MULTILINGUAL,
  FIXTURE_MODEL_CONTENT,
  FIXTURE_MODEL_CHEAP_BATCH,
  FIXTURE_MODEL_TOOL_SPECIALIST,
  FIXTURE_MODEL_STRUCTURED_ONLY,
  FIXTURE_MODEL_DEPRECATED,
  FIXTURE_MODEL_DISABLED,
  FIXTURE_MODEL_TEXT_ONLY,
  FIXTURE_MODEL_VOICE_FAST,
  FIXTURE_MODEL_BUSINESS_ANALYST,
  FIXTURE_MODEL_OPENROUTER_GENERIC,
]);

export const MODEL_FIXTURES_VERSION = '1.0.0';
