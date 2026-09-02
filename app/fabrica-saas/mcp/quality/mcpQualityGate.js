// MCP Quality Gate — ADV-12

export const GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARN:    'WARN',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

const DEFAULT_THRESHOLDS = Object.freeze({
  minOverallScore:        75,
  maxCriticalFailures:    0,
  minToolSelectionScore:  70,
  minArgSafetyScore:      90,
  minIsolationScore:      90,
});

export function evaluateMCPQualityGate(qualityScore, criticalFailures = [], thresholds = {}) {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const failures = [];

  if (qualityScore.overall < t.minOverallScore)
    failures.push(`OVERALL_SCORE_TOO_LOW: ${qualityScore.overall} < ${t.minOverallScore}`);
  if (criticalFailures.length > t.maxCriticalFailures)
    failures.push(`CRITICAL_FAILURES: ${criticalFailures.length}`);
  if ((qualityScore.dimensions?.ARG_SAFETY ?? 100) < t.minArgSafetyScore)
    failures.push(`ARG_SAFETY_TOO_LOW: ${qualityScore.dimensions?.ARG_SAFETY}`);
  if ((qualityScore.dimensions?.ISOLATION ?? 100) < t.minIsolationScore)
    failures.push(`ISOLATION_TOO_LOW: ${qualityScore.dimensions?.ISOLATION}`);

  const status = failures.length === 0 ? GATE_STATUS.PASS
    : criticalFailures.length > 0        ? GATE_STATUS.BLOCKED
    : GATE_STATUS.FAIL;

  return Object.freeze({ status, failures: Object.freeze(failures), qualityScore: qualityScore.overall, isReal: false });
}

export const MCP_QUALITY_GATE_VERSION = '1.0.0';
