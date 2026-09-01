// Agent Engine Bridge — ADV-04
// Connects production pipeline → ADV-03 agent-engine.
// No real calls. No real messages. isReal always false.

export const AGENT_BRIDGE_STATUS = Object.freeze({
  GENERATED:  'GENERATED',
  SKIPPED:    'SKIPPED',
  BLOCKED:    'BLOCKED',
});

const SUPPORTED_AGENT_TYPES = Object.freeze(['CHAT', 'SALES', 'SUPPORT', 'BOOKING', 'LEAD', 'VOICE']);

/**
 * Determine which agent types are needed for a project artifact.
 */
export function resolveAgentTypes(artifact = {}) {
  const modules = artifact.modules ?? [];
  const needed  = new Set();

  if (modules.some(m => /booking|cita|reserva/i.test(m)))   needed.add('BOOKING');
  if (modules.some(m => /chat|asistente|bot/i.test(m)))     needed.add('CHAT');
  if (modules.some(m => /ventas|sales|comercial/i.test(m))) needed.add('SALES');
  if (modules.some(m => /soporte|support|ayuda/i.test(m)))  needed.add('SUPPORT');
  if (modules.some(m => /lead|captaci/i.test(m)))           needed.add('LEAD');
  if (modules.some(m => /voz|voice|tel[eé]fono/i.test(m))) needed.add('VOICE');

  // Always include CHAT as baseline
  needed.add('CHAT');

  return [...needed].filter(t => SUPPORTED_AGENT_TYPES.includes(t));
}

/**
 * Generate agent definitions for a project artifact.
 * Bridges to agent-engine without duplicating its logic.
 */
export function generateAgentsForProject(artifact = {}) {
  if (!artifact.projectId) {
    return { valid: false, error: 'artifact.projectId required', status: AGENT_BRIDGE_STATUS.BLOCKED };
  }

  const agentTypes = resolveAgentTypes(artifact);
  const vertical   = artifact.vertical ?? 'DEFAULT';

  const agents = agentTypes.map(agentType => Object.freeze({
    agentId:    `AGENT-${artifact.projectId}-${agentType}`,
    agentType,
    vertical,
    channel:    agentType === 'VOICE' ? 'VOICE' : 'WEB_CHAT',
    isReal:     false,
    status:     'DEFINED',
    disclaimer: 'Agent definition only — no live LLM endpoint connected.',
  }));

  return Object.freeze({
    valid:      true,
    status:     AGENT_BRIDGE_STATUS.GENERATED,
    projectId:  artifact.projectId,
    agentTypes,
    agentCount: agents.length,
    agents,
    isReal:     false,
  });
}

export const AGENT_ENGINE_BRIDGE_VERSION = '1.0.0';
