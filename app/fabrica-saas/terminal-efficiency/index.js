// ADV-05 — Terminal Efficiency & Safe Autonomy — Barrel export

export { classifyCommand, filterSafeCommands, COMMAND_TIER, COMMAND_CATEGORY, SAFE_COMMAND_POLICY_VERSION } from './safeCommandPolicy.js';
export { createBatch, groupIntoSafeBatches, BATCH_STRATEGY, BATCH_STATUS, COMMAND_BATCHER_VERSION } from './commandBatcher.js';
export { planValidation, VALIDATION_MODE, VALIDATION_PLAN_STATUS, VALIDATION_PLANNER_VERSION } from './validationPlanner.js';
export { analyzeChangeImpact, analyzeFileImpact, IMPACT_LEVEL, CHANGE_IMPACT_ANALYZER_VERSION } from './changeImpactAnalyzer.js';
export { createValidationResultCache, CACHE_STATUS, CACHEABLE_OPERATIONS, NEVER_CACHE, VALIDATION_RESULT_CACHE_VERSION } from './validationResultCache.js';
export { createTerminalCheckpoint, TERMINAL_CHECKPOINT, TERMINAL_CHECKPOINT_VERSION } from './terminalCheckpoint.js';
export { planParallelExecution, PARALLELISM_DECISION, PARALLEL_EXECUTION_PLANNER_VERSION } from './parallelExecutionPlanner.js';
export { evaluateFailFast, shouldSkipStage, FAIL_FAST_STAGE, FAIL_FAST_POLICY_VERSION } from './failFastPolicy.js';
export { evaluateRetry, classifyError, ERROR_CLASS, RETRY_DECISION, SAFE_RETRY_POLICY_VERSION } from './safeRetryPolicy.js';
export { createRepoContextSnapshot, isSnapshotStale, SNAPSHOT_STATUS, REPO_CONTEXT_SNAPSHOT_VERSION } from './repoContextSnapshot.js';
export { createActiveScopeManager, checkFileScope, filterInScopeFiles, SCOPE_VERDICT, ACTIVE_SCOPE_MANAGER_VERSION } from './activeScopeManager.js';
export { buildQualityGatePlan, simulateQualityGateRun, QUALITY_GATE_STATUS, QUALITY_GATE_MODE, QUALITY_GATE_RUNNER_VERSION } from './qualityGateRunner.js';
export { evaluateContinuity, buildAutoContinuePlan, STAGE_CONTINUITY, AUTO_CONTINUE_POLICY_VERSION } from './autoContinuePolicy.js';
export { runFactoryTask, WORKFLOW_STATUS, TERMINAL_WORKFLOW_RUNNER_VERSION } from './terminalWorkflowRunner.js';
export { evaluateInterruption, shouldInterrupt, INTERRUPTION_DECISION, INTERRUPTION_REASON, HUMAN_INTERRUPTION_POLICY_VERSION } from './humanInterruptionPolicy.js';
export { buildScopedCommitPlan, buildMinimalStatusCheck, buildPushPlan, GIT_EFFICIENCY_HELPER_VERSION } from './gitEfficiencyHelper.js';
export { selectAffectedTests, TEST_SCOPE, TEST_SELECTOR_VERSION } from './testSelector.js';
export { isBuildRequired, BUILD_DECISION, BUILD_SELECTOR_VERSION } from './buildSelector.js';
export { emitEfficiencyEvent, createEfficiencyLogger, EFFICIENCY_EVENT, OBSERVABILITY_INTEGRATION_VERSION } from './observabilityIntegration.js';
export { createEfficiencyMetrics, METRIC_CATEGORY, TERMINAL_EFFICIENCY_METRICS_VERSION } from './terminalEfficiencyMetrics.js';
export { calculateTerminalSpeedup, SPEEDUP_GRADE, SPEEDUP_CALCULATOR_VERSION } from './speedupCalculator.js';
export { getLegacyExecution, getOptimizedExecution, FAILURE_FIXTURES, FIXTURE_VERSION } from './fixtures/efficiencyFixture.js';

export const TERMINAL_EFFICIENCY_VERSION = '1.0.0';
