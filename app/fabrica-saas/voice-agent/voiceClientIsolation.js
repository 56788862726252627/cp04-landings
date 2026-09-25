// Voice Client Isolation — ADV-11
// Client A facts MUST NEVER appear in Client B context

export function createVoiceClientContext(clientId = '') {
  if (!clientId) throw new Error('clientId is required for voice client isolation');
  const factsByClient = new Map();
  factsByClient.set(clientId, new Map());

  function setFact(forClientId, key, value) {
    if (forClientId !== clientId) {
      throw new Error(`CLIENT_ISOLATION_VIOLATION: cannot write client ${forClientId} facts into context for ${clientId}`);
    }
    factsByClient.get(clientId).set(key, value);
  }

  function getFact(forClientId, key) {
    if (forClientId !== clientId) {
      throw new Error(`CLIENT_ISOLATION_VIOLATION: cannot read client ${forClientId} facts from context of ${clientId}`);
    }
    return factsByClient.get(clientId).get(key) ?? null;
  }

  function getClientFacts() {
    return Object.freeze(Object.fromEntries(factsByClient.get(clientId)));
  }

  return Object.freeze({ clientId, setFact, getFact, getClientFacts, isReal: false });
}

export function detectClientLeakRisk(contextClientId = '', requestedClientId = '') {
  return Object.freeze({
    leakDetected:     contextClientId !== requestedClientId && Boolean(requestedClientId),
    contextClientId,
    requestedClientId,
    isReal: false,
  });
}

export const VOICE_CLIENT_ISOLATION_VERSION = '1.0.0';
