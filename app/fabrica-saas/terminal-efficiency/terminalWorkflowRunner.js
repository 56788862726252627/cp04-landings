// Terminal Workflow Runner — ADV-05
// Orchestrates the full factory task flow with minimal commands.

import { analyzeChangeImpact } from './changeImpactAnalyzer.js';
import { buildQualityGatePlan, simulateQualityGateRun, QUALITY_GATE_STATUS, QUALITY_GATE_MODE } from './qualityGateRunner.js';
import { createTerminalCheckpoint, TERMINAL_CHECKPOINT } from './terminalCheckpoint.js';
import { createEfficiencyLogger, EFFICIENCY_EVENT } from './observabilityIntegration.js';
import { buildAutoContinuePlan } from './autoContinuePolicy.js';
import { calculateTerminalSpeedup } from './speedupCalculator.js';

export const WORKFLOW_STATUS = Object.freeze({
  COMPLETED:     'COMPLETED',
  FAILED:        'FAILED',
  WAITING_HUMAN: 'WAITING_HUMAN',
  BLOCKED:       'BLOCKED',
});

export function runFactoryTask(params = {}) {
  const {
    taskId          = '',
    changedFiles    = [],
    riskLevel       = 'LOW',
    promptAuthorized = true,
    qualityOverrides = {},
    baseline        = {},
  } = params;

  if (!taskId) return { valid: false, error: 'taskId required' };

  const logger     = createEfficiencyLogger(`CORR-TASK-${taskId}`);
  const checkpoint = createTerminalCheckpoint(taskId);

  logger.log(EFFICIENCY_EVENT.EFFICIENCY_PLAN_CREATED, { taskId, riskLevel, fileCount: changedFiles.length });

  // Phase 1: inspect context
  const impact = analyzeChangeImpact(changedFiles);
  checkpoint.reach(TERMINAL_CHECKPOINT.AUDIT_DONE);

  // Phase 2: plan commands
  const continuityPlan = buildAutoContinuePlan(['IMPLEMENTATION', 'TARGETED_TESTS', 'LINT', 'BUILD', 'FULL_TESTS', 'COMMIT_PREP', 'COMMIT', 'PUSH'], promptAuthorized);

  // Phase 3: FAST mode validation
  const fastGatePlan = buildQualityGatePlan({ changedFiles, riskLevel, mode: QUALITY_GATE_MODE.FAST });
  logger.log(EFFICIENCY_EVENT.COMMAND_BATCH_STARTED, { mode: 'FAST', steps: fastGatePlan.stepCount });
  const fastResult   = simulateQualityGateRun(fastGatePlan, qualityOverrides);
  logger.log(EFFICIENCY_EVENT.COMMAND_BATCH_COMPLETED, { status: fastResult.status });

  if (fastResult.status === QUALITY_GATE_STATUS.FAIL_FAST) {
    return {
      valid:    true,
      status:   WORKFLOW_STATUS.FAILED,
      failedAt: fastResult.failedAt,
      events:   logger.getEvents(),
      isReal:   false,
    };
  }

  checkpoint.reach(TERMINAL_CHECKPOINT.TARGETED_TESTS_PASS);
  checkpoint.reach(TERMINAL_CHECKPOINT.LINT_PASS);

  // Phase 4: FINAL mode quality gate
  const finalGatePlan = buildQualityGatePlan({ changedFiles, riskLevel, mode: QUALITY_GATE_MODE.FINAL });
  logger.log(EFFICIENCY_EVENT.VALIDATION_OPTIMIZED, { stepsReduced: fastGatePlan.stepCount });
  const finalResult   = simulateQualityGateRun(finalGatePlan, qualityOverrides);

  if (finalResult.status === QUALITY_GATE_STATUS.FAIL_FAST) {
    return {
      valid:    true,
      status:   WORKFLOW_STATUS.FAILED,
      failedAt: finalResult.failedAt,
      events:   logger.getEvents(),
      isReal:   false,
    };
  }

  checkpoint.reach(TERMINAL_CHECKPOINT.FULL_TESTS_PASS);
  checkpoint.reach(TERMINAL_CHECKPOINT.BUILD_PASS);

  // Phase 5: speedup
  const speedup = calculateTerminalSpeedup({
    legacyCommands:    baseline.legacyCommands    ?? 40,
    optimizedCommands: baseline.optimizedCommands ?? 18,
    legacyConfirmations:    baseline.legacyConfirmations    ?? 10,
    optimizedConfirmations: baseline.optimizedConfirmations ?? 1,
    legacyValidationMinutes:    baseline.legacyValidationMinutes    ?? 8,
    optimizedValidationMinutes: baseline.optimizedValidationMinutes ?? 4,
    legacyWallClockMinutes:     baseline.legacyWallClockMinutes     ?? 20,
    optimizedWallClockMinutes:  baseline.optimizedWallClockMinutes  ?? 14,
  });

  logger.log(EFFICIENCY_EVENT.EFFICIENCY_RUN_COMPLETED, { speedupPercent: speedup.totalEstimatedSpeedupPercent });

  return {
    valid:       true,
    status:      WORKFLOW_STATUS.COMPLETED,
    taskId,
    impact:      impact.overallLevel,
    continuity:  continuityPlan,
    fastGate:    fastResult,
    finalGate:   finalResult,
    checkpoint:  checkpoint.summary(),
    speedup,
    events:      logger.getEvents(),
    isReal:      false,
  };
}

export const TERMINAL_WORKFLOW_RUNNER_VERSION = '1.0.0';
