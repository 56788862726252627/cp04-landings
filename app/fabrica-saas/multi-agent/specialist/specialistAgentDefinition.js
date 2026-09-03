// Specialist Agent Definition — ADV-17

export function createSpecialistAgentDefinition(config = {}) {
  const {
    id                = `agent-${Date.now()}`,
    role              = 'CHAT',
    capabilities      = [],
    allowedTools      = [],
    allowedMCP        = [],
    aiRoutingProfile  = { modelAlias: 'BALANCED', qualityTarget: 'STANDARD' },
    knowledgeScope    = 'PUBLIC',
    memoryScope       = 'TASK',       // TURN | TASK | SESSION
    writeScope        = 'NONE',       // NONE | LOCAL | CRM | BOOKING | EXTERNAL
    riskLevel         = 'LOW',
    budgetLimit       = 'LOW',
    escalationPolicy  = 'AUTO',
  } = config;

  return Object.freeze({
    id,
    role,
    capabilities:     Object.freeze([...capabilities]),
    allowedTools:     Object.freeze([...allowedTools]),
    allowedMCP:       Object.freeze([...allowedMCP]),
    aiRoutingProfile: Object.freeze({ ...aiRoutingProfile }),
    knowledgeScope,
    memoryScope,
    writeScope,
    riskLevel,
    budgetLimit,
    escalationPolicy,
    canWrite:         writeScope !== 'NONE',
    canActExternal:   writeScope === 'EXTERNAL',
    isReal:           false,
  });
}

export const SPECIALIST_AGENT_DEFINITION_VERSION = '1.0.0';
