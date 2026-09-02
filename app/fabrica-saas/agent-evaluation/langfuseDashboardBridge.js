// Langfuse Dashboard Bridge — maps AgentTrace → Langfuse trace format (dry-run)
// ADV-10

import { createLangfuseEvaluationAdapter } from './langfuseAdapter.js';

export function mapTraceToLangfuseFormat(trace = {}) {
  return Object.freeze({
    id:         trace.traceId ?? 'fixture-trace',
    name:       `eval-${trace.agentType ?? 'CHAT'}-${trace.vertical ?? 'general'}`,
    input:      null,
    output:     null,
    metadata: Object.freeze({
      agentType:         trace.agentType,
      vertical:          trace.vertical,
      turnIndex:         trace.turnIndex,
      inputTokens:       trace.inputTokens,
      outputTokens:      trace.outputTokens,
      latencyMs:         trace.latencyMs,
      redacted:          trace.redacted,
      // ADV-10b: business truth metadata
      factSourcesUsed:   trace.factSourcesUsed   ?? [],
      factsResolved:     trace.factsResolved      ?? 0,
      availabilitySource:trace.availabilitySource ?? null,
      truthConflicts:    trace.truthConflicts     ?? 0,
      staleFacts:        trace.staleFacts         ?? 0,
      unsupportedClaims: trace.unsupportedClaims  ?? 0,
    }),
    tags:       trace.tags ?? [],
    timestamp:  trace.createdAt ?? new Date().toISOString(),
    isReal:     false,
  });
}

export function pushTraceToDashboard(trace, adapterConfig = {}) {
  const adapter = createLangfuseEvaluationAdapter(adapterConfig);
  const payload = mapTraceToLangfuseFormat(trace);
  return adapter.sendTrace(payload);
}

export const LANGFUSE_DASHBOARD_BRIDGE_VERSION = '1.0.0';
