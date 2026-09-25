// CI Failure Scenarios — ADV-02 CI/CD Automatizado
// 10 escenarios síncronos de fallo CI con comportamiento seguro y verificable.

import { evaluateQualityGates, GATE_STATUS } from './qualityGateEngine.js';
import { evaluateFailFast } from './failFast.js';
import { evaluateBundleBudget, BUNDLE_STATUS } from './bundleGate.js';
import { evaluateReleaseReadiness, RELEASE_STATUS } from './releaseReadiness.js';
import { checkPolicyCompliance, POLICY_STATUS } from './branchPolicy.js';
import { isRetryable } from './retryPolicy.js';
import { createCIEvent, CI_EVENT_TYPE } from './observabilityIntegration.js';
import {
  simulateSecretDetected, simulateTestFailure, simulateLintFailure,
  simulateBuildFailure, makeArtifactResult,
} from './ciTestFixture.js';

export const CI_FAILURE_SCENARIO = Object.freeze({
  SECRET_FOUND:               'secret_found',
  TESTS_FAILED:               'tests_failed',
  LINT_FAILED:                'lint_failed',
  BUILD_FAILED:               'build_failed',
  DEPENDENCY_HIGH:            'dependency_high',
  DEPENDENCY_CRITICAL:        'dependency_critical',
  ARTIFACT_MISSING:           'artifact_missing',
  BUNDLE_OVER_BUDGET:         'bundle_over_budget',
  RELEASE_NOT_READY:          'release_not_ready',
  DIRECT_MAIN_PUSH_VIOLATION: 'direct_main_push_policy_violation',
  TRANSIENT_INSTALL_FAILURE:  'transient_install_failure',
  OBSERVABILITY_EVENT:        'observability_event_written',
});

export function runSecretFoundScenario() {
  const fixture  = simulateSecretDetected();
  const ffResult = evaluateFailFast({ secretResult: fixture.secretResult });
  const gates    = evaluateQualityGates({ secretResult: fixture.secretResult });
  return {
    scenario:   CI_FAILURE_SCENARIO.SECRET_FOUND,
    handled:    ffResult.shouldStop && gates.blocked,
    safe:       true,
    ffAction:   ffResult.action,
    gateStatus: gates.overallStatus,
    message:    'Secret detected → fail-fast STOP + quality gate BLOCKED',
  };
}

export function runTestsFailedScenario() {
  const fixture  = simulateTestFailure();
  const gates    = evaluateQualityGates({ testResult: fixture.testResult });
  const ffResult = evaluateFailFast({ testResult: fixture.testResult });
  return {
    scenario:   CI_FAILURE_SCENARIO.TESTS_FAILED,
    handled:    ffResult.shouldStop,
    ffAction:   ffResult.action,
    gateStatus: gates.overallStatus,
    message:    'Test failure → fail-fast STOP',
  };
}

export function runLintFailedScenario() {
  const fixture = simulateLintFailure();
  const gates   = evaluateQualityGates({ lintResult: fixture.lintResult });
  return {
    scenario:   CI_FAILURE_SCENARIO.LINT_FAILED,
    handled:    gates.blocked,
    gateStatus: gates.overallStatus,
    p0Failures: gates.p0Failures,
    message:    'Lint errors → quality gate BLOCKED',
  };
}

export function runBuildFailedScenario() {
  const fixture  = simulateBuildFailure();
  const ffResult = evaluateFailFast({ buildResult: fixture.buildResult });
  const gates    = evaluateQualityGates({ buildResult: fixture.buildResult, artifactResult: fixture.artifactResult });
  return {
    scenario:   CI_FAILURE_SCENARIO.BUILD_FAILED,
    handled:    ffResult.shouldStop && gates.blocked,
    ffAction:   ffResult.action,
    gateStatus: gates.overallStatus,
    message:    'Build failure → fail-fast STOP + quality gate BLOCKED',
  };
}

export function runDependencyHighScenario() {
  const gates = evaluateQualityGates({ dependencyResult: { criticalCVEs: 0, highCVEs: 2 } });
  return {
    scenario:   CI_FAILURE_SCENARIO.DEPENDENCY_HIGH,
    handled:    gates.warnings.includes('DEPENDENCY_GATE'),
    gateStatus: gates.overallStatus,
    message:    'High CVEs → dependency gate WARNING (not P0 blocking)',
  };
}

export function runDependencyCriticalScenario() {
  const gates = evaluateQualityGates({ dependencyResult: { criticalCVEs: 1, highCVEs: 0 } });
  return {
    scenario:   CI_FAILURE_SCENARIO.DEPENDENCY_CRITICAL,
    handled:    gates.gates.some(g => g.gateId === 'DEPENDENCY_GATE' && (g.status === GATE_STATUS.FAIL || g.status === GATE_STATUS.WARNING)),
    gateStatus: gates.overallStatus,
    message:    'Critical CVE → dependency gate FAIL',
  };
}

export function runArtifactMissingScenario() {
  const artifactResult = makeArtifactResult({ valid: false, errors: ['index.html not found'], missingFiles: ['index.html'] });
  const gates = evaluateQualityGates({ artifactResult });
  return {
    scenario:   CI_FAILURE_SCENARIO.ARTIFACT_MISSING,
    handled:    gates.blocked && gates.p0Failures.includes('ARTIFACT_GATE'),
    gateStatus: gates.overallStatus,
    message:    'Artifact invalid → ARTIFACT_GATE FAIL, pipeline BLOCKED',
  };
}

export function runBundleOverBudgetScenario() {
  const assets = [
    { name: 'main.js',   sizeBytes: 600 * 1024 },
    { name: 'vendor.js', sizeBytes: 200 * 1024 },
  ];
  const result = evaluateBundleBudget(assets);
  return {
    scenario:  CI_FAILURE_SCENARIO.BUNDLE_OVER_BUDGET,
    handled:   result.overallStatus !== BUNDLE_STATUS.PASS,
    status:    result.overallStatus,
    failures:  result.failures,
    message:   `Bundle over budget → ${result.overallStatus}`,
  };
}

export function runReleaseNotReadyScenario() {
  const result = evaluateReleaseReadiness({
    testsPassed: false, lintPassed: true, buildPassed: true,
    secretsClean: true, securityPassed: true, artifactValid: true,
    humanApprovalRequired: true,
  });
  return {
    scenario:  CI_FAILURE_SCENARIO.RELEASE_NOT_READY,
    handled:   result.status === RELEASE_STATUS.BLOCKED,
    status:    result.status,
    blockers:  result.blockers,
    message:   `Release blocked: ${result.blockers.join(', ')}`,
  };
}

export function runDirectMainPushViolationScenario() {
  const result = checkPolicyCompliance('main', 'direct_push', {});
  return {
    scenario:   CI_FAILURE_SCENARIO.DIRECT_MAIN_PUSH_VIOLATION,
    handled:    result.status === POLICY_STATUS.VIOLATION,
    status:     result.status,
    violations: result.violations.length,
    message:    'Direct push to main → policy VIOLATION',
  };
}

export function runTransientInstallFailureScenario() {
  const retryCheck = isRetryable('INSTALL', 'ECONNRESET: network error', 0);
  return {
    scenario:  CI_FAILURE_SCENARIO.TRANSIENT_INSTALL_FAILURE,
    handled:   retryCheck.retryable === true,
    retryable: retryCheck.retryable,
    reason:    retryCheck.reason,
    message:   'Transient install error → retryable',
  };
}

export function runObservabilityEventScenario() {
  const ev = createCIEvent(CI_EVENT_TYPE.PIPELINE_FAILED, {
    clientId:   'FACTORY-DEMO-CI',
    projectId:  'demo-dental-saas',
    pipelineId: 'factory-pr-pipeline',
    commitSha:  'abc1234',
    branch:     'feature/test',
  }, { message: 'Pipeline failed in test', failureCategory: 'TEST' });

  return {
    scenario: CI_FAILURE_SCENARIO.OBSERVABILITY_EVENT,
    handled:  ev.valid,
    eventId:  ev.event?.eventId ?? null,
    message:  'CI failure emits observability event',
  };
}

export function runAllCIFailureScenarios() {
  const results = [
    runSecretFoundScenario(),
    runTestsFailedScenario(),
    runLintFailedScenario(),
    runBuildFailedScenario(),
    runDependencyHighScenario(),
    runDependencyCriticalScenario(),
    runArtifactMissingScenario(),
    runBundleOverBudgetScenario(),
    runReleaseNotReadyScenario(),
    runDirectMainPushViolationScenario(),
    runTransientInstallFailureScenario(),
    runObservabilityEventScenario(),
  ];

  const allHandled = results.every(r => r.handled);

  return {
    valid:          true,
    totalScenarios: results.length,
    allHandled,
    results,
    disclaimer:     'All scenarios are fictional. No real CI pipeline triggered.',
  };
}

export const CI_FAILURE_SCENARIOS_VERSION = '1.0.0';
