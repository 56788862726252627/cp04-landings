// MCP Prompt Definition — ADV-12

export const PROMPT_CATEGORY = Object.freeze({
  SYSTEM:      'SYSTEM',
  TOOL_USE:    'TOOL_USE',
  PERSONA:     'PERSONA',
  SAFETY:      'SAFETY',
  EVALUATION:  'EVALUATION',
  ONBOARDING:  'ONBOARDING',
});

export function createMCPPrompt(config = {}) {
  if (!config.id)   throw new Error('MCPPrompt requires id');
  if (!config.name) throw new Error('MCPPrompt requires name');
  return Object.freeze({
    id:          config.id,
    name:        config.name,
    description: config.description ?? '',
    category:    config.category    ?? PROMPT_CATEGORY.SYSTEM,
    arguments:   Object.freeze(config.arguments ?? []),
    template:    config.template    ?? '',
    version:     config.version     ?? '1.0.0',
    clientScope: config.clientScope ?? null,
    isReal: false,
  });
}

export const MCP_PROMPT_DEFINITION_VERSION = '1.0.0';
