// MCP Voice Agent Bridge — ADV-12 → ADV-11

export const VOICE_AGENT_MCP_TOOLS = Object.freeze([
  Object.freeze({
    id: 'voice_agent.get_call_status', serverId: 'mcp_voice_agent', name: 'voice_agent.get_call_status',
    description: 'Read the status of a simulated call',
    inputSchema: { required: ['callId'] }, outputSchema: { required: ['status', 'isReal'] },
    readOnly: true, idempotent: true, destructive: false, requiresHumanApproval: false,
    riskLevel: 'LOW', costClass: 'FREE', requiredScopes: ['READ_CRM'], timeoutMs: 2000, retryPolicy: 'TRANSIENT', isReal: false,
  }),
  Object.freeze({
    id: 'voice_agent.initiate_call', serverId: 'mcp_voice_agent', name: 'voice_agent.initiate_call',
    description: 'Initiate a simulated AI voice call (NO_REAL_CALLS=SI)',
    inputSchema: { required: ['phoneNumber', 'agentProfileId', 'clientId'] }, outputSchema: { required: ['callId', 'isReal'] },
    readOnly: false, idempotent: false, destructive: false, requiresHumanApproval: true,
    riskLevel: 'MEDIUM', costClass: 'FREE', requiredScopes: ['SEND_SMS'], timeoutMs: 60000, retryPolicy: 'NONE',
    noRealCalls: true, isReal: false,
  }),
]);

export function createVoiceAgentBridge() {
  return Object.freeze({ tools: VOICE_AGENT_MCP_TOOLS, adv11Linked: true, noRealCalls: true, isReal: false });
}

export const MCP_VOICE_AGENT_BRIDGE_VERSION = '1.0.0';
