// Validation Planner — ADV-05
// Decides which validations are needed based on changed files and risk.

import { analyzeChangeImpact, IMPACT_LEVEL } from './changeImpactAnalyzer.js';

export const VALIDATION_MODE = Object.freeze({
  FAST:     'FAST',
  MODULE:   'MODULE',
  FULL:     'FULL',
  CRITICAL: 'CRITICAL',
});

export const VALIDATION_PLAN_STATUS = Object.freeze({
  READY:    'READY',
  BLOCKED:  'BLOCKED',
});

export function planValidation(params = {}) {
  const {
    changedFiles    = [],
    riskLevel       = 'LOW',
    currentStage    = 'DEVELOPMENT',
    previousResults = {},
    forceFullSuite  = false,
  } = params;

  const impact = analyzeChangeImpact(changedFiles);
  const isFinalGate = currentStage === 'FINAL_GATE' || forceFullSuite;

  let mode = VALIDATION_MODE.FAST;
  if (forceFullSuite || isFinalGate) mode = VALIDATION_MODE.FULL;
  else if (impact.overallLevel === IMPACT_LEVEL.CRITICAL || riskLevel === 'CRITICAL') mode = VALIDATION_MODE.CRITICAL;
  else if (impact.overallLevel === IMPACT_LEVEL.HIGH || riskLevel === 'HIGH') mode = VALIDATION_MODE.FULL;
  else if (impact.overallLevel === IMPACT_LEVEL.MEDIUM || riskLevel === 'MEDIUM') mode = VALIDATION_MODE.MODULE;

  const targetedTests   = mode === VALIDATION_MODE.FAST || mode === VALIDATION_MODE.MODULE;
  const fullTests       = mode === VALIDATION_MODE.FULL || mode === VALIDATION_MODE.CRITICAL || isFinalGate;
  const lintRequired    = impact.overallLevel !== IMPACT_LEVEL.NONE;
  const buildRequired   = fullTests || impact.hasCritical || isFinalGate;
  const secretScan      = impact.hasCritical || riskLevel === 'CRITICAL' || isFinalGate;
  const fullCI          = isFinalGate || impact.hasCritical;

  const cachedPrev = previousResults.fullTests === true && !impact.hasCritical && !forceFullSuite;

  return {
    valid:          true,
    mode,
    status:         VALIDATION_PLAN_STATUS.READY,
    targetedTests,
    fullTestsRequired: fullTests && !cachedPrev,
    lintRequired,
    buildRequired,
    secretScanRequired: secretScan,
    fullCIRequired: fullCI,
    canSkipBuild:  !buildRequired,
    reusingCache:  cachedPrev,
    impact:        impact.overallLevel,
    isReal:        false,
  };
}

export const VALIDATION_PLANNER_VERSION = '1.0.0';
