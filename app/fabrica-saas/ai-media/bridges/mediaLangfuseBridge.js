// Media Langfuse Bridge — ADV-13 (bridges ADV-10, no real export)

export const MEDIA_TRACE_TYPE = Object.freeze({
  SCRIPT_GENERATION: 'SCRIPT_GENERATION',
  QA_EVALUATION:     'QA_EVALUATION',
  PROVIDER_ROUTING:  'PROVIDER_ROUTING',
  COST_ESTIMATION:   'COST_ESTIMATION',
});

export function createMediaTrace(config = {}) {
  if (!config.traceType)  throw new Error('MediaTrace requires traceType');
  if (!config.projectId)  throw new Error('MediaTrace requires projectId');
  return Object.freeze({
    traceType:   config.traceType,
    projectId:   config.projectId,
    clientId:    config.clientId   ?? null,
    inputTokens: config.inputTokens ?? 0,
    outputTokens:config.outputTokens ?? 0,
    noRealExport: true,
    adv10Bridge: 'LANGFUSE_CONNECTED',
    isReal: false,
  });
}

export const MEDIA_LANGFUSE_BRIDGE_VERSION = '1.0.0';
