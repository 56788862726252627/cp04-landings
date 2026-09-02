// Quality/Cost Frontier Analyzer — ADV-10

export function compareAgentConfigurations(configs = []) {
  if (configs.length === 0) return Object.freeze({ winner: null, configs: [], isReal: false });

  const scored = configs.map(cfg => {
    const q  = cfg.qualityScore ?? 0;
    const c  = cfg.estimatedCostUSD ?? 0;
    const efficiency = c > 0 ? q / (c * 1000) : q;
    return Object.freeze({ ...cfg, efficiency: Math.round(efficiency * 10) / 10, isReal: false });
  });

  const sorted  = [...scored].sort((a, b) => b.efficiency - a.efficiency);
  const winner  = sorted[0];

  return Object.freeze({
    winner:  winner ?? null,
    configs: Object.freeze(sorted),
    note:    'Efficiency = quality / (cost_usd × 1000). Higher is better.',
    isReal: false,
  });
}

export function compareAgentConfigurationsFn(modelA = {}, modelB = {}) {
  return compareAgentConfigurations([modelA, modelB]);
}

export const QUALITY_COST_VERSION = '1.0.0';
