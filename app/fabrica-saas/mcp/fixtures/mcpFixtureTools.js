// MCP Fixture Tools — ADV-12 (30+ tools across risk/cost categories)

function tool(overrides) {
  return Object.freeze({
    readOnly: true, idempotent: true, destructive: false, requiresHumanApproval: false,
    riskLevel: 'LOW', costClass: 'FREE', requiredScopes: [], timeoutMs: 3000,
    retryPolicy: 'TRANSIENT', inputSchema: {}, outputSchema: {}, isReal: false,
    ...overrides,
  });
}

// Read-only tools (safe, free)
export const TOOLS_READ_ONLY = Object.freeze([
  tool({ id: 'crm.get_lead',           serverId: 'mcp_crm',           name: 'crm.get_lead',           requiredScopes: ['READ_CRM'],       inputSchema: { required: ['leadId'] } }),
  tool({ id: 'calendar.get_slots',     serverId: 'mcp_calendar',     name: 'calendar.get_slots',     requiredScopes: ['READ_CALENDAR'],  inputSchema: { required: ['date', 'serviceId'] } }),
  tool({ id: 'business.get_hours',     serverId: 'mcp_business_data', name: 'business.get_hours',     requiredScopes: ['READ_DATABASE'],  inputSchema: { required: ['clientId'] } }),
  tool({ id: 'business.get_services',  serverId: 'mcp_business_data', name: 'business.get_services',  requiredScopes: ['READ_DATABASE'],  inputSchema: { required: ['clientId'] } }),
  tool({ id: 'business.get_prices',    serverId: 'mcp_business_data', name: 'business.get_prices',    requiredScopes: ['READ_DATABASE'],  inputSchema: { required: ['clientId', 'service'] } }),
  tool({ id: 'files.read',             serverId: 'mcp_files',         name: 'files.read',             requiredScopes: ['READ_FILES'],     inputSchema: { required: ['path'] } }),
  tool({ id: 'search.semantic',        serverId: 'mcp_search',        name: 'search.semantic',        requiredScopes: ['SEMANTIC_SEARCH'], inputSchema: { required: ['query', 'collection'] } }),
  tool({ id: 'observability.query',    serverId: 'mcp_observability', name: 'observability.query',    requiredScopes: ['READ_METRICS'],   inputSchema: { required: ['metricName'] } }),
  tool({ id: 'pipeline.get_status',    serverId: 'mcp_pipeline',      name: 'pipeline.get_status',    requiredScopes: ['READ_DATABASE'],  inputSchema: { required: ['pipelineId'] } }),
  tool({ id: 'agent_eval.get_score',   serverId: 'mcp_agent_eval',    name: 'agent_eval.get_score',   requiredScopes: ['READ_METRICS'],   inputSchema: { required: ['sessionId'] } }),
]);

// Safe write tools (no approval needed)
export const TOOLS_SAFE_WRITE = Object.freeze([
  tool({ id: 'crm.update_lead',   serverId: 'mcp_crm',      name: 'crm.update_lead',   readOnly: false, riskLevel: 'MEDIUM', requiredScopes: ['WRITE_CRM'],      inputSchema: { required: ['leadId', 'fields'] } }),
  tool({ id: 'calendar.book_slot',serverId: 'mcp_calendar', name: 'calendar.book_slot',readOnly: false, riskLevel: 'MEDIUM', requiredScopes: ['WRITE_CALENDAR'],  inputSchema: { required: ['date', 'time', 'serviceId', 'clientId'] }, idempotent: false }),
  tool({ id: 'files.write',       serverId: 'mcp_files',    name: 'files.write',       readOnly: false, riskLevel: 'MEDIUM', requiredScopes: ['WRITE_FILES'],     inputSchema: { required: ['path', 'content'] } }),
  tool({ id: 'observability.emit', serverId: 'mcp_observability', name: 'observability.emit', readOnly: false, riskLevel: 'LOW', requiredScopes: ['READ_METRICS'], inputSchema: { required: ['eventType', 'payload'] } }),
]);

// Sensitive write — require human approval
export const TOOLS_SENSITIVE_WRITE = Object.freeze([
  tool({ id: 'calendar.cancel_slot',  serverId: 'mcp_calendar', name: 'calendar.cancel_slot',  readOnly: false, riskLevel: 'MEDIUM', requiresHumanApproval: true, requiredScopes: ['WRITE_CALENDAR'], inputSchema: { required: ['bookingId'] } }),
  tool({ id: 'email.send',            serverId: 'mcp_comm',     name: 'email.send',            readOnly: false, riskLevel: 'MEDIUM', requiresHumanApproval: true, requiredScopes: ['SEND_EMAIL'],     inputSchema: { required: ['to', 'subject', 'body'] }, idempotent: false }),
  tool({ id: 'sms.send',              serverId: 'mcp_comm',     name: 'sms.send',              readOnly: false, riskLevel: 'MEDIUM', requiresHumanApproval: true, requiredScopes: ['SEND_SMS'],       inputSchema: { required: ['to', 'body'] }, idempotent: false }),
  tool({ id: 'whatsapp.send',         serverId: 'mcp_comm',     name: 'whatsapp.send',         readOnly: false, riskLevel: 'MEDIUM', requiresHumanApproval: true, requiredScopes: ['SEND_WHATSAPP'], inputSchema: { required: ['to', 'message'] }, idempotent: false }),
]);

// Destructive tools (destructive + approval required)
export const TOOLS_DESTRUCTIVE = Object.freeze([
  tool({ id: 'crm.delete_lead',    serverId: 'mcp_crm',      name: 'crm.delete_lead',    readOnly: false, destructive: true, riskLevel: 'HIGH',     requiresHumanApproval: true, requiredScopes: ['WRITE_CRM'],   inputSchema: { required: ['leadId'] }, idempotent: false }),
  tool({ id: 'files.delete',       serverId: 'mcp_files',    name: 'files.delete',       readOnly: false, destructive: true, riskLevel: 'HIGH',     requiresHumanApproval: true, requiredScopes: ['WRITE_FILES'], inputSchema: { required: ['path'] }, idempotent: false }),
  tool({ id: 'db.drop_table',      serverId: 'mcp_database', name: 'db.drop_table',      readOnly: false, destructive: true, riskLevel: 'CRITICAL', requiresHumanApproval: true, requiredScopes: ['WRITE_DATABASE'], inputSchema: { required: ['tableName'] }, idempotent: false }),
  tool({ id: 'pipeline.rollback',  serverId: 'mcp_pipeline', name: 'pipeline.rollback',  readOnly: false, destructive: true, riskLevel: 'CRITICAL', requiresHumanApproval: true, requiredScopes: ['EXECUTE_WORKFLOW'], inputSchema: { required: ['deployId'] }, idempotent: false }),
]);

// Costed tools (costClass MEDIUM/HIGH/UNKNOWN)
export const TOOLS_COSTED = Object.freeze([
  tool({ id: 'search.web',           serverId: 'mcp_search',   name: 'search.web',    costClass: 'LOW',     requiredScopes: ['WEB_SEARCH'],   inputSchema: { required: ['query'] } }),
  tool({ id: 'ai.llm_call',         serverId: 'mcp_ai',       name: 'ai.llm_call',   costClass: 'MEDIUM',  requiresHumanApproval: true,       inputSchema: { required: ['prompt'] } }),
  tool({ id: 'tts.synthesize',      serverId: 'mcp_voice',    name: 'tts.synthesize',costClass: 'MEDIUM',  requiresHumanApproval: true,       inputSchema: { required: ['text'] } }),
  tool({ id: 'billing.charge',      serverId: 'mcp_billing',  name: 'billing.charge',costClass: 'HIGH',    requiresHumanApproval: true, riskLevel: 'CRITICAL', requiredScopes: ['BILLING'], inputSchema: { required: ['amount', 'customerId'] }, idempotent: false }),
  tool({ id: 'external.api_call',   serverId: 'mcp_external', name: 'external.api_call', costClass: 'UNKNOWN', inputSchema: { required: ['url'] } }),
]);

// Communication tools
export const TOOLS_COMMUNICATION = Object.freeze([
  tool({ id: 'comm.send_email',     serverId: 'mcp_comm', name: 'comm.send_email',    readOnly: false, riskLevel: 'MEDIUM', costClass: 'FREE', requiresHumanApproval: true, requiredScopes: ['SEND_EMAIL'],    inputSchema: { required: ['to', 'subject', 'body'] }, idempotent: false }),
  tool({ id: 'comm.send_sms',       serverId: 'mcp_comm', name: 'comm.send_sms',      readOnly: false, riskLevel: 'MEDIUM', costClass: 'FREE', requiresHumanApproval: true, requiredScopes: ['SEND_SMS'],      inputSchema: { required: ['to', 'body'] }, idempotent: false }),
  tool({ id: 'comm.send_whatsapp',  serverId: 'mcp_comm', name: 'comm.send_whatsapp', readOnly: false, riskLevel: 'MEDIUM', costClass: 'FREE', requiresHumanApproval: true, requiredScopes: ['SEND_WHATSAPP'], inputSchema: { required: ['to', 'message'] }, idempotent: false }),
  tool({ id: 'comm.send_slack',     serverId: 'mcp_comm', name: 'comm.send_slack',    readOnly: false, riskLevel: 'LOW',    costClass: 'FREE', requiresHumanApproval: false, requiredScopes: [],               inputSchema: { required: ['channel', 'text'] }, idempotent: false }),
]);

export const ALL_FIXTURE_TOOLS = Object.freeze([
  ...TOOLS_READ_ONLY, ...TOOLS_SAFE_WRITE, ...TOOLS_SENSITIVE_WRITE,
  ...TOOLS_DESTRUCTIVE, ...TOOLS_COSTED, ...TOOLS_COMMUNICATION,
]);

export const MCP_FIXTURE_TOOLS_VERSION = '1.0.0';
