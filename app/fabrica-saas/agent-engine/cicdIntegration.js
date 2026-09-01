// CI/CD Integration — ADV-03
// Gates de calidad para el motor de agentes. Sin ejecutar CI real.

export const AGENT_GATE = Object.freeze({
  UNIT_TESTS:      'UNIT_TESTS',
  LINT:            'LINT',
  BUILD:           'BUILD',
  SECURITY_SCAN:   'SECURITY_SCAN',
  SECRET_SCAN:     'SECRET_SCAN',
  ETHICS_AUDIT:    'ETHICS_AUDIT',
  SCHEMA_VALID:    'SCHEMA_VALID',
});

export const GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  FAIL:    'FAIL',
  SKIPPED: 'SKIPPED',
});

/**
 * Evaluate which CI gates apply to an agent engine change.
 */
export function evaluateAgentGates(params = {}) {
  const {
    testsPassed       = 0,
    testsTotal        = 0,
    lintErrors        = 0,
    buildSuccess      = true,
    secretsFound      = 0,
    securityIssues    = 0,
    darkPatternsFound = 0,
    schemaValid       = true,
  } = params;

  const gates = [
    evaluateGate(AGENT_GATE.UNIT_TESTS,    testsPassed >= testsTotal && testsTotal > 0),
    evaluateGate(AGENT_GATE.LINT,          lintErrors === 0),
    evaluateGate(AGENT_GATE.BUILD,         buildSuccess),
    evaluateGate(AGENT_GATE.SECRET_SCAN,   secretsFound === 0,   secretsFound > 0  ? `${secretsFound} secrets found — BLOCK` : null),
    evaluateGate(AGENT_GATE.SECURITY_SCAN, securityIssues === 0, securityIssues > 0 ? `${securityIssues} security issues` : null),
    evaluateGate(AGENT_GATE.ETHICS_AUDIT,  darkPatternsFound === 0, darkPatternsFound > 0 ? `${darkPatternsFound} dark patterns detected` : null),
    evaluateGate(AGENT_GATE.SCHEMA_VALID,  schemaValid),
  ];

  const allPass = gates.every(g => g.status === GATE_STATUS.PASS);
  const p0Fail  = gates.some(g =>
    g.status === GATE_STATUS.FAIL &&
    [AGENT_GATE.SECRET_SCAN, AGENT_GATE.ETHICS_AUDIT, AGENT_GATE.UNIT_TESTS].includes(g.gateId)
  );

  return Object.freeze({
    gates:          Object.freeze(gates),
    allPass,
    p0Fail,
    overallStatus:  p0Fail ? GATE_STATUS.FAIL : allPass ? GATE_STATUS.PASS : GATE_STATUS.WARNING,
    disclaimer:     'CI gates are evaluated locally. No remote CI triggered.',
  });
}

function evaluateGate(gateId, passing, message = null) {
  return Object.freeze({
    gateId,
    status:  passing ? GATE_STATUS.PASS : GATE_STATUS.FAIL,
    message: message ?? (passing ? null : `${gateId} did not pass`),
  });
}

/**
 * Build the quality gate manifest for an agent engine release.
 */
export function buildAgentReleaseGate(agentId, testResult = {}) {
  const { passed = 0, total = 0, lintErrors = 0, buildOk = true } = testResult;
  return evaluateAgentGates({
    testsPassed:   passed,
    testsTotal:    total,
    lintErrors,
    buildSuccess:  buildOk,
  });
}

export const CICD_INTEGRATION_VERSION = '1.0.0';
