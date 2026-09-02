// MCP Production Pipeline Bridge — ADV-12 → ADV-04

export const PRODUCTION_PIPELINE_MCP_TOOLS = Object.freeze([
  Object.freeze({
    id: 'pipeline.get_status', serverId: 'mcp_production_pipeline', name: 'pipeline.get_status',
    description: 'Read deployment pipeline status',
    inputSchema: { required: ['pipelineId'] }, outputSchema: { required: ['status', 'isReal'] },
    readOnly: true, idempotent: true, destructive: false, requiresHumanApproval: false,
    riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_DATABASE'], timeoutMs: 3000, retryPolicy: 'TRANSIENT', isReal: false,
  }),
  Object.freeze({
    id: 'pipeline.trigger_deploy', serverId: 'mcp_production_pipeline', name: 'pipeline.trigger_deploy',
    description: 'Trigger a deploy (ALWAYS requires human approval)',
    inputSchema: { required: ['pipelineId', 'target', 'approvedByHuman'] }, outputSchema: { required: ['deployId', 'isReal'] },
    readOnly: false, idempotent: false, destructive: false, requiresHumanApproval: true,
    riskLevel: 'CRITICAL', costClass: 'LOW', requiredScopes: ['EXECUTE_WORKFLOW'], timeoutMs: 120000, retryPolicy: 'NONE', isReal: false,
  }),
]);

export function createProductionPipelineBridge() {
  return Object.freeze({ tools: PRODUCTION_PIPELINE_MCP_TOOLS, adv04Linked: true, isReal: false });
}

export const MCP_PRODUCTION_PIPELINE_BRIDGE_VERSION = '1.0.0';
