// Voice Agent Bridge — ADV-16 ↔ ADV-11
// Voice: latency-sensitive, brevity, tool-capable.
// Requests FAST or BALANCED alias — no hardcode.

export function createVoiceBridge(config = {}) {
  const {
    latencyTarget   = 'LOW',
    preferredAlias  = 'FAST',    // or BALANCED
    requiresTools   = true,
    maxResponseLength = 'SHORT',
  } = config;

  return Object.freeze({
    latencyTarget,
    preferredAlias,
    requiresTools,
    maxResponseLength,

    buildVoiceRequestProfile(overrides = {}) {
      return Object.freeze({
        taskType:        'VOICE_PLANNING',
        latencyTarget,
        requiresTools,
        modelAlias:      preferredAlias,
        responseLength:  maxResponseLength,
        ...overrides,
        isReal: false,
      });
    },
    isReal: false,
  });
}

export const VOICE_BRIDGE_VERSION = '1.0.0';
