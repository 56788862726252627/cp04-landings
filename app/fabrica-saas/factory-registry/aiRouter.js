// AI Router Registry — ADV-16

export const AI_ROUTER_REGISTRY = Object.freeze({
  id:          'ai-router',
  version:     '1.0.0',
  description: 'Multi-provider AI Router — OpenRouter + direct + local + fallback. ADV-16.',
  modules: Object.freeze([
    // Providers
    'aiProviderDefinition', 'openRouterAuthProfile', 'openRouterProvider',
    // Models
    'aiModelCapability', 'aiModelDefinition', 'aiModelAlias',
    'aiModelPerformanceProfile', 'aiModelCatalogFreshness',
    // Routing
    'aiRequestProfile', 'aiRoutingMode', 'aiFallbackPolicy',
    'aiFallbackChain', 'aiModelSelector', 'aiRoutingPolicy', 'aiSemanticRoutingPolicy',
    // Health
    'aiProviderHealth', 'aiProviderCircuitBreaker', 'aiProviderRetry', 'aiProviderTimeout',
    // Cost
    'aiModelCostProfile', 'aiRequestCostEstimate', 'aiClientBudgetPolicy', 'aiRouterCostGuard',
    // Quality
    'aiQualityTarget', 'aiRoutingQualityScore', 'aiRoutingQualityGate',
    // Tasks
    'aiTaskClassifier', 'aiHighRiskPolicy',
    // Privacy
    'aiProviderPrivacyPolicy', 'aiDataMinimizationPolicy',
    // Policies
    'aiClientIsolationPolicy', 'aiModelAllowlistPolicy', 'aiModelBlockPolicy',
    'aiClientRoutingProfile', 'aiVerticalPresets',
    // Output
    'aiStructuredOutputPolicy', 'aiToolCapabilityPolicy', 'aiContextBudgetPolicy',
    'aiTokenEfficiencyPolicy', 'aiResponseBudget', 'aiResponseCachePolicy',
    // Normalizers
    'openRouterResponseNormalizer', 'openRouterErrorNormalizer',
    // Discovery
    'openRouterModelDiscovery',
    // Bridges (10)
    'agentEngineBridge', 'voiceBridge', 'mediaBridge', 'socialBridge',
    'leadCrmBridge', 'mcpBridge', 'businessTruthBridge',
    'observabilityBridge', 'cicdBridge', 'productionBridge',
    // Fixtures
    'providerFixtures', 'modelFixtures', 'goodRoutingFixtures',
    'failureFixtures', 'openRouterFixtures',
    // Reports & Metrics
    'aiRouterReport', 'aiRouterMetrics',
  ]),
  providers:       Object.freeze(['DIRECT', 'OPENROUTER', 'LOCAL', 'CUSTOM']),
  routingModes:    Object.freeze(['QUALITY_FIRST','BALANCED','COST_FIRST','LATENCY_FIRST','PRIVACY_FIRST','LOCAL_FIRST','CUSTOM']),
  modelAliases:    Object.freeze(['FAST','BALANCED','PREMIUM','REASONING','CODING','VISION','CHEAP','LOCAL','VOICE']),
  verticals:       Object.freeze(['PADEL','CLINIC','LEGAL','BEAUTY','VETERINARY','EDUCATION','GENERIC']),
  taskTypes:       Object.freeze(['SIMPLE_CHAT','CUSTOMER_SUPPORT','SALES','BOOKING','CODING','REASONING','BUSINESS_ANALYSIS','CONTENT','MEDIA_SCRIPT','SOCIAL_COPY','VOICE_PLANNING','STRUCTURED_EXTRACTION','FACTUAL_HIGH_RISK']),
  fixtureModels:   20,
  openRouterExecute: 'BLOCKED',
  realOpenRouterCalls: false,
  realLLMSpend:    false,
});
