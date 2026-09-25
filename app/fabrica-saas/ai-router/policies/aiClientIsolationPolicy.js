// AI Client Isolation Policy — ADV-16
// Client A routing config must not affect Client B.

export function createAIClientIsolationPolicy(config = {}) {
  const {
    clientId = 'unknown',
    isolated = true,
  } = config;

  return Object.freeze({
    clientId,
    isolated,

    validateIsolation(otherClientId) {
      if (otherClientId === clientId) {
        return Object.freeze({ valid: true, reason: null, isReal: false });
      }
      if (!isolated) {
        return Object.freeze({ valid: false, reason: 'CLIENT_ISOLATION_DISABLED', isReal: false });
      }
      return Object.freeze({ valid: true, reason: null, isReal: false });
    },

    scopeConfig(routingConfig) {
      // Returns config namespaced to this client — no shared mutable state
      return Object.freeze({
        clientId,
        ...routingConfig,
        _isolated: true,
        isReal: false,
      });
    },
    isReal: false,
  });
}

export function assertClientBoundary(configClientId, requestClientId) {
  if (configClientId !== requestClientId) {
    return Object.freeze({
      safe:   false,
      reason: `Client boundary violation: config=${configClientId}, request=${requestClientId}`,
      isReal: false,
    });
  }
  return Object.freeze({ safe: true, reason: null, isReal: false });
}

export const AI_CLIENT_ISOLATION_POLICY_VERSION = '1.0.0';
