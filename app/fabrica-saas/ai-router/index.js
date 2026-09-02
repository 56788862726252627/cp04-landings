// AI Router — ADV-16 barrel
// FACTORY_AGENCY_SCOPE_ONLY=SI | NO_REAL_OPENROUTER_CALLS=SI | NO_REAL_LLM_SPEND=SI

// ── Providers ─────────────────────────────────────────────────────────────────
export { PROVIDER_TYPE, PROVIDER_STATUS, PROVIDER_AUTH_TYPE, createAIProviderDefinition, isProviderAvailable, AI_PROVIDER_DEFINITION_VERSION }
  from './providers/aiProviderDefinition.js';
export { AUTH_STATUS, createOpenRouterAuthProfile, validateAuthProfile, OPENROUTER_AUTH_PROFILE_VERSION }
  from './providers/openRouterAuthProfile.js';
export { OPENROUTER_EXECUTE_STATUS, createOpenRouterProvider, OPENROUTER_PROVIDER_VERSION }
  from './providers/openRouterProvider.js';

// ── Models ────────────────────────────────────────────────────────────────────
export { AI_MODEL_CAPABILITY, hasCapability, meetsCapabilities, AI_MODEL_CAPABILITY_VERSION }
  from './models/aiModelCapability.js';
export { MODEL_STATUS, CONTEXT_CLASS, QUALITY_CLASS, SPEED_CLASS, COST_CLASS, PRIVACY_CLASS, createAIModelDefinition, AI_MODEL_DEFINITION_VERSION }
  from './models/aiModelDefinition.js';
export { MODEL_ALIAS, resolveAlias, createAIModelAlias, AI_MODEL_ALIAS_VERSION }
  from './models/aiModelAlias.js';
export { createAIModelPerformanceProfile, scoreForTask, AI_MODEL_PERFORMANCE_PROFILE_VERSION }
  from './models/aiModelPerformanceProfile.js';
export { CATALOG_FRESHNESS, createAIModelCatalogFreshnessPolicy, AI_MODEL_CATALOG_FRESHNESS_VERSION }
  from './models/aiModelCatalogFreshness.js';

// ── Routing ───────────────────────────────────────────────────────────────────
export { QUALITY_TARGET_LEVEL, LATENCY_TARGET, COST_SENSITIVITY, PRIVACY_LEVEL, CONTEXT_SIZE_CLASS, createAIRequestProfile, AI_REQUEST_PROFILE_VERSION }
  from './routing/aiRequestProfile.js';
export { ROUTING_MODE, DEFAULT_ROUTING_MODE, getRoutingModeWeights, createRoutingModeConfig, ROUTING_MODE_VERSION }
  from './routing/aiRoutingMode.js';
export { FALLBACK_FAILURE, isRetryable, shouldFallback, createAIFallbackPolicy, FALLBACK_POLICY_VERSION }
  from './routing/aiFallbackPolicy.js';
export { CHAIN_RESULT, createAIFallbackChain, resolveNextFallback, FALLBACK_CHAIN_VERSION }
  from './routing/aiFallbackChain.js';
export { selectAIModel, AI_MODEL_SELECTOR_VERSION }
  from './routing/aiModelSelector.js';
export { createAIRoutingPolicy, AI_ROUTING_POLICY_VERSION }
  from './routing/aiRoutingPolicy.js';
export { inferSemanticFeatures, createAISemanticRoutingPolicy, SEMANTIC_ROUTING_POLICY_VERSION }
  from './routing/aiSemanticRoutingPolicy.js';

// ── Health ────────────────────────────────────────────────────────────────────
export { PROVIDER_HEALTH_STATUS, createAIProviderHealth, isProviderHealthy, aggregateProviderHealth, AI_PROVIDER_HEALTH_VERSION }
  from './health/aiProviderHealth.js';
export { CIRCUIT_STATE, createAIProviderCircuitBreaker, AI_PROVIDER_CIRCUIT_BREAKER_VERSION }
  from './health/aiProviderCircuitBreaker.js';
export { createAIProviderRetry, AI_PROVIDER_RETRY_VERSION }
  from './health/aiProviderRetry.js';
export { createAIProviderTimeoutPolicy, AI_PROVIDER_TIMEOUT_VERSION }
  from './health/aiProviderTimeout.js';

// ── Cost ──────────────────────────────────────────────────────────────────────
export { createAIModelCostProfile, isCostKnown, isPaidModel, AI_MODEL_COST_PROFILE_VERSION }
  from './cost/aiModelCostProfile.js';
export { ESTIMATE_CONFIDENCE, createAIRequestCostEstimate, estimateFromProfile, AI_REQUEST_COST_ESTIMATE_VERSION }
  from './cost/aiRequestCostEstimate.js';
export { BUDGET_MODE, createAIClientBudgetPolicy, AI_CLIENT_BUDGET_POLICY_VERSION }
  from './cost/aiClientBudgetPolicy.js';
export { COST_GUARD_RESULT, createAIRouterCostGuard, AI_ROUTER_COST_GUARD_VERSION }
  from './cost/aiRouterCostGuard.js';

// ── Quality ───────────────────────────────────────────────────────────────────
export { AI_QUALITY_TARGET, getQualityRequirements, createAIQualityTarget, AI_QUALITY_TARGET_VERSION }
  from './quality/aiQualityTarget.js';
export { computeAIRoutingQualityScore, AI_ROUTING_QUALITY_SCORE_VERSION }
  from './quality/aiRoutingQualityScore.js';
export { ROUTING_GATE_STATUS, ROUTING_BLOCK_REASON, evaluateAIRoutingQualityGate, AI_ROUTING_QUALITY_GATE_VERSION }
  from './quality/aiRoutingQualityGate.js';

// ── Tasks ─────────────────────────────────────────────────────────────────────
export { AI_TASK_TYPE, TASK_RISK_LEVEL, classifyTaskRisk, createAITaskClassifier, AI_TASK_CLASSIFIER_VERSION }
  from './tasks/aiTaskClassifier.js';
export { isHighRiskDomain, createAIHighRiskPolicy, AI_HIGH_RISK_POLICY_VERSION }
  from './tasks/aiHighRiskPolicy.js';

// ── Privacy ───────────────────────────────────────────────────────────────────
export { createAIProviderPrivacyPolicy, routePrivacy, AI_PROVIDER_PRIVACY_POLICY_VERSION }
  from './privacy/aiProviderPrivacyPolicy.js';
export { redactSecrets, redactPII, minimizeContext, createAIDataMinimizationPolicy, AI_DATA_MINIMIZATION_VERSION }
  from './privacy/aiDataMinimizationPolicy.js';

// ── Policies ──────────────────────────────────────────────────────────────────
export { createAIClientIsolationPolicy, assertClientBoundary, AI_CLIENT_ISOLATION_POLICY_VERSION }
  from './policies/aiClientIsolationPolicy.js';
export { createAIModelAllowlistPolicy, AI_MODEL_ALLOWLIST_POLICY_VERSION }
  from './policies/aiModelAllowlistPolicy.js';
export { BLOCK_REASON, createAIModelBlockPolicy, AI_MODEL_BLOCK_POLICY_VERSION }
  from './policies/aiModelBlockPolicy.js';
export { createAIClientRoutingProfile, AI_CLIENT_ROUTING_PROFILE_VERSION }
  from './policies/aiClientRoutingProfile.js';
export { VERTICAL_PRESET, getVerticalPreset, AI_VERTICAL_PRESETS_VERSION }
  from './policies/aiVerticalPresets.js';

// ── Output ────────────────────────────────────────────────────────────────────
export { createAIStructuredOutputPolicy, AI_STRUCTURED_OUTPUT_POLICY_VERSION }
  from './output/aiStructuredOutputPolicy.js';
export { createAIToolCapabilityPolicy, AI_TOOL_CAPABILITY_POLICY_VERSION }
  from './output/aiToolCapabilityPolicy.js';
export { classifyContextSize, createAIContextBudgetPolicy, AI_CONTEXT_BUDGET_POLICY_VERSION }
  from './output/aiContextBudgetPolicy.js';
export { TOKEN_STRATEGY, createAITokenEfficiencyPolicy, AI_TOKEN_EFFICIENCY_POLICY_VERSION }
  from './output/aiTokenEfficiencyPolicy.js';
export { RESPONSE_LENGTH, createAIResponseBudget, AI_RESPONSE_BUDGET_VERSION }
  from './output/aiResponseBudget.js';
export { CACHE_ELIGIBILITY, createAIResponseCachePolicy, AI_RESPONSE_CACHE_POLICY_VERSION }
  from './output/aiResponseCachePolicy.js';

// ── Normalizers ───────────────────────────────────────────────────────────────
export { normalizeOpenRouterResponse, isValidOpenRouterResponse, OPENROUTER_RESPONSE_NORMALIZER_VERSION }
  from './normalizers/openRouterResponseNormalizer.js';
export { normalizeOpenRouterError, OPENROUTER_ERROR_NORMALIZER_VERSION }
  from './normalizers/openRouterErrorNormalizer.js';

// ── Discovery ─────────────────────────────────────────────────────────────────
export { DISCOVERY_SOURCE, createOpenRouterModelDiscovery, OPENROUTER_MODEL_DISCOVERY_VERSION }
  from './discovery/openRouterModelDiscovery.js';

// ── Bridges ───────────────────────────────────────────────────────────────────
export { createAgentEngineBridge, AGENT_ENGINE_BRIDGE_VERSION }   from './bridges/agentEngineBridge.js';
export { createVoiceBridge, VOICE_BRIDGE_VERSION }                from './bridges/voiceBridge.js';
export { createMediaBridge, MEDIA_BRIDGE_VERSION }                from './bridges/mediaBridge.js';
export { createSocialBridge, SOCIAL_BRIDGE_VERSION }              from './bridges/socialBridge.js';
export { createLeadCrmBridge, LEAD_CRM_BRIDGE_VERSION }           from './bridges/leadCrmBridge.js';
export { createMCPAIRouterBridge, MCP_AI_ROUTER_BRIDGE_VERSION }  from './bridges/mcpBridge.js';
export { createBusinessTruthBridge, BUSINESS_TRUTH_BRIDGE_VERSION } from './bridges/businessTruthBridge.js';
export { AI_ROUTING_EVENT, emitRoutingEvent, createAIRouterObservabilityBridge, AI_ROUTER_OBSERVABILITY_BRIDGE_VERSION }
  from './bridges/observabilityBridge.js';
export { CICD_CHECK, createAIRouterCICDBridge, AI_ROUTER_CICD_BRIDGE_VERSION }
  from './bridges/cicdBridge.js';
export { PROD_CHECK, createAIRouterProductionBridge, AI_ROUTER_PRODUCTION_BRIDGE_VERSION }
  from './bridges/productionBridge.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────
export {
  FIXTURE_DIRECT_PREMIUM, FIXTURE_DIRECT_FAST, FIXTURE_OPENROUTER, FIXTURE_LOCAL,
  FIXTURE_UNAVAILABLE_PROVIDER, FIXTURE_EXPENSIVE_PROVIDER, ALL_PROVIDER_FIXTURES, PROVIDER_FIXTURES_VERSION,
} from './fixtures/providerFixtures.js';
export {
  FIXTURE_MODEL_FAST_CHAT, FIXTURE_MODEL_BALANCED_CHAT, FIXTURE_MODEL_PREMIUM_REASON,
  FIXTURE_MODEL_HIGH_QUALITY, FIXTURE_MODEL_CODING, FIXTURE_MODEL_VISION, FIXTURE_MODEL_LONG_CONTEXT,
  FIXTURE_MODEL_LOCAL_FAST, FIXTURE_MODEL_LOCAL_CODING, FIXTURE_MODEL_MULTILINGUAL,
  FIXTURE_MODEL_CONTENT, FIXTURE_MODEL_CHEAP_BATCH, FIXTURE_MODEL_TOOL_SPECIALIST,
  FIXTURE_MODEL_STRUCTURED_ONLY, FIXTURE_MODEL_DEPRECATED, FIXTURE_MODEL_DISABLED,
  FIXTURE_MODEL_TEXT_ONLY, FIXTURE_MODEL_VOICE_FAST, FIXTURE_MODEL_BUSINESS_ANALYST,
  FIXTURE_MODEL_OPENROUTER_GENERIC, ALL_MODEL_FIXTURES, MODEL_FIXTURES_VERSION,
} from './fixtures/modelFixtures.js';
export { ALL_GOOD_ROUTING_FIXTURES, GOOD_ROUTING_FIXTURES_VERSION } from './fixtures/goodRoutingFixtures.js';
export { ALL_FAILURE_FIXTURES as ALL_ROUTING_FAILURE_FIXTURES, FAILURE_FIXTURES_VERSION } from './fixtures/failureFixtures.js';
export { ALL_OPENROUTER_FIXTURES, OPENROUTER_FIXTURES_VERSION } from './fixtures/openRouterFixtures.js';

// ── Reports & Metrics ─────────────────────────────────────────────────────────
export { createAIRouterReport, AI_ROUTER_REPORT_VERSION }  from './reports/aiRouterReport.js';
export { createAIRouterMetrics, AI_ROUTER_METRICS_VERSION } from './metrics/aiRouterMetrics.js';

// ── Meta ──────────────────────────────────────────────────────────────────────
export const AI_ROUTER_LAYER_VERSION = '1.0.0';
export const ADV16_STATUS            = '100_PERCENT';
export const OPENROUTER_INTEGRATED   = true;

export const AI_ROUTER_GUARDRAILS = Object.freeze({
  FACTORY_AGENCY_SCOPE_ONLY:  'SI',
  NO_REAL_OPENROUTER_CALLS:   'SI',
  NO_REAL_LLM_SPEND:          'SI',
  NO_REAL_API_KEYS:           'SI',
  NO_CP04_TOUCHED:            true,
  NO_BOT_TRADING_TOUCHED:     true,
  NO_LOCALHOST_5175:          true,
  OPENROUTER_EXECUTE_BLOCKED: true,
});
