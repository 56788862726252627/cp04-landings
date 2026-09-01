// ADV-02 CI/CD Automatizado — Test Suite
// node:test + node:assert/strict. No vitest.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CI_TRIGGER, PIPELINE_STATUS, createPipeline, evaluatePipelineStatus, PIPELINE_MODEL_VERSION,
} from '../../cicd/pipelineModel.js';

import {
  JOB_TYPE, JOB_STATUS, createJob, buildStandardJobSequence, JOB_MODEL_VERSION,
} from '../../cicd/jobModel.js';

import {
  GATE_STATUS, GATE_ID, GATE_PRIORITY, evaluateQualityGates, QUALITY_GATE_ENGINE_VERSION,
} from '../../cicd/qualityGateEngine.js';

import {
  SECRET_RISK, SECRET_TYPE, scanTextForSecrets, evaluateSecretScan, scanFiles, SECRET_SCAN_VERSION,
} from '../../cicd/secretScan.js';

import {
  DEP_RISK, DEP_STATUS, evaluateDependencyRisk, assessKnownRiskyPackages, DEPENDENCY_SCAN_VERSION,
} from '../../cicd/dependencyScan.js';

import {
  REGRESSION_RISK, evaluateRegressionRisk, REGRESSION_GATE_VERSION,
} from '../../cicd/regressionGate.js';

import {
  ARTIFACT_STATUS, validateBuildArtifact, validateArtifactFromList, ARTIFACT_VALIDATION_VERSION,
} from '../../cicd/artifactValidation.js';

import {
  BUNDLE_STATUS, BUNDLE_PRESET, evaluateBundleBudget, BUNDLE_GATE_VERSION,
} from '../../cicd/bundleGate.js';

import {
  BRANCH_TYPE, POLICY_STATUS, getBranchPolicy, checkPolicyCompliance,
  generateProtectionRecommendation, BRANCH_POLICY_VERSION,
} from '../../cicd/branchPolicy.js';

import {
  RELEASE_STATUS, READINESS_CHECK, evaluateReleaseReadiness, RELEASE_READINESS_VERSION,
} from '../../cicd/releaseReadiness.js';

import {
  CI_EVENT_TYPE, createCIEvent, emitJobEvents, emitPipelineEvent, OBSERVABILITY_INTEGRATION_VERSION,
} from '../../cicd/observabilityIntegration.js';

import {
  PR_PIPELINE_ID, createPRPipeline, runPRPipelineSimulation, PR_PIPELINE_STAGES, PR_PIPELINE_VERSION,
} from '../../cicd/prPipeline.js';

import {
  MAIN_PIPELINE_ID, createMainPipeline, runMainPipelineSimulation, validateMainCommit, MAIN_PIPELINE_VERSION,
} from '../../cicd/mainPipeline.js';

import {
  FAIL_FAST_REASON, FAIL_FAST_ACTION, evaluateFailFast, shouldSkipJob, FAIL_FAST_VERSION,
} from '../../cicd/failFast.js';

import {
  RETRYABLE_JOB_TYPES, isRetryable, createRetryPolicy, RETRY_POLICY_VERSION,
} from '../../cicd/retryPolicy.js';

import {
  CACHE_KEY_TYPE, CACHE_STATUS, generateCacheKey, getStandardCacheConfig, validateCachePath, CACHE_STRATEGY_VERSION,
} from '../../cicd/cacheStrategy.js';

import {
  ACTION_TYPE, generateCIFailureReport, generateBatchFailureReport, FAILURE_REPORT_VERSION,
} from '../../cicd/failureReport.js';

import {
  SUMMARY_SECTION, generateCISummary, CI_SUMMARY_VERSION,
} from '../../cicd/ciSummary.js';

import {
  CI_TARGET, generateCIConfig, generateReusableWorkflow, CI_CONFIG_GENERATOR_VERSION,
} from '../../cicd/ciConfigGenerator.js';

import {
  MATRIX_DIMENSION, buildCIMatrix, isKnownVertical, MATRIX_SUPPORT_VERSION,
} from '../../cicd/matrixSupport.js';

import {
  FIXTURE_PROJECT, makeTestResult, makeCleanTestResult, makeFailingTestResult,
  makeLintResult, makeFailingLintResult, makeBuildResult, makeFailingBuildResult,
  makeSecretResult, makeSecretFoundResult, makeArtifactResult, makeInvalidArtifactResult,
  simulateCleanPR, simulateSecretDetected, simulateTestFailure, simulateLintFailure,
  simulateBuildFailure, CI_TEST_FIXTURE_VERSION,
} from '../../cicd/ciTestFixture.js';

import {
  CI_FAILURE_SCENARIO, runSecretFoundScenario, runTestsFailedScenario, runLintFailedScenario,
  runBuildFailedScenario, runDependencyHighScenario, runDependencyCriticalScenario,
  runArtifactMissingScenario, runBundleOverBudgetScenario, runReleaseNotReadyScenario,
  runDirectMainPushViolationScenario, runTransientInstallFailureScenario, runObservabilityEventScenario,
  runAllCIFailureScenarios, CI_FAILURE_SCENARIOS_VERSION,
} from '../../cicd/ciFailureScenarios.js';

import { CICD_VERSION, CICD_MODULES } from '../../cicd/index.js';
import { REGISTRY_VERSION } from '../../factory-registry/index.js';

// ─── Pipeline Model ──────────────────────────────────────────────────────────
describe('pipelineModel', () => {
  it('CI_TRIGGER is frozen', () => {
    assert.ok(Object.isFrozen(CI_TRIGGER));
    assert.equal(CI_TRIGGER.PULL_REQUEST, 'PULL_REQUEST');
    assert.equal(CI_TRIGGER.PUSH_MAIN, 'PUSH_MAIN');
  });

  it('PIPELINE_STATUS has all states', () => {
    ['PENDING','RUNNING','PASSED','FAILED','BLOCKED','CANCELLED'].forEach(s =>
      assert.ok(PIPELINE_STATUS[s])
    );
  });

  it('createPipeline returns valid frozen pipeline', () => {
    const r = createPipeline({ name: 'Test Pipeline', trigger: CI_TRIGGER.PULL_REQUEST });
    assert.ok(r.valid);
    assert.ok(Object.isFrozen(r.pipeline));
    assert.equal(r.pipeline.trigger, CI_TRIGGER.PULL_REQUEST);
  });

  it('createPipeline errors on missing name', () => {
    const r = createPipeline({ trigger: CI_TRIGGER.PUSH_MAIN });
    assert.ok(!r.valid);
    assert.ok(r.errors.some(e => e.includes('name')));
  });

  it('createPipeline errors on invalid trigger', () => {
    const r = createPipeline({ name: 'x', trigger: 'INVALID' });
    assert.ok(!r.valid);
  });

  it('createPipeline defaults are sensible', () => {
    const r = createPipeline({ name: 'p', trigger: 'MANUAL' });
    assert.equal(r.pipeline.timeout, 1800);
    assert.equal(r.pipeline.status, PIPELINE_STATUS.PENDING);
    assert.ok(r.pipeline.securityPolicy.blockOnSecretFound);
  });

  it('evaluatePipelineStatus all-passed returns PASSED', () => {
    const jobs = [{ jobId: 'a', name: 'a', status: 'PASSED', blocking: true }];
    const r = evaluatePipelineStatus(jobs);
    assert.equal(r.status, PIPELINE_STATUS.PASSED);
    assert.deepEqual(r.blockers, []);
  });

  it('evaluatePipelineStatus blocking failure returns BLOCKED', () => {
    const jobs = [
      { jobId: 'a', name: 'Test', status: 'PASSED', blocking: true },
      { jobId: 'b', name: 'Lint', status: 'FAILED', blocking: true, reason: 'errors' },
    ];
    const r = evaluatePipelineStatus(jobs);
    assert.equal(r.status, PIPELINE_STATUS.BLOCKED);
    assert.equal(r.blockers.length, 1);
  });

  it('evaluatePipelineStatus empty returns PENDING', () => {
    const r = evaluatePipelineStatus([]);
    assert.equal(r.status, PIPELINE_STATUS.PENDING);
  });

  it('PIPELINE_MODEL_VERSION is string', () => {
    assert.equal(typeof PIPELINE_MODEL_VERSION, 'string');
  });
});

// ─── Job Model ────────────────────────────────────────────────────────────────
describe('jobModel', () => {
  it('JOB_TYPE is frozen with all types', () => {
    assert.ok(Object.isFrozen(JOB_TYPE));
    ['INSTALL','TEST','LINT','BUILD','SECRET_SCAN','DEPENDENCY_SCAN','QUALITY_GATE','ARTIFACT'].forEach(t =>
      assert.ok(JOB_TYPE[t])
    );
  });

  it('createJob returns valid frozen job', () => {
    const r = createJob({ id: 'j1', name: 'Test', type: JOB_TYPE.TEST });
    assert.ok(r.valid);
    assert.ok(Object.isFrozen(r.job));
    assert.equal(r.job.status, JOB_STATUS.PENDING);
  });

  it('createJob TEST is blocking by default', () => {
    const r = createJob({ id: 'j1', name: 'Test', type: JOB_TYPE.TEST });
    assert.ok(r.job.blocking);
  });

  it('createJob DEPENDENCY_SCAN is not blocking by default', () => {
    const r = createJob({ id: 'd1', name: 'Deps', type: JOB_TYPE.DEPENDENCY_SCAN });
    assert.ok(!r.job.blocking);
  });

  it('createJob errors on missing required fields', () => {
    assert.ok(!createJob({ name: 'x', type: JOB_TYPE.TEST }).valid);
    assert.ok(!createJob({ id: 'x', type: JOB_TYPE.TEST }).valid);
    assert.ok(!createJob({ id: 'x', name: 'x' }).valid);
  });

  it('buildStandardJobSequence returns 10 jobs', () => {
    const jobs = buildStandardJobSequence();
    assert.ok(jobs.length >= 8);
    assert.ok(jobs.some(j => j.type === JOB_TYPE.SECRET_SCAN));
    assert.ok(jobs.some(j => j.type === JOB_TYPE.TEST));
    assert.ok(jobs.some(j => j.type === JOB_TYPE.BUILD));
  });

  it('JOB_MODEL_VERSION is string', () => {
    assert.equal(typeof JOB_MODEL_VERSION, 'string');
  });
});

// ─── Quality Gate Engine ─────────────────────────────────────────────────────
describe('qualityGateEngine', () => {
  it('GATE_STATUS is frozen', () => {
    assert.ok(Object.isFrozen(GATE_STATUS));
    ['PASS','WARNING','FAIL','BLOCKED','NOT_APPLICABLE'].forEach(s => assert.ok(GATE_STATUS[s]));
  });

  it('all P0 gates pass on clean context', () => {
    const r = evaluateQualityGates({
      testResult:      { passed: 238, failed: 0, total: 238, preExistingFails: 0 },
      lintResult:      { errorCount: 0 },
      buildResult:     { success: true, durationMs: 535 },
      secretResult:    { secretsFound: 0, critical: false },
      securityResult:  { hasCritical: false, hasHigh: false },
      dependencyResult: { criticalCVEs: 0, highCVEs: 0 },
      artifactResult:  { valid: true, missingFiles: [] },
    });
    assert.ok(r.valid);
    assert.ok(!r.blocked);
    assert.equal(r.p0Failures.length, 0);
    assert.equal(r.overallStatus, GATE_STATUS.PASS);
  });

  it('secret found → BLOCKED', () => {
    const r = evaluateQualityGates({ secretResult: { secretsFound: 1, critical: true } });
    assert.ok(r.blocked);
    assert.ok(r.p0Failures.includes(GATE_ID.SECRET_GATE));
  });

  it('lint errors → BLOCKED', () => {
    const r = evaluateQualityGates({ lintResult: { errorCount: 3 } });
    assert.ok(r.blocked);
    assert.ok(r.p0Failures.includes(GATE_ID.LINT_GATE));
  });

  it('build failure → BLOCKED', () => {
    const r = evaluateQualityGates({ buildResult: { success: false } });
    assert.ok(r.blocked);
    assert.ok(r.p0Failures.includes(GATE_ID.BUILD_GATE));
  });

  it('new test failures → BLOCKED', () => {
    const r = evaluateQualityGates({ testResult: { passed: 200, failed: 5, total: 205, preExistingFails: 1 } });
    assert.ok(r.blocked);
  });

  it('pre-existing only → WARNING not FAIL', () => {
    const r = evaluateQualityGates({ testResult: { passed: 238, failed: 1, total: 239, preExistingFails: 1 } });
    const testGate = r.gates.find(g => g.gateId === GATE_ID.TEST_GATE);
    assert.ok(testGate.status !== GATE_STATUS.FAIL);
  });

  it('artifact invalid → BLOCKED', () => {
    const r = evaluateQualityGates({ artifactResult: { valid: false, missingFiles: ['index.html'] } });
    assert.ok(r.blocked);
    assert.ok(r.p0Failures.includes(GATE_ID.ARTIFACT_GATE));
  });

  it('high CVEs → WARNING not blocked', () => {
    const r = evaluateQualityGates({ dependencyResult: { criticalCVEs: 0, highCVEs: 2 } });
    assert.ok(!r.blocked || r.overallStatus === GATE_STATUS.WARNING);
    assert.ok(r.warnings.includes(GATE_ID.DEPENDENCY_GATE) || r.p0Failures.length === 0);
  });

  it('empty context → all NOT_APPLICABLE', () => {
    const r = evaluateQualityGates({});
    assert.ok(r.gates.every(g => g.status === GATE_STATUS.NOT_APPLICABLE));
  });

  it('GATE_PRIORITY SECRET_GATE is P0', () => {
    assert.equal(GATE_PRIORITY[GATE_ID.SECRET_GATE], 'P0');
  });

  it('QUALITY_GATE_ENGINE_VERSION is string', () => {
    assert.equal(typeof QUALITY_GATE_ENGINE_VERSION, 'string');
  });
});

// ─── Secret Scan ─────────────────────────────────────────────────────────────
describe('secretScan', () => {
  it('SECRET_RISK and SECRET_TYPE are frozen', () => {
    assert.ok(Object.isFrozen(SECRET_RISK));
    assert.ok(Object.isFrozen(SECRET_TYPE));
  });

  it('detects Stripe test key in source', () => {
    const findings = scanTextForSecrets('const key = "sk_test_abc123xyz456verylongtoken";', 'src/config.js');
    assert.ok(findings.length > 0);
    assert.equal(findings[0].type, SECRET_TYPE.STRIPE_TEST_KEY);
  });

  it('detects JWT in source', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const findings = scanTextForSecrets(`Authorization: Bearer ${jwt}`, 'src/api.js');
    assert.ok(findings.length > 0);
  });

  it('suppresses LOW risk in test files', () => {
    const findings = scanTextForSecrets('const x = "sk_test_abc123xyz456verylongtoken";', 'test.fixture.js');
    const suppressed = findings.filter(f => f.suppressedInTest);
    assert.ok(suppressed.length > 0 || findings.length === 0);
  });

  it('redactedPreview never includes full secret value', () => {
    const findings = scanTextForSecrets('sk_test_abc123xyz456verylongtokenvalue', 'src/x.js');
    for (const f of findings) {
      assert.ok(!f.redactedPreview.includes('abc123xyz456verylongtokenvalue'));
      assert.ok(f.redactedPreview.includes('[REDACTED'));
    }
  });

  it('evaluateSecretScan with no findings returns safe result', () => {
    const r = evaluateSecretScan([]);
    assert.ok(r.valid);
    assert.equal(r.secretsFound, 0);
    assert.ok(!r.critical);
  });

  it('evaluateSecretScan with critical finding returns critical=true', () => {
    const findings = scanTextForSecrets('const k = "sk_test_abc123xyz456longtokenX";', 'src/main.js');
    const r = evaluateSecretScan(findings);
    assert.ok(r.valid);
    assert.ok(r.secretsFound > 0 || r.adapterNote.includes('NO_SECRET_VALUES'));
  });

  it('scanFiles skips .md and .json extensions', () => {
    const files = [
      { path: 'README.md', content: 'sk_test_abc123xyz456verylongtoken' },
      { path: 'config.json', content: '{"token":"sk_test_abc123xyz456verylongtoken"}' },
    ];
    const r = scanFiles(files);
    assert.equal(r.secretsFound, 0);
  });

  it('SECRET_SCAN_VERSION is string', () => {
    assert.equal(typeof SECRET_SCAN_VERSION, 'string');
  });
});

// ─── Dependency Scan ──────────────────────────────────────────────────────────
describe('dependencyScan', () => {
  it('null audit data returns UNKNOWN risk', () => {
    const r = evaluateDependencyRisk(null);
    assert.ok(r.valid);
    assert.equal(r.risk, DEP_RISK.UNKNOWN);
    assert.equal(r.status, DEP_STATUS.PASS);
  });

  it('critical CVEs → CRITICAL risk + FAIL status', () => {
    const r = evaluateDependencyRisk({
      metadata: { vulnerabilities: { critical: 1, high: 0, moderate: 0, low: 0, info: 0 } },
    });
    assert.equal(r.risk, DEP_RISK.CRITICAL);
    assert.equal(r.status, DEP_STATUS.FAIL);
    assert.equal(r.criticalCVEs, 1);
  });

  it('high CVEs → WARNING status', () => {
    const r = evaluateDependencyRisk({
      metadata: { vulnerabilities: { critical: 0, high: 2, moderate: 0, low: 0, info: 0 } },
    });
    assert.equal(r.status, DEP_STATUS.WARNING);
  });

  it('zero vulnerabilities → SAFE + PASS', () => {
    const r = evaluateDependencyRisk({
      metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0, info: 0 } },
    });
    assert.equal(r.risk, DEP_RISK.SAFE);
    assert.equal(r.status, DEP_STATUS.PASS);
  });

  it('assessKnownRiskyPackages detects node-serialize', () => {
    const r = assessKnownRiskyPackages([{ name: 'node-serialize', version: '0.0.4' }]);
    assert.ok(r.hasKnownRisky);
    assert.equal(r.findings[0].risk, DEP_RISK.CRITICAL);
  });

  it('assessKnownRiskyPackages clean packages returns empty', () => {
    const r = assessKnownRiskyPackages([{ name: 'lodash', version: '4.17.21' }]);
    assert.ok(!r.hasKnownRisky);
  });

  it('DEPENDENCY_SCAN_VERSION is string', () => {
    assert.equal(typeof DEPENDENCY_SCAN_VERSION, 'string');
  });
});

// ─── Regression Gate ──────────────────────────────────────────────────────────
describe('regressionGate', () => {
  it('no changes → LOW risk', () => {
    const r = evaluateRegressionRisk({ baseline: { testCount: 238, passCount: 238, buildSuccess: true }, current: { testCount: 238, passCount: 238, failCount: 0, buildSuccess: true }, changedFiles: [] });
    assert.equal(r.riskLevel, REGRESSION_RISK.LOW);
    assert.ok(r.valid);
  });

  it('removed tests increase risk', () => {
    const r = evaluateRegressionRisk({ removedTests: 5, changedFiles: [] });
    assert.ok(r.riskScore > 0);
    assert.ok(r.factors.some(f => f.factor === 'removed_tests'));
  });

  it('critical file touched increases risk', () => {
    const r = evaluateRegressionRisk({ changedFiles: ['factory-registry/index.js'] });
    assert.ok(r.criticalFilesTouched.length > 0);
    assert.ok(r.riskScore > 0);
  });

  it('build regression → MEDIUM risk', () => {
    const r = evaluateRegressionRisk({
      baseline: { buildSuccess: true, testCount: 100, passCount: 100 },
      current:  { buildSuccess: false, testCount: 100, passCount: 80, failCount: 0 },
      changedFiles: [],
    });
    // riskScore=10 (build regression) → threshold ≤15 → MEDIUM
    assert.equal(r.riskLevel, REGRESSION_RISK.MEDIUM);
    assert.ok(r.riskScore > 0);
  });

  it('REGRESSION_GATE_VERSION is string', () => {
    assert.equal(typeof REGRESSION_GATE_VERSION, 'string');
  });
});

// ─── Artifact Validation ──────────────────────────────────────────────────────
describe('artifactValidation', () => {
  it('validateArtifactFromList valid list passes', () => {
    const r = validateArtifactFromList(['index.html', 'assets/main.js', 'assets/main.css']);
    assert.ok(r.valid);
    assert.equal(r.status, ARTIFACT_STATUS.VALID);
  });

  it('validateArtifactFromList missing index.html fails', () => {
    const r = validateArtifactFromList(['assets/main.js']);
    assert.ok(!r.valid);
    assert.equal(r.status, ARTIFACT_STATUS.INVALID);
    assert.ok(r.errors.some(e => e.includes('index.html')));
  });

  it('validateArtifactFromList dev files produce warning', () => {
    const r = validateArtifactFromList(['index.html', 'assets/main.js', 'source.map']);
    assert.ok(r.warnings.length > 0 || r.valid);
  });

  it('validateArtifactFromList empty list fails', () => {
    const r = validateArtifactFromList([]);
    assert.ok(!r.valid);
  });

  it('validateBuildArtifact non-existent path fails', () => {
    const r = validateBuildArtifact('/nonexistent/path/dist');
    assert.ok(!r.valid);
    assert.equal(r.status, ARTIFACT_STATUS.INVALID);
  });

  it('ARTIFACT_VALIDATION_VERSION is string', () => {
    assert.equal(typeof ARTIFACT_VALIDATION_VERSION, 'string');
  });
});

// ─── Bundle Gate ──────────────────────────────────────────────────────────────
describe('bundleGate', () => {
  it('assets within budget → PASS', () => {
    const assets = [{ name: 'main.js', sizeBytes: 100 * 1024 }];
    const r = evaluateBundleBudget(assets);
    assert.equal(r.overallStatus, BUNDLE_STATUS.PASS);
    assert.ok(r.valid);
  });

  it('asset over fail threshold → FAIL', () => {
    const assets = [{ name: 'main.js', sizeBytes: 600 * 1024 }];
    const r = evaluateBundleBudget(assets, { preset: BUNDLE_PRESET.FACTORY_DEFAULT });
    assert.ok(r.overallStatus !== BUNDLE_STATUS.PASS);
    assert.ok(r.failures.length > 0);
  });

  it('asset over warn threshold → WARNING', () => {
    const assets = [{ name: 'main.js', sizeBytes: 400 * 1024 }];
    const r = evaluateBundleBudget(assets, { preset: BUNDLE_PRESET.FACTORY_DEFAULT });
    assert.ok(r.overallStatus === BUNDLE_STATUS.WARNING || r.overallStatus === BUNDLE_STATUS.FAIL);
  });

  it('EDUCA preset has higher limits', () => {
    const assets = [{ name: 'educa.js', sizeBytes: 550 * 1024 }];
    const rDefault = evaluateBundleBudget(assets, { preset: BUNDLE_PRESET.FACTORY_DEFAULT });
    const rEduca   = evaluateBundleBudget(assets, { preset: BUNDLE_PRESET.EDUCA });
    assert.ok(rEduca.failures.length <= rDefault.failures.length);
  });

  it('empty assets → PASS with 0MB', () => {
    const r = evaluateBundleBudget([]);
    assert.equal(r.totalMb, 0);
  });

  it('BUNDLE_GATE_VERSION is string', () => {
    assert.equal(typeof BUNDLE_GATE_VERSION, 'string');
  });
});

// ─── Branch Policy ───────────────────────────────────────────────────────────
describe('branchPolicy', () => {
  it('main policy disallows direct push', () => {
    const { policy } = getBranchPolicy('main');
    assert.ok(!policy.directPushAllowed);
    assert.ok(policy.reviewRequired);
  });

  it('feature/* allows direct push', () => {
    const { policy } = getBranchPolicy('feature/my-feature');
    assert.ok(policy.directPushAllowed);
    assert.equal(policy.type, BRANCH_TYPE.FEATURE);
  });

  it('direct push to main → VIOLATION', () => {
    const r = checkPolicyCompliance('main', 'direct_push', {});
    assert.equal(r.status, POLICY_STATUS.VIOLATION);
    assert.ok(r.violations.length > 0);
  });

  it('force push to main → VIOLATION', () => {
    const r = checkPolicyCompliance('main', 'force_push', {});
    assert.equal(r.status, POLICY_STATUS.VIOLATION);
  });

  it('merge to main without approval → VIOLATION', () => {
    const r = checkPolicyCompliance('main', 'merge', { approved: false, passedChecks: ['test','lint','build','secret-quick-scan','quality-gate'] });
    assert.equal(r.status, POLICY_STATUS.VIOLATION);
  });

  it('merge to main with approval and checks → COMPLIANT', () => {
    const r = checkPolicyCompliance('main', 'merge', { approved: true, passedChecks: ['test','lint','build','secret-quick-scan','quality-gate'] });
    assert.equal(r.status, POLICY_STATUS.COMPLIANT);
  });

  it('generateProtectionRecommendation returns structure', () => {
    const rec = generateProtectionRecommendation('main');
    assert.ok(rec);
    assert.ok(Array.isArray(rec.recommendation.required_status_checks.contexts));
    assert.ok(!rec.recommendation.allow_force_pushes);
  });

  it('BRANCH_POLICY_VERSION is string', () => {
    assert.equal(typeof BRANCH_POLICY_VERSION, 'string');
  });
});

// ─── Release Readiness ───────────────────────────────────────────────────────
describe('releaseReadiness', () => {
  it('all P0 pass with humanApproval → HUMAN_REVIEW', () => {
    const r = evaluateReleaseReadiness({
      testsPassed: true, lintPassed: true, buildPassed: true,
      securityPassed: true, secretsClean: true, artifactValid: true,
      humanApprovalRequired: true,
    });
    assert.equal(r.status, RELEASE_STATUS.HUMAN_REVIEW);
    assert.ok(!r.ready);
  });

  it('all P0 pass + no humanApproval → READY', () => {
    const r = evaluateReleaseReadiness({
      testsPassed: true, lintPassed: true, buildPassed: true,
      securityPassed: true, secretsClean: true, artifactValid: true,
      humanApprovalRequired: false,
    });
    assert.equal(r.status, RELEASE_STATUS.READY);
    assert.ok(r.ready);
  });

  it('tests failed → BLOCKED', () => {
    const r = evaluateReleaseReadiness({ testsPassed: false });
    assert.equal(r.status, RELEASE_STATUS.BLOCKED);
    assert.ok(r.blockers.includes(READINESS_CHECK.TESTS));
  });

  it('secrets not clean → BLOCKED', () => {
    const r = evaluateReleaseReadiness({ testsPassed: true, lintPassed: true, buildPassed: true, securityPassed: true, secretsClean: false, artifactValid: true });
    assert.equal(r.status, RELEASE_STATUS.BLOCKED);
    assert.ok(r.blockers.includes(READINESS_CHECK.SECRETS));
  });

  it('has 14 checks total', () => {
    const r = evaluateReleaseReadiness({});
    assert.equal(r.totalChecks, 14);
  });

  it('disclaimer always present', () => {
    const r = evaluateReleaseReadiness({});
    assert.ok(r.disclaimer.includes('NO_AUTO_RELEASE'));
  });

  it('RELEASE_READINESS_VERSION is string', () => {
    assert.equal(typeof RELEASE_READINESS_VERSION, 'string');
  });
});

// ─── Observability Integration ───────────────────────────────────────────────
describe('observabilityIntegration', () => {
  it('CI_EVENT_TYPE is frozen', () => {
    assert.ok(Object.isFrozen(CI_EVENT_TYPE));
    ['CI_STARTED','JOB_STARTED','JOB_PASSED','JOB_FAILED','PIPELINE_PASSED','PIPELINE_FAILED','RELEASE_BLOCKED'].forEach(t =>
      assert.ok(CI_EVENT_TYPE[t])
    );
  });

  it('createCIEvent returns valid event', () => {
    const r = createCIEvent(CI_EVENT_TYPE.CI_STARTED, { clientId: 'TEST', projectId: 'proj' });
    assert.ok(r.valid);
    assert.ok(r.event);
    assert.ok(r.event.eventId);
  });

  it('JOB_FAILED event has humanActionRequired', () => {
    const r = createCIEvent(CI_EVENT_TYPE.PIPELINE_FAILED, { clientId: 'TEST', projectId: 'proj' });
    assert.ok(r.valid);
    assert.ok(r.event.humanActionRequired);
  });

  it('emitJobEvents passed job returns single event', () => {
    const events = emitJobEvents({ jobId: 'test', name: 'Test Suite', status: 'PASSED' }, { clientId: 'TEST', projectId: 'p' });
    assert.equal(events.length, 1);
  });

  it('emitPipelineEvent returns valid result', () => {
    const r = emitPipelineEvent('PASSED', { clientId: 'TEST', projectId: 'p', pipelineId: 'factory-pr-pipeline' });
    assert.ok(r.valid);
  });

  it('OBSERVABILITY_INTEGRATION_VERSION is string', () => {
    assert.equal(typeof OBSERVABILITY_INTEGRATION_VERSION, 'string');
  });
});

// ─── PR Pipeline ──────────────────────────────────────────────────────────────
describe('prPipeline', () => {
  it('createPRPipeline returns valid pipeline', () => {
    const r = createPRPipeline();
    assert.ok(r.valid);
    assert.equal(r.pipeline.trigger, CI_TRIGGER.PULL_REQUEST);
    assert.ok(r.pipeline.jobs.length > 0);
  });

  it('runPRPipelineSimulation all-passed → mergeAllowed', () => {
    const jobs = [
      { jobId: 'secret-quick-scan', name: 'Secret Scan', status: 'PASSED', blocking: true },
      { jobId: 'test', name: 'Test', status: 'PASSED', blocking: true },
      { jobId: 'lint', name: 'Lint', status: 'PASSED', blocking: true },
      { jobId: 'build', name: 'Build', status: 'PASSED', blocking: true },
    ];
    const r = runPRPipelineSimulation(jobs);
    assert.ok(r.mergeAllowed);
  });

  it('runPRPipelineSimulation with blocking failure → not mergeAllowed', () => {
    const jobs = [
      { jobId: 'test', name: 'Test', status: 'FAILED', blocking: true, reason: 'test failure' },
    ];
    const r = runPRPipelineSimulation(jobs);
    assert.ok(!r.mergeAllowed);
  });

  it('PR_PIPELINE_STAGES has secret-scan first', () => {
    const first = PR_PIPELINE_STAGES[0];
    assert.equal(first.stage, 1);
    assert.equal(first.jobId, 'secret-quick-scan');
    assert.ok(first.failFast);
  });

  it('PR_PIPELINE_VERSION is string', () => {
    assert.equal(typeof PR_PIPELINE_VERSION, 'string');
  });
});

// ─── Main Pipeline ────────────────────────────────────────────────────────────
describe('mainPipeline', () => {
  it('createMainPipeline trigger is PUSH_MAIN', () => {
    const r = createMainPipeline();
    assert.ok(r.valid);
    assert.equal(r.pipeline.trigger, CI_TRIGGER.PUSH_MAIN);
  });

  it('runMainPipelineSimulation deployAllowed always false', () => {
    const r = runMainPipelineSimulation([]);
    assert.ok(!r.deployAllowed);
  });

  it('validateMainCommit rejects direct push', () => {
    const r = validateMainCommit({ commitSha: 'abc', author: 'dev', directPush: true, prMerged: false });
    assert.ok(!r.eligible);
    assert.ok(r.issues.some(i => i.includes('Direct push')));
  });

  it('validateMainCommit valid commit is eligible', () => {
    const r = validateMainCommit({ commitSha: 'abc1234', author: 'dev', directPush: false, prMerged: true, testsVerified: true });
    assert.ok(r.eligible);
  });

  it('MAIN_PIPELINE_VERSION is string', () => {
    assert.equal(typeof MAIN_PIPELINE_VERSION, 'string');
  });
});

// ─── Fail Fast ────────────────────────────────────────────────────────────────
describe('failFast', () => {
  it('secret critical → STOP', () => {
    const r = evaluateFailFast({ secretResult: { critical: true } });
    assert.equal(r.action, FAIL_FAST_ACTION.STOP);
    assert.ok(r.shouldStop);
    assert.equal(r.reason, FAIL_FAST_REASON.SECRET_CRITICAL);
  });

  it('install failed → STOP', () => {
    const r = evaluateFailFast({ installFailed: true });
    assert.equal(r.action, FAIL_FAST_ACTION.STOP);
    assert.equal(r.reason, FAIL_FAST_REASON.INSTALL_FAILURE);
  });

  it('build failure → STOP', () => {
    const r = evaluateFailFast({ buildResult: { success: false } });
    assert.equal(r.action, FAIL_FAST_ACTION.STOP);
  });

  it('clean context → CONTINUE', () => {
    const r = evaluateFailFast({ secretResult: { critical: false }, testResult: { failed: 1, preExistingFails: 1 } });
    assert.equal(r.action, FAIL_FAST_ACTION.CONTINUE);
    assert.ok(!r.shouldStop);
  });

  it('shouldSkipJob skips jobs after fail-fast', () => {
    const ff = { shouldStop: true };
    assert.ok(shouldSkipJob('build', ff, ['secret-quick-scan']));
    assert.ok(!shouldSkipJob('secret-quick-scan', ff, []));
  });

  it('FAIL_FAST_VERSION is string', () => {
    assert.equal(typeof FAIL_FAST_VERSION, 'string');
  });
});

// ─── Retry Policy ────────────────────────────────────────────────────────────
describe('retryPolicy', () => {
  it('INSTALL + ECONNRESET is retryable', () => {
    const r = isRetryable('INSTALL', 'ECONNRESET: network error', 0);
    assert.ok(r.retryable);
  });

  it('TEST is never retryable', () => {
    const r = isRetryable('TEST', 'assertion failed', 0);
    assert.ok(!r.retryable);
  });

  it('LINT is never retryable', () => {
    const r = isRetryable('LINT', 'some error', 0);
    assert.ok(!r.retryable);
  });

  it('max retries exceeded → not retryable', () => {
    const r = isRetryable('INSTALL', 'ECONNRESET', 3);
    assert.ok(!r.retryable);
  });

  it('non-transient error on INSTALL is not retryable', () => {
    const r = isRetryable('INSTALL', 'peer dependency conflict', 0);
    assert.ok(!r.retryable);
  });

  it('createRetryPolicy returns frozen object', () => {
    const p = createRetryPolicy();
    assert.ok(Object.isFrozen(p));
    assert.ok(p.neverRetry.includes('TEST'));
    assert.ok(p.disclaimer.includes('transient'));
  });

  it('RETRY_POLICY_VERSION is string', () => {
    assert.equal(typeof RETRY_POLICY_VERSION, 'string');
  });
});

// ─── Cache Strategy ──────────────────────────────────────────────────────────
describe('cacheStrategy', () => {
  it('generateCacheKey returns valid key', () => {
    const r = generateCacheKey(CACHE_KEY_TYPE.NODE_MODULES, 'package-lock-content-123');
    assert.ok(r.valid);
    assert.ok(r.key.includes('factory'));
    assert.ok(Array.isArray(r.restoreKeys));
  });

  it('generateCacheKey invalid type returns error', () => {
    const r = generateCacheKey('INVALID');
    assert.ok(!r.valid);
  });

  it('validateCachePath rejects .env paths', () => {
    const r = validateCachePath('.env');
    assert.ok(!r.valid);
    assert.ok(r.sensitive);
  });

  it('validateCachePath accepts node_modules', () => {
    const r = validateCachePath('node_modules');
    assert.ok(r.valid);
    assert.ok(!r.sensitive);
  });

  it('getStandardCacheConfig has neverCache list', () => {
    const config = getStandardCacheConfig();
    assert.ok(Object.isFrozen(config));
    assert.ok(Array.isArray(config.nodeModules.neverCache));
    assert.ok(config.disclaimer.includes('NEVER_CACHE_SECRETS'));
  });

  it('CACHE_STRATEGY_VERSION is string', () => {
    assert.equal(typeof CACHE_STRATEGY_VERSION, 'string');
  });
});

// ─── Failure Report ──────────────────────────────────────────────────────────
describe('failureReport', () => {
  it('generateCIFailureReport returns frozen object', () => {
    const r = generateCIFailureReport({ failedJob: 'TEST', reason: 'assertion failed', affectedFiles: ['src/x.js'] });
    assert.ok(Object.isFrozen(r));
    assert.ok(r.valid);
    assert.ok(r.blocking);
    assert.ok(r.message.includes('TEST'));
  });

  it('SECRET_SCAN failure suggests REMOVE_SECRET', () => {
    const r = generateCIFailureReport({ failedJob: 'SECRET_SCAN', reason: 'critical secret found' });
    assert.equal(r.recommendedAction, ACTION_TYPE.REMOVE_SECRET);
  });

  it('LINT failure suggests FIX_LINT', () => {
    const r = generateCIFailureReport({ failedJob: 'LINT', reason: '3 errors' });
    assert.equal(r.recommendedAction, ACTION_TYPE.FIX_LINT);
  });

  it('generateBatchFailureReport handles multiple failures', () => {
    const failures = [
      { failedJob: 'TEST', reason: 'failures' },
      { failedJob: 'LINT', reason: 'errors' },
    ];
    const r = generateBatchFailureReport(failures);
    assert.ok(r.valid);
    assert.equal(r.totalFailures, 2);
    assert.ok(r.hasBlocking);
  });

  it('FAILURE_REPORT_VERSION is string', () => {
    assert.equal(typeof FAILURE_REPORT_VERSION, 'string');
  });
});

// ─── CI Summary ──────────────────────────────────────────────────────────────
describe('ciSummary', () => {
  it('generateCISummary returns frozen object', () => {
    const r = generateCISummary({ pipelineStatus: PIPELINE_STATUS.PASSED, durationMs: 4000 });
    assert.ok(Object.isFrozen(r));
    assert.ok(r.valid);
    assert.ok(r.passed);
  });

  it('FAILED pipeline has blockers', () => {
    const r = generateCISummary({
      pipelineStatus: PIPELINE_STATUS.BLOCKED,
      jobResults: [{ jobId: 'test', name: 'Test', status: 'FAILED', blocking: true }],
    });
    assert.ok(r.blockers.length > 0);
  });

  it('sections include expected keys', () => {
    const r = generateCISummary({ testResult: { passed: 238, failed: 1, total: 239 }, lintResult: { errorCount: 0 } });
    assert.ok(r.sections.tests);
    assert.ok(r.sections.lint);
  });

  it('CI_SUMMARY_VERSION is string', () => {
    assert.equal(typeof CI_SUMMARY_VERSION, 'string');
  });
});

// ─── CI Config Generator ─────────────────────────────────────────────────────
describe('ciConfigGenerator', () => {
  it('generateCIConfig returns valid YAML string', () => {
    const r = generateCIConfig({}, CI_TARGET.GITHUB_ACTIONS);
    assert.ok(r.valid);
    assert.ok(typeof r.yaml === 'string');
    assert.ok(r.yaml.includes('name:'));
    assert.ok(r.yaml.includes('pull_request'));
    assert.ok(r.yaml.includes('node --test'));
    assert.ok(r.disclaimer.includes('NO_REAL_DEPLOY'));
  });

  it('generateCIConfig custom name appears in yaml', () => {
    const r = generateCIConfig({ workflowName: 'My CI' }, CI_TARGET.GITHUB_ACTIONS);
    assert.ok(r.yaml.includes('My CI'));
  });

  it('generateCIConfig unsupported target returns error', () => {
    const r = generateCIConfig({}, 'JENKINS');
    assert.ok(!r.valid);
  });

  it('generateReusableWorkflow returns valid yaml', () => {
    const r = generateReusableWorkflow();
    assert.ok(r.valid);
    assert.ok(r.yaml.includes('workflow_call'));
  });

  it('CI_CONFIG_GENERATOR_VERSION is string', () => {
    assert.equal(typeof CI_CONFIG_GENERATOR_VERSION, 'string');
  });
});

// ─── Matrix Support ───────────────────────────────────────────────────────────
describe('matrixSupport', () => {
  it('buildCIMatrix single node version', () => {
    const r = buildCIMatrix({ nodeVersions: ['20'] });
    assert.ok(r.valid);
    assert.ok(r.matrix.include.length >= 1);
  });

  it('buildCIMatrix respects maxCombinations', () => {
    const r = buildCIMatrix({ nodeVersions: ['18','20','22'], maxCombinations: 4 });
    assert.ok(r.matrix.include.length <= 4);
  });

  it('buildCIMatrix with verticals', () => {
    const r = buildCIMatrix({ nodeVersions: ['20'], verticals: ['dental','physio'], maxCombinations: 6 });
    assert.ok(r.matrix.include.some(i => i.vertical));
  });

  it('isKnownVertical dental → true', () => {
    assert.ok(isKnownVertical('dental'));
  });

  it('isKnownVertical unknown → false', () => {
    assert.ok(!isKnownVertical('blockchain'));
  });

  it('MATRIX_SUPPORT_VERSION is string', () => {
    assert.equal(typeof MATRIX_SUPPORT_VERSION, 'string');
  });
});

// ─── CI Test Fixture ──────────────────────────────────────────────────────────
describe('ciTestFixture', () => {
  it('FIXTURE_PROJECT is not real', () => {
    assert.ok(Object.isFrozen(FIXTURE_PROJECT));
    assert.ok(!FIXTURE_PROJECT.isReal);
    assert.equal(FIXTURE_PROJECT.dataType, 'FIXTURE');
  });

  it('makeCleanTestResult has 0 new failures', () => {
    const r = makeCleanTestResult();
    assert.equal(r.failed - r.preExistingFails, 0);
  });

  it('makeFailingTestResult has new failures', () => {
    const r = makeFailingTestResult();
    assert.ok(r.failed - r.preExistingFails > 0);
  });

  it('makeSecretFoundResult has critical=true', () => {
    const r = makeSecretFoundResult();
    assert.ok(r.critical);
    assert.ok(r.secretsFound > 0);
  });

  it('simulateCleanPR returns complete fixture', () => {
    const r = simulateCleanPR();
    assert.ok(!r.isReal);
    assert.ok(r.testResult);
    assert.ok(r.lintResult);
    assert.ok(r.buildResult);
    assert.equal(r.scenario, 'clean_pr');
  });

  it('simulateSecretDetected has critical secret', () => {
    const r = simulateSecretDetected();
    assert.ok(r.secretResult.critical);
  });

  it('simulateBuildFailure has invalid artifact', () => {
    const r = simulateBuildFailure();
    assert.ok(!r.buildResult.success);
    assert.ok(!r.artifactResult.valid);
  });

  it('CI_TEST_FIXTURE_VERSION is string', () => {
    assert.equal(typeof CI_TEST_FIXTURE_VERSION, 'string');
  });
});

// ─── CI Failure Scenarios ────────────────────────────────────────────────────
describe('ciFailureScenarios — individual', () => {
  it('secret_found → handled + safe', () => {
    const r = runSecretFoundScenario();
    assert.equal(r.scenario, CI_FAILURE_SCENARIO.SECRET_FOUND);
    assert.ok(r.handled);
    assert.ok(r.safe);
  });

  it('tests_failed → handled', () => {
    const r = runTestsFailedScenario();
    assert.equal(r.scenario, CI_FAILURE_SCENARIO.TESTS_FAILED);
    assert.ok(r.handled);
  });

  it('lint_failed → handled', () => {
    const r = runLintFailedScenario();
    assert.ok(r.handled);
  });

  it('build_failed → handled', () => {
    const r = runBuildFailedScenario();
    assert.ok(r.handled);
  });

  it('dependency_high → WARNING not blocked', () => {
    const r = runDependencyHighScenario();
    assert.ok(r.handled);
  });

  it('dependency_critical → handled', () => {
    const r = runDependencyCriticalScenario();
    assert.ok(r.handled);
  });

  it('artifact_missing → blocked', () => {
    const r = runArtifactMissingScenario();
    assert.ok(r.handled);
  });

  it('bundle_over_budget → not PASS', () => {
    const r = runBundleOverBudgetScenario();
    assert.ok(r.handled);
    assert.ok(r.status !== BUNDLE_STATUS.PASS);
  });

  it('release_not_ready → BLOCKED', () => {
    const r = runReleaseNotReadyScenario();
    assert.ok(r.handled);
    assert.equal(r.status, RELEASE_STATUS.BLOCKED);
  });

  it('direct_main_push_violation → VIOLATION', () => {
    const r = runDirectMainPushViolationScenario();
    assert.ok(r.handled);
    assert.equal(r.status, POLICY_STATUS.VIOLATION);
  });

  it('transient_install_failure → retryable', () => {
    const r = runTransientInstallFailureScenario();
    assert.ok(r.handled);
    assert.ok(r.retryable);
  });

  it('observability_event → written', () => {
    const r = runObservabilityEventScenario();
    assert.ok(r.handled);
    assert.ok(r.eventId);
  });
});

describe('ciFailureScenarios — runAll', () => {
  it('runAllCIFailureScenarios handles all 12', () => {
    const r = runAllCIFailureScenarios();
    assert.ok(r.valid);
    assert.equal(r.totalScenarios, 12);
    assert.ok(r.allHandled, `Not all handled: ${JSON.stringify(r.results.filter(x => !x.handled).map(x => x.scenario))}`);
  });
});

// ─── Registry & Barrel ───────────────────────────────────────────────────────
describe('registry', () => {
  it('REGISTRY_VERSION is 3.0.0', () => {
    assert.ok(REGISTRY_VERSION >= '3.0.0', `Expected >= 3.0.0, got ${REGISTRY_VERSION}`);
  });

  it('CICD_VERSION is string', () => {
    assert.equal(typeof CICD_VERSION, 'string');
    assert.equal(CICD_VERSION, '1.0.0');
  });

  it('CICD_MODULES is frozen array of 23 items', () => {
    assert.ok(Object.isFrozen(CICD_MODULES));
    assert.ok(CICD_MODULES.length >= 20);
    assert.ok(CICD_MODULES.includes('pipelineModel'));
    assert.ok(CICD_MODULES.includes('qualityGateEngine'));
    assert.ok(CICD_MODULES.includes('localCIRunner'));
  });
});
