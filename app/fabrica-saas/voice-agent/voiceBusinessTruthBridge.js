// Voice Business Truth Bridge — ADV-11
// Connects voice agent to ADV-10b Business Source of Truth

export const VOICE_FACT_RESOLUTION_STATUS = Object.freeze({
  RESOLVED:   'RESOLVED',
  UNVERIFIED: 'UNVERIFIED',
  FABRICATED: 'FABRICATED',
  UNKNOWN:    'UNKNOWN',
});

export function createVoiceBusinessTruthBridge(businessSourceOfTruth = null) {
  function resolveFactForVoice(factKey = '', clientId = '') {
    if (!businessSourceOfTruth) {
      return Object.freeze({ status: VOICE_FACT_RESOLUTION_STATUS.UNKNOWN, fact: null, clientId, factKey, isReal: false });
    }
    const entry = businessSourceOfTruth.facts?.[factKey];
    if (!entry) {
      return Object.freeze({ status: VOICE_FACT_RESOLUTION_STATUS.UNKNOWN, fact: null, clientId, factKey, isReal: false });
    }
    return Object.freeze({ status: VOICE_FACT_RESOLUTION_STATUS.RESOLVED, fact: entry, clientId, factKey, isReal: false });
  }

  function isFactVerified(factKey = '') {
    const r = resolveFactForVoice(factKey);
    return r.status === VOICE_FACT_RESOLUTION_STATUS.RESOLVED;
  }

  return Object.freeze({
    resolveFactForVoice,
    isFactVerified,
    hasSource:  Boolean(businessSourceOfTruth),
    isReal: false,
  });
}

export const VOICE_BUSINESS_TRUTH_BRIDGE_VERSION = '1.0.0';
