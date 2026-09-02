// MCP Business Truth Bridge — ADV-12 → ADV-10b

export const BUSINESS_TRUTH_MCP_TOOL = Object.freeze({
  id:       'business_truth.query',
  serverId: 'mcp_business_data',
  name:     'business_truth.query',
  description: 'Query verified business facts (hours, prices, services) — read-only',
  inputSchema:  { required: ['clientId', 'field'] },
  outputSchema: { required: ['value', 'confidence', 'isReal'] },
  readOnly:              true,
  idempotent:            true,
  destructive:           false,
  requiresHumanApproval: false,
  riskLevel:             'LOW',
  costClass:             'FREE',
  requiredScopes:        ['READ_DATABASE'],
  timeoutMs:             3000,
  retryPolicy:           'TRANSIENT',
  isReal: false,
});

export function createBusinessTruthBridge() {
  return Object.freeze({
    tools:        Object.freeze([BUSINESS_TRUTH_MCP_TOOL]),
    adv10bLinked: true,
    queryFact:    (clientId, field) => Object.freeze({
      clientId, field, value: null, confidence: 0, simulated: true, isReal: false,
    }),
    isReal: false,
  });
}

export const MCP_BUSINESS_TRUTH_BRIDGE_VERSION = '1.0.0';
