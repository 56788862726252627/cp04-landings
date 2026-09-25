// MCP Tool Plan — ADV-12

export const PLAN_TYPE = Object.freeze({
  SINGLE:              'SINGLE',
  SEQUENTIAL:          'SEQUENTIAL',
  PARALLEL_READ_ONLY:  'PARALLEL_READ_ONLY',
});

export function createMCPToolPlan(config = {}) {
  if (!config.steps || config.steps.length === 0) throw new Error('MCPToolPlan requires at least one step');

  const type = config.type ?? (config.steps.length === 1 ? PLAN_TYPE.SINGLE : PLAN_TYPE.SEQUENTIAL);

  if (type === PLAN_TYPE.PARALLEL_READ_ONLY) {
    const hasWrite = config.steps.some(s => !s.readOnly);
    if (hasWrite) throw new Error('PARALLEL_READ_ONLY plan cannot contain write steps');
  }

  return Object.freeze({
    id:          config.id     ?? `plan_${Date.now()}`,
    type,
    steps:       Object.freeze(config.steps.map(s => Object.freeze(s))),
    description: config.description ?? '',
    isReal: false,
  });
}

export const MCP_TOOL_PLAN_VERSION = '1.0.0';
