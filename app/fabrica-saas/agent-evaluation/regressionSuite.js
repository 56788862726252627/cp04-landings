// Agent Regression Suite — ADV-10

export function createAgentRegressionSuite(fields = {}) {
  return Object.freeze({
    id:       fields.id ?? `regression_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    name:     fields.name ?? 'Agent Regression Suite',
    baseline: Object.freeze({ ...(fields.baseline ?? {}) }),
    current:  Object.freeze({ ...(fields.current ?? {}) }),
    createdAt:fields.createdAt ?? new Date().toISOString(),
    isReal: false,
  });
}

export function detectRegressions(suite = {}) {
  const baseline = suite.baseline ?? {};
  const current  = suite.current  ?? {};
  const regressions = [];

  const dimensions = Object.keys(baseline);
  for (const dim of dimensions) {
    const prev = baseline[dim] ?? 0;
    const curr = current[dim]  ?? 0;
    const delta = curr - prev;
    if (delta < -5) {
      regressions.push(Object.freeze({
        dimension: dim,
        prev,
        curr,
        delta,
        severity: delta < -20 ? 'CRITICAL' : delta < -10 ? 'HIGH' : 'MEDIUM',
        isReal: false,
      }));
    }
  }

  return Object.freeze({
    regressions:    Object.freeze(regressions),
    regressionCount:regressions.length,
    hasCritical:    regressions.some(r => r.severity === 'CRITICAL'),
    isReal: false,
  });
}

export const REGRESSION_SUITE_VERSION = '1.0.0';
