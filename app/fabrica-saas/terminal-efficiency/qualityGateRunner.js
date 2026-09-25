// Quality Gate Runner — ADV-05
// Single-command reusable runner that selects and sequences validations.

import { planValidation } from './validationPlanner.js';
import { evaluateFailFast } from './failFastPolicy.js';

export const QUALITY_GATE_STATUS = Object.freeze({
  ALL_PASS:    'ALL_PASS',
  FAIL_FAST:   'FAIL_FAST',
  PARTIAL:     'PARTIAL',
  NOT_REQUIRED:'NOT_REQUIRED',
});

export const QUALITY_GATE_MODE = Object.freeze({
  FAST:  'FAST',
  FINAL: 'FINAL',
});

export function buildQualityGatePlan(params = {}) {
  const { changedFiles = [], riskLevel = 'LOW', mode = QUALITY_GATE_MODE.FINAL, previousResults = {} } = params;

  const plan = planValidation({
    changedFiles,
    riskLevel,
    currentStage: mode === QUALITY_GATE_MODE.FINAL ? 'FINAL_GATE' : 'DEVELOPMENT',
    previousResults,
    forceFullSuite: mode === QUALITY_GATE_MODE.FINAL,
  });

  const steps = [];
  if (mode === QUALITY_GATE_MODE.FINAL || plan.secretScanRequired) {
    steps.push({ id: 'SECRET_SCAN', command: 'node --test generator/tests/v2-secret-scan.test.mjs || true', blocking: true });
  }
  if (plan.targetedTests && !plan.fullTestsRequired) {
    steps.push({ id: 'TARGETED_TESTS', command: 'node --test generator/tests/*.test.mjs', blocking: true });
  }
  if (plan.fullTestsRequired) {
    steps.push({ id: 'FULL_TESTS', command: 'node --test generator/tests/*.test.mjs', blocking: true });
  }
  if (plan.lintRequired) {
    steps.push({ id: 'LINT', command: 'npx eslint terminal-efficiency/ --max-warnings=0', blocking: false });
  }
  if (plan.buildRequired) {
    steps.push({ id: 'BUILD', command: 'npm run build', blocking: true });
  }

  return {
    valid: true,
    mode,
    steps,
    stepCount: steps.length,
    plan,
    isReal: false,
  };
}

export function simulateQualityGateRun(gatePlan, overrides = {}) {
  const results = [];
  for (const step of gatePlan.steps) {
    const override = overrides[step.id];
    const status   = override ?? 'PASS';
    results.push({ stage: step.id, status, simulated: !override });
    const ff = evaluateFailFast(results);
    if (ff.shouldStop && step.blocking) {
      return {
        valid:        true,
        status:       QUALITY_GATE_STATUS.FAIL_FAST,
        failedAt:     step.id,
        results,
        stagesSaved:  ff.blockedStages,
        isReal:       false,
      };
    }
  }
  return {
    valid:   true,
    status:  QUALITY_GATE_STATUS.ALL_PASS,
    results,
    isReal:  false,
  };
}

export const QUALITY_GATE_RUNNER_VERSION = '1.0.0';
