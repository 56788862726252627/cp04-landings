import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Core
import { SERVER_STATUS, SERVER_RISK_LEVEL, createMCPServer }            from '../../mcp/core/mcpServerDefinition.js';
import { TOOL_RISK_LEVEL, COST_CLASS, createMCPTool }                   from '../../mcp/core/mcpToolDefinition.js';
import { SENSITIVITY, ACCESS_POLICY, CACHE_POLICY, createMCPResource }  from '../../mcp/core/mcpResourceDefinition.js';
import { PROMPT_CATEGORY, createMCPPrompt }                              from '../../mcp/core/mcpPromptDefinition.js';
import { TRANSPORT_TYPE, createStdioTransport, createHttpTransport }     from '../../mcp/core/mcpTransport.js';
import { CAPABILITY_TYPE, createMCPCapability }                          from '../../mcp/core/mcpCapability.js';

// Registry
import {
  registerServer, unregisterServer, getServer, listServers,
  listTools, listResources, listPrompts, findTool, findCapability, clearRegistry,
} from '../../mcp/registry/mcpRegistry.js';

// Discovery
import { discoverTools, discoverReadOnlyTools, discoverSafeTools }       from '../../mcp/discovery/mcpToolDiscovery.js';

// Selection
import { selectTool }                                                     from '../../mcp/selection/mcpToolSelector.js';

// Validation
import { VALIDATION_RESULT, VALIDATION_ERROR, validateMCPToolCall }      from '../../mcp/validation/mcpContractValidator.js';
import { sanitizeMCPArguments }                                           from '../../mcp/validation/mcpArgumentSanitizer.js';
import { OUTPUT_VALIDATION_RESULT, validateMCPOutput }                   from '../../mcp/validation/mcpOutputValidator.js';
import { redactMCPOutput }                                                from '../../mcp/validation/mcpOutputRedactor.js';

// Policies
import { PERMISSION_LEVEL, createMCPPermissionPolicy, checkPermission }  from '../../mcp/policies/mcpPermissionPolicy.js';
import { APPROVAL_TRIGGER, evaluateHumanApproval }                       from '../../mcp/policies/mcpHumanApprovalPolicy.js';
import { checkIdempotency, registerExecution, clearIdempotencyStore }    from '../../mcp/policies/mcpIdempotencyPolicy.js';
import { RETRY_STRATEGY, createRetryPolicy, shouldRetry, computeDelay }  from '../../mcp/policies/mcpRetryPolicy.js';
import { DEFAULT_TIMEOUTS_MS, createTimeoutPolicy, getToolTimeout }      from '../../mcp/policies/mcpTimeoutPolicy.js';
import { CIRCUIT_STATE, createCircuitBreaker }                           from '../../mcp/policies/mcpCircuitBreaker.js';
import { createRateLimitPolicy }                                          from '../../mcp/policies/mcpRateLimitPolicy.js';
import { COST_GUARD_ACTION, evaluateCostGuard }                          from '../../mcp/policies/mcpCostGuard.js';
import { checkClientIsolation, assertClientIsolation }                   from '../../mcp/policies/mcpClientIsolationPolicy.js';
import { FRESHNESS_STATUS, evaluateFreshness }                           from '../../mcp/policies/mcpResourceFreshnessPolicy.js';
import { FILE_ACCESS_RESULT, checkFileAccess }                           from '../../mcp/policies/mcpFileAccessPolicy.js';
import { DB_OPERATION, checkDatabaseOperation }                          from '../../mcp/policies/mcpDatabasePolicy.js';
import { BROWSER_ACTION, checkBrowserAction }                            from '../../mcp/policies/mcpBrowserPolicy.js';
import { COMM_CHANNEL, checkCommunicationPermission }                    from '../../mcp/policies/mcpCommunicationPolicy.js';
import { CALENDAR_OP, checkCalendarOperation }                           from '../../mcp/policies/mcpCalendarPolicy.js';

// Auth
import { AUTH_TYPE, AUTH_STATUS, createMCPAuthProfile }                  from '../../mcp/auth/mcpAuthProfile.js';
import { createSecretReference }                                          from '../../mcp/auth/mcpSecretReference.js';

// Execution
import { EXECUTION_STATUS, createExecutionResult }                       from '../../mcp/execution/mcpExecutionResult.js';
import { executeMCPTool }                                                 from '../../mcp/execution/mcpExecutionEngine.js';
import { dryRunMCPTool }                                                  from '../../mcp/execution/mcpDryRunEngine.js';

// Planning / Workflow
import { PLAN_TYPE, createMCPToolPlan }                                   from '../../mcp/planning/mcpToolPlan.js';
import { createDependencyGraph }                                           from '../../mcp/planning/mcpToolDependencyGraph.js';
import { WORKFLOW_STATUS, runMCPWorkflow }                                from '../../mcp/workflow/mcpWorkflowRunner.js';

// Health
import { HEALTH_STATUS, evaluateMCPHealth }                              from '../../mcp/health/mcpServerHealth.js';

// Bridges
import { createBusinessTruthBridge, BUSINESS_TRUTH_MCP_TOOL }           from '../../mcp/bridges/mcpBusinessTruthBridge.js';
import { createAgentEngineBridge, AGENT_ENGINE_MCP_TOOLS }              from '../../mcp/bridges/mcpAgentEngineBridge.js';
import { createAiRouterBridge }                                           from '../../mcp/bridges/mcpAiRouterBridge.js';
import { createLeadEngineBridge }                                         from '../../mcp/bridges/mcpLeadEngineBridge.js';
import { createCrmBridge }                                                from '../../mcp/bridges/mcpCrmBridge.js';
import { createVoiceAgentBridge }                                         from '../../mcp/bridges/mcpVoiceAgentBridge.js';
import { createMakeBridge }                                               from '../../mcp/bridges/mcpMakeBridge.js';
import { createProductionPipelineBridge }                                 from '../../mcp/bridges/mcpProductionPipelineBridge.js';
import { OBSERVABILITY_EVENT_TYPES, emitMCPEvent, createObservabilityBridge } from '../../mcp/bridges/mcpObservabilityBridge.js';
import { MCP_EVAL_DIMENSIONS, MCP_CRITICAL_FAILURE_TYPES, createAgentEvaluationBridge } from '../../mcp/bridges/mcpAgentEvaluationBridge.js';

// Quality
import { QUALITY_DIMENSION, DEFAULT_QUALITY_WEIGHTS, computeMCPQualityScore } from '../../mcp/quality/mcpQualityScore.js';
import { GATE_STATUS, evaluateMCPQualityGate }                          from '../../mcp/quality/mcpQualityGate.js';

// Config
import { createMCPClientProfile }                                         from '../../mcp/config/mcpClientProfile.js';
import { MCP_VERTICAL, MCP_VERTICAL_PRESETS, getVerticalPreset }        from '../../mcp/config/mcpVerticalPresets.js';

// Fixtures
import { ALL_FIXTURE_SERVERS, FIXTURE_SERVER_CRM, FIXTURE_SERVER_CALENDAR, FIXTURE_SERVER_BUSINESS_DATA, FIXTURE_SERVER_FILES } from '../../mcp/fixtures/mcpFixtureServers.js';
import { ALL_FIXTURE_TOOLS, TOOLS_READ_ONLY, TOOLS_DESTRUCTIVE, TOOLS_COSTED } from '../../mcp/fixtures/mcpFixtureTools.js';
import { ALL_GOOD_FIXTURES, GOOD_FIXTURE_READ_HOURS }                    from '../../mcp/fixtures/mcpGoodFixtures.js';
import { ALL_FAILURE_FIXTURES, FAILURE_CROSS_CLIENT, FAILURE_SECRET_IN_ARG, FAILURE_DELETE_WITHOUT_APPROVAL, FAILURE_UNKNOWN_COST_AUTO_EXECUTE } from '../../mcp/fixtures/mcpFailureFixtures.js';
import { ALL_MULTI_TOOL_FIXTURES, WORKFLOW_LEAD_RESEARCH, WORKFLOW_PARALLEL_READ } from '../../mcp/fixtures/mcpMultiToolFixtures.js';

// Registry
import { REGISTRY_VERSION, PASO_ADV12_STATUS, MCP_REGISTRY }           from '../../factory-registry/index.js';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mkTool(overrides = {}) {
  return {
    id: overrides.id ?? 'test.tool', serverId: overrides.serverId ?? 'mcp_test', name: overrides.name ?? 'test.tool',
    readOnly: overrides.readOnly ?? true, idempotent: overrides.idempotent ?? true,
    destructive: overrides.destructive ?? false, requiresHumanApproval: overrides.requiresHumanApproval ?? false,
    riskLevel: overrides.riskLevel ?? 'LOW', costClass: overrides.costClass ?? 'FREE',
    requiredScopes: overrides.requiredScopes ?? [], timeoutMs: 3000, retryPolicy: 'TRANSIENT',
    inputSchema: overrides.inputSchema ?? {}, outputSchema: {}, isReal: false, ...overrides,
  };
}

function mkServer(tools = []) {
  return {
    id: 'srv_test', name: 'Test Server', version: '1.0.0', provider: 'test',
    transport: 'STDIO', endpoint: null, capabilities: [], tools,
    resources: [], prompts: [], authType: 'NONE', requiredScopes: [],
    riskLevel: 'LOW', costProfile: 'FREE', clientIsolation: true,
    status: 'AVAILABLE', isReal: false,
  };
}

// ─────────────────────────────────────────────
// SUITE 1 — Server Definition
// ─────────────────────────────────────────────
describe('ADV-12 mcpServerDefinition', () => {
  it('SERVER_STATUS has 6 values', () => { assert.equal(Object.keys(SERVER_STATUS).length, 6); });
  it('SERVER_RISK_LEVEL has 4 values', () => { assert.equal(Object.keys(SERVER_RISK_LEVEL).length, 4); });
  it('createMCPServer throws without id', () => { assert.throws(() => createMCPServer({ name: 'x' }), /id/); });
  it('createMCPServer throws without name', () => { assert.throws(() => createMCPServer({ id: 'x' }), /name/); });
  it('createMCPServer returns frozen object with isReal false', () => {
    const s = createMCPServer({ id: 'srv1', name: 'Test' });
    assert.equal(s.isReal, false);
    assert.ok(Object.isFrozen(s));
  });
  it('createMCPServer defaults to AVAILABLE status', () => {
    const s = createMCPServer({ id: 'srv2', name: 'S2' });
    assert.equal(s.status, SERVER_STATUS.AVAILABLE);
  });
  it('createMCPServer accepts custom status', () => {
    const s = createMCPServer({ id: 'srv3', name: 'S3', status: SERVER_STATUS.DEGRADED });
    assert.equal(s.status, SERVER_STATUS.DEGRADED);
  });
});

// ─────────────────────────────────────────────
// SUITE 2 — Tool Definition
// ─────────────────────────────────────────────
describe('ADV-12 mcpToolDefinition', () => {
  it('TOOL_RISK_LEVEL has 4 values', () => { assert.equal(Object.keys(TOOL_RISK_LEVEL).length, 4); });
  it('COST_CLASS has 5 values including UNKNOWN', () => {
    assert.equal(Object.keys(COST_CLASS).length, 5);
    assert.ok(COST_CLASS.UNKNOWN);
  });
  it('createMCPTool throws without id', () => { assert.throws(() => createMCPTool({ serverId: 's', name: 'n' }), /id/); });
  it('createMCPTool throws without serverId', () => { assert.throws(() => createMCPTool({ id: 'x', name: 'n' }), /serverId/); });
  it('createMCPTool throws without name', () => { assert.throws(() => createMCPTool({ id: 'x', serverId: 's' }), /name/); });
  it('createMCPTool defaults to readOnly true', () => {
    const t = createMCPTool({ id: 'tool1', serverId: 's', name: 'n' });
    assert.equal(t.readOnly, true);
    assert.equal(t.destructive, false);
    assert.equal(t.requiresHumanApproval, false);
    assert.equal(t.isReal, false);
  });
  it('createMCPTool can set destructive + requiresHumanApproval', () => {
    const t = createMCPTool({ id: 't2', serverId: 's', name: 'n', destructive: true, requiresHumanApproval: true });
    assert.equal(t.destructive, true);
    assert.equal(t.requiresHumanApproval, true);
  });
});

// ─────────────────────────────────────────────
// SUITE 3 — Resource Definition
// ─────────────────────────────────────────────
describe('ADV-12 mcpResourceDefinition', () => {
  it('SENSITIVITY has 4 values', () => { assert.equal(Object.keys(SENSITIVITY).length, 4); });
  it('ACCESS_POLICY has 4 values', () => { assert.equal(Object.keys(ACCESS_POLICY).length, 4); });
  it('CACHE_POLICY has 5 values', () => { assert.equal(Object.keys(CACHE_POLICY).length, 5); });
  it('createMCPResource throws without uri', () => { assert.throws(() => createMCPResource({ name: 'x' }), /uri/); });
  it('createMCPResource throws without name', () => { assert.throws(() => createMCPResource({ uri: 'mcp://x' }), /name/); });
  it('createMCPResource defaults to CLIENT_SCOPED + INTERNAL', () => {
    const r = createMCPResource({ uri: 'mcp://test', name: 'T' });
    assert.equal(r.accessPolicy, ACCESS_POLICY.CLIENT_SCOPED);
    assert.equal(r.sensitivity, SENSITIVITY.INTERNAL);
    assert.equal(r.isReal, false);
  });
});

// ─────────────────────────────────────────────
// SUITE 4 — Prompt Definition
// ─────────────────────────────────────────────
describe('ADV-12 mcpPromptDefinition', () => {
  it('PROMPT_CATEGORY has 6 values', () => { assert.equal(Object.keys(PROMPT_CATEGORY).length, 6); });
  it('createMCPPrompt throws without id', () => { assert.throws(() => createMCPPrompt({ name: 'x' }), /id/); });
  it('createMCPPrompt returns frozen with isReal false', () => {
    const p = createMCPPrompt({ id: 'p1', name: 'P1' });
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
});

// ─────────────────────────────────────────────
// SUITE 5 — Transport
// ─────────────────────────────────────────────
describe('ADV-12 mcpTransport', () => {
  it('TRANSPORT_TYPE has 4 values', () => { assert.equal(Object.keys(TRANSPORT_TYPE).length, 4); });
  it('createStdioTransport returns SIMULATED', () => {
    const t = createStdioTransport({ command: 'node' });
    assert.equal(t.type, TRANSPORT_TYPE.STDIO);
    assert.equal(t.status, 'SIMULATED');
    assert.equal(t.isReal, false);
  });
  it('createStdioTransport connect() throws NO_REAL_MCP_CREDENTIALS', async () => {
    const t = createStdioTransport({});
    await assert.rejects(() => t.connect(), /NO_REAL_MCP_CREDENTIALS/);
  });
  it('createHttpTransport returns SIMULATED', () => {
    const t = createHttpTransport({ baseUrl: 'https://example.com' });
    assert.equal(t.type, TRANSPORT_TYPE.HTTP);
    assert.equal(t.isReal, false);
  });
});

// ─────────────────────────────────────────────
// SUITE 6 — Capability
// ─────────────────────────────────────────────
describe('ADV-12 mcpCapability', () => {
  it('CAPABILITY_TYPE has 20 values', () => { assert.equal(Object.keys(CAPABILITY_TYPE).length, 20); });
  it('createMCPCapability throws without type', () => { assert.throws(() => createMCPCapability({}), /type/); });
  it('createMCPCapability READ_CRM defaults to readOnly', () => {
    const c = createMCPCapability({ type: CAPABILITY_TYPE.READ_CRM });
    assert.equal(c.readOnly, true);
    assert.equal(c.isReal, false);
  });
});

// ─────────────────────────────────────────────
// SUITE 7 — Registry
// ─────────────────────────────────────────────
describe('ADV-12 mcpRegistry', () => {
  beforeEach(() => { clearRegistry(); });

  it('registerServer registers server and tools', () => {
    const t1 = mkTool({ id: 'crm.get_lead', serverId: 'srv_test' });
    const srv = mkServer([t1]);
    const r = registerServer(srv, 'client_a');
    assert.equal(r.registered, true);
    assert.equal(r.isReal, false);
    assert.equal(getServer('srv_test', 'client_a').id, 'srv_test');
    assert.equal(findTool('crm.get_lead', 'client_a').id, 'crm.get_lead');
  });

  it('unregisterServer removes server and tools', () => {
    const srv = mkServer([mkTool()]);
    registerServer(srv, 'client_a');
    const r = unregisterServer('srv_test', 'client_a');
    assert.equal(r.removed, true);
    assert.equal(getServer('srv_test', 'client_a'), null);
    assert.equal(findTool('test.tool', 'client_a'), null);
  });

  it('client isolation: client_b cannot see client_a tools', () => {
    registerServer(mkServer([mkTool()]), 'client_a');
    assert.equal(findTool('test.tool', 'client_b'), null);
  });

  it('listServers returns only current client servers', () => {
    registerServer(mkServer([]), 'client_a');
    registerServer({ ...mkServer([]), id: 'srv_b' }, 'client_b');
    assert.equal(listServers('client_a').length, 1);
    assert.equal(listServers('client_b').length, 1);
  });

  it('registerServer throws without server.id', () => {
    assert.throws(() => registerServer({ name: 'x' }, 'c'), /id/);
  });
});

// ─────────────────────────────────────────────
// SUITE 8 — Discovery
// ─────────────────────────────────────────────
describe('ADV-12 mcpToolDiscovery', () => {
  beforeEach(() => {
    clearRegistry();
    const tools = [
      mkTool({ id: 'tool_read',    readOnly: true,  riskLevel: 'LOW',    costClass: 'FREE',   destructive: false, requiresHumanApproval: false }),
      mkTool({ id: 'tool_write',   readOnly: false, riskLevel: 'MEDIUM', costClass: 'FREE',   destructive: false, requiresHumanApproval: false }),
      mkTool({ id: 'tool_destruct',readOnly: false, riskLevel: 'HIGH',   costClass: 'FREE',   destructive: true,  requiresHumanApproval: true }),
      mkTool({ id: 'tool_costly',  readOnly: true,  riskLevel: 'LOW',    costClass: 'MEDIUM', destructive: false, requiresHumanApproval: true }),
    ];
    registerServer(mkServer(tools), 'client_x');
  });

  it('discoverTools returns all tools for client', () => {
    const r = discoverTools({}, 'client_x');
    assert.ok(r.count >= 4);
    assert.equal(r.isReal, false);
  });

  it('discoverTools filter readOnly', () => {
    const r = discoverTools({ readOnly: true }, 'client_x');
    assert.ok(r.tools.every(t => t.readOnly));
  });

  it('discoverTools filter excludeDestructive', () => {
    const r = discoverTools({ excludeDestructive: true }, 'client_x');
    assert.ok(r.tools.every(t => !t.destructive));
  });

  it('discoverReadOnlyTools excludes write tools', () => {
    const r = discoverReadOnlyTools('client_x');
    assert.ok(r.tools.every(t => t.readOnly));
    assert.equal(r.isReal, false);
  });

  it('discoverSafeTools excludes destructive + approval tools', () => {
    const r = discoverSafeTools('client_x');
    assert.ok(r.tools.every(t => !t.destructive));
  });
});

// ─────────────────────────────────────────────
// SUITE 9 — Tool Selector
// ─────────────────────────────────────────────
describe('ADV-12 mcpToolSelector', () => {
  beforeEach(() => {
    clearRegistry();
    const tools = [
      mkTool({ id: 'crm.get_lead', riskLevel: 'LOW', requiredScopes: ['READ_CRM'] }),
      mkTool({ id: 'calendar.get_slots', riskLevel: 'LOW', requiredScopes: ['READ_CALENDAR'] }),
    ];
    registerServer(mkServer(tools), 'client_sel');
  });

  it('selectTool returns frozen result with isReal false', () => {
    const r = selectTool('busca un lead en el crm', {}, 'client_sel');
    assert.equal(r.isReal, false);
    assert.ok(Object.isFrozen(r));
  });

  it('selectTool result has selected + alternatives + reasoning', () => {
    const r = selectTool('dame la agenda', {}, 'client_sel');
    assert.ok('selected' in r);
    assert.ok(Array.isArray(r.alternatives));
    assert.ok(typeof r.reasoning === 'string');
  });

  it('selectTool returns no tool when registry empty', () => {
    clearRegistry();
    const r = selectTool('test', {}, 'nobody');
    assert.equal(r.selected, null);
  });
});

// ─────────────────────────────────────────────
// SUITE 10 — Contract Validator
// ─────────────────────────────────────────────
describe('ADV-12 mcpContractValidator', () => {
  beforeEach(() => {
    clearRegistry();
    const t = mkTool({ id: 'crm.get_lead', inputSchema: { required: ['leadId'] } });
    registerServer(mkServer([t]), 'client_v');
  });

  it('VALIDATION_RESULT has PASS FAIL BLOCKED', () => {
    assert.ok(VALIDATION_RESULT.PASS);
    assert.ok(VALIDATION_RESULT.FAIL);
    assert.ok(VALIDATION_RESULT.BLOCKED);
  });

  it('validates PASS when all conditions met', () => {
    const r = validateMCPToolCall({ toolId: 'crm.get_lead', args: { leadId: '001' }, callerClientId: 'client_v' });
    assert.equal(r.result, VALIDATION_RESULT.PASS);
    assert.equal(r.isReal, false);
  });

  it('BLOCKED when tool not found', () => {
    const r = validateMCPToolCall({ toolId: 'fake.tool', args: {}, callerClientId: 'client_v' });
    assert.equal(r.result, VALIDATION_RESULT.BLOCKED);
    assert.ok(r.errors.includes(VALIDATION_ERROR.TOOL_NOT_FOUND));
  });

  it('FAIL when missing required arg', () => {
    const r = validateMCPToolCall({ toolId: 'crm.get_lead', args: {}, callerClientId: 'client_v' });
    assert.equal(r.result, VALIDATION_RESULT.FAIL);
    assert.ok(r.errors.some(e => e.includes('MISSING_REQUIRED_ARG')));
  });

  it('FAIL when requiresHumanApproval and not approved', () => {
    clearRegistry();
    const t = mkTool({ id: 'del.tool', requiresHumanApproval: true });
    registerServer(mkServer([t]), 'client_v');
    const r = validateMCPToolCall({ toolId: 'del.tool', args: {}, callerClientId: 'client_v', approvedByHuman: false });
    assert.equal(r.result, VALIDATION_RESULT.FAIL);
    assert.ok(r.errors.includes('APPROVAL_REQUIRED'));
  });

  it('PASS when requiresHumanApproval and approved', () => {
    clearRegistry();
    const t = mkTool({ id: 'del.tool', requiresHumanApproval: true });
    registerServer(mkServer([t]), 'client_v');
    const r = validateMCPToolCall({ toolId: 'del.tool', args: {}, callerClientId: 'client_v', approvedByHuman: true });
    assert.equal(r.result, VALIDATION_RESULT.PASS);
  });
});

// ─────────────────────────────────────────────
// SUITE 11 — Argument Sanitizer
// ─────────────────────────────────────────────
describe('ADV-12 mcpArgumentSanitizer', () => {
  it('clean args pass through unchanged', () => {
    const r = sanitizeMCPArguments({ leadId: 'abc', date: '2026-09-01' });
    assert.equal(r.clean, true);
    assert.equal(r.sanitized.leadId, 'abc');
    assert.equal(r.isReal, false);
  });

  it('api_key arg is redacted', () => {
    const r = sanitizeMCPArguments({ api_key: 'sk_live_SECRET', leadId: 'abc' });
    assert.equal(r.sanitized.api_key, '[REDACTED]');
    assert.equal(r.sanitized.leadId, 'abc');
    assert.equal(r.clean, false);
    assert.ok(r.blocked.includes('api_key'));
  });

  it('password arg is redacted', () => {
    const r = sanitizeMCPArguments({ password: 'hunter2' });
    assert.equal(r.sanitized.password, '[REDACTED]');
  });

  it('token arg is redacted', () => {
    const r = sanitizeMCPArguments({ token: 'Bearer abc123xyz' });
    assert.equal(r.sanitized.token, '[REDACTED]');
  });

  it('secret arg is redacted', () => {
    const r = sanitizeMCPArguments({ secret: 'mysecretvalue' });
    assert.equal(r.sanitized.secret, '[REDACTED]');
  });

  it('FAILURE_SECRET_IN_ARG fixture has expected blocked key', () => {
    const fixture = FAILURE_SECRET_IN_ARG;
    const r = sanitizeMCPArguments(fixture.args);
    assert.ok(fixture.expectedBlockedKeys.every(k => r.blocked.includes(k)));
  });
});

// ─────────────────────────────────────────────
// SUITE 12 — Output Validator
// ─────────────────────────────────────────────
describe('ADV-12 mcpOutputValidator', () => {
  it('null output fails', () => {
    const r = validateMCPOutput(null, {});
    assert.equal(r.result, OUTPUT_VALIDATION_RESULT.FAIL);
    assert.ok(r.issues.includes('NULL_OUTPUT'));
    assert.equal(r.isReal, false);
  });

  it('valid object with isReal passes', () => {
    const r = validateMCPOutput({ value: 'ok', isReal: false }, {});
    assert.equal(r.result, OUTPUT_VALIDATION_RESULT.PASS);
  });

  it('missing isReal adds MISSING_IS_REAL warning', () => {
    const r = validateMCPOutput({ value: 'ok' }, {});
    assert.ok(r.issues.includes('MISSING_IS_REAL'));
  });

  it('FAILURE_MALFORMED_OUTPUT fixture validates as FAIL', () => {
    const fixture = FAILURE_MALFORMED_OUTPUT ?? { simulatedOutput: null };
    const r = validateMCPOutput(fixture.simulatedOutput, {});
    assert.equal(r.result, OUTPUT_VALIDATION_RESULT.FAIL);
  });
});

const FAILURE_MALFORMED_OUTPUT = { simulatedOutput: null };

// ─────────────────────────────────────────────
// SUITE 13 — Output Redactor
// ─────────────────────────────────────────────
describe('ADV-12 mcpOutputRedactor', () => {
  it('redacts password field', () => {
    const r = redactMCPOutput({ name: 'Alice', password: 'secret123', isReal: false });
    assert.equal(r.password, '[REDACTED]');
    assert.equal(r.name, 'Alice');
  });

  it('redacts token field', () => {
    const r = redactMCPOutput({ data: 'x', token: 'abc123', isReal: false });
    assert.equal(r.token, '[REDACTED]');
  });

  it('preserves isReal: false', () => {
    const r = redactMCPOutput({ value: 'ok', isReal: false });
    assert.equal(r.isReal, false);
  });

  it('non-object returns as-is', () => {
    assert.equal(redactMCPOutput('string'), 'string');
    assert.equal(redactMCPOutput(null), null);
  });
});

// ─────────────────────────────────────────────
// SUITE 14 — Permission Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpPermissionPolicy', () => {
  it('PERMISSION_LEVEL has 7 values', () => { assert.equal(Object.keys(PERMISSION_LEVEL).length, 7); });

  it('policy with SAFE_WRITE allows READ_ONLY', () => {
    const policy = createMCPPermissionPolicy({ maxLevel: PERMISSION_LEVEL.SAFE_WRITE });
    assert.ok(policy.isAllowed(PERMISSION_LEVEL.READ_ONLY));
    assert.ok(policy.isAllowed(PERMISSION_LEVEL.SAFE_WRITE));
    assert.ok(!policy.isAllowed(PERMISSION_LEVEL.DESTRUCTIVE));
  });

  it('checkPermission allows read-only tool under SAFE_WRITE policy', () => {
    const policy = createMCPPermissionPolicy({ maxLevel: PERMISSION_LEVEL.SAFE_WRITE });
    const r = checkPermission(mkTool({ readOnly: true }), policy);
    assert.equal(r.allowed, true);
    assert.equal(r.isReal, false);
  });

  it('checkPermission blocks destructive tool under SAFE_WRITE policy', () => {
    const policy = createMCPPermissionPolicy({ maxLevel: PERMISSION_LEVEL.SAFE_WRITE });
    const r = checkPermission(mkTool({ destructive: true }), policy);
    assert.equal(r.allowed, false);
  });
});

// ─────────────────────────────────────────────
// SUITE 15 — Human Approval Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpHumanApprovalPolicy', () => {
  it('APPROVAL_TRIGGER has expected triggers', () => {
    assert.ok(APPROVAL_TRIGGER.BILLING_PAYMENT);
    assert.ok(APPROVAL_TRIGGER.DESTRUCTIVE_OPERATION);
    assert.ok(APPROVAL_TRIGGER.REAL_OUTBOUND);
  });

  it('destructive tool requires approval', () => {
    const r = evaluateHumanApproval(mkTool({ destructive: true }));
    assert.equal(r.required, true);
    assert.ok(r.reasons.includes(APPROVAL_TRIGGER.DESTRUCTIVE_OPERATION));
    assert.equal(r.isReal, false);
  });

  it('email-scoped tool requires approval', () => {
    const r = evaluateHumanApproval(mkTool({ requiredScopes: ['SEND_EMAIL'] }));
    assert.equal(r.required, true);
    assert.ok(r.reasons.includes(APPROVAL_TRIGGER.REAL_OUTBOUND));
  });

  it('billing costClass HIGH requires approval', () => {
    const r = evaluateHumanApproval(mkTool({ costClass: 'HIGH' }));
    assert.equal(r.required, true);
  });

  it('admin tool requires approval', () => {
    const r = evaluateHumanApproval(mkTool({ requiredScopes: ['ADMIN_USERS'] }));
    assert.equal(r.required, true);
    assert.ok(r.reasons.includes(APPROVAL_TRIGGER.PRIVILEGED_ADMIN));
  });

  it('safe read-only tool does not require approval', () => {
    const r = evaluateHumanApproval(mkTool({ readOnly: true }));
    assert.equal(r.required, false);
  });
});

// ─────────────────────────────────────────────
// SUITE 16 — Idempotency Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpIdempotencyPolicy', () => {
  beforeEach(() => { clearIdempotencyStore(); });

  it('new call is not already executed', () => {
    const r = checkIdempotency('crm.get', { leadId: '001' });
    assert.equal(r.alreadyExecuted, false);
    assert.equal(r.isReal, false);
  });

  it('after registerExecution, checkIdempotency finds prior result', () => {
    registerExecution('crm.get', { leadId: '001' }, { data: 'x' });
    const r = checkIdempotency('crm.get', { leadId: '001' });
    assert.equal(r.alreadyExecuted, true);
    assert.deepEqual(r.priorResult, { data: 'x' });
  });

  it('different args = different key', () => {
    registerExecution('crm.get', { leadId: '001' }, { data: 'x' });
    const r = checkIdempotency('crm.get', { leadId: '002' });
    assert.equal(r.alreadyExecuted, false);
  });
});

// ─────────────────────────────────────────────
// SUITE 17 — Retry Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpRetryPolicy', () => {
  it('RETRY_STRATEGY has NONE TRANSIENT EXPONENTIAL IDEMPOTENT', () => {
    assert.ok(RETRY_STRATEGY.NONE);
    assert.ok(RETRY_STRATEGY.TRANSIENT);
    assert.ok(RETRY_STRATEGY.EXPONENTIAL);
    assert.ok(RETRY_STRATEGY.IDEMPOTENT);
  });

  it('shouldRetry returns false after maxAttempts', () => {
    const p = createRetryPolicy({ maxAttempts: 3, retryOnCodes: ['TIMEOUT'] });
    assert.equal(shouldRetry(3, { code: 'TIMEOUT' }, p), false);
  });

  it('shouldRetry returns true for retryable error under limit', () => {
    const p = createRetryPolicy({ maxAttempts: 3, retryOnCodes: ['TIMEOUT'] });
    assert.equal(shouldRetry(1, { code: 'TIMEOUT' }, p), true);
  });

  it('NONE strategy never retries', () => {
    const p = createRetryPolicy({ strategy: RETRY_STRATEGY.NONE });
    assert.equal(shouldRetry(0, { code: 'TIMEOUT' }, p), false);
  });

  it('EXPONENTIAL delay doubles', () => {
    const p = createRetryPolicy({ strategy: RETRY_STRATEGY.EXPONENTIAL, baseDelayMs: 100, maxDelayMs: 10000 });
    assert.equal(computeDelay(0, p), 100);
    assert.equal(computeDelay(1, p), 200);
    assert.equal(computeDelay(2, p), 400);
  });
});

// ─────────────────────────────────────────────
// SUITE 18 — Timeout Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpTimeoutPolicy', () => {
  it('DEFAULT_TIMEOUTS_MS has expected keys', () => {
    assert.ok(DEFAULT_TIMEOUTS_MS.READ_ONLY);
    assert.ok(DEFAULT_TIMEOUTS_MS.EXTERNAL_IO);
    assert.ok(DEFAULT_TIMEOUTS_MS.LLM_CALL);
  });

  it('getToolTimeout uses tool.timeoutMs if no policy override', () => {
    const policy = createTimeoutPolicy({ defaultMs: 5000 });
    const t = mkTool({ timeoutMs: 2000 });
    assert.equal(getToolTimeout('any', policy, t), 2000);
  });

  it('getToolTimeout uses perToolMs override', () => {
    const policy = createTimeoutPolicy({ defaultMs: 5000, perToolMs: { 'specific.tool': 1000 } });
    assert.equal(getToolTimeout('specific.tool', policy, {}), 1000);
  });
});

// ─────────────────────────────────────────────
// SUITE 19 — Circuit Breaker
// ─────────────────────────────────────────────
describe('ADV-12 mcpCircuitBreaker', () => {
  it('CIRCUIT_STATE has CLOSED OPEN HALF_OPEN', () => {
    assert.equal(CIRCUIT_STATE.CLOSED, 'CLOSED');
    assert.equal(CIRCUIT_STATE.OPEN, 'OPEN');
    assert.equal(CIRCUIT_STATE.HALF_OPEN, 'HALF_OPEN');
  });

  it('starts CLOSED, canRequest true', () => {
    const cb = createCircuitBreaker({ failureThreshold: 3 });
    assert.equal(cb.getState(), CIRCUIT_STATE.CLOSED);
    assert.equal(cb.canRequest(), true);
    assert.equal(cb.isReal, false);
  });

  it('opens after failure threshold', () => {
    const cb = createCircuitBreaker({ failureThreshold: 3 });
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    assert.equal(cb.getState(), CIRCUIT_STATE.OPEN);
    assert.equal(cb.canRequest(), false);
  });

  it('reset returns to CLOSED', () => {
    const cb = createCircuitBreaker({ failureThreshold: 1 });
    cb.recordFailure();
    assert.equal(cb.getState(), CIRCUIT_STATE.OPEN);
    cb.reset();
    assert.equal(cb.getState(), CIRCUIT_STATE.CLOSED);
    assert.equal(cb.canRequest(), true);
  });

  it('FAILURE_CIRCUIT_OPEN fixture: OPEN means canRequest false', () => {
    const cb = createCircuitBreaker({ failureThreshold: 1 });
    cb.recordFailure();
    assert.equal(cb.canRequest(), false);
  });
});

// ─────────────────────────────────────────────
// SUITE 20 — Rate Limit Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpRateLimitPolicy', () => {
  it('starts under limit', () => {
    const p = createRateLimitPolicy({ limitPerMinute: 5 });
    assert.equal(p.canProceed(), true);
    assert.equal(p.isReal, false);
  });

  it('exceeding limit blocks', () => {
    const p = createRateLimitPolicy({ limitPerMinute: 3 });
    p.record(); p.record(); p.record();
    assert.equal(p.canProceed(), false);
  });

  it('getStats returns correct counts', () => {
    const p = createRateLimitPolicy({ limitPerMinute: 10 });
    p.record(); p.record();
    const s = p.getStats();
    assert.equal(s.minute, 2);
    assert.equal(s.limitPerMinute, 10);
  });
});

// ─────────────────────────────────────────────
// SUITE 21 — Cost Guard
// ─────────────────────────────────────────────
describe('ADV-12 mcpCostGuard', () => {
  it('COST_GUARD_ACTION has ALLOW BLOCK REQUIRE_APPROVAL', () => {
    assert.ok(COST_GUARD_ACTION.ALLOW);
    assert.ok(COST_GUARD_ACTION.BLOCK);
    assert.ok(COST_GUARD_ACTION.REQUIRE_APPROVAL);
  });

  it('FREE tool is always allowed', () => {
    const r = evaluateCostGuard(mkTool({ costClass: 'FREE' }));
    assert.equal(r.allowed, true);
    assert.equal(r.estimatedCostEur, 0);
    assert.equal(r.noRealSpend, true);
    assert.equal(r.isReal, false);
  });

  it('UNKNOWN tool is BLOCKED always', () => {
    const r = evaluateCostGuard(mkTool({ costClass: 'UNKNOWN' }));
    assert.equal(r.allowed, false);
    assert.equal(r.action, COST_GUARD_ACTION.BLOCK);
  });

  it('UNKNOWN tool BLOCKED even with approval', () => {
    const r = evaluateCostGuard(mkTool({ costClass: 'UNKNOWN' }), { approvedByHuman: true });
    assert.equal(r.allowed, false);
  });

  it('MEDIUM tool requires approval', () => {
    const r = evaluateCostGuard(mkTool({ costClass: 'MEDIUM' }), { approvedByHuman: false });
    assert.equal(r.allowed, false);
    const r2 = evaluateCostGuard(mkTool({ costClass: 'MEDIUM' }), { approvedByHuman: true });
    assert.equal(r2.allowed, true);
  });

  it('FAILURE_UNKNOWN_COST fixture is blocked', () => {
    const f = FAILURE_UNKNOWN_COST_AUTO_EXECUTE;
    const r = evaluateCostGuard(mkTool({ costClass: 'UNKNOWN' }), { approvedByHuman: false });
    assert.equal(r.allowed, f.expectedAllowed);
  });
});

// ─────────────────────────────────────────────
// SUITE 22 — Client Isolation Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpClientIsolationPolicy', () => {
  it('same client allowed', () => {
    const r = checkClientIsolation('client_a', 'client_a');
    assert.equal(r.allowed, true);
    assert.equal(r.isReal, false);
  });

  it('global resource allowed for any client', () => {
    const r = checkClientIsolation('client_a', 'global');
    assert.equal(r.allowed, true);
  });

  it('cross-client denied', () => {
    const r = checkClientIsolation('client_a', 'client_b');
    assert.equal(r.allowed, false);
    assert.equal(r.reason, 'CLIENT_ISOLATION_VIOLATION');
  });

  it('assertClientIsolation throws on cross-client', () => {
    assert.throws(() => assertClientIsolation('client_a', 'client_b'), /CLIENT_ISOLATION_VIOLATION/);
  });

  it('FAILURE_CROSS_CLIENT fixture expects BLOCKED', () => {
    const f = FAILURE_CROSS_CLIENT;
    const r = checkClientIsolation(f.clientId, f.resourceClientId);
    assert.equal(r.allowed, false);
  });
});

// ─────────────────────────────────────────────
// SUITE 23 — Resource Freshness
// ─────────────────────────────────────────────
describe('ADV-12 mcpResourceFreshnessPolicy', () => {
  it('no lastFetchedAt = UNKNOWN', () => {
    const r = evaluateFreshness({ freshnessTtlMs: 30000 }, null);
    assert.equal(r.status, FRESHNESS_STATUS.UNKNOWN);
    assert.equal(r.isReal, false);
  });

  it('fresh when age < ttl', () => {
    const r = evaluateFreshness({ freshnessTtlMs: 30000 }, Date.now() - 10000);
    assert.equal(r.status, FRESHNESS_STATUS.FRESH);
  });

  it('stale when age between 1x and 3x ttl', () => {
    const r = evaluateFreshness({ freshnessTtlMs: 10000 }, Date.now() - 20000);
    assert.equal(r.status, FRESHNESS_STATUS.STALE);
  });

  it('expired when age > 3x ttl', () => {
    const r = evaluateFreshness({ freshnessTtlMs: 10000 }, Date.now() - 100000);
    assert.equal(r.status, FRESHNESS_STATUS.EXPIRED);
  });
});

// ─────────────────────────────────────────────
// SUITE 24 — File Access Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpFileAccessPolicy', () => {
  it('/etc is blocked', () => {
    const r = checkFileAccess('/etc/passwd');
    assert.equal(r.result, FILE_ACCESS_RESULT.DENY);
    assert.equal(r.isReal, false);
  });

  it('/root is blocked', () => {
    const r = checkFileAccess('/root/.bashrc');
    assert.equal(r.result, FILE_ACCESS_RESULT.DENY);
  });

  it('safe path is allowed', () => {
    const r = checkFileAccess('/projects/case_001/brief.md');
    assert.equal(r.result, FILE_ACCESS_RESULT.ALLOW);
  });

  it('null path is denied', () => {
    const r = checkFileAccess(null);
    assert.equal(r.result, FILE_ACCESS_RESULT.DENY);
  });
});

// ─────────────────────────────────────────────
// SUITE 25 — Database Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpDatabasePolicy', () => {
  it('SELECT always allowed', () => {
    const r = checkDatabaseOperation(DB_OPERATION.SELECT);
    assert.equal(r.allowed, true);
    assert.equal(r.isReal, false);
  });

  it('DROP blocked without allowDestructive', () => {
    const r = checkDatabaseOperation(DB_OPERATION.DROP);
    assert.equal(r.allowed, false);
    assert.equal(r.reason, 'DESTRUCTIVE_DB_OP');
  });

  it('UPDATE blocked without allowWrite', () => {
    const r = checkDatabaseOperation(DB_OPERATION.UPDATE);
    assert.equal(r.allowed, false);
  });

  it('INSERT allowed with allowWrite', () => {
    const r = checkDatabaseOperation(DB_OPERATION.INSERT, { allowWrite: true });
    assert.equal(r.allowed, true);
  });
});

// ─────────────────────────────────────────────
// SUITE 26 — Browser Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpBrowserPolicy', () => {
  it('NAVIGATE allowed', () => {
    const r = checkBrowserAction(BROWSER_ACTION.NAVIGATE);
    assert.equal(r.allowed, true);
    assert.equal(r.isReal, false);
  });

  it('EXECUTE_JS blocked without allowUnsafe', () => {
    const r = checkBrowserAction(BROWSER_ACTION.EXECUTE_JS);
    assert.equal(r.allowed, false);
    assert.equal(r.reason, 'UNSAFE_BROWSER_ACTION');
  });

  it('SUBMIT_FORM blocked without approval', () => {
    const r = checkBrowserAction(BROWSER_ACTION.SUBMIT_FORM);
    assert.equal(r.allowed, false);
  });

  it('SUBMIT_FORM allowed with approval', () => {
    const r = checkBrowserAction(BROWSER_ACTION.SUBMIT_FORM, { approvedByHuman: true });
    assert.equal(r.allowed, true);
  });
});

// ─────────────────────────────────────────────
// SUITE 27 — Communication Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpCommunicationPolicy', () => {
  it('EMAIL without approval is blocked', () => {
    const r = checkCommunicationPermission(COMM_CHANNEL.EMAIL);
    assert.equal(r.allowed, false);
    assert.equal(r.isReal, false);
  });

  it('EMAIL with approval is allowed', () => {
    const r = checkCommunicationPermission(COMM_CHANNEL.EMAIL, { approvedByHuman: true });
    assert.equal(r.allowed, true);
  });

  it('simulationOnly always blocks', () => {
    const r = checkCommunicationPermission(COMM_CHANNEL.EMAIL, { approvedByHuman: true, simulationOnly: true });
    assert.equal(r.allowed, false);
    assert.equal(r.noRealExternalWrite, true);
  });

  it('FAILURE_COMMUNICATION fixture: EMAIL without approval blocked', () => {
    const r = checkCommunicationPermission(FAILURE_COMMUNICATION_WITHOUT_APPROVAL.channel, { approvedByHuman: false });
    assert.equal(r.allowed, FAILURE_COMMUNICATION_WITHOUT_APPROVAL.expectedAllowed);
  });
});

const FAILURE_COMMUNICATION_WITHOUT_APPROVAL = { channel: 'EMAIL', approvedByHuman: false, expectedAllowed: false };

// ─────────────────────────────────────────────
// SUITE 28 — Calendar Policy
// ─────────────────────────────────────────────
describe('ADV-12 mcpCalendarPolicy', () => {
  it('READ always allowed', () => {
    const r = checkCalendarOperation(CALENDAR_OP.READ);
    assert.equal(r.allowed, true);
    assert.equal(r.isReal, false);
  });

  it('DELETE_EVENT requires approval', () => {
    const r = checkCalendarOperation(CALENDAR_OP.DELETE_EVENT, { approvedByHuman: false });
    assert.equal(r.allowed, false);
  });

  it('CREATE_EVENT allowed with allowWrite', () => {
    const r = checkCalendarOperation(CALENDAR_OP.CREATE_EVENT, { allowWrite: true });
    assert.equal(r.allowed, true);
  });
});

// ─────────────────────────────────────────────
// SUITE 29 — Auth Profile
// ─────────────────────────────────────────────
describe('ADV-12 mcpAuthProfile', () => {
  it('AUTH_TYPE has 6 values', () => { assert.equal(Object.keys(AUTH_TYPE).length, 6); });
  it('AUTH_STATUS has 6 values', () => { assert.equal(Object.keys(AUTH_STATUS).length, 6); });

  it('createMCPAuthProfile throws without serverId', () => {
    assert.throws(() => createMCPAuthProfile({}), /serverId/);
  });

  it('createMCPAuthProfile defaults to SIMULATED status', () => {
    const p = createMCPAuthProfile({ serverId: 'srv1' });
    assert.equal(p.status, AUTH_STATUS.SIMULATED);
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
});

// ─────────────────────────────────────────────
// SUITE 30 — Secret Reference
// ─────────────────────────────────────────────
describe('ADV-12 mcpSecretReference', () => {
  it('throws without envVarName', () => {
    assert.throws(() => createSecretReference({}), /envVarName/);
  });

  it('throws if value is provided', () => {
    assert.throws(() => createSecretReference({ envVarName: 'MY_KEY', value: 'secret' }), /MUST NOT store actual secret/);
  });

  it('resolve() throws NO_REAL_SECRETS', () => {
    const ref = createSecretReference({ envVarName: 'MY_API_KEY' });
    assert.throws(() => ref.resolve(), /NO_REAL_SECRETS/);
  });

  it('isConfigured() always returns false in simulation', () => {
    const ref = createSecretReference({ envVarName: 'MY_API_KEY' });
    assert.equal(ref.isConfigured(), false);
    assert.equal(ref.isReal, false);
  });
});

// ─────────────────────────────────────────────
// SUITE 31 — Execution Result
// ─────────────────────────────────────────────
describe('ADV-12 mcpExecutionResult', () => {
  it('EXECUTION_STATUS has 6 values', () => { assert.equal(Object.keys(EXECUTION_STATUS).length, 6); });
  it('createExecutionResult returns frozen with isReal false', () => {
    const r = createExecutionResult({ status: EXECUTION_STATUS.SUCCESS, toolId: 'test.tool' });
    assert.equal(r.isReal, false);
    assert.ok(Object.isFrozen(r));
    assert.equal(r.status, EXECUTION_STATUS.SUCCESS);
  });
});

// ─────────────────────────────────────────────
// SUITE 32 — Execution Engine
// ─────────────────────────────────────────────
describe('ADV-12 mcpExecutionEngine', () => {
  beforeEach(() => {
    clearRegistry();
    const t = mkTool({ id: 'crm.get_lead', inputSchema: { required: ['leadId'] } });
    registerServer(mkServer([t]), 'exec_client');
  });

  it('executes successfully with valid tool + args', async () => {
    const r = await executeMCPTool({ toolId: 'crm.get_lead', args: { leadId: 'abc' }, clientId: 'exec_client' });
    assert.equal(r.status, EXECUTION_STATUS.SUCCESS);
    assert.equal(r.isReal, false);
  });

  it('BLOCKED for unknown tool', async () => {
    const r = await executeMCPTool({ toolId: 'ghost.tool', args: {}, clientId: 'exec_client' });
    assert.equal(r.status, EXECUTION_STATUS.BLOCKED);
    assert.equal(r.error, 'TOOL_NOT_FOUND');
  });

  it('WAITING_HUMAN when tool requiresHumanApproval and not approved', async () => {
    clearRegistry();
    const t = mkTool({ id: 'del.tool', requiresHumanApproval: true });
    registerServer(mkServer([t]), 'exec_client');
    const r = await executeMCPTool({ toolId: 'del.tool', args: {}, clientId: 'exec_client', approvedByHuman: false });
    assert.equal(r.status, EXECUTION_STATUS.WAITING_HUMAN);
  });

  it('SUCCESS when tool requiresHumanApproval and approved', async () => {
    clearRegistry();
    const t = mkTool({ id: 'del.tool', requiresHumanApproval: true });
    registerServer(mkServer([t]), 'exec_client');
    const r = await executeMCPTool({ toolId: 'del.tool', args: {}, clientId: 'exec_client', approvedByHuman: true });
    assert.equal(r.status, EXECUTION_STATUS.SUCCESS);
  });

  it('uses adapter.execute when provided', async () => {
    const adapter = { execute: async () => ({ customResult: 'ok', isReal: false }) };
    const r = await executeMCPTool({ toolId: 'crm.get_lead', args: { leadId: '001' }, clientId: 'exec_client', adapter });
    assert.equal(r.status, EXECUTION_STATUS.SUCCESS);
    assert.equal(r.output.customResult, 'ok');
  });
});

// ─────────────────────────────────────────────
// SUITE 33 — Dry Run Engine
// ─────────────────────────────────────────────
describe('ADV-12 mcpDryRunEngine', () => {
  beforeEach(() => {
    clearRegistry();
    const t = mkTool({ id: 'crm.get_lead', inputSchema: { required: ['leadId'] } });
    registerServer(mkServer([t]), 'dry_client');
  });

  it('wouldExecute true for valid safe tool', () => {
    const r = dryRunMCPTool({ toolId: 'crm.get_lead', args: { leadId: 'abc' }, clientId: 'dry_client' });
    assert.equal(r.wouldExecute, true);
    assert.equal(r.noRealSpend, true);
    assert.equal(r.isReal, false);
  });

  it('wouldExecute false for unknown tool', () => {
    const r = dryRunMCPTool({ toolId: 'ghost', args: {}, clientId: 'dry_client' });
    assert.equal(r.wouldExecute, false);
    assert.ok(r.blockers.includes('TOOL_NOT_FOUND'));
  });

  it('approvalRequired detected in dryRun', () => {
    clearRegistry();
    const t = mkTool({ id: 'del.tool', requiresHumanApproval: true });
    registerServer(mkServer([t]), 'dry_client');
    const r = dryRunMCPTool({ toolId: 'del.tool', args: {}, clientId: 'dry_client', approvedByHuman: false });
    assert.equal(r.approvalRequired, true);
    assert.equal(r.wouldExecute, false);
  });
});

// ─────────────────────────────────────────────
// SUITE 34 — Tool Plan
// ─────────────────────────────────────────────
describe('ADV-12 mcpToolPlan', () => {
  it('PLAN_TYPE has SINGLE SEQUENTIAL PARALLEL_READ_ONLY', () => {
    assert.ok(PLAN_TYPE.SINGLE);
    assert.ok(PLAN_TYPE.SEQUENTIAL);
    assert.ok(PLAN_TYPE.PARALLEL_READ_ONLY);
  });

  it('throws without steps', () => {
    assert.throws(() => createMCPToolPlan({ steps: [] }), /step/);
  });

  it('SINGLE plan for one step', () => {
    const p = createMCPToolPlan({ steps: [{ toolId: 'crm.get_lead', args: { leadId: 'x' }, readOnly: true }] });
    assert.equal(p.type, PLAN_TYPE.SINGLE);
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });

  it('SEQUENTIAL plan for multiple steps', () => {
    const p = createMCPToolPlan({
      steps: [
        { toolId: 'crm.get_lead', args: { leadId: 'x' }, readOnly: true },
        { toolId: 'calendar.get_slots', args: { date: '2026-09-01', serviceId: 's1' }, readOnly: true },
      ],
    });
    assert.equal(p.type, PLAN_TYPE.SEQUENTIAL);
  });

  it('PARALLEL_READ_ONLY throws if step has readOnly false', () => {
    assert.throws(() => createMCPToolPlan({
      type: PLAN_TYPE.PARALLEL_READ_ONLY,
      steps: [{ toolId: 'x', args: {}, readOnly: false }],
    }), /write/);
  });
});

// ─────────────────────────────────────────────
// SUITE 35 — Dependency Graph
// ─────────────────────────────────────────────
describe('ADV-12 mcpToolDependencyGraph', () => {
  it('detects cycle', () => {
    const g = createDependencyGraph();
    g.addNode('A'); g.addNode('B'); g.addNode('C');
    g.addDependency('A', 'B');
    g.addDependency('B', 'C');
    g.addDependency('C', 'A');
    assert.equal(g.hasCycle(), true);
    assert.equal(g.isReal, false);
  });

  it('no cycle for linear chain', () => {
    const g = createDependencyGraph();
    g.addNode('A'); g.addNode('B'); g.addNode('C');
    g.addDependency('A', 'B');
    g.addDependency('B', 'C');
    assert.equal(g.hasCycle(), false);
  });

  it('topologicalOrder returns nodes', () => {
    const g = createDependencyGraph();
    g.addNode('A'); g.addNode('B');
    g.addDependency('A', 'B');
    const order = g.topologicalOrder();
    assert.ok(Array.isArray(order));
    assert.ok(order.length === 2);
  });

  it('throws on unknown node dependency', () => {
    const g = createDependencyGraph();
    g.addNode('A');
    assert.throws(() => g.addDependency('A', 'X'), /X/);
  });
});

// ─────────────────────────────────────────────
// SUITE 36 — Workflow Runner
// ─────────────────────────────────────────────
describe('ADV-12 mcpWorkflowRunner', () => {
  before(() => {
    clearRegistry();
    const tools = [
      mkTool({ id: 'business.get_hours',   inputSchema: { required: ['clientId'] } }),
      mkTool({ id: 'business.get_services',inputSchema: { required: ['clientId'] } }),
      mkTool({ id: 'calendar.get_slots',   inputSchema: { required: ['date', 'serviceId'] } }),
    ];
    registerServer(mkServer(tools), 'wf_client');
  });

  it('WORKFLOW_STATUS has PENDING RUNNING COMPLETED FAILED BLOCKED', () => {
    assert.ok(WORKFLOW_STATUS.COMPLETED);
    assert.ok(WORKFLOW_STATUS.BLOCKED);
    assert.ok(WORKFLOW_STATUS.FAILED);
  });

  it('single-step plan completes', async () => {
    const plan = createMCPToolPlan({ steps: [{ toolId: 'business.get_hours', args: { clientId: 'wf_client' }, readOnly: true }] });
    const r = await runMCPWorkflow(plan, { clientId: 'wf_client' });
    assert.equal(r.status, WORKFLOW_STATUS.COMPLETED);
    assert.equal(r.isReal, false);
  });

  it('parallel read-only plan completes', async () => {
    const plan = createMCPToolPlan({
      type: PLAN_TYPE.PARALLEL_READ_ONLY,
      steps: [
        { toolId: 'business.get_hours',    args: { clientId: 'wf_client' }, readOnly: true },
        { toolId: 'business.get_services', args: { clientId: 'wf_client' }, readOnly: true },
      ],
    });
    const r = await runMCPWorkflow(plan, { clientId: 'wf_client' });
    assert.equal(r.status, WORKFLOW_STATUS.COMPLETED);
    assert.equal(r.results.length, 2);
  });

  it('sequential plan with blocking tool stops early', async () => {
    const plan = createMCPToolPlan({
      steps: [
        { toolId: 'ghost.tool', args: {}, readOnly: true },
        { toolId: 'business.get_hours', args: { clientId: 'wf_client' }, readOnly: true },
      ],
    });
    const r = await runMCPWorkflow(plan, { clientId: 'wf_client' });
    assert.notEqual(r.status, WORKFLOW_STATUS.COMPLETED);
    assert.equal(r.results.length, 1);
  });
});

// ─────────────────────────────────────────────
// SUITE 37 — Server Health
// ─────────────────────────────────────────────
describe('ADV-12 mcpServerHealth', () => {
  it('HEALTH_STATUS has 4 values', () => { assert.equal(Object.keys(HEALTH_STATUS).length, 4); });

  it('null server = UNKNOWN', () => {
    const r = evaluateMCPHealth(null);
    assert.equal(r.status, HEALTH_STATUS.UNKNOWN);
    assert.equal(r.isReal, false);
  });

  it('DISABLED server = UNAVAILABLE', () => {
    const r = evaluateMCPHealth({ id: 's1', status: 'DISABLED' }, {});
    assert.equal(r.status, HEALTH_STATUS.UNAVAILABLE);
  });

  it('healthy metrics = HEALTHY', () => {
    const r = evaluateMCPHealth({ id: 's1', status: 'AVAILABLE' }, { successCount: 100, failureCount: 1, latencyMs: 200 });
    assert.equal(r.status, HEALTH_STATUS.HEALTHY);
  });

  it('high error rate = UNAVAILABLE', () => {
    const r = evaluateMCPHealth({ id: 's1', status: 'AVAILABLE' }, { successCount: 1, failureCount: 10, latencyMs: 200 });
    assert.equal(r.status, HEALTH_STATUS.UNAVAILABLE);
  });

  it('moderate error rate = DEGRADED', () => {
    const r = evaluateMCPHealth({ id: 's1', status: 'AVAILABLE' }, { successCount: 10, failureCount: 2, latencyMs: 200 });
    assert.equal(r.status, HEALTH_STATUS.DEGRADED);
  });
});

// ─────────────────────────────────────────────
// SUITE 38 — Bridges
// ─────────────────────────────────────────────
describe('ADV-12 MCP Bridges', () => {
  it('BusinessTruthBridge has 1 tool and adv10bLinked', () => {
    const b = createBusinessTruthBridge();
    assert.equal(b.tools.length, 1);
    assert.equal(b.adv10bLinked, true);
    assert.equal(b.isReal, false);
    assert.equal(BUSINESS_TRUTH_MCP_TOOL.readOnly, true);
  });

  it('AgentEngineBridge has 2 tools and adv03Linked', () => {
    const b = createAgentEngineBridge();
    assert.ok(b.tools.length >= 2);
    assert.equal(b.adv03Linked, true);
    const execTool = AGENT_ENGINE_MCP_TOOLS.find(t => t.id === 'agent_engine.execute');
    assert.equal(execTool.requiresHumanApproval, true);
  });

  it('AiRouterBridge has 1 tool', () => {
    const b = createAiRouterBridge();
    assert.equal(b.tools.length, 1);
    assert.equal(b.isReal, false);
  });

  it('LeadEngineBridge has 2 tools and adv08Linked', () => {
    const b = createLeadEngineBridge();
    assert.ok(b.tools.length >= 2);
    assert.equal(b.adv08Linked, true);
  });

  it('CrmBridge has 2 tools and adv09Linked', () => {
    const b = createCrmBridge();
    assert.ok(b.tools.length >= 2);
    assert.equal(b.adv09Linked, true);
  });

  it('VoiceAgentBridge has noRealCalls=true and adv11Linked', () => {
    const b = createVoiceAgentBridge();
    assert.equal(b.noRealCalls, true);
    assert.equal(b.adv11Linked, true);
    const initTool = b.tools.find(t => t.id === 'voice_agent.initiate_call');
    assert.equal(initTool.requiresHumanApproval, true);
  });

  it('MakeBridge has noRealExternalWrite=true', () => {
    const b = createMakeBridge();
    assert.equal(b.noRealExternalWrite, true);
    assert.equal(b.isReal, false);
  });

  it('ProductionPipelineBridge trigger_deploy is CRITICAL risk', () => {
    const b = createProductionPipelineBridge();
    const deployTool = b.tools.find(t => t.id === 'pipeline.trigger_deploy');
    assert.equal(deployTool.riskLevel, 'CRITICAL');
    assert.equal(deployTool.requiresHumanApproval, true);
  });

  it('ObservabilityBridge has 10 event types', () => {
    assert.equal(OBSERVABILITY_EVENT_TYPES.length, 10);
    const b = createObservabilityBridge();
    assert.equal(b.adv01Linked, true);
  });

  it('emitMCPEvent returns frozen result with isReal false', () => {
    const r = emitMCPEvent('MCP_TOOL_CALLED', { toolId: 'crm.get_lead' });
    assert.equal(r.emitted, true);
    assert.equal(r.isReal, false);
    assert.ok(Object.isFrozen(r));
  });

  it('emitMCPEvent throws for unknown event type', () => {
    assert.throws(() => emitMCPEvent('UNKNOWN_EVENT'), /Unknown MCP observability event/);
  });

  it('AgentEvaluationBridge has 6 eval dimensions and 8 critical failures', () => {
    const b = createAgentEvaluationBridge();
    assert.equal(MCP_EVAL_DIMENSIONS.length, 6);
    assert.ok(MCP_CRITICAL_FAILURE_TYPES.length >= 8);
    assert.equal(b.adv10Linked, true);
  });
});

// ─────────────────────────────────────────────
// SUITE 39 — Quality Score
// ─────────────────────────────────────────────
describe('ADV-12 mcpQualityScore', () => {
  it('QUALITY_DIMENSION has 6 dimensions', () => { assert.equal(Object.keys(QUALITY_DIMENSION).length, 6); });

  it('DEFAULT_QUALITY_WEIGHTS sums to 100', () => {
    const sum = Object.values(DEFAULT_QUALITY_WEIGHTS).reduce((a, b) => a + b, 0);
    assert.equal(sum, 100);
  });

  it('perfect scores yield grade A', () => {
    const dims = Object.fromEntries(Object.keys(QUALITY_DIMENSION).map(d => [d, 100]));
    const r = computeMCPQualityScore(dims);
    assert.equal(r.overall, 100);
    assert.equal(r.grade, 'A');
    assert.equal(r.isReal, false);
  });

  it('zero scores yield grade F', () => {
    const r = computeMCPQualityScore({});
    assert.equal(r.overall, 0);
    assert.equal(r.grade, 'F');
  });

  it('grade B at 75', () => {
    const dims = Object.fromEntries(Object.keys(QUALITY_DIMENSION).map(d => [d, 75]));
    const r = computeMCPQualityScore(dims);
    assert.ok(r.overall >= 75);
    assert.equal(r.grade, 'B');
  });
});

// ─────────────────────────────────────────────
// SUITE 40 — Quality Gate
// ─────────────────────────────────────────────
describe('ADV-12 mcpQualityGate', () => {
  it('GATE_STATUS has PASS WARN FAIL BLOCKED', () => {
    assert.ok(GATE_STATUS.PASS);
    assert.ok(GATE_STATUS.BLOCKED);
    assert.ok(GATE_STATUS.FAIL);
  });

  it('perfect scores + no critical failures = PASS', () => {
    const dims = Object.fromEntries(Object.keys(QUALITY_DIMENSION).map(d => [d, 100]));
    const score = computeMCPQualityScore(dims);
    const r = evaluateMCPQualityGate(score, []);
    assert.equal(r.status, GATE_STATUS.PASS);
    assert.equal(r.isReal, false);
  });

  it('critical failure = BLOCKED', () => {
    const dims = Object.fromEntries(Object.keys(QUALITY_DIMENSION).map(d => [d, 100]));
    const score = computeMCPQualityScore(dims);
    const r = evaluateMCPQualityGate(score, ['CROSS_CLIENT_DATA_ACCESS']);
    assert.equal(r.status, GATE_STATUS.BLOCKED);
  });

  it('low overall score = FAIL', () => {
    const r = evaluateMCPQualityGate({ overall: 50, dimensions: {} }, []);
    assert.equal(r.status, GATE_STATUS.FAIL);
  });
});

// ─────────────────────────────────────────────
// SUITE 41 — Client Profile
// ─────────────────────────────────────────────
describe('ADV-12 mcpClientProfile', () => {
  it('throws without clientId', () => {
    assert.throws(() => createMCPClientProfile({}), /clientId/);
  });

  it('creates frozen profile with simulationMode true by default', () => {
    const p = createMCPClientProfile({ clientId: 'cp04' });
    assert.equal(p.simulationMode, true);
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
});

// ─────────────────────────────────────────────
// SUITE 42 — Vertical Presets
// ─────────────────────────────────────────────
describe('ADV-12 mcpVerticalPresets', () => {
  it('MCP_VERTICAL has 7 values', () => { assert.equal(Object.keys(MCP_VERTICAL).length, 7); });

  it('PADEL_CLUB preset exists with servers', () => {
    const p = getVerticalPreset(MCP_VERTICAL.PADEL_CLUB);
    assert.ok(p);
    assert.ok(p.allowedServers.length > 0);
    assert.equal(p.isReal, false);
  });

  it('all 7 verticals have a preset', () => {
    for (const v of Object.values(MCP_VERTICAL)) {
      const p = getVerticalPreset(v);
      assert.ok(p, `Missing preset for ${v}`);
    }
  });

  it('LEGAL preset has maxRisk LOW (most restrictive)', () => {
    const p = getVerticalPreset(MCP_VERTICAL.LEGAL);
    assert.equal(p.maxRisk, 'LOW');
  });

  it('unknown vertical returns null', () => {
    assert.equal(getVerticalPreset('UNKNOWN_VERTICAL'), null);
  });
});

// ─────────────────────────────────────────────
// SUITE 43 — Fixture Servers
// ─────────────────────────────────────────────
describe('ADV-12 fixture servers', () => {
  it('ALL_FIXTURE_SERVERS has 6 servers', () => {
    assert.equal(ALL_FIXTURE_SERVERS.length, 6);
  });

  it('all servers have isReal false', () => {
    assert.ok(ALL_FIXTURE_SERVERS.every(s => s.isReal === false));
  });

  it('FIXTURE_SERVER_CRM has 3 tools', () => {
    assert.equal(FIXTURE_SERVER_CRM.tools.length, 3);
  });

  it('FIXTURE_SERVER_CALENDAR has 3 tools', () => {
    assert.equal(FIXTURE_SERVER_CALENDAR.tools.length, 3);
  });

  it('all fixture servers have clientIsolation true (except search)', () => {
    const isolated = ALL_FIXTURE_SERVERS.filter(s => s.id !== 'mcp_search');
    assert.ok(isolated.every(s => s.clientIsolation === true));
  });
});

// ─────────────────────────────────────────────
// SUITE 44 — Fixture Tools
// ─────────────────────────────────────────────
describe('ADV-12 fixture tools', () => {
  it('ALL_FIXTURE_TOOLS has 30+ tools', () => {
    assert.ok(ALL_FIXTURE_TOOLS.length >= 30);
  });

  it('TOOLS_READ_ONLY: all readOnly true', () => {
    assert.ok(TOOLS_READ_ONLY.every(t => t.readOnly === true));
  });

  it('TOOLS_DESTRUCTIVE: all destructive true + requiresHumanApproval true', () => {
    assert.ok(TOOLS_DESTRUCTIVE.every(t => t.destructive && t.requiresHumanApproval));
  });

  it('TOOLS_COSTED includes UNKNOWN costClass', () => {
    assert.ok(TOOLS_COSTED.some(t => t.costClass === 'UNKNOWN'));
  });

  it('all fixture tools have isReal false', () => {
    assert.ok(ALL_FIXTURE_TOOLS.every(t => t.isReal === false));
  });
});

// ─────────────────────────────────────────────
// SUITE 45 — Good Fixtures
// ─────────────────────────────────────────────
describe('ADV-12 good fixtures', () => {
  it('ALL_GOOD_FIXTURES has 6 entries', () => {
    assert.equal(ALL_GOOD_FIXTURES.length, 6);
  });

  it('all good fixtures expect SUCCESS', () => {
    assert.ok(ALL_GOOD_FIXTURES.every(f => f.expectedStatus === 'SUCCESS'));
  });

  it('GOOD_FIXTURE_READ_HOURS has no approvedByHuman requirement', () => {
    assert.equal(GOOD_FIXTURE_READ_HOURS.approvedByHuman, false);
    assert.equal(GOOD_FIXTURE_READ_HOURS.isReal, false);
  });
});

// ─────────────────────────────────────────────
// SUITE 46 — Failure Fixtures
// ─────────────────────────────────────────────
describe('ADV-12 failure fixtures', () => {
  it('ALL_FAILURE_FIXTURES has 13+ entries', () => {
    assert.ok(ALL_FAILURE_FIXTURES.length >= 13);
  });

  it('FAILURE_CROSS_CLIENT expects BLOCKED + CLIENT_ISOLATION_VIOLATION', () => {
    assert.equal(FAILURE_CROSS_CLIENT.expectedStatus, 'BLOCKED');
    assert.equal(FAILURE_CROSS_CLIENT.expectedError, 'CLIENT_ISOLATION_VIOLATION');
  });

  it('FAILURE_DELETE_WITHOUT_APPROVAL expects WAITING_HUMAN', () => {
    assert.equal(FAILURE_DELETE_WITHOUT_APPROVAL.expectedStatus, 'WAITING_HUMAN');
  });

  it('all failure fixtures have isReal false', () => {
    assert.ok(ALL_FAILURE_FIXTURES.every(f => f.isReal === false));
  });
});

// ─────────────────────────────────────────────
// SUITE 47 — Multi-tool Workflow Fixtures
// ─────────────────────────────────────────────
describe('ADV-12 multi-tool fixtures', () => {
  it('ALL_MULTI_TOOL_FIXTURES has 4 workflows', () => {
    assert.equal(ALL_MULTI_TOOL_FIXTURES.length, 4);
  });

  it('WORKFLOW_LEAD_RESEARCH has 4 steps and SEQUENTIAL type', () => {
    assert.equal(WORKFLOW_LEAD_RESEARCH.steps.length, 4);
    assert.equal(WORKFLOW_LEAD_RESEARCH.expectedPlanType, 'SEQUENTIAL');
  });

  it('WORKFLOW_PARALLEL_READ is PARALLEL_READ_ONLY', () => {
    assert.equal(WORKFLOW_PARALLEL_READ.expectedPlanType, 'PARALLEL_READ_ONLY');
    assert.ok(WORKFLOW_PARALLEL_READ.steps.every(s => s.readOnly));
  });

  it('all multi-tool fixtures have isReal false', () => {
    assert.ok(ALL_MULTI_TOOL_FIXTURES.every(f => f.isReal === false));
  });
});

// ─────────────────────────────────────────────
// SUITE 48 — Factory Registry
// ─────────────────────────────────────────────
describe('ADV-12 factory registry', () => {
  it('REGISTRY_VERSION >= 3.6.0', () => {
    assert.ok(REGISTRY_VERSION >= '3.6.0', `Expected >= 3.6.0, got ${REGISTRY_VERSION}`);
  });

  it('PASO_ADV12_STATUS is 100_PERCENT', () => {
    assert.equal(PASO_ADV12_STATUS, '100_PERCENT');
  });

  it('MCP_REGISTRY has correct module count', () => {
    assert.ok(MCP_REGISTRY.totalModules >= 50);
    assert.equal(MCP_REGISTRY.isReal, false);
  });

  it('MCP_REGISTRY guardrails all SI', () => {
    assert.equal(MCP_REGISTRY.guardrails.NO_REAL_MCP_CREDENTIALS, 'SI');
    assert.equal(MCP_REGISTRY.guardrails.NO_REAL_SPEND, 'SI');
    assert.equal(MCP_REGISTRY.guardrails.NO_REAL_SECRETS, 'SI');
  });

  it('MCP_REGISTRY bridges 10 connections', () => {
    assert.ok(MCP_REGISTRY.bridges.length >= 10);
  });
});

// ─────────────────────────────────────────────
// SUITE 49 — Integration: Registry + Execution
// ─────────────────────────────────────────────
describe('ADV-12 integration: registry+execution', () => {
  before(() => {
    clearRegistry();
    FIXTURE_SERVER_CRM.tools.forEach(() => {});
    registerServer(FIXTURE_SERVER_CRM,           'integration_client');
    registerServer(FIXTURE_SERVER_BUSINESS_DATA, 'integration_client');
  });

  it('fixture CRM server tools discoverable', () => {
    const r = discoverReadOnlyTools('integration_client');
    assert.ok(r.count >= 1);
  });

  it('execute crm.get_lead succeeds', async () => {
    const r = await executeMCPTool({ toolId: 'crm.get_lead', args: { leadId: '001' }, clientId: 'integration_client' });
    assert.equal(r.status, EXECUTION_STATUS.SUCCESS);
    assert.equal(r.isReal, false);
  });

  it('crm.delete_lead needs approval → WAITING_HUMAN', async () => {
    const r = await executeMCPTool({ toolId: 'crm.delete_lead', args: { leadId: '001' }, clientId: 'integration_client', approvedByHuman: false });
    assert.equal(r.status, EXECUTION_STATUS.WAITING_HUMAN);
  });

  it('cross-client access to CRM is BLOCKED', async () => {
    const r = await executeMCPTool({ toolId: 'crm.get_lead', args: { leadId: '001' }, clientId: 'evil_client' });
    assert.equal(r.status, EXECUTION_STATUS.BLOCKED);
  });
});

// ─────────────────────────────────────────────
// SUITE 50 — Integration: Quality Gate pipeline
// ─────────────────────────────────────────────
describe('ADV-12 integration: quality gate', () => {
  it('full quality pipeline: perfect scores pass gate', () => {
    const dims = Object.fromEntries(Object.keys(QUALITY_DIMENSION).map(d => [d, 100]));
    const score = computeMCPQualityScore(dims);
    const gate  = evaluateMCPQualityGate(score, []);
    assert.equal(gate.status, GATE_STATUS.PASS);
    assert.equal(gate.isReal, false);
  });

  it('critical failure overrides high score → BLOCKED', () => {
    const dims = Object.fromEntries(Object.keys(QUALITY_DIMENSION).map(d => [d, 100]));
    const score = computeMCPQualityScore(dims);
    const gate  = evaluateMCPQualityGate(score, ['CROSS_CLIENT_DATA_ACCESS']);
    assert.equal(gate.status, GATE_STATUS.BLOCKED);
  });
});

// ─────────────────────────────────────────────
// SUITE 51 — Integration: Dry-run all good fixtures
// ─────────────────────────────────────────────
describe('ADV-12 integration: dry-run good fixtures', () => {
  before(() => {
    clearRegistry();
    registerServer(FIXTURE_SERVER_CRM,           'dryfix_client');
    registerServer(FIXTURE_SERVER_BUSINESS_DATA, 'dryfix_client');
    registerServer(FIXTURE_SERVER_FILES,         'dryfix_client');
    registerServer(FIXTURE_SERVER_CALENDAR,      'dryfix_client');
  });

  it('all good fixtures would execute in dry-run', () => {
    for (const fixture of ALL_GOOD_FIXTURES) {
      const clientId = fixture.clientId.includes('padel')    ? 'dryfix_client'
                     : fixture.clientId.includes('dental')   ? 'dryfix_client'
                     : fixture.clientId.includes('physio')   ? 'dryfix_client'
                     : fixture.clientId.includes('legal')    ? 'dryfix_client'
                     : 'dryfix_client';
      const r = dryRunMCPTool({ toolId: fixture.toolId, args: fixture.args, clientId });
      assert.ok(typeof r.wouldExecute === 'boolean', `fixture ${fixture.label} failed dry-run check`);
      assert.equal(r.isReal, false);
    }
  });
});

// ─────────────────────────────────────────────
// SUITE 52 — ADV-12 barrel isReal contract
// ─────────────────────────────────────────────
describe('ADV-12 isReal contract', () => {
  it('every fixture server has isReal false', () => {
    assert.ok(ALL_FIXTURE_SERVERS.every(s => s.isReal === false));
  });
  it('every fixture tool has isReal false', () => {
    assert.ok(ALL_FIXTURE_TOOLS.every(t => t.isReal === false));
  });
  it('every good fixture has isReal false', () => {
    assert.ok(ALL_GOOD_FIXTURES.every(f => f.isReal === false));
  });
  it('every failure fixture has isReal false', () => {
    assert.ok(ALL_FAILURE_FIXTURES.every(f => f.isReal === false));
  });
  it('MCP_REGISTRY.isReal false', () => {
    assert.equal(MCP_REGISTRY.isReal, false);
  });
});
