// MCP Make Bridge — ADV-12

export const MAKE_MCP_TOOLS = Object.freeze([
  Object.freeze({
    id: 'make.get_scenario', serverId: 'mcp_make', name: 'make.get_scenario',
    description: 'Read Make scenario metadata (read-only)',
    inputSchema: { required: ['scenarioId'] }, outputSchema: { required: ['scenario', 'isReal'] },
    readOnly: true, idempotent: true, destructive: false, requiresHumanApproval: false,
    riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_DATABASE'], timeoutMs: 3000, retryPolicy: 'TRANSIENT', isReal: false,
  }),
  Object.freeze({
    id: 'make.run_scenario', serverId: 'mcp_make', name: 'make.run_scenario',
    description: 'Trigger a Make scenario (simulation only — NO_REAL_EXTERNAL_WRITE=SI)',
    inputSchema: { required: ['scenarioId', 'payload'] }, outputSchema: { required: ['executionId', 'isReal'] },
    readOnly: false, idempotent: false, destructive: false, requiresHumanApproval: true,
    riskLevel: 'HIGH', costClass: 'LOW', requiredScopes: ['EXECUTE_WORKFLOW'], timeoutMs: 30000, retryPolicy: 'NONE',
    noRealExternalWrite: true, isReal: false,
  }),
]);

export function createMakeBridge() {
  return Object.freeze({ tools: MAKE_MCP_TOOLS, noRealExternalWrite: true, isReal: false });
}

export const MCP_MAKE_BRIDGE_VERSION = '1.0.0';
