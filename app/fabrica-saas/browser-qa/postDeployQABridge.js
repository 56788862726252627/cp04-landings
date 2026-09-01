// Post-Deploy QA Bridge — ADV-06
// Connects browser QA results to the ADV-04 production pipeline.

export const DEPLOY_QA_GATE = Object.freeze({
  SMOKE_PASS:       'SMOKE_PASS',
  RENDER_PASS:      'RENDER_PASS',
  CONSOLE_CLEAN:    'CONSOLE_CLEAN',
  NETWORK_CLEAN:    'NETWORK_CLEAN',
  PERF_ACCEPTABLE:  'PERF_ACCEPTABLE',
  A11Y_BASELINE:    'A11Y_BASELINE',
});

export const DEPLOY_QA_VERDICT = Object.freeze({
  APPROVED:       'APPROVED',
  CONDITIONAL:    'CONDITIONAL',
  REJECTED:       'REJECTED',
  NEEDS_REVIEW:   'NEEDS_REVIEW',
});

const GATE_BLOCKING = {
  [DEPLOY_QA_GATE.SMOKE_PASS]:      true,
  [DEPLOY_QA_GATE.RENDER_PASS]:     true,
  [DEPLOY_QA_GATE.CONSOLE_CLEAN]:   true,
  [DEPLOY_QA_GATE.NETWORK_CLEAN]:   true,
  [DEPLOY_QA_GATE.PERF_ACCEPTABLE]: false,
  [DEPLOY_QA_GATE.A11Y_BASELINE]:   false,
};

export function createPostDeployQAPlan(pipelineContext = {}) {
  const { projectId, deploymentId, environment = 'staging' } = pipelineContext;
  if (!projectId) return { valid: false, error: 'projectId required' };

  return Object.freeze({
    valid:        true,
    projectId,
    deploymentId: deploymentId ?? `DEP-${Date.now()}`,
    environment,
    gates:        Object.values(DEPLOY_QA_GATE),
    gateCount:    Object.values(DEPLOY_QA_GATE).length,
    isReal:       false,
  });
}

export function evaluatePostDeployQA(plan = {}, gateResults = {}) {
  if (!plan.valid) return { valid: false, error: 'invalid plan' };

  const evaluated = plan.gates.map(gate => ({
    gate,
    passed:   gateResults[gate] ?? false,
    blocking: GATE_BLOCKING[gate] ?? false,
  }));

  const failed   = evaluated.filter(g => !g.passed);
  const blocking = failed.filter(g => g.blocking);

  let verdict;
  if (blocking.length > 0)      verdict = DEPLOY_QA_VERDICT.REJECTED;
  else if (failed.length > 2)   verdict = DEPLOY_QA_VERDICT.NEEDS_REVIEW;
  else if (failed.length > 0)   verdict = DEPLOY_QA_VERDICT.CONDITIONAL;
  else                          verdict = DEPLOY_QA_VERDICT.APPROVED;

  return Object.freeze({
    valid:       true,
    projectId:   plan.projectId,
    environment: plan.environment,
    verdict,
    gatesPassed: evaluated.filter(g => g.passed).length,
    gatesFailed: failed.length,
    blocking:    blocking.length,
    results:     evaluated,
    canDeploy:   verdict === DEPLOY_QA_VERDICT.APPROVED,
    isReal:      false,
  });
}

export function buildQASignoffRequest(qaResult = {}) {
  if (!qaResult.valid) return { valid: false, error: 'invalid QA result' };
  return Object.freeze({
    valid:       true,
    type:        'POST_DEPLOY_QA_SIGNOFF',
    projectId:   qaResult.projectId,
    verdict:     qaResult.verdict,
    requiresHuman: qaResult.verdict !== DEPLOY_QA_VERDICT.APPROVED,
    summary:     `QA: ${qaResult.gatesPassed}/${qaResult.gatesPassed + qaResult.gatesFailed} gates passed. Verdict: ${qaResult.verdict}`,
    isReal:      false,
  });
}

export const POST_DEPLOY_QA_BRIDGE_VERSION = '1.0.0';
