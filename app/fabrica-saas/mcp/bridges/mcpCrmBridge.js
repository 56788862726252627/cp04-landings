// MCP CRM Bridge — ADV-12 → ADV-09

export const CRM_MCP_TOOLS = Object.freeze([
  Object.freeze({
    id: 'crm.get_lead', serverId: 'mcp_crm', name: 'crm.get_lead',
    description: 'Read a CRM lead record',
    inputSchema: { required: ['leadId'] }, outputSchema: { required: ['lead', 'isReal'] },
    readOnly: true, idempotent: true, destructive: false, requiresHumanApproval: false,
    riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_CRM'], timeoutMs: 3000, retryPolicy: 'TRANSIENT', isReal: false,
  }),
  Object.freeze({
    id: 'crm.update_lead', serverId: 'mcp_crm', name: 'crm.update_lead',
    description: 'Update a CRM lead record',
    inputSchema: { required: ['leadId', 'fields'] }, outputSchema: { required: ['updated', 'isReal'] },
    readOnly: false, idempotent: true, destructive: false, requiresHumanApproval: false,
    riskLevel: 'MEDIUM', costClass: 'FREE', requiredScopes: ['WRITE_CRM'], timeoutMs: 5000, retryPolicy: 'TRANSIENT', isReal: false,
  }),
]);

export function createCrmBridge() {
  return Object.freeze({ tools: CRM_MCP_TOOLS, adv09Linked: true, isReal: false });
}

export const MCP_CRM_BRIDGE_VERSION = '1.0.0';
