// Process Health Check — FASE 26: auditoría de salud de procesos

/**
 * Audit a single SOP definition for completeness.
 */
export function auditProcess(sop = {}) {
  const issues = {
    missing_owner:               !sop.owner,
    missing_input:               !sop.requiredInputs?.length,
    missing_output:              !sop.artifacts?.length,
    missing_completion_criteria: !sop.completionCriteria?.length,
    dead_step:                   hasDeadStep(sop),
    missing_decision:            !hasDecisionOrGate(sop),
    missing_escalation:          !sop.escalation,
    missing_qa:                  !sop.qualityChecks?.length,
    missing_security:            !sop.securityChecks?.length,
    missing_artifact:            !sop.artifacts?.length,
    missing_metric:              !sop.metrics?.length,
    missing_handoff:             !sop.handoff,
  };

  const flaggedIssues = Object.entries(issues).filter(([, v]) => v).map(([k]) => k);
  const healthScore   = Math.max(0, 100 - flaggedIssues.length * 8);

  return {
    sopId:        sop.id ?? 'unknown',
    sopTitle:     sop.title ?? 'unknown',
    issues:       flaggedIssues,
    issueCount:   flaggedIssues.length,
    healthScore,
    status:       healthScore >= 80 ? 'HEALTHY' : healthScore >= 60 ? 'WARNING' : 'CRITICAL',
  };
}

function hasDeadStep(sop = {}) {
  const steps = sop.steps ?? [];
  if (steps.length === 0) return true;
  return steps.some(s => !s.label && !s);
}

function hasDecisionOrGate(sop = {}) {
  const steps = sop.steps ?? [];
  return steps.some(s =>
    s.type === 'DECISION' || s.type === 'GATE'
  );
}

/**
 * Audit a list of SOPs and return aggregate report.
 */
export function auditProcessList(sops = []) {
  const results = sops.map(auditProcess);
  const healthy  = results.filter(r => r.status === 'HEALTHY');
  const warning  = results.filter(r => r.status === 'WARNING');
  const critical = results.filter(r => r.status === 'CRITICAL');
  const avgScore = results.length
    ? Math.round(results.reduce((sum, r) => sum + r.healthScore, 0) / results.length)
    : 0;

  return {
    total:    results.length,
    healthy:  healthy.length,
    warning:  warning.length,
    critical: critical.length,
    avgScore,
    results,
    topIssues: getTopIssues(results),
  };
}

function getTopIssues(results = []) {
  const counts = {};
  for (const r of results) {
    for (const issue of r.issues) {
      counts[issue] = (counts[issue] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, count }));
}

/**
 * Audit a BPMN process structure for health.
 */
export function auditBPMNProcess(process = {}) {
  const issues = [];
  const warnings = [];

  if (!process.id)    issues.push('missing_id');
  if (!process.name)  issues.push('missing_name');
  if (!process.pools?.length) issues.push('no_pools');
  if (!process.sequenceFlows?.length) issues.push('no_flows');
  if (!process.sopRef) warnings.push('no_sop_reference');

  const allIds = new Set();
  for (const pool of (process.pools ?? [])) {
    if (!pool.lanes?.length) warnings.push(`pool ${pool.id} has no lanes`);
    for (const el of (pool.elements ?? [])) {
      if (allIds.has(el.id)) issues.push(`duplicate_element: ${el.id}`);
      allIds.add(el.id);
    }
  }

  const hasStart = [...allIds].some(id => id.includes('start'));
  const hasEnd   = [...allIds].some(id => id.includes('end'));
  if (!hasStart) issues.push('no_start_event');
  if (!hasEnd)   issues.push('no_end_event');

  for (const f of (process.sequenceFlows ?? [])) {
    if (!allIds.has(f.source)) issues.push(`orphan_flow_source: ${f.source}`);
    if (!allIds.has(f.target)) issues.push(`orphan_flow_target: ${f.target}`);
  }

  const healthScore = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

  return {
    processId:   process.id ?? 'unknown',
    issues,
    warnings,
    issueCount:  issues.length,
    healthScore,
    status:      healthScore >= 80 ? 'HEALTHY' : healthScore >= 50 ? 'WARNING' : 'CRITICAL',
    elementCount: allIds.size,
    flowCount:    (process.sequenceFlows ?? []).length,
  };
}

export const PROCESS_HEALTH_VERSION = '1.0.0';
