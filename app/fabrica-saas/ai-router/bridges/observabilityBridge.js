// Observability Bridge — ADV-16 ↔ ADV-01
// Routing events. Never logs secrets or full prompts.

export const AI_ROUTING_EVENT = Object.freeze({
  ROUTING_REQUESTED:        'aiRoutingRequested',
  MODEL_SELECTED:           'aiModelSelected',
  PROVIDER_SELECTED:        'aiProviderSelected',
  FALLBACK_ACTIVATED:       'aiFallbackActivated',
  PROVIDER_FAILED:          'aiProviderFailed',
  COST_BLOCKED:             'aiCostBlocked',
  PRIVACY_BLOCKED:          'aiPrivacyBlocked',
  REQUEST_COMPLETED:        'aiRequestCompleted',
  ROUTING_QUALITY_EVALUATED:'aiRoutingQualityEvaluated',
});

export function emitRoutingEvent(eventType, payload = {}) {
  // Sanitize: remove any keys that look like secrets or prompts
  const safe = Object.fromEntries(
    Object.entries(payload).filter(([k]) =>
      !k.toLowerCase().includes('key') &&
      !k.toLowerCase().includes('secret') &&
      !k.toLowerCase().includes('prompt') &&
      !k.toLowerCase().includes('content')
    )
  );

  return Object.freeze({
    event:   eventType,
    payload: Object.freeze(safe),
    ts:      new Date().toISOString(),
    isReal:  false,
  });
}

export function createAIRouterObservabilityBridge() {
  return Object.freeze({
    events: AI_ROUTING_EVENT,
    emit:   emitRoutingEvent,
    isReal: false,
  });
}

export const AI_ROUTER_OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
