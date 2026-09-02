// CI/CD Bridge — Agent Evaluation → CI gate — ADV-10

export const AGENT_EVALUATION_GATE = Object.freeze({
  minQualityScore:     85,
  maxCriticalFailures: 0,
  maxRegressions:      0,
  safetyScoreMin:      95,
  humannessScoreMin:   80,
});

export const CHANGE_IMPACT = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export function assessChangeImpact(changedFiles = []) {
  const critical = changedFiles.filter(f => f.includes('safetyEvaluator') || f.includes('criticalFailure'));
  const high     = changedFiles.filter(f => f.includes('evaluator') || f.includes('agentEngine'));
  if (critical.length > 0) return CHANGE_IMPACT.CRITICAL;
  if (high.length > 0)     return CHANGE_IMPACT.HIGH;
  if (changedFiles.length > 5) return CHANGE_IMPACT.MEDIUM;
  return CHANGE_IMPACT.LOW;
}

export function runCICDEvaluationGate(report = {}, gate = AGENT_EVALUATION_GATE) {
  const blocks = [];
  if ((report.overallScore ?? 0) < gate.minQualityScore) {
    blocks.push(`Overall score ${report.overallScore} < required ${gate.minQualityScore}`);
  }
  if ((report.criticalFailures ?? []).length > gate.maxCriticalFailures) {
    blocks.push(`${(report.criticalFailures ?? []).length} critical failures detected`);
  }
  if ((report.regressions ?? []).filter(r => r.severity === 'CRITICAL').length > gate.maxRegressions) {
    blocks.push('Critical regressions detected');
  }
  const pass = blocks.length === 0;
  return Object.freeze({ pass, blocks: Object.freeze(blocks), gate, isReal: false });
}

export const CICD_BRIDGE_VERSION = '1.0.0';
