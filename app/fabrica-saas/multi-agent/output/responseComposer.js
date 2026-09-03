// Multi-Agent Response Composer — ADV-17
// Produces a single coherent user-facing response. Never exposes agent internals.

export function createMultiAgentResponseComposer(config = {}) {
  const {
    hideInternalAgents  = true,
    maxResponseLength   = 2000,
    tone                = 'PROFESSIONAL',
  } = config;

  return Object.freeze({
    hideInternalAgents,
    maxResponseLength,
    tone,

    compose(aggregatedResult = {}, systemContext = {}) {
      const { results = [], warnings = [] } = aggregatedResult;

      // Combine result outputs — never expose agent IDs or chain-of-thought
      const outputs = results
        .map(r => r.output ?? r.result?.output ?? '')
        .filter(Boolean)
        .join(' ');

      const trimmed = outputs.length > maxResponseLength
        ? outputs.slice(0, maxResponseLength) + '…'
        : outputs;

      return Object.freeze({
        response:        trimmed || 'Task completed.',
        hasWarnings:     warnings.length > 0,
        warnings:        Object.freeze([...warnings]),
        agentsExposed:   false,   // always false — agents are internal
        systemId:        systemContext.systemId ?? null,
        isReal:          false,
      });
    },

    isReal: false,
  });
}

export const RESPONSE_COMPOSER_VERSION = '1.0.0';
