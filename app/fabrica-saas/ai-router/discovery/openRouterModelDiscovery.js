// OpenRouter Model Discovery — ADV-16
// Fixture/static foundation. No real HTTP requests.

export const DISCOVERY_SOURCE = Object.freeze({
  FIXTURE:  'FIXTURE',
  CACHED:   'CACHED',
  LIVE:     'LIVE',   // future — not enabled in ADV-16
  BLOCKED:  'BLOCKED',
});

export function createOpenRouterModelDiscovery(config = {}) {
  const { staticCatalog = [] } = config;
  // allowLive: always forced false in ADV-16, never read

  return Object.freeze({
    allowLive: false, // enforced regardless of config

    discover() {
      // In ADV-16: always returns fixture catalog, never makes real requests
      return Object.freeze({
        source:  DISCOVERY_SOURCE.FIXTURE,
        models:  Object.freeze([...staticCatalog]),
        count:   staticCatalog.length,
        isReal:  false,
      });
    },

    getModel(modelId) {
      const found = staticCatalog.find(m => m.modelId === modelId);
      return found ? Object.freeze({ found: true, model: found, isReal: false })
                   : Object.freeze({ found: false, model: null, isReal: false });
    },
    isReal: false,
  });
}

export const OPENROUTER_MODEL_DISCOVERY_VERSION = '1.0.0';
