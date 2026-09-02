// MCP Fixture Servers — ADV-12 (6 servers, all simulated)

export const FIXTURE_SERVER_CRM = Object.freeze({
  id: 'mcp_crm', name: 'CRM MCP Server', version: '1.0.0',
  provider: 'fixture', transport: 'STDIO', endpoint: null,
  capabilities: Object.freeze(['READ_CRM', 'WRITE_CRM']),
  tools: Object.freeze([
    Object.freeze({ id: 'crm.get_lead',    serverId: 'mcp_crm', name: 'crm.get_lead',    readOnly: true,  destructive: false, requiresHumanApproval: false, riskLevel: 'LOW',    costClass: 'FREE', requiredScopes: ['READ_CRM'],  timeoutMs: 3000, retryPolicy: 'TRANSIENT', idempotent: true,  inputSchema: { required: ['leadId'] },          outputSchema: {}, isReal: false }),
    Object.freeze({ id: 'crm.update_lead', serverId: 'mcp_crm', name: 'crm.update_lead', readOnly: false, destructive: false, requiresHumanApproval: false, riskLevel: 'MEDIUM', costClass: 'FREE', requiredScopes: ['WRITE_CRM'], timeoutMs: 5000, retryPolicy: 'TRANSIENT', idempotent: true,  inputSchema: { required: ['leadId', 'fields'] }, outputSchema: {}, isReal: false }),
    Object.freeze({ id: 'crm.delete_lead', serverId: 'mcp_crm', name: 'crm.delete_lead', readOnly: false, destructive: true,  requiresHumanApproval: true,  riskLevel: 'HIGH',   costClass: 'FREE', requiredScopes: ['WRITE_CRM'], timeoutMs: 5000, retryPolicy: 'NONE',      idempotent: false, inputSchema: { required: ['leadId'] },          outputSchema: {}, isReal: false }),
  ]),
  resources: Object.freeze([]), prompts: Object.freeze([]),
  authType: 'NONE', requiredScopes: Object.freeze([]), riskLevel: 'MEDIUM', costProfile: 'FREE',
  clientIsolation: true, status: 'AVAILABLE', isReal: false,
});

export const FIXTURE_SERVER_CALENDAR = Object.freeze({
  id: 'mcp_calendar', name: 'Calendar MCP Server', version: '1.0.0',
  provider: 'fixture', transport: 'HTTP', endpoint: null,
  capabilities: Object.freeze(['READ_CALENDAR', 'WRITE_CALENDAR']),
  tools: Object.freeze([
    Object.freeze({ id: 'calendar.get_slots',   serverId: 'mcp_calendar', name: 'calendar.get_slots',   readOnly: true,  destructive: false, requiresHumanApproval: false, riskLevel: 'LOW',    costClass: 'FREE', requiredScopes: ['READ_CALENDAR'],  timeoutMs: 3000, retryPolicy: 'TRANSIENT', idempotent: true,  inputSchema: { required: ['date', 'serviceId'] }, outputSchema: {}, isReal: false }),
    Object.freeze({ id: 'calendar.book_slot',   serverId: 'mcp_calendar', name: 'calendar.book_slot',   readOnly: false, destructive: false, requiresHumanApproval: false, riskLevel: 'MEDIUM', costClass: 'FREE', requiredScopes: ['WRITE_CALENDAR'], timeoutMs: 5000, retryPolicy: 'TRANSIENT', idempotent: false, inputSchema: { required: ['date', 'time', 'serviceId', 'clientId'] }, outputSchema: {}, isReal: false }),
    Object.freeze({ id: 'calendar.cancel_slot', serverId: 'mcp_calendar', name: 'calendar.cancel_slot', readOnly: false, destructive: false, requiresHumanApproval: true,  riskLevel: 'MEDIUM', costClass: 'FREE', requiredScopes: ['WRITE_CALENDAR'], timeoutMs: 5000, retryPolicy: 'NONE',      idempotent: true,  inputSchema: { required: ['bookingId'] },          outputSchema: {}, isReal: false }),
  ]),
  resources: Object.freeze([]), prompts: Object.freeze([]),
  authType: 'API_KEY', requiredScopes: Object.freeze([]), riskLevel: 'MEDIUM', costProfile: 'FREE',
  clientIsolation: true, status: 'AVAILABLE', isReal: false,
});

export const FIXTURE_SERVER_BUSINESS_DATA = Object.freeze({
  id: 'mcp_business_data', name: 'Business Data MCP Server', version: '1.0.0',
  provider: 'fixture', transport: 'STDIO', endpoint: null,
  capabilities: Object.freeze(['READ_DATABASE']),
  tools: Object.freeze([
    Object.freeze({ id: 'business.get_hours',    serverId: 'mcp_business_data', name: 'business.get_hours',    readOnly: true, destructive: false, requiresHumanApproval: false, riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_DATABASE'], timeoutMs: 2000, retryPolicy: 'TRANSIENT', idempotent: true, inputSchema: { required: ['clientId'] },           outputSchema: {}, isReal: false }),
    Object.freeze({ id: 'business.get_services', serverId: 'mcp_business_data', name: 'business.get_services', readOnly: true, destructive: false, requiresHumanApproval: false, riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_DATABASE'], timeoutMs: 2000, retryPolicy: 'TRANSIENT', idempotent: true, inputSchema: { required: ['clientId'] },           outputSchema: {}, isReal: false }),
    Object.freeze({ id: 'business.get_prices',   serverId: 'mcp_business_data', name: 'business.get_prices',   readOnly: true, destructive: false, requiresHumanApproval: false, riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_DATABASE'], timeoutMs: 2000, retryPolicy: 'TRANSIENT', idempotent: true, inputSchema: { required: ['clientId', 'service'] }, outputSchema: {}, isReal: false }),
  ]),
  resources: Object.freeze([]), prompts: Object.freeze([]),
  authType: 'NONE', requiredScopes: Object.freeze([]), riskLevel: 'LOW', costProfile: 'FREE',
  clientIsolation: true, status: 'AVAILABLE', isReal: false,
});

export const FIXTURE_SERVER_FILES = Object.freeze({
  id: 'mcp_files', name: 'Files MCP Server', version: '1.0.0',
  provider: 'fixture', transport: 'STDIO', endpoint: null,
  capabilities: Object.freeze(['READ_FILES', 'WRITE_FILES']),
  tools: Object.freeze([
    Object.freeze({ id: 'files.read',   serverId: 'mcp_files', name: 'files.read',   readOnly: true,  destructive: false, requiresHumanApproval: false, riskLevel: 'LOW',    costClass: 'FREE', requiredScopes: ['READ_FILES'],  timeoutMs: 3000, retryPolicy: 'TRANSIENT', idempotent: true,  inputSchema: { required: ['path'] },        outputSchema: {}, isReal: false }),
    Object.freeze({ id: 'files.write',  serverId: 'mcp_files', name: 'files.write',  readOnly: false, destructive: false, requiresHumanApproval: false, riskLevel: 'MEDIUM', costClass: 'FREE', requiredScopes: ['WRITE_FILES'], timeoutMs: 5000, retryPolicy: 'TRANSIENT', idempotent: true,  inputSchema: { required: ['path', 'content'] }, outputSchema: {}, isReal: false }),
    Object.freeze({ id: 'files.delete', serverId: 'mcp_files', name: 'files.delete', readOnly: false, destructive: true,  requiresHumanApproval: true,  riskLevel: 'HIGH',   costClass: 'FREE', requiredScopes: ['WRITE_FILES'], timeoutMs: 3000, retryPolicy: 'NONE',      idempotent: false, inputSchema: { required: ['path'] },        outputSchema: {}, isReal: false }),
  ]),
  resources: Object.freeze([]), prompts: Object.freeze([]),
  authType: 'NONE', requiredScopes: Object.freeze([]), riskLevel: 'MEDIUM', costProfile: 'FREE',
  clientIsolation: true, status: 'AVAILABLE', isReal: false,
});

export const FIXTURE_SERVER_AUTOMATION = Object.freeze({
  id: 'mcp_automation', name: 'Automation MCP Server', version: '1.0.0',
  provider: 'fixture', transport: 'HTTP', endpoint: null,
  capabilities: Object.freeze(['EXECUTE_WORKFLOW', 'TRIGGER_WEBHOOK']),
  tools: Object.freeze([
    Object.freeze({ id: 'automation.run_workflow', serverId: 'mcp_automation', name: 'automation.run_workflow', readOnly: false, destructive: false, requiresHumanApproval: true, riskLevel: 'HIGH', costClass: 'LOW', requiredScopes: ['EXECUTE_WORKFLOW'], timeoutMs: 30000, retryPolicy: 'NONE', idempotent: false, inputSchema: { required: ['workflowId', 'payload'] }, outputSchema: {}, isReal: false }),
  ]),
  resources: Object.freeze([]), prompts: Object.freeze([]),
  authType: 'API_KEY', requiredScopes: Object.freeze([]), riskLevel: 'HIGH', costProfile: 'LOW',
  clientIsolation: true, status: 'AVAILABLE', isReal: false,
});

export const FIXTURE_SERVER_SEARCH = Object.freeze({
  id: 'mcp_search', name: 'Search MCP Server', version: '1.0.0',
  provider: 'fixture', transport: 'HTTP', endpoint: null,
  capabilities: Object.freeze(['WEB_SEARCH', 'SEMANTIC_SEARCH']),
  tools: Object.freeze([
    Object.freeze({ id: 'search.web',      serverId: 'mcp_search', name: 'search.web',      readOnly: true, destructive: false, requiresHumanApproval: false, riskLevel: 'LOW', costClass: 'LOW',  requiredScopes: ['WEB_SEARCH'],      timeoutMs: 8000, retryPolicy: 'TRANSIENT', idempotent: true, inputSchema: { required: ['query'] }, outputSchema: {}, isReal: false }),
    Object.freeze({ id: 'search.semantic', serverId: 'mcp_search', name: 'search.semantic', readOnly: true, destructive: false, requiresHumanApproval: false, riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['SEMANTIC_SEARCH'], timeoutMs: 5000, retryPolicy: 'TRANSIENT', idempotent: true, inputSchema: { required: ['query', 'collection'] }, outputSchema: {}, isReal: false }),
  ]),
  resources: Object.freeze([]), prompts: Object.freeze([]),
  authType: 'API_KEY', requiredScopes: Object.freeze([]), riskLevel: 'LOW', costProfile: 'LOW',
  clientIsolation: false, status: 'AVAILABLE', isReal: false,
});

export const ALL_FIXTURE_SERVERS = Object.freeze([
  FIXTURE_SERVER_CRM, FIXTURE_SERVER_CALENDAR, FIXTURE_SERVER_BUSINESS_DATA,
  FIXTURE_SERVER_FILES, FIXTURE_SERVER_AUTOMATION, FIXTURE_SERVER_SEARCH,
]);

export const MCP_FIXTURE_SERVERS_VERSION = '1.0.0';
