// Release Gates — PASO G
// 10 gates. Any P0 failure → BLOCKED.

export const GATE_RESULT = Object.freeze({
  PASS:         'PASS',
  BLOCKED:      'BLOCKED',
  HUMAN_REVIEW: 'HUMAN_REVIEW',
  NOT_EVALUATED:'NOT_EVALUATED',
});

export const RELEASE_GATE_IDS = Object.freeze({
  BUILD:       'BUILD_GATE',
  TEST:        'TEST_GATE',
  SECURITY:    'SECURITY_GATE',
  PRIVACY:     'PRIVACY_GATE',
  ACCESSIBILITY:'ACCESSIBILITY_GATE',
  MOBILE:      'MOBILE_GATE',
  RUNTIME:     'RUNTIME_GATE',
  DEPLOY:      'DEPLOY_GATE',
  POST_DEPLOY: 'POST_DEPLOY_GATE',
  ROLLBACK:    'ROLLBACK_GATE',
});

const GATE_DEFINITIONS = {
  [RELEASE_GATE_IDS.BUILD]: {
    label: 'Build Gate',
    p0: true,
    requiredChecks: ['lintPasses', 'buildPasses', 'lockfilePresent', 'nodeVersionSpecified'],
  },
  [RELEASE_GATE_IDS.TEST]: {
    label: 'Test Gate',
    p0: true,
    requiredChecks: ['allTestsPass', 'noSkippedCritical'],
  },
  [RELEASE_GATE_IDS.SECURITY]: {
    label: 'Security Gate',
    p0: true,
    requiredChecks: ['noSecretsInCode', 'noHardcodedCredentials', 'securityHeadersConfigured'],
  },
  [RELEASE_GATE_IDS.PRIVACY]: {
    label: 'Privacy Gate',
    p0: false,
    humanReview: true,
    requiredChecks: ['gdprComplianceReviewed', 'dataDeletionPossible'],
  },
  [RELEASE_GATE_IDS.ACCESSIBILITY]: {
    label: 'Accessibility Gate',
    p0: false,
    requiredChecks: ['ariaLandmarks', 'keyboardNav', 'colorContrast'],
  },
  [RELEASE_GATE_IDS.MOBILE]: {
    label: 'Mobile Gate',
    p0: true,
    requiredChecks: ['responsiveLayout', 'touchTargets', 'mobileNav'],
  },
  [RELEASE_GATE_IDS.RUNTIME]: {
    label: 'Runtime Render Gate',
    p0: true,
    requiredChecks: ['noBlankScreen', 'rootElementRenders', 'noRuntimeException'],
  },
  [RELEASE_GATE_IDS.DEPLOY]: {
    label: 'Deploy Gate',
    p0: true,
    requiredChecks: ['preDeployReadinessPass', 'targetConfigured', 'rollbackPlanDefined'],
  },
  [RELEASE_GATE_IDS.POST_DEPLOY]: {
    label: 'Post-Deploy Gate',
    p0: true,
    requiredChecks: ['healthCheckPass', 'criticalQAPass'],
  },
  [RELEASE_GATE_IDS.ROLLBACK]: {
    label: 'Rollback Gate',
    p0: false,
    requiredChecks: ['rollbackPlanDefined', 'previousVersionKnown'],
  },
};

/**
 * Evaluate all release gates from a checks map.
 * @param {object} checks — { lintPasses: true, allTestsPass: true, ... }
 */
export function evaluateReleaseGates(checks = {}) {
  const gateResults = {};

  for (const [gateId, def] of Object.entries(GATE_DEFINITIONS)) {
    const checkResults = def.requiredChecks.map(c => ({
      check: c,
      passed: checks[c] === true,
      value:  checks[c],
    }));

    const allPass         = checkResults.every(r => r.passed);
    const anyExplicitFail = checkResults.some(r => r.value === false);
    const allUnchecked    = checkResults.every(r => r.value === undefined || r.value === null);
    const humanReview     = def.humanReview && !allPass;

    let result;
    if (allUnchecked) {
      result = GATE_RESULT.NOT_EVALUATED;
    } else if (!allPass && !anyExplicitFail && !humanReview) {
      // some undefined + no explicit fail = partially evaluated
      result = GATE_RESULT.NOT_EVALUATED;
    } else if (!allPass) {
      result = humanReview ? GATE_RESULT.HUMAN_REVIEW : GATE_RESULT.BLOCKED;
    } else {
      result = GATE_RESULT.PASS;
    }

    gateResults[gateId] = {
      gateId,
      label:      def.label,
      p0:         def.p0,
      result,
      checkResults,
      allPass,
    };
  }

  const p0Blocked = Object.values(gateResults).filter(g => g.p0 && g.result === GATE_RESULT.BLOCKED);
  const anyHumanReview = Object.values(gateResults).filter(g => g.result === GATE_RESULT.HUMAN_REVIEW);
  const allPass = Object.values(gateResults).every(g => g.result === GATE_RESULT.PASS);

  const overallResult = p0Blocked.length > 0       ? GATE_RESULT.BLOCKED
    : anyHumanReview.length > 0                    ? GATE_RESULT.HUMAN_REVIEW
    : allPass                                       ? GATE_RESULT.PASS
    : GATE_RESULT.NOT_EVALUATED;

  return {
    valid:          true,
    overallResult,
    p0Blocked:      p0Blocked.length,
    humanReview:    anyHumanReview.length,
    gatesTotal:     Object.keys(GATE_DEFINITIONS).length,
    gatesPassed:    Object.values(gateResults).filter(g => g.result === GATE_RESULT.PASS).length,
    gates:          gateResults,
    blockedGateIds: p0Blocked.map(g => g.gateId),
    deploymentAllowed: overallResult === GATE_RESULT.PASS,
    disclaimer:     'Release gates are operational validation. P0 failures block deployment.',
  };
}

export const RELEASE_GATES_VERSION = '1.0.0';
