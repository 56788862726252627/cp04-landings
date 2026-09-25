// Result Aggregator — ADV-17

export function aggregateMultiAgentResults(results = [], options = {}) {
  const {
    deduplicateBy   = 'objective',
    conflictWinner  = 'BUSINESS_TRUTH',
    preserveSources = true,
  } = options;

  // Deduplicate by key
  const seen  = new Map();
  const dedup = [];
  for (const r of results) {
    const key = r[deduplicateBy] ?? r.taskId ?? JSON.stringify(r);
    if (!seen.has(key)) { seen.set(key, true); dedup.push(r); }
  }

  // Collect all warnings
  const warnings = dedup.flatMap(r => r.warnings ?? []);

  // Sources
  const sources = preserveSources ? dedup.map(r => r.agentId ?? r.source).filter(Boolean) : [];

  return Object.freeze({
    results:       Object.freeze(dedup),
    resultCount:   dedup.length,
    warnings:      Object.freeze([...new Set(warnings)]),
    sources:       Object.freeze([...new Set(sources)]),
    conflictWinner,
    isReal:        false,
  });
}

export const RESULT_AGGREGATOR_VERSION = '1.0.0';
