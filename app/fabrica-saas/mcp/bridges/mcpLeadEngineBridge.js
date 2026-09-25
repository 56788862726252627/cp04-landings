// MCP Lead Engine Bridge — ADV-12 → ADV-08

export const LEAD_ENGINE_MCP_TOOLS = Object.freeze([
  Object.freeze({
    id: 'lead_engine.search', serverId: 'mcp_lead_engine', name: 'lead_engine.search',
    description: 'Search leads by vertical, location, criteria',
    inputSchema: { required: ['vertical', 'criteria'] }, outputSchema: { required: ['leads', 'isReal'] },
    readOnly: true, idempotent: true, destructive: false, requiresHumanApproval: false,
    riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_CRM'], timeoutMs: 5000, retryPolicy: 'TRANSIENT', isReal: false,
  }),
  Object.freeze({
    id: 'lead_engine.enrich', serverId: 'mcp_lead_engine', name: 'lead_engine.enrich',
    description: 'Enrich lead with additional data',
    inputSchema: { required: ['leadId'] }, outputSchema: { required: ['enriched', 'isReal'] },
    readOnly: false, idempotent: true, destructive: false, requiresHumanApproval: false,
    riskLevel: 'MEDIUM', costClass: 'LOW', requiredScopes: ['WRITE_CRM'], timeoutMs: 10000, retryPolicy: 'TRANSIENT', isReal: false,
  }),
]);

export function createLeadEngineBridge() {
  return Object.freeze({ tools: LEAD_ENGINE_MCP_TOOLS, adv08Linked: true, isReal: false });
}

export const MCP_LEAD_ENGINE_BRIDGE_VERSION = '1.0.0';
