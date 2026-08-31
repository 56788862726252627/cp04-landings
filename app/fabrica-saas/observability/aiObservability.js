// AI Observability Foundation — ADV-01 Transversal Observability
// Stable contract for future Langfuse integration. No Langfuse calls yet.
// Records: agent calls, latency, success/failure, fallbacks, escalations.

import { createObservabilityEvent, SEVERITY, EVENT_TYPE, EVENT_STATUS, SERVICE } from './eventModel.js';

export const AI_PROVIDER = Object.freeze({
  ANTHROPIC: 'anthropic',
  OPENAI:    'openai',
  OPENROUTER:'openrouter',
  LOCAL:     'local',
  UNKNOWN:   'unknown',
});

export const MODEL_TIER = Object.freeze({
  FAST:     'fast',     // Haiku, GPT-4o-mini
  BALANCED: 'balanced', // Sonnet
  POWERFUL: 'powerful', // Opus, GPT-4o
  LOCAL:    'local',    // Ollama
});

export const AI_EVENT_TYPE = Object.freeze({
  AGENT_CALL:        'AGENT_CALL',
  AGENT_SUCCESS:     'AGENT_SUCCESS',
  AGENT_FAILURE:     'AGENT_FAILURE',
  FALLBACK_USED:     'FALLBACK_USED',
  HUMAN_ESCALATION:  'HUMAN_ESCALATION',
  MODEL_TIMEOUT:     'MODEL_TIMEOUT',
  CONTEXT_OVERFLOW:  'CONTEXT_OVERFLOW',
  RATE_LIMITED:      'RATE_LIMITED',
});

/**
 * Create an AI observability event.
 * Token counts and cost are ESTIMATES — never real billing data.
 * @param {object} params
 * @param {string} params.agentId
 * @param {string} params.agentType   — CHAT_AGENT | SALES_AGENT | SUPPORT_AGENT | BOOKING_AGENT | LEAD_AGENT | VOICE_AGENT
 * @param {string} params.provider    — AI_PROVIDER value
 * @param {string} params.modelTier   — MODEL_TIER value
 * @param {string} params.promptVersion
 * @param {number} params.latencyMs
 * @param {boolean} params.success
 * @param {boolean} params.fallbackUsed
 * @param {boolean} params.humanEscalation
 * @param {number} params.estimatedTokens  — approximate, not billing
 * @param {number} params.estimatedCostEur — approximate, not billing
 * @param {string} params.error
 * @param {string} params.correlationId
 * @param {string} params.clientId
 * @param {string} params.projectId
 */
export function createAIEvent(params = {}) {
  if (!params.agentId && !params.agentType) {
    return { valid: false, error: 'agentId or agentType required' };
  }

  const failed = params.success === false || !!params.error;
  const severity = failed
    ? (params.retryCount >= 2 ? SEVERITY.ERROR : SEVERITY.WARNING)
    : params.humanEscalation ? SEVERITY.WARNING
    : SEVERITY.INFO;

  const message = failed
    ? `AI agent ${params.agentType ?? params.agentId} FAILED: ${params.error ?? 'unknown'}`
    : params.humanEscalation
    ? `AI agent ${params.agentType ?? params.agentId} escalated to human`
    : `AI agent ${params.agentType ?? params.agentId} completed successfully`;

  const result = createObservabilityEvent({
    eventType:    EVENT_TYPE.AI,
    severity,
    status:       failed ? EVENT_STATUS.FAILURE : params.humanEscalation ? EVENT_STATUS.SKIPPED : EVENT_STATUS.SUCCESS,
    message,
    service:      SERVICE.AI,
    component:    'agent',
    module:       params.agentType ?? params.agentId,
    correlationId: params.correlationId,
    clientId:     params.clientId,
    projectId:    params.projectId,
    durationMs:   params.latencyMs ?? null,
    errorCategory: failed ? 'AI_PROVIDER' : null,
    recoverable:   !failed || params.fallbackUsed,
    humanActionRequired: params.humanEscalation ?? false,
    metadata: {
      agentId:           params.agentId ?? null,
      agentType:         params.agentType ?? null,
      provider:          params.provider ?? AI_PROVIDER.UNKNOWN,
      modelTier:         params.modelTier ?? MODEL_TIER.BALANCED,
      promptVersion:     params.promptVersion ?? null,
      fallbackUsed:      params.fallbackUsed ?? false,
      humanEscalation:   params.humanEscalation ?? false,
      estimatedTokens:   params.estimatedTokens ?? null,
      estimatedCostEur:  params.estimatedCostEur ?? null,
      langfuseTraceId:   null, // future: populate when Langfuse is connected
    },
    source: 'ai-observability',
  });

  return result;
}

/**
 * Stub for future Langfuse trace creation.
 * Returns the trace params without sending anything.
 * Replace this function body when Langfuse is configured.
 */
export function createLangfuseTraceStub(aiEvent) {
  if (!aiEvent) return { valid: false, error: 'aiEvent required' };

  return {
    valid:    true,
    sent:     false,
    reason:   'LANGFUSE_NOT_CONFIGURED',
    traceParams: {
      name:        aiEvent.metadata?.agentType ?? 'unknown-agent',
      sessionId:   aiEvent.correlationId,
      metadata: {
        clientId:    aiEvent.clientId,
        projectId:   aiEvent.projectId,
        modelTier:   aiEvent.metadata?.modelTier,
        provider:    aiEvent.metadata?.provider,
      },
    },
    disclaimer: 'Connect Langfuse SDK and replace this stub to enable tracing.',
  };
}

export const AI_OBSERVABILITY_VERSION = '1.0.0';
