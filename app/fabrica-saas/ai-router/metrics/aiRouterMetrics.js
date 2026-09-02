// AI Router Metrics Foundation — ADV-16
// Fixture only — no real telemetry sink.

export function createAIRouterMetrics() {
  const counters = {
    requestsByProvider: {},
    requestsByModelAlias: {},
    fallbackRate:           0,
    blockedCostRequests:    0,
    blockedPrivacyRequests: 0,
    selectionLatencyMs:     [],
    providerHealth:         {},
  };

  return {
    increment(counter, key = null) {
      if (key) {
        counters[counter] = counters[counter] ?? {};
        counters[counter][key] = (counters[counter][key] ?? 0) + 1;
      } else if (typeof counters[counter] === 'number') {
        counters[counter]++;
      }
    },

    recordLatency(ms) {
      counters.selectionLatencyMs.push(ms);
    },

    setProviderHealth(providerId, status) {
      counters.providerHealth[providerId] = status;
    },

    snapshot() {
      const latencies = counters.selectionLatencyMs;
      return Object.freeze({
        requestsByProvider:      Object.freeze({ ...counters.requestsByProvider }),
        requestsByModelAlias:    Object.freeze({ ...counters.requestsByModelAlias }),
        fallbackRate:            counters.fallbackRate,
        blockedCostRequests:     counters.blockedCostRequests,
        blockedPrivacyRequests:  counters.blockedPrivacyRequests,
        avgSelectionLatencyMs:   latencies.length
          ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
          : null,
        providerHealth: Object.freeze({ ...counters.providerHealth }),
        isReal: false,
      });
    },
  };
}

export const AI_ROUTER_METRICS_VERSION = '1.0.0';
