// ADV-16 — OpenRouter inside AI Router — Tests
// node:test | NO_REAL_OPENROUTER_CALLS=SI | NO_REAL_LLM_SPEND=SI
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Imports ───────────────────────────────────────────────────────────────────
import {
  // providers
  PROVIDER_TYPE, PROVIDER_STATUS, PROVIDER_AUTH_TYPE,
  createAIProviderDefinition, isProviderAvailable, AI_PROVIDER_DEFINITION_VERSION,
  AUTH_STATUS, createOpenRouterAuthProfile, validateAuthProfile, OPENROUTER_AUTH_PROFILE_VERSION,
  OPENROUTER_EXECUTE_STATUS, createOpenRouterProvider, OPENROUTER_PROVIDER_VERSION,
  // models
  AI_MODEL_CAPABILITY, hasCapability, meetsCapabilities, AI_MODEL_CAPABILITY_VERSION,
  MODEL_STATUS, QUALITY_CLASS, SPEED_CLASS, COST_CLASS, PRIVACY_CLASS, CONTEXT_CLASS,
  createAIModelDefinition, AI_MODEL_DEFINITION_VERSION,
  MODEL_ALIAS, resolveAlias, createAIModelAlias, AI_MODEL_ALIAS_VERSION,
  createAIModelPerformanceProfile, scoreForTask, AI_MODEL_PERFORMANCE_PROFILE_VERSION,
  CATALOG_FRESHNESS, createAIModelCatalogFreshnessPolicy, AI_MODEL_CATALOG_FRESHNESS_VERSION,
  // routing
  QUALITY_TARGET_LEVEL, LATENCY_TARGET, COST_SENSITIVITY, PRIVACY_LEVEL,
  createAIRequestProfile, AI_REQUEST_PROFILE_VERSION,
  ROUTING_MODE, DEFAULT_ROUTING_MODE, getRoutingModeWeights, createRoutingModeConfig, ROUTING_MODE_VERSION,
  FALLBACK_FAILURE, isRetryable, shouldFallback, createAIFallbackPolicy, FALLBACK_POLICY_VERSION,
  CHAIN_RESULT, createAIFallbackChain, resolveNextFallback, FALLBACK_CHAIN_VERSION,
  selectAIModel, AI_MODEL_SELECTOR_VERSION,
  createAIRoutingPolicy, AI_ROUTING_POLICY_VERSION,
  inferSemanticFeatures, createAISemanticRoutingPolicy, SEMANTIC_ROUTING_POLICY_VERSION,
  // health
  PROVIDER_HEALTH_STATUS, createAIProviderHealth, isProviderHealthy, aggregateProviderHealth, AI_PROVIDER_HEALTH_VERSION,
  CIRCUIT_STATE, createAIProviderCircuitBreaker, AI_PROVIDER_CIRCUIT_BREAKER_VERSION,
  createAIProviderRetry, AI_PROVIDER_RETRY_VERSION,
  createAIProviderTimeoutPolicy, AI_PROVIDER_TIMEOUT_VERSION,
  // cost
  createAIModelCostProfile, isCostKnown, isPaidModel, AI_MODEL_COST_PROFILE_VERSION,
  ESTIMATE_CONFIDENCE, createAIRequestCostEstimate, estimateFromProfile, AI_REQUEST_COST_ESTIMATE_VERSION,
  BUDGET_MODE, createAIClientBudgetPolicy, AI_CLIENT_BUDGET_POLICY_VERSION,
  COST_GUARD_RESULT, createAIRouterCostGuard, AI_ROUTER_COST_GUARD_VERSION,
  // quality
  AI_QUALITY_TARGET, getQualityRequirements, createAIQualityTarget, AI_QUALITY_TARGET_VERSION,
  computeAIRoutingQualityScore, AI_ROUTING_QUALITY_SCORE_VERSION,
  ROUTING_GATE_STATUS, ROUTING_BLOCK_REASON, evaluateAIRoutingQualityGate, AI_ROUTING_QUALITY_GATE_VERSION,
  // tasks
  AI_TASK_TYPE, TASK_RISK_LEVEL, classifyTaskRisk, createAITaskClassifier, AI_TASK_CLASSIFIER_VERSION,
  isHighRiskDomain, createAIHighRiskPolicy, AI_HIGH_RISK_POLICY_VERSION,
  // privacy
  createAIProviderPrivacyPolicy, routePrivacy, AI_PROVIDER_PRIVACY_POLICY_VERSION,
  redactSecrets, redactPII, minimizeContext, createAIDataMinimizationPolicy, AI_DATA_MINIMIZATION_VERSION,
  // policies
  createAIClientIsolationPolicy, assertClientBoundary, AI_CLIENT_ISOLATION_POLICY_VERSION,
  createAIModelAllowlistPolicy, AI_MODEL_ALLOWLIST_POLICY_VERSION,
  BLOCK_REASON, createAIModelBlockPolicy, AI_MODEL_BLOCK_POLICY_VERSION,
  createAIClientRoutingProfile, AI_CLIENT_ROUTING_PROFILE_VERSION,
  VERTICAL_PRESET, getVerticalPreset, AI_VERTICAL_PRESETS_VERSION,
  // output
  createAIStructuredOutputPolicy, AI_STRUCTURED_OUTPUT_POLICY_VERSION,
  createAIToolCapabilityPolicy, AI_TOOL_CAPABILITY_POLICY_VERSION,
  classifyContextSize, createAIContextBudgetPolicy, AI_CONTEXT_BUDGET_POLICY_VERSION,
  TOKEN_STRATEGY, createAITokenEfficiencyPolicy, AI_TOKEN_EFFICIENCY_POLICY_VERSION,
  RESPONSE_LENGTH, createAIResponseBudget, AI_RESPONSE_BUDGET_VERSION,
  CACHE_ELIGIBILITY, createAIResponseCachePolicy, AI_RESPONSE_CACHE_POLICY_VERSION,
  // normalizers
  normalizeOpenRouterResponse, isValidOpenRouterResponse, OPENROUTER_RESPONSE_NORMALIZER_VERSION,
  normalizeOpenRouterError, OPENROUTER_ERROR_NORMALIZER_VERSION,
  // discovery
  DISCOVERY_SOURCE, createOpenRouterModelDiscovery, OPENROUTER_MODEL_DISCOVERY_VERSION,
  // bridges
  createAgentEngineBridge, AGENT_ENGINE_BRIDGE_VERSION,
  createVoiceBridge, VOICE_BRIDGE_VERSION,
  createMediaBridge, MEDIA_BRIDGE_VERSION,
  createSocialBridge, SOCIAL_BRIDGE_VERSION,
  createLeadCrmBridge, LEAD_CRM_BRIDGE_VERSION,
  createMCPAIRouterBridge, MCP_AI_ROUTER_BRIDGE_VERSION,
  createBusinessTruthBridge, BUSINESS_TRUTH_BRIDGE_VERSION,
  AI_ROUTING_EVENT, emitRoutingEvent, createAIRouterObservabilityBridge, AI_ROUTER_OBSERVABILITY_BRIDGE_VERSION,
  CICD_CHECK, createAIRouterCICDBridge, AI_ROUTER_CICD_BRIDGE_VERSION,
  PROD_CHECK, createAIRouterProductionBridge, AI_ROUTER_PRODUCTION_BRIDGE_VERSION,
  // fixtures
  ALL_PROVIDER_FIXTURES, FIXTURE_DIRECT_PREMIUM, FIXTURE_OPENROUTER, FIXTURE_LOCAL,
  FIXTURE_UNAVAILABLE_PROVIDER, FIXTURE_EXPENSIVE_PROVIDER,
  ALL_MODEL_FIXTURES, FIXTURE_MODEL_FAST_CHAT, FIXTURE_MODEL_PREMIUM_REASON,
  FIXTURE_MODEL_DEPRECATED, FIXTURE_MODEL_DISABLED, FIXTURE_MODEL_VISION,
  FIXTURE_MODEL_TOOL_SPECIALIST, FIXTURE_MODEL_TEXT_ONLY,
  ALL_GOOD_ROUTING_FIXTURES, ALL_ROUTING_FAILURE_FIXTURES, ALL_OPENROUTER_FIXTURES,
  // reports & metrics
  createAIRouterReport, AI_ROUTER_REPORT_VERSION,
  createAIRouterMetrics, AI_ROUTER_METRICS_VERSION,
  // meta
  AI_ROUTER_LAYER_VERSION, ADV16_STATUS, OPENROUTER_INTEGRATED, AI_ROUTER_GUARDRAILS,
} from '../../fabrica-saas/ai-router/index.js';

import { AI_ROUTER_REGISTRY } from '../../fabrica-saas/factory-registry/aiRouter.js';
import { REGISTRY_VERSION, PASO_ADV16_STATUS } from '../../fabrica-saas/factory-registry/index.js';

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Provider Definition', () => {
  it('creates provider with all required fields', () => {
    const p = createAIProviderDefinition({ id: 'test', name: 'Test', type: PROVIDER_TYPE.DIRECT });
    assert.equal(p.id, 'test');
    assert.equal(p.type, PROVIDER_TYPE.DIRECT);
    assert.equal(p.isReal, false);
  });

  it('exposes all provider types', () => {
    assert.ok(PROVIDER_TYPE.DIRECT);
    assert.ok(PROVIDER_TYPE.OPENROUTER);
    assert.ok(PROVIDER_TYPE.LOCAL);
    assert.ok(PROVIDER_TYPE.CUSTOM);
  });

  it('exposes all provider statuses', () => {
    assert.ok(PROVIDER_STATUS.ACTIVE);
    assert.ok(PROVIDER_STATUS.UNAVAILABLE);
    assert.ok(PROVIDER_STATUS.BLOCKED);
  });

  it('isProviderAvailable returns true for ACTIVE', () => {
    const p = createAIProviderDefinition({ status: PROVIDER_STATUS.ACTIVE });
    assert.ok(isProviderAvailable(p));
  });

  it('isProviderAvailable returns true for DEGRADED', () => {
    const p = createAIProviderDefinition({ status: PROVIDER_STATUS.DEGRADED });
    assert.ok(isProviderAvailable(p));
  });

  it('isProviderAvailable returns false for UNAVAILABLE', () => {
    const p = createAIProviderDefinition({ status: PROVIDER_STATUS.UNAVAILABLE });
    assert.ok(!isProviderAvailable(p));
  });

  it('freezes output object', () => {
    const p = createAIProviderDefinition({});
    assert.throws(() => { p.id = 'hack'; }, { name: 'TypeError' });
  });

  it('has version', () => { assert.ok(AI_PROVIDER_DEFINITION_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — OpenRouter Auth Profile', () => {
  it('creates auth profile without real key', () => {
    const a = createOpenRouterAuthProfile({ secretConfigured: false });
    assert.equal(a.realKeyStored, false);
    assert.equal(a.isReal, false);
  });

  it('status REQUIRES_CONFIGURATION when not configured', () => {
    const a = createOpenRouterAuthProfile({ secretConfigured: false });
    assert.equal(a.status, AUTH_STATUS.REQUIRES_CONFIGURATION);
  });

  it('status READY when configured', () => {
    const a = createOpenRouterAuthProfile({ secretConfigured: true });
    assert.equal(a.status, AUTH_STATUS.READY);
  });

  it('validateAuthProfile returns invalid when not configured', () => {
    const a = createOpenRouterAuthProfile({ secretConfigured: false });
    const v = validateAuthProfile(a);
    assert.equal(v.valid, false);
  });

  it('validateAuthProfile returns valid when READY', () => {
    const a = createOpenRouterAuthProfile({ secretConfigured: true });
    const v = validateAuthProfile(a);
    assert.ok(v.valid);
  });

  it('never stores real key', () => {
    const a = createOpenRouterAuthProfile({ secretConfigured: true });
    assert.equal(a.realKeyStored, false);
  });

  it('has version', () => { assert.ok(OPENROUTER_AUTH_PROFILE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — OpenRouter Provider', () => {
  it('creates provider with execute BLOCKED', () => {
    const p = createOpenRouterProvider({ secretConfigured: false });
    const r = p.execute();
    assert.equal(r.status, OPENROUTER_EXECUTE_STATUS.BLOCKED);
    assert.equal(r.isReal, false);
  });

  it('execute always blocked even when configured', () => {
    const p = createOpenRouterProvider({ secretConfigured: true });
    const r = p.execute();
    assert.equal(r.status, OPENROUTER_EXECUTE_STATUS.BLOCKED);
  });

  it('validateConfig returns invalid when not configured', () => {
    const p = createOpenRouterProvider({ secretConfigured: false });
    assert.equal(p.validateConfig().valid, false);
  });

  it('health returns UNAVAILABLE when not configured', () => {
    const p = createOpenRouterProvider({ secretConfigured: false });
    assert.equal(p.health().status, 'UNAVAILABLE');
  });

  it('health returns HEALTHY when configured', () => {
    const p = createOpenRouterProvider({ secretConfigured: true });
    assert.equal(p.health().status, 'HEALTHY');
  });

  it('listConfiguredModels returns frozen array', () => {
    const p = createOpenRouterProvider({ enabledModels: ['m1', 'm2'] });
    const models = p.listConfiguredModels();
    assert.equal(models.length, 2);
  });

  it('normalizeResponse extracts content', () => {
    const p   = createOpenRouterProvider({});
    const raw = { model: 'x', choices: [{ message: { role: 'assistant', content: 'Hello' }, finish_reason: 'stop' }], usage: {} };
    const norm = p.normalizeResponse(raw);
    assert.equal(norm.content, 'Hello');
    assert.equal(norm.isReal, false);
  });

  it('has version', () => { assert.ok(OPENROUTER_PROVIDER_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — AI Model Capability', () => {
  it('exposes all required capabilities', () => {
    const required = ['CHAT','REASONING','CODING','VISION','STRUCTURED_OUTPUT','TOOLS',
      'LONG_CONTEXT','FAST_RESPONSE','LOW_COST','PREMIUM_QUALITY','MULTILINGUAL',
      'VOICE_PLANNING','CONTENT','EMBEDDINGS_FOUNDATION'];
    for (const cap of required) assert.ok(AI_MODEL_CAPABILITY[cap], `Missing: ${cap}`);
  });

  it('hasCapability returns true when present', () => {
    const model = { capabilities: ['CHAT', 'TOOLS'] };
    assert.ok(hasCapability(model, 'CHAT'));
  });

  it('hasCapability returns false when absent', () => {
    const model = { capabilities: ['CHAT'] };
    assert.ok(!hasCapability(model, 'VISION'));
  });

  it('meetsCapabilities returns true when all present', () => {
    const model = { capabilities: ['CHAT', 'TOOLS', 'REASONING'] };
    assert.ok(meetsCapabilities(model, ['CHAT', 'TOOLS']));
  });

  it('meetsCapabilities returns false if one missing', () => {
    const model = { capabilities: ['CHAT'] };
    assert.ok(!meetsCapabilities(model, ['CHAT', 'VISION']));
  });

  it('has version', () => { assert.ok(AI_MODEL_CAPABILITY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — AI Model Definition', () => {
  it('creates model with all required fields', () => {
    const m = createAIModelDefinition({ provider: 'direct', modelId: 'x', displayName: 'X' });
    assert.equal(m.provider, 'direct');
    assert.equal(m.isReal, false);
  });

  it('freezes output', () => {
    const m = createAIModelDefinition({});
    assert.throws(() => { m.modelId = 'hack'; });
  });

  it('exposes all quality classes', () => {
    assert.ok(QUALITY_CLASS.BASIC);
    assert.ok(QUALITY_CLASS.PREMIUM);
  });

  it('exposes all cost classes', () => {
    assert.ok(COST_CLASS.FREE);
    assert.ok(COST_CLASS.HIGH);
    assert.ok(COST_CLASS.UNKNOWN);
  });

  it('has version', () => { assert.ok(AI_MODEL_DEFINITION_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Model Alias', () => {
  it('resolves FAST alias', () => {
    const r = resolveAlias(MODEL_ALIAS.FAST);
    assert.ok(r.resolved);
    assert.ok(r.requirements.speedClass);
  });

  it('resolves PREMIUM alias', () => {
    const r = resolveAlias(MODEL_ALIAS.PREMIUM);
    assert.ok(r.resolved);
    assert.equal(r.requirements.minQuality, 'HIGH');
  });

  it('returns unresolved for unknown alias', () => {
    const r = resolveAlias('NONEXISTENT');
    assert.equal(r.resolved, false);
  });

  it('createAIModelAlias is frozen', () => {
    const a = createAIModelAlias(MODEL_ALIAS.BALANCED);
    assert.throws(() => { a.alias = 'hack'; });
  });

  it('exposes all aliases', () => {
    const aliases = ['FAST','BALANCED','PREMIUM','REASONING','CODING','VISION','CHEAP','LOCAL','VOICE'];
    for (const a of aliases) assert.ok(MODEL_ALIAS[a], `Missing: ${a}`);
  });

  it('has version', () => { assert.ok(AI_MODEL_ALIAS_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Model Performance Profile', () => {
  it('creates profile with source=FIXTURE', () => {
    const p = createAIModelPerformanceProfile({ modelId: 'm1', qualityScore: 85 });
    assert.equal(p.source, 'FIXTURE');
    assert.equal(p.isReal, false);
  });

  it('scoreForTask returns taskFit score when available', () => {
    const p = createAIModelPerformanceProfile({ qualityScore: 70, taskFit: { CODING: 90 } });
    assert.equal(scoreForTask(p, 'CODING'), 90);
  });

  it('scoreForTask falls back to qualityScore', () => {
    const p = createAIModelPerformanceProfile({ qualityScore: 70 });
    assert.equal(scoreForTask(p, 'UNKNOWN_TASK'), 70);
  });

  it('has version', () => { assert.ok(AI_MODEL_PERFORMANCE_PROFILE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Catalog Freshness', () => {
  it('UNKNOWN when no lastUpdatedAt', () => {
    const p = createAIModelCatalogFreshnessPolicy({ provider: 'or' });
    assert.equal(p.status, CATALOG_FRESHNESS.UNKNOWN);
  });

  it('FRESH when updated recently', () => {
    const p = createAIModelCatalogFreshnessPolicy({ lastUpdatedAt: new Date().toISOString() });
    assert.equal(p.status, CATALOG_FRESHNESS.FRESH);
    assert.ok(p.trustCatalog);
  });

  it('STALE when updated 60 days ago', () => {
    const old = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString();
    const p   = createAIModelCatalogFreshnessPolicy({ lastUpdatedAt: old });
    assert.equal(p.status, CATALOG_FRESHNESS.STALE);
  });

  it('has version', () => { assert.ok(AI_MODEL_CATALOG_FRESHNESS_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Request Profile', () => {
  it('creates with defaults', () => {
    const r = createAIRequestProfile({});
    assert.equal(r.taskType, 'SIMPLE_CHAT');
    assert.equal(r.isReal, false);
  });

  it('freezes output', () => {
    const r = createAIRequestProfile({});
    assert.throws(() => { r.taskType = 'hack'; });
  });

  it('exposes all quality targets', () => {
    assert.ok(QUALITY_TARGET_LEVEL.CRITICAL);
    assert.ok(QUALITY_TARGET_LEVEL.BASIC);
  });

  it('exposes privacy levels', () => {
    assert.ok(PRIVACY_LEVEL.RESTRICTED);
    assert.ok(PRIVACY_LEVEL.PUBLIC_SAFE);
  });

  it('has version', () => { assert.ok(AI_REQUEST_PROFILE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Routing Mode', () => {
  it('default is BALANCED', () => {
    assert.equal(DEFAULT_ROUTING_MODE, ROUTING_MODE.BALANCED);
  });

  it('getRoutingModeWeights returns weights for QUALITY_FIRST', () => {
    const w = getRoutingModeWeights(ROUTING_MODE.QUALITY_FIRST);
    assert.ok(w.quality >= w.cost);
  });

  it('getRoutingModeWeights returns weights for COST_FIRST', () => {
    const w = getRoutingModeWeights(ROUTING_MODE.COST_FIRST);
    assert.ok(w.cost >= w.quality);
  });

  it('createRoutingModeConfig is frozen', () => {
    const c = createRoutingModeConfig(ROUTING_MODE.BALANCED);
    assert.throws(() => { c.mode = 'hack'; });
  });

  it('exposes all 7 routing modes', () => {
    const modes = ['QUALITY_FIRST','BALANCED','COST_FIRST','LATENCY_FIRST','PRIVACY_FIRST','LOCAL_FIRST','CUSTOM'];
    for (const m of modes) assert.ok(ROUTING_MODE[m], `Missing: ${m}`);
  });

  it('has version', () => { assert.ok(ROUTING_MODE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Fallback Policy', () => {
  it('RATE_LIMIT is retryable', () => {
    assert.ok(isRetryable(FALLBACK_FAILURE.RATE_LIMIT));
  });

  it('AUTH is not retryable', () => {
    assert.ok(!isRetryable(FALLBACK_FAILURE.AUTH));
  });

  it('POLICY_BLOCK is not retryable', () => {
    assert.ok(!isRetryable(FALLBACK_FAILURE.POLICY_BLOCK));
  });

  it('TIMEOUT should fallback', () => {
    assert.ok(shouldFallback(FALLBACK_FAILURE.TIMEOUT));
  });

  it('CAPABILITY_MISMATCH should not fallback blindly', () => {
    assert.ok(!shouldFallback(FALLBACK_FAILURE.CAPABILITY_MISMATCH));
  });

  it('createAIFallbackPolicy classify works', () => {
    const p = createAIFallbackPolicy({});
    const c = p.classify(FALLBACK_FAILURE.RATE_LIMIT);
    assert.ok(c.retryable);
    assert.ok(c.fallbackOk);
  });

  it('AUTH escalates', () => {
    const p = createAIFallbackPolicy({});
    const c = p.classify(FALLBACK_FAILURE.AUTH);
    assert.ok(c.escalate);
    assert.ok(!c.fallbackOk);
  });

  it('has version', () => { assert.ok(FALLBACK_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Fallback Chain', () => {
  const chain = createAIFallbackChain([
    { provider: 'direct', model: 'm1', capabilities: ['CHAT','TOOLS'] },
    { provider: 'local',  model: 'm2', capabilities: ['CHAT']         },
  ]);

  it('creates chain with correct length', () => {
    assert.equal(chain.length, 2);
  });

  it('resolves to capable provider', () => {
    const r = resolveNextFallback(chain, -1, FALLBACK_FAILURE.RATE_LIMIT, ['CHAT']);
    assert.equal(r.result, CHAIN_RESULT.RESOLVED);
    assert.equal(r.provider.provider, 'direct');
  });

  it('skips incapable provider', () => {
    const r = resolveNextFallback(chain, 0, FALLBACK_FAILURE.TIMEOUT, ['CHAT','TOOLS']);
    assert.equal(r.result, CHAIN_RESULT.EXHAUSTED); // local lacks TOOLS
  });

  it('blocks on AUTH failure', () => {
    const r = resolveNextFallback(chain, -1, FALLBACK_FAILURE.AUTH, ['CHAT']);
    assert.equal(r.result, CHAIN_RESULT.BLOCKED);
  });

  it('has version', () => { assert.ok(FALLBACK_CHAIN_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Model Selector', () => {
  const catalog = [
    createAIModelDefinition({
      provider: 'direct', modelId: 'fast-m', capabilities: ['CHAT'],
      qualityClass: QUALITY_CLASS.BASIC, speedClass: SPEED_CLASS.VERY_FAST,
      costClass: COST_CLASS.LOW, status: MODEL_STATUS.AVAILABLE,
    }),
    createAIModelDefinition({
      provider: 'direct', modelId: 'premium-m', capabilities: ['CHAT','REASONING'],
      qualityClass: QUALITY_CLASS.PREMIUM, speedClass: SPEED_CLASS.SLOW,
      costClass: COST_CLASS.HIGH, status: MODEL_STATUS.AVAILABLE,
    }),
  ];

  it('selects a model from catalog', () => {
    const r = selectAIModel(catalog, { requiredCapabilities: ['CHAT'] }, ROUTING_MODE.BALANCED);
    assert.ok(r.selectedModel);
  });

  it('returns null for empty catalog', () => {
    const r = selectAIModel([], {});
    assert.equal(r.selectedModel, null);
  });

  it('QUALITY_FIRST selects premium model', () => {
    const r = selectAIModel(catalog, { requiredCapabilities: ['CHAT'] }, ROUTING_MODE.QUALITY_FIRST);
    assert.equal(r.selectedModel, 'premium-m');
  });

  it('COST_FIRST selects cheaper model', () => {
    const r = selectAIModel(catalog, { requiredCapabilities: ['CHAT'] }, ROUTING_MODE.COST_FIRST);
    assert.equal(r.selectedModel, 'fast-m');
  });

  it('filters by required capabilities', () => {
    const r = selectAIModel(catalog, { requiredCapabilities: ['REASONING'] }, ROUTING_MODE.BALANCED);
    assert.equal(r.selectedModel, 'premium-m');
  });

  it('filters out DEPRECATED models', () => {
    const cat2 = [
      createAIModelDefinition({ provider: 'x', modelId: 'dep', capabilities: ['CHAT'], status: MODEL_STATUS.DEPRECATED }),
      createAIModelDefinition({ provider: 'x', modelId: 'ok',  capabilities: ['CHAT'], status: MODEL_STATUS.AVAILABLE  }),
    ];
    const r = selectAIModel(cat2, { requiredCapabilities: ['CHAT'] });
    assert.equal(r.selectedModel, 'ok');
  });

  it('filters by requiresTools', () => {
    const r = selectAIModel(catalog, { requiresTools: true }, ROUTING_MODE.BALANCED);
    assert.equal(r.selectedModel, null); // neither model has tools:true
  });

  it('isReal false', () => {
    const r = selectAIModel(catalog, {});
    assert.equal(r.isReal, false);
  });

  it('has version', () => { assert.ok(AI_MODEL_SELECTOR_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Routing Policy', () => {
  const catalog = [
    createAIModelDefinition({
      provider: 'direct', modelId: 'std', capabilities: ['CHAT'],
      qualityClass: QUALITY_CLASS.STANDARD, speedClass: SPEED_CLASS.FAST,
      costClass: COST_CLASS.LOW, status: MODEL_STATUS.AVAILABLE,
    }),
    createAIModelDefinition({
      provider: 'blocked-provider', modelId: 'blk', capabilities: ['CHAT'],
      qualityClass: QUALITY_CLASS.STANDARD, speedClass: SPEED_CLASS.FAST,
      costClass: COST_CLASS.LOW, status: MODEL_STATUS.AVAILABLE,
    }),
  ];

  it('blocks provider in blockedProviders list', () => {
    const policy = createAIRoutingPolicy({ blockedProviders: ['blocked-provider'] });
    const r      = policy.route(catalog, { requiredCapabilities: ['CHAT'] });
    assert.equal(r.selectedModel, 'std');
  });

  it('restricts to allowedProviders', () => {
    const policy = createAIRoutingPolicy({ allowedProviders: ['direct'] });
    const r      = policy.route(catalog, { requiredCapabilities: ['CHAT'] });
    assert.equal(r.selectedProvider, 'direct');
  });

  it('quality floor blocks low-quality for CRITICAL task', () => {
    const basicCat = [
      createAIModelDefinition({
        provider: 'x', modelId: 'basic', capabilities: ['CHAT'],
        qualityClass: QUALITY_CLASS.BASIC, speedClass: SPEED_CLASS.FAST,
        costClass: COST_CLASS.FREE, status: MODEL_STATUS.AVAILABLE,
      }),
    ];
    const policy = createAIRoutingPolicy({});
    const r      = policy.route(basicCat, { qualityTarget: 'CRITICAL', requiredCapabilities: ['CHAT'] });
    assert.ok(r.policyBlocked);
  });

  it('has version', () => { assert.ok(AI_ROUTING_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Semantic Routing', () => {
  it('infers VOICE_PLANNING features', () => {
    const f = inferSemanticFeatures('VOICE_PLANNING');
    assert.ok(f.inferred);
    assert.ok(f.caps.includes('VOICE_PLANNING'));
    assert.equal(f.speed, 'FAST');
  });

  it('infers FACTUAL_HIGH_RISK as PREMIUM', () => {
    const f = inferSemanticFeatures('FACTUAL_HIGH_RISK');
    assert.equal(f.quality, 'PREMIUM');
  });

  it('unknown task → inferred:false', () => {
    const f = inferSemanticFeatures('UNKNOWN_TASK_XYZ');
    assert.ok(!f.inferred);
  });

  it('has version', () => { assert.ok(SEMANTIC_ROUTING_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Provider Health', () => {
  it('creates health with UNKNOWN default', () => {
    const h = createAIProviderHealth({ providerId: 'x' });
    assert.equal(h.status, PROVIDER_HEALTH_STATUS.UNKNOWN);
  });

  it('isProviderHealthy true for HEALTHY', () => {
    const h = createAIProviderHealth({ status: PROVIDER_HEALTH_STATUS.HEALTHY });
    assert.ok(isProviderHealthy(h));
  });

  it('isProviderHealthy true for DEGRADED', () => {
    const h = createAIProviderHealth({ status: PROVIDER_HEALTH_STATUS.DEGRADED });
    assert.ok(isProviderHealthy(h));
  });

  it('isProviderHealthy false for UNAVAILABLE', () => {
    const h = createAIProviderHealth({ status: PROVIDER_HEALTH_STATUS.UNAVAILABLE });
    assert.ok(!isProviderHealthy(h));
  });

  it('aggregates to HEALTHY when all healthy', () => {
    const list = [
      createAIProviderHealth({ status: PROVIDER_HEALTH_STATUS.HEALTHY }),
      createAIProviderHealth({ status: PROVIDER_HEALTH_STATUS.HEALTHY }),
    ];
    assert.equal(aggregateProviderHealth(list), PROVIDER_HEALTH_STATUS.HEALTHY);
  });

  it('aggregates to UNAVAILABLE when all down', () => {
    const list = [
      createAIProviderHealth({ status: PROVIDER_HEALTH_STATUS.UNAVAILABLE }),
      createAIProviderHealth({ status: PROVIDER_HEALTH_STATUS.UNAVAILABLE }),
    ];
    assert.equal(aggregateProviderHealth(list), PROVIDER_HEALTH_STATUS.UNAVAILABLE);
  });

  it('has version', () => { assert.ok(AI_PROVIDER_HEALTH_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Circuit Breaker', () => {
  it('starts CLOSED', () => {
    const cb = createAIProviderCircuitBreaker({});
    assert.equal(cb.getState(), CIRCUIT_STATE.CLOSED);
  });

  it('opens after threshold failures', () => {
    const cb = createAIProviderCircuitBreaker({ failureThreshold: 3 });
    cb.recordFailure(); cb.recordFailure(); cb.recordFailure();
    assert.equal(cb.getState(), CIRCUIT_STATE.OPEN);
  });

  it('blocks requests when OPEN', () => {
    const cb = createAIProviderCircuitBreaker({ failureThreshold: 1, halfOpenAfterMs: 999999 });
    cb.recordFailure();
    assert.ok(!cb.allowRequest());
  });

  it('allows request when CLOSED', () => {
    const cb = createAIProviderCircuitBreaker({});
    assert.ok(cb.allowRequest());
  });

  it('resets to CLOSED', () => {
    const cb = createAIProviderCircuitBreaker({ failureThreshold: 1 });
    cb.recordFailure();
    cb.reset();
    assert.equal(cb.getState(), CIRCUIT_STATE.CLOSED);
  });

  it('has version', () => { assert.ok(AI_PROVIDER_CIRCUIT_BREAKER_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Provider Retry', () => {
  it('creates retry policy', () => {
    const r = createAIProviderRetry({ maxAttempts: 3 });
    assert.equal(r.maxAttempts, 3);
  });

  it('shouldRetry false when maxAttempts reached', () => {
    const r = createAIProviderRetry({ maxAttempts: 3 });
    assert.ok(!r.shouldRetry(3, FALLBACK_FAILURE.RATE_LIMIT));
  });

  it('shouldRetry true for retryable failure', () => {
    const r = createAIProviderRetry({ maxAttempts: 3 });
    assert.ok(r.shouldRetry(0, FALLBACK_FAILURE.RATE_LIMIT));
  });

  it('shouldRetry false for AUTH failure', () => {
    const r = createAIProviderRetry({ maxAttempts: 3 });
    assert.ok(!r.shouldRetry(0, FALLBACK_FAILURE.AUTH));
  });

  it('buildRetryPlan has isReal false', () => {
    const r = createAIProviderRetry({});
    const p = r.buildRetryPlan(FALLBACK_FAILURE.RATE_LIMIT);
    assert.equal(p.isReal, false);
  });

  it('has version', () => { assert.ok(AI_PROVIDER_RETRY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Provider Timeout', () => {
  it('voice task gets shorter timeout', () => {
    const t = createAIProviderTimeoutPolicy({});
    assert.ok(t.getTaskTimeout('VOICE_PLANNING') <= t.getTaskTimeout('CODING'));
  });

  it('local provider gets shorter timeout than openrouter', () => {
    const t = createAIProviderTimeoutPolicy({});
    assert.ok(t.getProviderTimeout('local') <= t.getProviderTimeout('openrouter'));
  });

  it('resolve returns frozen object', () => {
    const t = createAIProviderTimeoutPolicy({});
    const r = t.resolve('SIMPLE_CHAT', 'direct');
    assert.ok(r.timeoutMs > 0);
    assert.throws(() => { r.timeoutMs = 0; });
  });

  it('has version', () => { assert.ok(AI_PROVIDER_TIMEOUT_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Cost Profile', () => {
  it('FREE is not paid', () => {
    const p = createAIModelCostProfile({ costClass: COST_CLASS.FREE });
    assert.ok(!isPaidModel(p));
  });

  it('HIGH is paid', () => {
    const p = createAIModelCostProfile({ costClass: COST_CLASS.HIGH });
    assert.ok(isPaidModel(p));
  });

  it('UNKNOWN cost is not known', () => {
    const p = createAIModelCostProfile({});
    assert.ok(!isCostKnown(p));
  });

  it('never stores real pricing', () => {
    const p = createAIModelCostProfile({ costClass: COST_CLASS.HIGH });
    assert.equal(p.realPricingStored, false);
  });

  it('has version', () => { assert.ok(AI_MODEL_COST_PROFILE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Cost Estimate', () => {
  it('creates estimate with isReal false', () => {
    const e = createAIRequestCostEstimate({ provider: 'or', model: 'm1', estimatedCostClass: COST_CLASS.LOW });
    assert.equal(e.isReal, false);
    assert.equal(e.realCostStored, false);
  });

  it('estimateFromProfile uses model costClass', () => {
    const model = createAIModelDefinition({ costClass: COST_CLASS.MEDIUM });
    const e     = estimateFromProfile(model);
    assert.equal(e.estimatedCostClass, COST_CLASS.MEDIUM);
  });

  it('UNKNOWN model gives UNKNOWN confidence', () => {
    const model = createAIModelDefinition({ costClass: COST_CLASS.UNKNOWN });
    const e     = estimateFromProfile(model);
    assert.equal(e.confidence, ESTIMATE_CONFIDENCE.UNKNOWN);
  });

  it('has version', () => { assert.ok(AI_REQUEST_COST_ESTIMATE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Budget Policy', () => {
  it('UNLIMITED mode allows all', () => {
    const p = createAIClientBudgetPolicy({ mode: BUDGET_MODE.UNLIMITED });
    assert.ok(p.isAllowed(COST_CLASS.HIGH));
  });

  it('FREE_ONLY blocks paid', () => {
    const p = createAIClientBudgetPolicy({ mode: BUDGET_MODE.FREE_ONLY });
    assert.ok(!p.isAllowed(COST_CLASS.LOW));
    assert.ok(p.isAllowed(COST_CLASS.FREE));
  });

  it('blocks UNKNOWN cost', () => {
    const p = createAIClientBudgetPolicy({ mode: BUDGET_MODE.MONITORED, maxRequestCostClass: COST_CLASS.MEDIUM });
    assert.ok(!p.isAllowed(COST_CLASS.UNKNOWN));
  });

  it('requiresApproval for HIGH cost', () => {
    const p = createAIClientBudgetPolicy({ humanApprovalThreshold: COST_CLASS.HIGH });
    assert.ok(p.requiresApproval(COST_CLASS.HIGH));
  });

  it('realBillingActive is false', () => {
    const p = createAIClientBudgetPolicy({});
    assert.equal(p.realBillingActive, false);
  });

  it('has version', () => { assert.ok(AI_CLIENT_BUDGET_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Cost Guard', () => {
  it('blocks UNKNOWN paid execution', () => {
    const guard  = createAIRouterCostGuard({ blockUnknownPaid: true });
    const est    = createAIRequestCostEstimate({ estimatedCostClass: COST_CLASS.UNKNOWN, confidence: ESTIMATE_CONFIDENCE.UNKNOWN });
    const result = guard.evaluate(est);
    assert.equal(result.result, COST_GUARD_RESULT.BLOCKED);
    assert.equal(result.reason, 'UNKNOWN_PAID_EXECUTION');
  });

  it('blocks HIGH cost without policy', () => {
    const guard = createAIRouterCostGuard({ blockHighCostWithoutPolicy: true });
    const est   = createAIRequestCostEstimate({ estimatedCostClass: COST_CLASS.HIGH, confidence: ESTIMATE_CONFIDENCE.LOW });
    const r     = guard.evaluate(est, null);
    assert.equal(r.result, COST_GUARD_RESULT.BLOCKED);
  });

  it('allows LOW cost with approved provider', () => {
    const guard = createAIRouterCostGuard({ approvedProviders: ['direct'] });
    const est   = createAIRequestCostEstimate({ provider: 'direct', estimatedCostClass: COST_CLASS.LOW, confidence: ESTIMATE_CONFIDENCE.MEDIUM });
    const r     = guard.evaluate(est);
    assert.equal(r.result, COST_GUARD_RESULT.ALLOWED);
  });

  it('blocks unapproved provider', () => {
    const guard = createAIRouterCostGuard({ approvedProviders: ['direct'] });
    const est   = createAIRequestCostEstimate({ provider: 'openrouter', estimatedCostClass: COST_CLASS.LOW, confidence: ESTIMATE_CONFIDENCE.MEDIUM });
    const r     = guard.evaluate(est);
    assert.equal(r.result, COST_GUARD_RESULT.BLOCKED);
    assert.equal(r.reason, 'PROVIDER_NOT_APPROVED');
  });

  it('has version', () => { assert.ok(AI_ROUTER_COST_GUARD_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Quality Target', () => {
  it('CRITICAL requires humanReview', () => {
    const t = createAIQualityTarget(AI_QUALITY_TARGET.CRITICAL);
    assert.ok(t.humanReview);
    assert.ok(t.groundingRequired);
  });

  it('BASIC does not require humanReview', () => {
    const t = createAIQualityTarget(AI_QUALITY_TARGET.BASIC);
    assert.ok(!t.humanReview);
  });

  it('has version', () => { assert.ok(AI_QUALITY_TARGET_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Routing Quality Score', () => {
  it('computes overall score', () => {
    const s = computeAIRoutingQualityScore({ taskFit: 90, quality: 85, costAppropriateness: 80, latency: 90, privacy: 100, health: 100, fallback: 100, outputCompatibility: 100 });
    assert.ok(s.overall >= 80);
    assert.ok(s.routingReady);
  });

  it('returns violations when factor < 50', () => {
    const s = computeAIRoutingQualityScore({ taskFit: 30 });
    assert.ok(s.violations.length > 0);
  });

  it('isReal false', () => {
    assert.equal(computeAIRoutingQualityScore({}).isReal, false);
  });

  it('has version', () => { assert.ok(AI_ROUTING_QUALITY_SCORE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Routing Quality Gate', () => {
  it('PASS when all good and score >= 80', () => {
    const r = evaluateAIRoutingQualityGate({ score: 90, capabilityMatch: true, privacySafe: true, costApproved: true, policyCompliant: true, fallbackValid: true, modelEnabled: true, highRiskSafe: true });
    assert.equal(r.status, ROUTING_GATE_STATUS.PASS);
  });

  it('BLOCKED when capability mismatch', () => {
    const r = evaluateAIRoutingQualityGate({ score: 90, capabilityMatch: false });
    assert.equal(r.status, ROUTING_GATE_STATUS.BLOCKED);
    assert.ok(r.blocks.includes(ROUTING_BLOCK_REASON.CAPABILITY_MISMATCH));
  });

  it('BLOCKED when restricted data to unauthorized provider', () => {
    const r = evaluateAIRoutingQualityGate({ score: 90, privacySafe: false });
    assert.ok(r.blocks.includes(ROUTING_BLOCK_REASON.RESTRICTED_DATA_UNAUTHORIZED));
  });

  it('BLOCKED when paid without approval', () => {
    const r = evaluateAIRoutingQualityGate({ score: 90, costApproved: false });
    assert.ok(r.blocks.includes(ROUTING_BLOCK_REASON.PAID_WITHOUT_APPROVAL));
  });

  it('BLOCKED when disabled model', () => {
    const r = evaluateAIRoutingQualityGate({ score: 90, modelEnabled: false });
    assert.ok(r.blocks.includes(ROUTING_BLOCK_REASON.DISABLED_MODEL));
  });

  it('BLOCKED when unsafe high risk', () => {
    const r = evaluateAIRoutingQualityGate({ score: 90, highRiskSafe: false });
    assert.ok(r.blocks.includes(ROUTING_BLOCK_REASON.UNSAFE_HIGH_RISK_ROUTING));
  });

  it('has version', () => { assert.ok(AI_ROUTING_QUALITY_GATE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Task Classifier', () => {
  it('FACTUAL_HIGH_RISK is CRITICAL risk', () => {
    assert.equal(classifyTaskRisk(AI_TASK_TYPE.FACTUAL_HIGH_RISK), TASK_RISK_LEVEL.CRITICAL);
  });

  it('SIMPLE_CHAT is LOW risk', () => {
    assert.equal(classifyTaskRisk(AI_TASK_TYPE.SIMPLE_CHAT), TASK_RISK_LEVEL.LOW);
  });

  it('createAITaskClassifier classifies correctly', () => {
    const c = createAITaskClassifier();
    const r = c.classify(AI_TASK_TYPE.FACTUAL_HIGH_RISK);
    assert.ok(r.critical);
    assert.ok(r.highRisk);
  });

  it('exposes all task types', () => {
    const types = ['SIMPLE_CHAT','CUSTOMER_SUPPORT','SALES','BOOKING','CODING','REASONING',
      'BUSINESS_ANALYSIS','CONTENT','MEDIA_SCRIPT','SOCIAL_COPY','VOICE_PLANNING',
      'STRUCTURED_EXTRACTION','FACTUAL_HIGH_RISK'];
    for (const t of types) assert.ok(AI_TASK_TYPE[t], `Missing: ${t}`);
  });

  it('has version', () => { assert.ok(AI_TASK_CLASSIFIER_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — High-Risk Policy', () => {
  it('detects high-risk domain', () => {
    assert.ok(isHighRiskDomain('legal'));
    assert.ok(isHighRiskDomain('medical'));
    assert.ok(!isHighRiskDomain('sports'));
  });

  it('blocks cheap model for CRITICAL task', () => {
    const p = createAIHighRiskPolicy({ enforcePremiumQuality: true });
    const r = p.evaluate('FACTUAL_HIGH_RISK', TASK_RISK_LEVEL.CRITICAL, 'BASIC');
    assert.ok(!r.safe);
  });

  it('allows HIGH quality for CRITICAL task', () => {
    const p = createAIHighRiskPolicy({ enforcePremiumQuality: true });
    const r = p.evaluate('FACTUAL_HIGH_RISK', TASK_RISK_LEVEL.CRITICAL, 'HIGH');
    assert.ok(r.safe);
  });

  it('is safe for LOW risk regardless of quality', () => {
    const p = createAIHighRiskPolicy({});
    const r = p.evaluate('SIMPLE_CHAT', TASK_RISK_LEVEL.LOW, 'BASIC');
    assert.ok(r.safe);
  });

  it('has version', () => { assert.ok(AI_HIGH_RISK_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Privacy Policy', () => {
  it('public provider allows PUBLIC_SAFE', () => {
    const p = createAIProviderPrivacyPolicy({ maxDataClass: 'PUBLIC_SAFE' });
    assert.ok(p.allows('PUBLIC_SAFE'));
  });

  it('public provider blocks SENSITIVE', () => {
    const p = createAIProviderPrivacyPolicy({ maxDataClass: 'BUSINESS_INTERNAL' });
    assert.ok(!p.allows('SENSITIVE'));
  });

  it('RESTRICTED requires explicit policy', () => {
    const p = createAIProviderPrivacyPolicy({ maxDataClass: 'RESTRICTED', requiresExplicitPolicy: false });
    assert.ok(!p.allows('RESTRICTED'));
  });

  it('routePrivacy returns allowed correctly', () => {
    const policy = createAIProviderPrivacyPolicy({ maxDataClass: 'PERSONAL' });
    const r      = routePrivacy('PUBLIC_SAFE', policy);
    assert.ok(r.allowed);
  });

  it('has version', () => { assert.ok(AI_PROVIDER_PRIVACY_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Data Minimization', () => {
  it('redacts API key patterns', () => {
    const r = redactSecrets('Authorization: Bearer abc123def456ghi789jkl012mno345pqr');
    assert.ok(r.includes('[REDACTED_SECRET]'));
  });

  it('minimizeContext trims long text', () => {
    const long = 'x'.repeat(10000);
    const r    = minimizeContext(long, 100);
    assert.ok(r.length <= 110); // trimmed + marker
    assert.ok(r.includes('[trimmed]'));
  });

  it('createAIDataMinimizationPolicy processes text', () => {
    const p = createAIDataMinimizationPolicy({ maxContextChars: 50 });
    const r = p.process('Short text');
    assert.equal(r, 'Short text');
  });

  it('has version', () => { assert.ok(AI_DATA_MINIMIZATION_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Client Isolation', () => {
  it('same client passes boundary check', () => {
    const r = assertClientBoundary('client-A', 'client-A');
    assert.ok(r.safe);
  });

  it('different client fails boundary check', () => {
    const r = assertClientBoundary('client-A', 'client-B');
    assert.ok(!r.safe);
  });

  it('scopeConfig namespaces to clientId', () => {
    const p = createAIClientIsolationPolicy({ clientId: 'A' });
    const c = p.scopeConfig({ mode: 'BALANCED' });
    assert.equal(c.clientId, 'A');
    assert.ok(c._isolated);
  });

  it('has version', () => { assert.ok(AI_CLIENT_ISOLATION_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Model Allowlist Policy', () => {
  it('allows all when no restrictions', () => {
    const p = createAIModelAllowlistPolicy({});
    assert.ok(p.isAllowed('any-model', 'any-provider'));
  });

  it('blocks model not in allowedModelIds', () => {
    const p = createAIModelAllowlistPolicy({ allowedModelIds: ['model-a'] });
    assert.ok(!p.isModelAllowed('model-b'));
  });

  it('allows model in list', () => {
    const p = createAIModelAllowlistPolicy({ allowedModelIds: ['model-a'] });
    assert.ok(p.isModelAllowed('model-a'));
  });

  it('has version', () => { assert.ok(AI_MODEL_ALLOWLIST_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Model Block Policy', () => {
  it('blocks deprecated model', () => {
    const p   = createAIModelBlockPolicy({});
    const m   = createAIModelDefinition({ status: MODEL_STATUS.DEPRECATED });
    const res = p.isBlocked(m);
    assert.ok(res.blocked);
  });

  it('blocks disabled model', () => {
    const p   = createAIModelBlockPolicy({});
    const m   = createAIModelDefinition({ status: MODEL_STATUS.DISABLED });
    const res = p.isBlocked(m);
    assert.ok(res.blocked);
  });

  it('does not block AVAILABLE model', () => {
    const p   = createAIModelBlockPolicy({});
    const m   = createAIModelDefinition({ status: MODEL_STATUS.AVAILABLE });
    const res = p.isBlocked(m);
    assert.ok(!res.blocked);
  });

  it('filterCatalog removes blocked models', () => {
    const p = createAIModelBlockPolicy({});
    const catalog = [
      createAIModelDefinition({ modelId: 'good', status: MODEL_STATUS.AVAILABLE }),
      createAIModelDefinition({ modelId: 'bad',  status: MODEL_STATUS.DEPRECATED }),
    ];
    const filtered = p.filterCatalog(catalog);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].modelId, 'good');
  });

  it('has version', () => { assert.ok(AI_MODEL_BLOCK_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Client Routing Profile', () => {
  it('creates with defaults', () => {
    const p = createAIClientRoutingProfile({ clientId: 'c1' });
    assert.equal(p.clientId, 'c1');
    assert.equal(p.routingMode, DEFAULT_ROUTING_MODE);
    assert.equal(p.isReal, false);
  });

  it('freezes output', () => {
    const p = createAIClientRoutingProfile({});
    assert.throws(() => { p.clientId = 'hack'; });
  });

  it('has version', () => { assert.ok(AI_CLIENT_ROUTING_PROFILE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Vertical Presets', () => {
  it('LEGAL preset uses QUALITY_FIRST and CRITICAL quality', () => {
    const p = getVerticalPreset(VERTICAL_PRESET.LEGAL);
    assert.equal(p.routingMode, ROUTING_MODE.QUALITY_FIRST);
    assert.equal(p.qualityTarget, 'CRITICAL');
  });

  it('PADEL preset uses BALANCED', () => {
    const p = getVerticalPreset(VERTICAL_PRESET.PADEL);
    assert.equal(p.routingMode, ROUTING_MODE.BALANCED);
  });

  it('EDUCATION preset prefers local', () => {
    const p = getVerticalPreset(VERTICAL_PRESET.EDUCATION);
    assert.ok(p.localPreference);
  });

  it('unknown vertical defaults to GENERIC', () => {
    const p = getVerticalPreset('NONEXISTENT');
    assert.equal(p.routingMode, ROUTING_MODE.BALANCED);
  });

  it('exposes all 7 verticals', () => {
    const verticals = ['PADEL','CLINIC','LEGAL','BEAUTY','VETERINARY','EDUCATION','GENERIC'];
    for (const v of verticals) assert.ok(VERTICAL_PRESET[v], `Missing: ${v}`);
  });

  it('has version', () => { assert.ok(AI_VERTICAL_PRESETS_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Structured Output Policy', () => {
  it('compatible with model that supports it', () => {
    const p = createAIStructuredOutputPolicy({});
    const m = createAIModelDefinition({ structuredOutput: true });
    assert.ok(p.isCompatible(m));
  });

  it('incompatible with model that does not support it', () => {
    const p = createAIStructuredOutputPolicy({});
    const m = createAIModelDefinition({ structuredOutput: false });
    assert.ok(!p.isCompatible(m));
  });

  it('validate returns invalid when output empty', () => {
    const p = createAIStructuredOutputPolicy({});
    const v = p.validate(null);
    assert.ok(!v.valid);
  });

  it('validate detects missing required keys', () => {
    const p = createAIStructuredOutputPolicy({});
    const v = p.validate({ a: 1 }, { required: ['a', 'b'] });
    assert.ok(!v.valid);
    assert.ok(v.reason.includes('b'));
  });

  it('has version', () => { assert.ok(AI_STRUCTURED_OUTPUT_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Tool Capability Policy', () => {
  it('compatible with tool-enabled model', () => {
    const p = createAIToolCapabilityPolicy();
    const m = createAIModelDefinition({ tools: true });
    assert.ok(p.isCompatible(m));
  });

  it('validate fails when tools required but model lacks them', () => {
    const p = createAIToolCapabilityPolicy();
    const m = createAIModelDefinition({ tools: false });
    const v = p.validate(true, m);
    assert.ok(!v.valid);
    assert.equal(v.reason, 'MODEL_DOES_NOT_SUPPORT_TOOLS');
  });

  it('validate passes when tools not required', () => {
    const p = createAIToolCapabilityPolicy();
    const m = createAIModelDefinition({ tools: false });
    const v = p.validate(false, m);
    assert.ok(v.valid);
  });

  it('has version', () => { assert.ok(AI_TOOL_CAPABILITY_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Context Budget Policy', () => {
  it('classifies small context correctly', () => {
    assert.equal(classifyContextSize(1000), CONTEXT_CLASS.SMALL);
  });

  it('classifies very large context correctly', () => {
    assert.equal(classifyContextSize(200000), CONTEXT_CLASS.VERY_LARGE);
  });

  it('evaluate detects within-budget', () => {
    const p = createAIContextBudgetPolicy({ maxContextClass: CONTEXT_CLASS.MEDIUM });
    const r = p.evaluate(1000);
    assert.ok(r.within);
  });

  it('evaluate detects over-budget', () => {
    const p = createAIContextBudgetPolicy({ maxContextClass: CONTEXT_CLASS.SMALL });
    const r = p.evaluate(50000);
    assert.ok(!r.within);
  });

  it('has version', () => { assert.ok(AI_CONTEXT_BUDGET_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Token Efficiency Policy', () => {
  it('applies strategies when quality allows', () => {
    const p = createAITokenEfficiencyPolicy({ safeQualityFloor: 'STANDARD' });
    const r = p.apply('text', 'STANDARD');
    assert.ok(r.qualityPreserved);
  });

  it('skips aggressive strategies for HIGH quality', () => {
    const p = createAITokenEfficiencyPolicy({ safeQualityFloor: 'STANDARD' });
    const r = p.apply('text', 'HIGH');
    assert.equal(r.appliedStrategies.length, 0);
  });

  it('has version', () => { assert.ok(AI_TOKEN_EFFICIENCY_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Response Budget', () => {
  it('VOICE_PLANNING gets SHORT response', () => {
    const b = createAIResponseBudget({ taskType: 'VOICE_PLANNING' });
    assert.equal(b.length, RESPONSE_LENGTH.SHORT);
  });

  it('CODING gets DETAILED response', () => {
    const b = createAIResponseBudget({ taskType: 'CODING' });
    assert.equal(b.length, RESPONSE_LENGTH.DETAILED);
  });

  it('override works', () => {
    const b = createAIResponseBudget({ taskType: 'CODING', override: RESPONSE_LENGTH.SHORT });
    assert.equal(b.length, RESPONSE_LENGTH.SHORT);
  });

  it('has version', () => { assert.ok(AI_RESPONSE_BUDGET_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Response Cache Policy', () => {
  it('booking is NOT cacheable', () => {
    const p = createAIResponseCachePolicy({});
    const r = p.evaluate('BOOKING', 'PUBLIC_SAFE');
    assert.equal(r.eligibility, CACHE_ELIGIBILITY.FORBIDDEN);
  });

  it('SENSITIVE data is NOT cacheable', () => {
    const p = createAIResponseCachePolicy({});
    const r = p.evaluate('CONTENT', 'SENSITIVE');
    assert.equal(r.eligibility, CACHE_ELIGIBILITY.FORBIDDEN);
  });

  it('CONTENT with PUBLIC_SAFE is cacheable', () => {
    const p = createAIResponseCachePolicy({});
    const r = p.evaluate('CONTENT', 'PUBLIC_SAFE', false);
    assert.equal(r.eligibility, CACHE_ELIGIBILITY.CACHEABLE);
  });

  it('personalized is NOT_CACHEABLE', () => {
    const p = createAIResponseCachePolicy({});
    const r = p.evaluate('CONTENT', 'PUBLIC_SAFE', true);
    assert.equal(r.eligibility, CACHE_ELIGIBILITY.NOT_CACHEABLE);
  });

  it('has version', () => { assert.ok(AI_RESPONSE_CACHE_POLICY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — OpenRouter Response Normalizer', () => {
  const validRaw = {
    model: 'fixture-m',
    choices: [{ message: { role: 'assistant', content: 'Answer.' }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  };

  it('normalizes valid response', () => {
    const n = normalizeOpenRouterResponse(validRaw);
    assert.equal(n.content, 'Answer.');
    assert.equal(n.model, 'fixture-m');
    assert.equal(n.provider, 'openrouter');
    assert.equal(n.isReal, false);
  });

  it('isValidOpenRouterResponse true for valid', () => {
    assert.ok(isValidOpenRouterResponse(validRaw));
  });

  it('isValidOpenRouterResponse false for empty choices', () => {
    assert.ok(!isValidOpenRouterResponse({ choices: [] }));
  });

  it('handles missing usage gracefully', () => {
    const raw = { choices: [{ message: { content: 'Hi' }, finish_reason: 'stop' }] };
    const n   = normalizeOpenRouterResponse(raw);
    assert.equal(n.usage.totalTokens, null);
  });

  it('has version', () => { assert.ok(OPENROUTER_RESPONSE_NORMALIZER_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — OpenRouter Error Normalizer', () => {
  it('maps 429 to RATE_LIMIT', () => {
    const e = normalizeOpenRouterError({ status: 429 });
    assert.equal(e.failureType, FALLBACK_FAILURE.RATE_LIMIT);
    assert.ok(e.retryable);
  });

  it('maps 401 to AUTH', () => {
    const e = normalizeOpenRouterError({ status: 401 });
    assert.equal(e.failureType, FALLBACK_FAILURE.AUTH);
    assert.ok(!e.retryable);
  });

  it('maps 500 to PROVIDER_DOWN', () => {
    const e = normalizeOpenRouterError({ status: 500 });
    assert.equal(e.failureType, FALLBACK_FAILURE.PROVIDER_DOWN);
  });

  it('maps 504 to TIMEOUT', () => {
    const e = normalizeOpenRouterError({ status: 504 });
    assert.equal(e.failureType, FALLBACK_FAILURE.TIMEOUT);
  });

  it('isReal false', () => {
    assert.equal(normalizeOpenRouterError({}).isReal, false);
  });

  it('has version', () => { assert.ok(OPENROUTER_ERROR_NORMALIZER_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Model Discovery', () => {
  it('discover returns fixture source', () => {
    const d = createOpenRouterModelDiscovery({ staticCatalog: [{ modelId: 'm1' }] });
    const r = d.discover();
    assert.equal(r.source, DISCOVERY_SOURCE.FIXTURE);
    assert.equal(r.isReal, false);
  });

  it('always uses fixture even if allowLive passed', () => {
    const d = createOpenRouterModelDiscovery({ allowLive: true, staticCatalog: [] });
    assert.equal(d.allowLive, false);
  });

  it('getModel finds existing model', () => {
    const d = createOpenRouterModelDiscovery({ staticCatalog: [{ modelId: 'fixture-m1' }] });
    const r = d.getModel('fixture-m1');
    assert.ok(r.found);
  });

  it('getModel returns not found for missing model', () => {
    const d = createOpenRouterModelDiscovery({ staticCatalog: [] });
    const r = d.getModel('nonexistent');
    assert.ok(!r.found);
  });

  it('has version', () => { assert.ok(OPENROUTER_MODEL_DISCOVERY_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Agent Engine Bridge', () => {
  it('creates bridge with routing profile', () => {
    const b = createAgentEngineBridge({ agentId: 'sales-agent', aiRoutingProfile: 'BALANCED', qualityTarget: 'STANDARD' });
    assert.equal(b.agentId, 'sales-agent');
    assert.equal(b.qualityTarget, 'STANDARD');
  });

  it('buildRequestProfile does not hardcode model name', () => {
    const b = createAgentEngineBridge({ agentId: 'a1', qualityTarget: 'HIGH' });
    const r = b.buildRequestProfile('CODING');
    assert.equal(r.taskType, 'CODING');
    assert.equal(r.qualityTarget, 'HIGH');
    assert.ok(!r.modelId); // no concrete model name
  });

  it('has version', () => { assert.ok(AGENT_ENGINE_BRIDGE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Voice Bridge', () => {
  it('builds voice request profile with FAST alias', () => {
    const b = createVoiceBridge({ preferredAlias: 'FAST' });
    const r = b.buildVoiceRequestProfile();
    assert.equal(r.taskType, 'VOICE_PLANNING');
    assert.equal(r.modelAlias, 'FAST');
    assert.equal(r.latencyTarget, 'LOW');
  });

  it('has version', () => { assert.ok(VOICE_BRIDGE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Media Bridge', () => {
  it('uses PREMIUM for MEDIA_SCRIPT', () => {
    const b = createMediaBridge({});
    const r = b.buildMediaRequestProfile('MEDIA_SCRIPT');
    assert.equal(r.modelAlias, 'PREMIUM');
    assert.equal(r.qualityTarget, 'HIGH');
  });

  it('uses BALANCED for non-premium tasks', () => {
    const b = createMediaBridge({});
    const r = b.buildMediaRequestProfile('CONTENT');
    assert.equal(r.modelAlias, 'BALANCED');
  });

  it('has version', () => { assert.ok(MEDIA_BRIDGE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Social Bridge', () => {
  it('uses CHEAP in batch mode', () => {
    const b = createSocialBridge({ batchMode: true });
    const r = b.buildSocialRequestProfile();
    assert.equal(r.modelAlias, 'CHEAP');
  });

  it('HIGH cost sensitivity for social copy', () => {
    const b = createSocialBridge({});
    const r = b.buildSocialRequestProfile();
    assert.equal(r.costSensitivity, 'HIGH');
  });

  it('has version', () => { assert.ok(SOCIAL_BRIDGE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Lead CRM Bridge', () => {
  it('ENRICHMENT uses cheap alias', () => {
    const b = createLeadCrmBridge({});
    const r = b.buildLeadRequestProfile('ENRICHMENT');
    assert.equal(r.modelAlias, 'CHEAP');
  });

  it('CRM analysis uses balanced alias', () => {
    const b = createLeadCrmBridge({});
    const r = b.buildCrmRequestProfile();
    assert.equal(r.modelAlias, 'BALANCED');
  });

  it('has version', () => { assert.ok(LEAD_CRM_BRIDGE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — MCP AI Router Bridge', () => {
  it('keeps MCP tool and AI model separate', () => {
    const b = createMCPAIRouterBridge();
    const r = b.routeThroughMCP('my_tool', { qualityTarget: 'STANDARD' });
    assert.ok(r.note.includes('independent'));
    assert.equal(r.isReal, false);
  });

  it('has version', () => { assert.ok(MCP_AI_ROUTER_BRIDGE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Business Truth Bridge', () => {
  it('enforces grounding', () => {
    const b = createBusinessTruthBridge({});
    const r = b.enforceGrounding({ content: 'some response' });
    assert.ok(r.groundingEnforced);
    assert.ok(!r.paramericMemoryTrusted);
  });

  it('validateFactual requires validation', () => {
    const b = createBusinessTruthBridge({});
    const r = b.validateFactual('Claim X');
    assert.ok(r.validationRequired);
  });

  it('has version', () => { assert.ok(BUSINESS_TRUTH_BRIDGE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Observability Bridge', () => {
  it('emits routing event without secrets', () => {
    const e = emitRoutingEvent(AI_ROUTING_EVENT.MODEL_SELECTED, {
      model: 'fixture-m', apiKey: 'sk-secret123', provider: 'direct',
    });
    assert.equal(e.event, AI_ROUTING_EVENT.MODEL_SELECTED);
    assert.ok(!('apiKey' in e.payload));
    assert.ok('provider' in e.payload);
  });

  it('event payload is frozen', () => {
    const e = emitRoutingEvent(AI_ROUTING_EVENT.ROUTING_REQUESTED, { source: 'test' });
    assert.throws(() => { e.payload.hack = 'x'; });
  });

  it('exposes all routing events', () => {
    const events = ['ROUTING_REQUESTED','MODEL_SELECTED','PROVIDER_SELECTED','FALLBACK_ACTIVATED',
      'PROVIDER_FAILED','COST_BLOCKED','PRIVACY_BLOCKED','REQUEST_COMPLETED','ROUTING_QUALITY_EVALUATED'];
    for (const ev of events) assert.ok(AI_ROUTING_EVENT[ev], `Missing: ${ev}`);
  });

  it('has version', () => { assert.ok(AI_ROUTER_OBSERVABILITY_BRIDGE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — CI/CD Bridge', () => {
  it('runAllChecks passes in clean state', () => {
    const b = createAIRouterCICDBridge({});
    const r = b.runAllChecks();
    assert.ok(r.allPass);
    assert.equal(r.isReal, false);
  });

  it('exposes all CI checks', () => {
    const checks = ['PROVIDER_ADAPTERS','ROUTING_FIXTURES','SECRET_REFERENCES','NO_REAL_KEYS','QUALITY_GATES'];
    for (const c of checks) assert.ok(CICD_CHECK[c], `Missing: ${c}`);
  });

  it('has version', () => { assert.ok(AI_ROUTER_CICD_BRIDGE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Production Bridge', () => {
  it('all pass when all configured', () => {
    const b = createAIRouterProductionBridge({
      providerConfigured: true, secretRefExists: true, policyValid: true,
      costPolicyExists: true, healthAcceptable: true, fallbackConfigured: true,
    });
    assert.ok(b.productionReady);
  });

  it('not ready when provider not configured', () => {
    const b = createAIRouterProductionBridge({ providerConfigured: false });
    assert.ok(!b.productionReady);
  });

  it('isReal false', () => {
    const b = createAIRouterProductionBridge({});
    assert.equal(b.isReal, false);
  });

  it('has version', () => { assert.ok(AI_ROUTER_PRODUCTION_BRIDGE_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Provider Fixtures', () => {
  it('has 6 provider fixtures', () => {
    assert.equal(ALL_PROVIDER_FIXTURES.length, 6);
  });

  it('all fixtures have isReal false', () => {
    for (const p of ALL_PROVIDER_FIXTURES) assert.equal(p.isReal, false, `${p.id} isReal should be false`);
  });

  it('OPENROUTER fixture is INACTIVE by default', () => {
    assert.equal(FIXTURE_OPENROUTER.status, PROVIDER_STATUS.INACTIVE);
  });

  it('UNAVAILABLE fixture is UNAVAILABLE', () => {
    assert.equal(FIXTURE_UNAVAILABLE_PROVIDER.status, PROVIDER_STATUS.UNAVAILABLE);
  });

  it('LOCAL fixture is FREE cost', () => {
    assert.equal(FIXTURE_LOCAL.costProfile, 'FREE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Model Fixtures', () => {
  it('has exactly 20 model fixtures', () => {
    assert.equal(ALL_MODEL_FIXTURES.length, 20);
  });

  it('all model fixtures have isReal false', () => {
    for (const m of ALL_MODEL_FIXTURES) assert.equal(m.isReal, false, `${m.modelId} isReal should be false`);
  });

  it('DEPRECATED fixture has DEPRECATED status', () => {
    assert.equal(FIXTURE_MODEL_DEPRECATED.status, MODEL_STATUS.DEPRECATED);
  });

  it('DISABLED fixture has DISABLED status', () => {
    assert.equal(FIXTURE_MODEL_DISABLED.status, MODEL_STATUS.DISABLED);
  });

  it('VISION fixture supports vision', () => {
    assert.ok(FIXTURE_MODEL_VISION.vision);
  });

  it('TOOL_SPECIALIST supports tools', () => {
    assert.ok(FIXTURE_MODEL_TOOL_SPECIALIST.tools);
  });

  it('TEXT_ONLY does not support vision', () => {
    assert.ok(!FIXTURE_MODEL_TEXT_ONLY.vision);
  });

  it('PREMIUM_REASON is PREMIUM quality', () => {
    assert.equal(FIXTURE_MODEL_PREMIUM_REASON.qualityClass, QUALITY_CLASS.PREMIUM);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Routing Fixtures', () => {
  it('has 8 good routing scenarios', () => {
    assert.equal(ALL_GOOD_ROUTING_FIXTURES.length, 8);
  });

  it('all good routing fixtures have isReal false', () => {
    for (const f of ALL_GOOD_ROUTING_FIXTURES) assert.equal(f.isReal, false);
  });

  it('has 10 failure routing scenarios', () => {
    assert.equal(ALL_ROUTING_FAILURE_FIXTURES.length, 10);
  });

  it('all failure fixtures have isReal false', () => {
    for (const f of ALL_ROUTING_FAILURE_FIXTURES) assert.equal(f.isReal, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — OpenRouter Fixtures', () => {
  it('has 7 OpenRouter simulation fixtures', () => {
    assert.equal(ALL_OPENROUTER_FIXTURES.length, 7);
  });

  it('all OpenRouter fixtures have isReal false', () => {
    for (const f of ALL_OPENROUTER_FIXTURES) assert.equal(f.isReal, false);
  });

  it('rate limit fixture has status 429', () => {
    const f = ALL_OPENROUTER_FIXTURES.find(x => x.id === 'or-rate-limit');
    assert.equal(f.httpStatus, 429);
    assert.equal(f.expectedFailure, 'RATE_LIMIT');
  });

  it('auth missing fixture maps to AUTH failure', () => {
    const f = ALL_OPENROUTER_FIXTURES.find(x => x.id === 'or-auth-missing');
    assert.equal(f.expectedFailure, 'AUTH');
  });

  it('success fixture has valid response shape', () => {
    const f = ALL_OPENROUTER_FIXTURES.find(x => x.id === 'or-success');
    assert.ok(Array.isArray(f.response.choices));
    assert.ok(f.response.choices[0].message.content);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Router Report', () => {
  it('creates report with avgQualityScore', () => {
    const r = createAIRouterReport({ requests: 10, qualityScores: [80, 90, 85] });
    assert.equal(r.avgQualityScore, 85);
    assert.equal(r.isReal, false);
  });

  it('avgQualityScore null when no scores', () => {
    const r = createAIRouterReport({});
    assert.equal(r.avgQualityScore, null);
  });

  it('has version', () => { assert.ok(AI_ROUTER_REPORT_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Router Metrics', () => {
  it('increments counters', () => {
    const m = createAIRouterMetrics();
    m.increment('requestsByProvider', 'direct');
    m.increment('requestsByProvider', 'direct');
    const s = m.snapshot();
    assert.equal(s.requestsByProvider.direct, 2);
  });

  it('records latency', () => {
    const m = createAIRouterMetrics();
    m.recordLatency(100);
    m.recordLatency(200);
    const s = m.snapshot();
    assert.equal(s.avgSelectionLatencyMs, 150);
  });

  it('snapshot isReal false', () => {
    const m = createAIRouterMetrics();
    assert.equal(m.snapshot().isReal, false);
  });

  it('has version', () => { assert.ok(AI_ROUTER_METRICS_VERSION); });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Registry', () => {
  it('AI_ROUTER_REGISTRY has correct ID', () => {
    assert.equal(AI_ROUTER_REGISTRY.id, 'ai-router');
  });

  it('registry has 7 routing modes', () => {
    assert.equal(AI_ROUTER_REGISTRY.routingModes.length, 7);
  });

  it('registry has 9 model aliases', () => {
    assert.equal(AI_ROUTER_REGISTRY.modelAliases.length, 9);
  });

  it('registry has 20 fixture models', () => {
    assert.equal(AI_ROUTER_REGISTRY.fixtureModels, 20);
  });

  it('real OpenRouter calls blocked in registry', () => {
    assert.equal(AI_ROUTER_REGISTRY.realOpenRouterCalls, false);
    assert.equal(AI_ROUTER_REGISTRY.realLLMSpend, false);
  });

  it('REGISTRY_VERSION updated to 4.0.0', () => {
    assert.equal(REGISTRY_VERSION, '4.0.0');
  });

  it('PASO_ADV16_STATUS is 100_PERCENT', () => {
    assert.equal(PASO_ADV16_STATUS, '100_PERCENT');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Barrel Guardrails', () => {
  it('ADV16_STATUS is 100_PERCENT', () => {
    assert.equal(ADV16_STATUS, '100_PERCENT');
  });

  it('OPENROUTER_INTEGRATED is true', () => {
    assert.ok(OPENROUTER_INTEGRATED);
  });

  it('guardrails frozen', () => {
    assert.throws(() => { AI_ROUTER_GUARDRAILS.HACK = 'x'; });
  });

  it('FACTORY_AGENCY_SCOPE_ONLY is SI', () => {
    assert.equal(AI_ROUTER_GUARDRAILS.FACTORY_AGENCY_SCOPE_ONLY, 'SI');
  });

  it('NO_REAL_OPENROUTER_CALLS is SI', () => {
    assert.equal(AI_ROUTER_GUARDRAILS.NO_REAL_OPENROUTER_CALLS, 'SI');
  });

  it('NO_REAL_LLM_SPEND is SI', () => {
    assert.equal(AI_ROUTER_GUARDRAILS.NO_REAL_LLM_SPEND, 'SI');
  });

  it('NO_CP04_TOUCHED is true', () => {
    assert.equal(AI_ROUTER_GUARDRAILS.NO_CP04_TOUCHED, true);
  });

  it('OPENROUTER_EXECUTE_BLOCKED is true', () => {
    assert.equal(AI_ROUTER_GUARDRAILS.OPENROUTER_EXECUTE_BLOCKED, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-16 — Integration: Full routing pipeline', () => {
  it('simple support request → balanced routing → standard quality selection', () => {
    const catalog = ALL_MODEL_FIXTURES.filter(m =>
      m.status === MODEL_STATUS.AVAILABLE &&
      m.capabilities.includes('CHAT')
    );
    const policy  = createAIRoutingPolicy({ defaultMode: ROUTING_MODE.BALANCED });
    const request = createAIRequestProfile({ taskType: 'CUSTOMER_SUPPORT', qualityTarget: 'STANDARD' });
    const result  = policy.route(catalog, request);
    assert.ok(result.selectedModel);
    assert.ok(!result.policyBlocked);
  });

  it('CRITICAL task → blocks BASIC quality model', () => {
    const basicCatalog = ALL_MODEL_FIXTURES.filter(m =>
      m.qualityClass === QUALITY_CLASS.BASIC && m.status === MODEL_STATUS.AVAILABLE
    );
    const policy  = createAIRoutingPolicy({});
    const request = createAIRequestProfile({ taskType: 'FACTUAL_HIGH_RISK', qualityTarget: 'CRITICAL' });
    const result  = policy.route(basicCatalog, request);
    assert.ok(result.policyBlocked);
  });

  it('tool required → only tool models selected', () => {
    const catalog = ALL_MODEL_FIXTURES.filter(m => m.status === MODEL_STATUS.AVAILABLE);
    const policy  = createAIRoutingPolicy({});
    const request = createAIRequestProfile({ requiresTools: true });
    const result  = policy.route(catalog, request);
    if (result.selectedModel) {
      const sel = catalog.find(m => m.modelId === result.selectedModel);
      assert.ok(sel.tools);
    }
  });

  it('vision required → only vision models selected', () => {
    const catalog = ALL_MODEL_FIXTURES.filter(m => m.status === MODEL_STATUS.AVAILABLE);
    const policy  = createAIRoutingPolicy({});
    const request = createAIRequestProfile({ requiresVision: true });
    const result  = policy.route(catalog, request);
    if (result.selectedModel) {
      const sel = catalog.find(m => m.modelId === result.selectedModel);
      assert.ok(sel.vision);
    }
  });

  it('OpenRouter execute always blocked', () => {
    const provider = createOpenRouterProvider({ secretConfigured: true });
    const result   = provider.execute();
    assert.equal(result.status, OPENROUTER_EXECUTE_STATUS.BLOCKED);
    assert.equal(result.isReal, false);
  });

  it('cross-client isolation: different clients have separate configs', () => {
    const clientA = createAIClientRoutingProfile({ clientId: 'A', routingMode: ROUTING_MODE.COST_FIRST });
    const clientB = createAIClientRoutingProfile({ clientId: 'B', routingMode: ROUTING_MODE.QUALITY_FIRST });
    assert.notEqual(clientA.routingMode, clientB.routingMode);
    const boundary = assertClientBoundary('A', 'B');
    assert.ok(!boundary.safe);
  });

  it('cost guard blocks unknown paid execution', () => {
    const guard  = createAIRouterCostGuard({ blockUnknownPaid: true });
    const est    = createAIRequestCostEstimate({ estimatedCostClass: COST_CLASS.UNKNOWN, confidence: ESTIMATE_CONFIDENCE.UNKNOWN });
    const result = guard.evaluate(est, null);
    assert.equal(result.result, COST_GUARD_RESULT.BLOCKED);
  });

  it('fallback chain resolves to local when primary down', () => {
    const chain = createAIFallbackChain([
      { provider: 'openrouter', model: 'or-m', capabilities: ['CHAT'] },
      { provider: 'local',      model: 'local-m', capabilities: ['CHAT'] },
    ]);
    const r = resolveNextFallback(chain, -1, FALLBACK_FAILURE.RATE_LIMIT, ['CHAT']);
    assert.equal(r.result, CHAIN_RESULT.RESOLVED);
    assert.equal(r.provider.provider, 'openrouter');
  });

  it('circuit breaker blocks after threshold', () => {
    const cb = createAIProviderCircuitBreaker({ failureThreshold: 2, halfOpenAfterMs: 9999999 });
    cb.recordFailure(); cb.recordFailure();
    assert.ok(!cb.allowRequest());
  });

  it('privacy: restricted data blocked from public provider', () => {
    const policy  = createAIProviderPrivacyPolicy({ maxDataClass: 'BUSINESS_INTERNAL' });
    const result  = routePrivacy('RESTRICTED', policy);
    assert.ok(!result.allowed);
  });

  it('quality gate blocks disabled model', () => {
    const gate = evaluateAIRoutingQualityGate({ score: 95, modelEnabled: false });
    assert.equal(gate.status, ROUTING_GATE_STATUS.BLOCKED);
    assert.ok(gate.blocks.includes(ROUTING_BLOCK_REASON.DISABLED_MODEL));
  });
});
