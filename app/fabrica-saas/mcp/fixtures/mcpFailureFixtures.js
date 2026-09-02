// MCP Failure Fixtures — ADV-12 (12+ failure scenarios)

export const FAILURE_CROSS_CLIENT = Object.freeze({
  label:       'cross_client_access',
  toolId:      'crm.get_lead',
  clientId:    'attacker_client',
  resourceClientId: 'padel_club_01',
  args:        Object.freeze({ leadId: 'lead_001' }),
  expectedStatus:  'BLOCKED',
  expectedError:   'CLIENT_ISOLATION_VIOLATION',
  description: 'Client A cannot read Client B data',
  isReal: false,
});

export const FAILURE_SECRET_IN_ARG = Object.freeze({
  label:       'secret_in_argument',
  toolId:      'business.get_hours',
  clientId:    'test_client',
  args:        Object.freeze({ clientId: 'test_client', api_key: 'sk_live_SUPERSECRET123456789' }),
  expectedSanitized: true,
  expectedBlockedKeys: ['api_key'],
  description: 'Secret key in args must be redacted by sanitizer',
  isReal: false,
});

export const FAILURE_DELETE_WITHOUT_APPROVAL = Object.freeze({
  label:       'delete_without_approval',
  toolId:      'crm.delete_lead',
  clientId:    'padel_club_01',
  args:        Object.freeze({ leadId: 'lead_001' }),
  approvedByHuman: false,
  expectedStatus:  'WAITING_HUMAN',
  description: 'Destructive operation without human approval must block',
  isReal: false,
});

export const FAILURE_PAID_TOOL_WITHOUT_APPROVAL = Object.freeze({
  label:       'paid_tool_without_approval',
  toolId:      'billing.charge',
  clientId:    'padel_club_01',
  args:        Object.freeze({ amount: 99, customerId: 'cust_001' }),
  approvedByHuman: false,
  expectedStatus:  'WAITING_HUMAN',
  description: 'Billing tool requires human approval',
  isReal: false,
});

export const FAILURE_TOOL_NOT_FOUND = Object.freeze({
  label:       'tool_not_found',
  toolId:      'nonexistent.tool',
  clientId:    'any_client',
  args:        Object.freeze({}),
  expectedStatus: 'BLOCKED',
  expectedError:  'TOOL_NOT_FOUND',
  description: 'Calling a tool not in registry must block',
  isReal: false,
});

export const FAILURE_SCHEMA_MISSING_REQUIRED = Object.freeze({
  label:       'missing_required_arg',
  toolId:      'crm.get_lead',
  clientId:    'padel_club_01',
  args:        Object.freeze({}),
  expectedStatus: 'FAILED',
  description: 'Missing required arg leadId must fail validation',
  isReal: false,
});

export const FAILURE_UNKNOWN_COST_AUTO_EXECUTE = Object.freeze({
  label:       'unknown_cost_blocked',
  toolId:      'external.api_call',
  clientId:    'test_client',
  args:        Object.freeze({ url: 'https://example.com' }),
  approvedByHuman: false,
  expectedAllowed: false,
  expectedAction: 'BLOCK',
  description: 'UNKNOWN costClass is always blocked (never auto-executes)',
  isReal: false,
});

export const FAILURE_CIRCUIT_OPEN = Object.freeze({
  label:       'circuit_open',
  serverId:    'mcp_crm',
  state:       'OPEN',
  description: 'Requests must be rejected when circuit breaker is OPEN',
  canRequest:  false,
  isReal: false,
});

export const FAILURE_RATE_LIMITED = Object.freeze({
  label:       'rate_limited',
  toolId:      'crm.get_lead',
  clientId:    'test_client',
  requestCount: 100,
  limitPerMinute: 60,
  description: 'Exceeding rate limit must block further requests',
  isReal: false,
});

export const FAILURE_TIMEOUT = Object.freeze({
  label:       'timeout',
  toolId:      'calendar.book_slot',
  clientId:    'padel_club_01',
  simulatedLatencyMs: 10000,
  toolTimeoutMs:      5000,
  expectedStatus: 'TIMEOUT',
  description: 'Tool exceeding timeout must return TIMEOUT status',
  isReal: false,
});

export const FAILURE_STALE_RESOURCE = Object.freeze({
  label:       'stale_resource',
  resourceUri:    'mcp://business_data/padel_club_01/hours',
  freshnessTtlMs: 30000,
  ageMs:          100000,
  expectedFreshness: 'EXPIRED',
  description: 'Resource older than 3x TTL is EXPIRED',
  isReal: false,
});

export const FAILURE_MALFORMED_OUTPUT = Object.freeze({
  label:       'malformed_output',
  toolId:      'crm.get_lead',
  simulatedOutput: null,
  expectedValidation: 'FAIL',
  description: 'Null output must fail output validation',
  isReal: false,
});

export const FAILURE_COMMUNICATION_WITHOUT_APPROVAL = Object.freeze({
  label:       'email_without_approval',
  channel:     'EMAIL',
  approvedByHuman: false,
  expectedAllowed: false,
  description: 'Email/SMS/WhatsApp requires human approval',
  isReal: false,
});

export const ALL_FAILURE_FIXTURES = Object.freeze([
  FAILURE_CROSS_CLIENT,
  FAILURE_SECRET_IN_ARG,
  FAILURE_DELETE_WITHOUT_APPROVAL,
  FAILURE_PAID_TOOL_WITHOUT_APPROVAL,
  FAILURE_TOOL_NOT_FOUND,
  FAILURE_SCHEMA_MISSING_REQUIRED,
  FAILURE_UNKNOWN_COST_AUTO_EXECUTE,
  FAILURE_CIRCUIT_OPEN,
  FAILURE_RATE_LIMITED,
  FAILURE_TIMEOUT,
  FAILURE_STALE_RESOURCE,
  FAILURE_MALFORMED_OUTPUT,
  FAILURE_COMMUNICATION_WITHOUT_APPROVAL,
]);

export const MCP_FAILURE_FIXTURES_VERSION = '1.0.0';
