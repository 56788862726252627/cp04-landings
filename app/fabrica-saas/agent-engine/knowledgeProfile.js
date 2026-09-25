// Agent Knowledge Profile — ADV-03
// Cada agente solo accede al conocimiento que necesita. Preparado para RAG futuro.

export const KNOWLEDGE_SOURCE = Object.freeze({
  BUSINESS_KNOWLEDGE: 'BUSINESS_KNOWLEDGE',
  SERVICE_KNOWLEDGE:  'SERVICE_KNOWLEDGE',
  FAQ:                'FAQ',
  PRICING:            'PRICING',
  POLICIES:           'POLICIES',
  AVAILABILITY:       'AVAILABILITY',
  CRM_CONTEXT:        'CRM_CONTEXT',
  VERTICAL_KNOWLEDGE: 'VERTICAL_KNOWLEDGE',
  EXTERNAL_RAG:       'EXTERNAL_RAG',
  MCP_TOOLS:          'MCP_TOOLS',
});

export const KNOWLEDGE_ACCESS = Object.freeze({
  FULL:        'FULL',
  READ_ONLY:   'READ_ONLY',
  SUMMARY:     'SUMMARY',
  RESTRICTED:  'RESTRICTED',
  NONE:        'NONE',
});

const AGENT_TYPE_KNOWLEDGE_MAP = Object.freeze({
  CHAT:    [KNOWLEDGE_SOURCE.FAQ, KNOWLEDGE_SOURCE.SERVICE_KNOWLEDGE, KNOWLEDGE_SOURCE.BUSINESS_KNOWLEDGE],
  SALES:   [KNOWLEDGE_SOURCE.SERVICE_KNOWLEDGE, KNOWLEDGE_SOURCE.PRICING, KNOWLEDGE_SOURCE.VERTICAL_KNOWLEDGE, KNOWLEDGE_SOURCE.CRM_CONTEXT],
  SUPPORT: [KNOWLEDGE_SOURCE.POLICIES, KNOWLEDGE_SOURCE.SERVICE_KNOWLEDGE, KNOWLEDGE_SOURCE.CRM_CONTEXT, KNOWLEDGE_SOURCE.FAQ],
  BOOKING: [KNOWLEDGE_SOURCE.AVAILABILITY, KNOWLEDGE_SOURCE.PRICING, KNOWLEDGE_SOURCE.POLICIES, KNOWLEDGE_SOURCE.SERVICE_KNOWLEDGE],
  LEAD:    [KNOWLEDGE_SOURCE.SERVICE_KNOWLEDGE, KNOWLEDGE_SOURCE.PRICING, KNOWLEDGE_SOURCE.VERTICAL_KNOWLEDGE],
  VOICE:   [KNOWLEDGE_SOURCE.FAQ, KNOWLEDGE_SOURCE.AVAILABILITY, KNOWLEDGE_SOURCE.SERVICE_KNOWLEDGE],
});

/**
 * Create an AgentKnowledgeProfile.
 * Only grants access to sources needed for the agent type.
 */
export function createKnowledgeProfile(params = {}) {
  const {
    agentType   = 'CHAT',
    allowRAG    = false,
    allowCRM    = false,
    overrides   = {},
  } = params;

  const baseSources = AGENT_TYPE_KNOWLEDGE_MAP[agentType] ?? AGENT_TYPE_KNOWLEDGE_MAP.CHAT;
  const activeSources = [...baseSources];
  if (allowRAG) activeSources.push(KNOWLEDGE_SOURCE.EXTERNAL_RAG);
  if (allowCRM) activeSources.push(KNOWLEDGE_SOURCE.CRM_CONTEXT);

  const accessMap = {};
  for (const src of Object.values(KNOWLEDGE_SOURCE)) {
    accessMap[src] = activeSources.includes(src) ? KNOWLEDGE_ACCESS.READ_ONLY : KNOWLEDGE_ACCESS.NONE;
  }
  if (overrides.accessMap) Object.assign(accessMap, overrides.accessMap);

  const profile = Object.freeze({
    agentType,
    activeSources:  Object.freeze(activeSources),
    accessMap:      Object.freeze(accessMap),
    ragEnabled:     allowRAG,
    crmEnabled:     allowCRM,
    leastPrivilege: true,
    ragNote:        'RAG/MCP integration pending ADV-04+. Profile is pre-wired.',
    version:        '1.0.0',
  });

  return { valid: true, profile };
}

export const KNOWLEDGE_PROFILE_VERSION = '1.0.0';
