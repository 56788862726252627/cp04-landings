// Model / Configuration Comparison — ADV-10

export function compareAgentConfigurations(configs = []) {
  if (configs.length === 0) return Object.freeze({ winner: null, ranked: [], isReal: false });

  const ranked = [...configs]
    .map(c => Object.freeze({
      id:              c.id ?? 'unknown',
      model:           c.model ?? 'fixture',
      qualityScore:    c.qualityScore ?? 0,
      latencyMs:       c.latencyMs ?? 0,
      estimatedCostUSD:c.estimatedCostUSD ?? 0,
      efficiency:      c.estimatedCostUSD > 0
        ? Math.round((c.qualityScore ?? 0) / (c.estimatedCostUSD * 1000) * 10) / 10
        : c.qualityScore ?? 0,
      isReal: false,
    }))
    .sort((a, b) => b.efficiency - a.efficiency);

  return Object.freeze({
    winner: ranked[0] ?? null,
    ranked: Object.freeze(ranked),
    note:   'Ranked by efficiency (quality / cost). No real LLM calls made.',
    isReal: false,
  });
}

export const MODEL_COMPARISON_VERSION = '1.0.0';
