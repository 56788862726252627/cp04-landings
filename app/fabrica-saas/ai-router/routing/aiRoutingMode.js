// AI Routing Mode — ADV-16

export const ROUTING_MODE = Object.freeze({
  QUALITY_FIRST:  'QUALITY_FIRST',
  BALANCED:       'BALANCED',
  COST_FIRST:     'COST_FIRST',
  LATENCY_FIRST:  'LATENCY_FIRST',
  PRIVACY_FIRST:  'PRIVACY_FIRST',
  LOCAL_FIRST:    'LOCAL_FIRST',
  CUSTOM:         'CUSTOM',
});

export const DEFAULT_ROUTING_MODE = ROUTING_MODE.BALANCED;

const MODE_WEIGHTS = Object.freeze({
  [ROUTING_MODE.QUALITY_FIRST]: Object.freeze({ quality: 50, cost: 10, latency: 20, privacy: 20 }),
  [ROUTING_MODE.BALANCED]:      Object.freeze({ quality: 30, cost: 25, latency: 25, privacy: 20 }),
  [ROUTING_MODE.COST_FIRST]:    Object.freeze({ quality: 20, cost: 50, latency: 15, privacy: 15 }),
  [ROUTING_MODE.LATENCY_FIRST]: Object.freeze({ quality: 20, cost: 20, latency: 50, privacy: 10 }),
  [ROUTING_MODE.PRIVACY_FIRST]: Object.freeze({ quality: 20, cost: 10, latency: 10, privacy: 60 }),
  [ROUTING_MODE.LOCAL_FIRST]:   Object.freeze({ quality: 20, cost: 20, latency: 30, privacy: 30 }),
});

export function getRoutingModeWeights(mode) {
  return MODE_WEIGHTS[mode] ?? MODE_WEIGHTS[ROUTING_MODE.BALANCED];
}

export function createRoutingModeConfig(mode = DEFAULT_ROUTING_MODE, overrides = {}) {
  const weights = getRoutingModeWeights(mode);
  return Object.freeze({
    mode,
    weights: Object.freeze({ ...weights, ...overrides }),
    isReal: false,
  });
}

export const ROUTING_MODE_VERSION = '1.0.0';
