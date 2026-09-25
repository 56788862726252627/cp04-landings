// Multi-Agent Security Policy — ADV-17

export const SECURITY_BLOCK_REASON = Object.freeze({
  PROMPT_INJECTED_DELEGATION:  'PROMPT_INJECTED_DELEGATION',
  PERMISSION_MANIPULATION:     'PERMISSION_MANIPULATION',
  TOOL_INJECTION:              'TOOL_INJECTION',
  AGENT_IMPERSONATION:         'AGENT_IMPERSONATION',
  CROSS_CLIENT_ROUTING:        'CROSS_CLIENT_ROUTING',
  SELF_PERMISSION_ESCALATION:  'SELF_PERMISSION_ESCALATION',
  UNAUTHORIZED_EXTERNAL_ACTION: 'UNAUTHORIZED_EXTERNAL_ACTION',
});

export function createMultiAgentSecurityPolicy(config = {}) {
  const {
    blockPromptInjection  = true,
    blockCrossClientRoute = true,
    blockSelfEscalation   = true,
    blockToolInjection    = true,
  } = config;

  return Object.freeze({
    blockPromptInjection,
    blockCrossClientRoute,
    blockSelfEscalation,
    blockToolInjection,

    evaluate(action = {}) {
      const blocks = [];

      if (blockPromptInjection && action.fromExternal && action.createsAgent) {
        blocks.push(SECURITY_BLOCK_REASON.PROMPT_INJECTED_DELEGATION);
      }

      if (blockCrossClientRoute && action.sourceClientId !== action.targetClientId) {
        blocks.push(SECURITY_BLOCK_REASON.CROSS_CLIENT_ROUTING);
      }

      if (blockSelfEscalation && action.agentId === action.grantedByAgentId) {
        blocks.push(SECURITY_BLOCK_REASON.SELF_PERMISSION_ESCALATION);
      }

      if (blockToolInjection && action.toolFromExternalInput) {
        blocks.push(SECURITY_BLOCK_REASON.TOOL_INJECTION);
      }

      return Object.freeze({
        safe:   blocks.length === 0,
        blocks: Object.freeze(blocks),
        isReal: false,
      });
    },

    isReal: false,
  });
}

export const MULTIAGENT_SECURITY_POLICY_VERSION = '1.0.0';
