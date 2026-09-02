// Business Source of Truth Bridge — ADV-16 ↔ ADV-10b
// OpenRouter/model selection does NOT change grounding.
// Business facts always come from BusinessSourceOfTruth, never from model memory.

export function createBusinessTruthBridge(config = {}) {
  const { sourceId = 'BUSINESS_SOURCE_OF_TRUTH' } = config;

  return Object.freeze({
    sourceId,

    enforceGrounding(response = {}) {
      return Object.freeze({
        groundingEnforced: true,
        source:            sourceId,
        paramericMemoryTrusted: false,
        note: 'Business facts must be validated against BusinessSourceOfTruth, not model memory',
        response: Object.freeze(response),
        isReal: false,
      });
    },

    // eslint-disable-next-line no-unused-vars
    validateFactual(claim = '', groundingData = {}) {
      // Fixture: always returns validation required
      return Object.freeze({
        claim,
        validationRequired: true,
        source:             sourceId,
        isReal:             false,
      });
    },
    isReal: false,
  });
}

export const BUSINESS_TRUTH_BRIDGE_VERSION = '1.0.0';
