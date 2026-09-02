// Agent Cost Evaluator — ADV-10

export const COST_STATUS = Object.freeze({
  UNKNOWN:     'UNKNOWN',
  CHEAP:       'CHEAP',
  MODERATE:    'MODERATE',
  EXPENSIVE:   'EXPENSIVE',
  CRITICAL:    'CRITICAL',
});

const MODEL_PRICES_USD_PER_1K = Object.freeze({
  'claude-haiku-4-5':   { input: 0.00025, output: 0.00125 },
  'claude-sonnet-4-6':  { input: 0.003,   output: 0.015 },
  'claude-opus-4-8':    { input: 0.015,   output: 0.075 },
  'gpt-4o':             { input: 0.005,   output: 0.015 },
  'gpt-4o-mini':        { input: 0.00015, output: 0.0006 },
  'fixture':            { input: 0,       output: 0 },
});

export function createAgentCostEvaluator(fields = {}) {
  const model       = fields.model ?? 'fixture';
  const prices      = MODEL_PRICES_USD_PER_1K[model] ?? null;
  const inputTokens = fields.inputTokens ?? 0;
  const outputTokens= fields.outputTokens ?? 0;
  const totalTokens = inputTokens + outputTokens;

  let estimatedCostUSD = 0;
  let costStatus       = COST_STATUS.UNKNOWN;

  if (prices) {
    estimatedCostUSD = (inputTokens / 1000) * prices.input + (outputTokens / 1000) * prices.output;
    costStatus = estimatedCostUSD < 0.001 ? COST_STATUS.CHEAP
               : estimatedCostUSD < 0.01  ? COST_STATUS.MODERATE
               : estimatedCostUSD < 0.05  ? COST_STATUS.EXPENSIVE
               : COST_STATUS.CRITICAL;
  }

  return Object.freeze({
    model,
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCostUSD: Math.round(estimatedCostUSD * 1e6) / 1e6,
    costStatus,
    note: prices ? '' : 'Model price unknown — cost estimated as UNKNOWN',
    isReal: false,
  });
}

export const COST_EVALUATOR_VERSION = '1.0.0';
