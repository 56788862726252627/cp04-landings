// MCP Layer barrel — ADV-12

// Core
export { SERVER_STATUS, SERVER_RISK_LEVEL, createMCPServer, MCP_SERVER_DEFINITION_VERSION }    from './core/mcpServerDefinition.js';
export { TOOL_RISK_LEVEL, COST_CLASS, createMCPTool, MCP_TOOL_DEFINITION_VERSION }             from './core/mcpToolDefinition.js';
export { SENSITIVITY, ACCESS_POLICY, CACHE_POLICY, createMCPResource, MCP_RESOURCE_DEFINITION_VERSION } from './core/mcpResourceDefinition.js';
export { PROMPT_CATEGORY, createMCPPrompt, MCP_PROMPT_DEFINITION_VERSION }                     from './core/mcpPromptDefinition.js';
export { TRANSPORT_TYPE, TRANSPORT_STATUS, createStdioTransport, createHttpTransport, createSseTransport, createStreamableHttpTransport, MCP_TRANSPORT_VERSION } from './core/mcpTransport.js';
export { CAPABILITY_TYPE, createMCPCapability, MCP_CAPABILITY_VERSION }                        from './core/mcpCapability.js';

// Registry
export { registerServer, unregisterServer, getServer, listServers, listTools, listResources, listPrompts, findTool, findCapability, clearRegistry, MCP_REGISTRY_VERSION } from './registry/mcpRegistry.js';

// Discovery
export { discoverTools, discoverReadOnlyTools, discoverSafeTools, MCP_TOOL_DISCOVERY_VERSION } from './discovery/mcpToolDiscovery.js';

// Selection
export { selectTool, MCP_TOOL_SELECTOR_VERSION }                                               from './selection/mcpToolSelector.js';

// Validation
export { VALIDATION_RESULT, VALIDATION_ERROR, validateMCPToolCall, MCP_CONTRACT_VALIDATOR_VERSION } from './validation/mcpContractValidator.js';
export { sanitizeMCPArguments, MCP_ARGUMENT_SANITIZER_VERSION }                                from './validation/mcpArgumentSanitizer.js';
export { OUTPUT_VALIDATION_RESULT, validateMCPOutput, MCP_OUTPUT_VALIDATOR_VERSION }           from './validation/mcpOutputValidator.js';
export { redactMCPOutput, MCP_OUTPUT_REDACTOR_VERSION }                                        from './validation/mcpOutputRedactor.js';

// Policies
export { PERMISSION_LEVEL, createMCPPermissionPolicy, checkPermission, MCP_PERMISSION_POLICY_VERSION } from './policies/mcpPermissionPolicy.js';
export { APPROVAL_TRIGGER, evaluateHumanApproval, MCP_HUMAN_APPROVAL_POLICY_VERSION }         from './policies/mcpHumanApprovalPolicy.js';
export { createIdempotencyKey, checkIdempotency, registerExecution, clearIdempotencyStore, MCP_IDEMPOTENCY_POLICY_VERSION } from './policies/mcpIdempotencyPolicy.js';
export { RETRY_STRATEGY, createRetryPolicy, shouldRetry, computeDelay, MCP_RETRY_POLICY_VERSION } from './policies/mcpRetryPolicy.js';
export { DEFAULT_TIMEOUTS_MS, createTimeoutPolicy, getToolTimeout, MCP_TIMEOUT_POLICY_VERSION } from './policies/mcpTimeoutPolicy.js';
export { CIRCUIT_STATE, createCircuitBreaker, MCP_CIRCUIT_BREAKER_VERSION }                   from './policies/mcpCircuitBreaker.js';
export { createRateLimitPolicy, MCP_RATE_LIMIT_POLICY_VERSION }                               from './policies/mcpRateLimitPolicy.js';
export { COST_GUARD_ACTION, evaluateCostGuard, MCP_COST_GUARD_VERSION }                       from './policies/mcpCostGuard.js';
export { checkClientIsolation, assertClientIsolation, MCP_CLIENT_ISOLATION_POLICY_VERSION }   from './policies/mcpClientIsolationPolicy.js';
export { FRESHNESS_STATUS, evaluateFreshness, MCP_RESOURCE_FRESHNESS_POLICY_VERSION }         from './policies/mcpResourceFreshnessPolicy.js';
export { FILE_ACCESS_RESULT, checkFileAccess, MCP_FILE_ACCESS_POLICY_VERSION }                from './policies/mcpFileAccessPolicy.js';
export { DB_OPERATION, checkDatabaseOperation, MCP_DATABASE_POLICY_VERSION }                  from './policies/mcpDatabasePolicy.js';
export { BROWSER_ACTION, checkBrowserAction, MCP_BROWSER_POLICY_VERSION }                     from './policies/mcpBrowserPolicy.js';
export { COMM_CHANNEL, checkCommunicationPermission, MCP_COMMUNICATION_POLICY_VERSION }       from './policies/mcpCommunicationPolicy.js';
export { CALENDAR_OP, checkCalendarOperation, MCP_CALENDAR_POLICY_VERSION }                   from './policies/mcpCalendarPolicy.js';

// Auth
export { AUTH_TYPE, AUTH_STATUS, createMCPAuthProfile, MCP_AUTH_PROFILE_VERSION }             from './auth/mcpAuthProfile.js';
export { createSecretReference, MCP_SECRET_REFERENCE_VERSION }                                 from './auth/mcpSecretReference.js';

// Execution
export { EXECUTION_STATUS, createExecutionResult, MCP_EXECUTION_RESULT_VERSION }              from './execution/mcpExecutionResult.js';
export { executeMCPTool, MCP_EXECUTION_ENGINE_VERSION }                                        from './execution/mcpExecutionEngine.js';
export { dryRunMCPTool, MCP_DRY_RUN_ENGINE_VERSION }                                          from './execution/mcpDryRunEngine.js';

// Planning
export { PLAN_TYPE, createMCPToolPlan, MCP_TOOL_PLAN_VERSION }                                from './planning/mcpToolPlan.js';
export { createDependencyGraph, MCP_DEPENDENCY_GRAPH_VERSION }                                 from './planning/mcpToolDependencyGraph.js';

// Workflow
export { WORKFLOW_STATUS, runMCPWorkflow, MCP_WORKFLOW_RUNNER_VERSION }                       from './workflow/mcpWorkflowRunner.js';

// Health
export { HEALTH_STATUS, evaluateMCPHealth, MCP_SERVER_HEALTH_VERSION }                        from './health/mcpServerHealth.js';

// Bridges
export { BUSINESS_TRUTH_MCP_TOOL, createBusinessTruthBridge, MCP_BUSINESS_TRUTH_BRIDGE_VERSION } from './bridges/mcpBusinessTruthBridge.js';
export { AGENT_ENGINE_MCP_TOOLS, createAgentEngineBridge, MCP_AGENT_ENGINE_BRIDGE_VERSION }   from './bridges/mcpAgentEngineBridge.js';
export { AI_ROUTER_MCP_TOOL, createAiRouterBridge, MCP_AI_ROUTER_BRIDGE_VERSION }             from './bridges/mcpAiRouterBridge.js';
export { LEAD_ENGINE_MCP_TOOLS, createLeadEngineBridge, MCP_LEAD_ENGINE_BRIDGE_VERSION }      from './bridges/mcpLeadEngineBridge.js';
export { CRM_MCP_TOOLS, createCrmBridge, MCP_CRM_BRIDGE_VERSION }                             from './bridges/mcpCrmBridge.js';
export { VOICE_AGENT_MCP_TOOLS, createVoiceAgentBridge, MCP_VOICE_AGENT_BRIDGE_VERSION }      from './bridges/mcpVoiceAgentBridge.js';
export { MAKE_MCP_TOOLS, createMakeBridge, MCP_MAKE_BRIDGE_VERSION }                          from './bridges/mcpMakeBridge.js';
export { PRODUCTION_PIPELINE_MCP_TOOLS, createProductionPipelineBridge, MCP_PRODUCTION_PIPELINE_BRIDGE_VERSION } from './bridges/mcpProductionPipelineBridge.js';
export { OBSERVABILITY_EVENT_TYPES, OBSERVABILITY_MCP_TOOLS, emitMCPEvent, createObservabilityBridge, MCP_OBSERVABILITY_BRIDGE_VERSION } from './bridges/mcpObservabilityBridge.js';
export { MCP_EVAL_DIMENSIONS, MCP_CRITICAL_FAILURE_TYPES, createAgentEvaluationBridge, MCP_AGENT_EVALUATION_BRIDGE_VERSION } from './bridges/mcpAgentEvaluationBridge.js';

// Quality
export { QUALITY_DIMENSION, DEFAULT_QUALITY_WEIGHTS, computeMCPQualityScore, MCP_QUALITY_SCORE_VERSION } from './quality/mcpQualityScore.js';
export { GATE_STATUS, evaluateMCPQualityGate, MCP_QUALITY_GATE_VERSION }                      from './quality/mcpQualityGate.js';

// Config
export { createMCPClientProfile, MCP_CLIENT_PROFILE_VERSION }                                  from './config/mcpClientProfile.js';
export { MCP_VERTICAL, MCP_VERTICAL_PRESETS, getVerticalPreset, MCP_VERTICAL_PRESETS_VERSION } from './config/mcpVerticalPresets.js';

// Fixtures
export { ALL_FIXTURE_SERVERS, FIXTURE_SERVER_CRM, FIXTURE_SERVER_CALENDAR, FIXTURE_SERVER_BUSINESS_DATA, FIXTURE_SERVER_FILES, FIXTURE_SERVER_AUTOMATION, FIXTURE_SERVER_SEARCH, MCP_FIXTURE_SERVERS_VERSION } from './fixtures/mcpFixtureServers.js';
export { ALL_FIXTURE_TOOLS, TOOLS_READ_ONLY, TOOLS_SAFE_WRITE, TOOLS_SENSITIVE_WRITE, TOOLS_DESTRUCTIVE, TOOLS_COSTED, TOOLS_COMMUNICATION, MCP_FIXTURE_TOOLS_VERSION } from './fixtures/mcpFixtureTools.js';
export { ALL_GOOD_FIXTURES, GOOD_FIXTURE_READ_HOURS, MCP_GOOD_FIXTURES_VERSION }              from './fixtures/mcpGoodFixtures.js';
export { ALL_FAILURE_FIXTURES, FAILURE_CROSS_CLIENT, FAILURE_SECRET_IN_ARG, FAILURE_DELETE_WITHOUT_APPROVAL, MCP_FAILURE_FIXTURES_VERSION } from './fixtures/mcpFailureFixtures.js';
export { ALL_MULTI_TOOL_FIXTURES, WORKFLOW_LEAD_RESEARCH, WORKFLOW_BOOKING_PREPARATION, WORKFLOW_PARALLEL_READ, MCP_MULTI_TOOL_FIXTURES_VERSION } from './fixtures/mcpMultiToolFixtures.js';

export const MCP_LAYER_VERSION  = '1.0.0';
export const ADV12_STATUS       = '100_PERCENT';
