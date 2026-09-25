// Pipeline Orchestrator — ADV-04
// runOnePromptToProduction(): full pipeline from brief → final URL.
// Declarative, deterministic, no real deploys, no real client data.

import { validateProductionBrief } from './briefValidation.js';
import { generateFromBrief }       from './factoryBridge.js';
import { generateAgentsForProject } from './agentEngineBridge.js';
import { generateAutomationPlan }  from './automationBridge.js';
import { createProductionDataPlan } from './dataDbBridge.js';
import { canAutoDeploy, AUTO_DEPLOY_DECISION } from './safeAutoDeployPolicy.js';
import { createDeployAdapter, ADAPTER_MODE } from './deployExecutionAdapter.js';
import { resolveStagingPolicy, runStagingSmokeQA } from './stagingPipeline.js';
import { evaluateExternalCostRisk } from './costSafety.js';
import { evaluateHumanApprovalRequirement } from './humanApprovalGate.js';
import { calculateProductionAutonomyScore } from './autonomyScore.js';
import { estimateProductionTime }   from './timeEstimator.js';
import { buildProductionResult, RESULT_STATUS } from './onePromptProductionResult.js';
import { createCheckpointTracker, CHECKPOINT } from './checkpoints.js';
import { createPipelineLogger, PIPELINE_EVENT } from './observabilityBridge.js';

/**
 * Run the full One Prompt → Production pipeline.
 *
 * options: {
 *   environment   'DRY_RUN' | 'STAGING' | 'PRODUCTION'
 *   adapterMode   'DRY_RUN' | 'STAGING_SIMULATION'
 *   stopOnManual  boolean — stop and return WAITING_HUMAN if manual action required
 * }
 */
export function runOnePromptToProduction(brief = {}, options = {}) {
  const environment  = options.environment  ?? 'DRY_RUN';
  const adapterMode  = options.adapterMode  ?? ADAPTER_MODE.DRY_RUN;
  const stopOnManual = options.stopOnManual ?? true;
  const startedAt    = new Date().toISOString();

  const checkpoints  = createCheckpointTracker(brief.businessName ?? 'unknown');
  const logger       = createPipelineLogger();
  const completedStages = [];
  const blockedStages   = [];
  const warnings        = [];

  logger.log(PIPELINE_EVENT.PIPELINE_STARTED, { environment, adapterMode });

  // ── STAGE 1: BRIEF_VALIDATION ────────────────────────────────────────────
  logger.log(PIPELINE_EVENT.STAGE_STARTED, { stage: 'BRIEF_VALIDATION' });
  const briefResult = validateProductionBrief(brief);

  if (!briefResult.valid) {
    logger.log(PIPELINE_EVENT.STAGE_FAILED, { stage: 'BRIEF_VALIDATION', reason: briefResult.message });
    if (stopOnManual) {
      return buildProductionResult({
        projectId:       brief.businessName ?? 'unknown',
        status:          RESULT_STATUS.WAITING_HUMAN,
        completedStages, blockedStages: ['BRIEF_VALIDATION', ...briefResult.criticalMissing],
        manualActions:   [{ type: 'APPROVAL', reason: briefResult.message }],
        warnings,
        environment,
        startedAt,
        completedAt: new Date().toISOString(),
      });
    }
  }
  completedStages.push('BRIEF_VALIDATION');
  checkpoints.reach(CHECKPOINT.BRIEF_VALIDATED);
  logger.log(PIPELINE_EVENT.STAGE_PASSED, { stage: 'BRIEF_VALIDATION' });

  // ── STAGES 2-10: GENERATION (ANALYSIS → AUTOMATION_PLAN) ────────────────
  logger.log(PIPELINE_EVENT.STAGE_STARTED, { stage: 'GENERATION' });
  const generationResult = generateFromBrief({ valid: true, brief });
  if (!generationResult.valid) {
    blockedStages.push('GENERATION');
    return buildProductionResult({
      projectId: brief.businessName ?? 'unknown',
      status:    RESULT_STATUS.FAILED,
      completedStages, blockedStages, warnings, environment, startedAt,
      completedAt: new Date().toISOString(),
    });
  }

  const artifact = generationResult.artifact;
  completedStages.push(...generationResult.stagesCompleted);
  checkpoints.reach(CHECKPOINT.PROJECT_GENERATED);
  logger.log(PIPELINE_EVENT.STAGE_PASSED, { stage: 'GENERATION', projectId: artifact.projectId });

  // ── AGENT PLAN ─────────────────────────────────────────────────────────
  const agentResult = generateAgentsForProject(artifact);
  if (agentResult.valid) {
    completedStages.push('AGENT_PLAN');
    logger.log(PIPELINE_EVENT.STAGE_PASSED, { stage: 'AGENT_PLAN', agentCount: agentResult.agentCount });
  }

  // ── AUTOMATION PLAN ────────────────────────────────────────────────────
  const automationResult = generateAutomationPlan({ ...artifact, integrations: brief.integrations ?? [] });
  completedStages.push('AUTOMATION_PLAN');
  if (automationResult.manualBlocks?.length > 0) {
    warnings.push(`Automation manual auth required: ${automationResult.manualBlocks.join(', ')}`);
  }

  // ── DATA PLAN ─────────────────────────────────────────────────────────
  createProductionDataPlan({ projectId: artifact.projectId, vertical: artifact.vertical, modules: artifact.modules });
  completedStages.push('DATA_MODEL');

  // ── COST SAFETY ───────────────────────────────────────────────────────
  const costResult = evaluateExternalCostRisk(brief.integrations ?? []);
  if (costResult.requiresHuman && stopOnManual) {
    logger.log(PIPELINE_EVENT.HUMAN_ACTION_REQUIRED, { trigger: 'COST_SAFETY', items: costResult.criticalItems });
  }
  if (costResult.criticalItems?.length > 0) {
    warnings.push(`Cost risk (CRITICAL): ${costResult.criticalItems.join(', ')}`);
  }

  // ── HUMAN APPROVAL CHECK ──────────────────────────────────────────────
  const approvalResult = evaluateHumanApprovalRequirement({
    hasBillingAction:  costResult.requiresHuman,
    environment,
    vertical:          brief.vertical,
    integrations:      brief.integrations ?? [],
    isProductionDomain: environment === 'PRODUCTION',
  });

  if (approvalResult.required && stopOnManual) {
    logger.log(PIPELINE_EVENT.HUMAN_ACTION_REQUIRED, { triggers: approvalResult.triggers });
    return buildProductionResult({
      projectId:     artifact.projectId,
      status:        RESULT_STATUS.WAITING_HUMAN,
      project:       artifact,
      completedStages, blockedStages,
      manualActions: approvalResult.triggers.map(t => ({ type: t, reason: approvalResult.message })),
      warnings, environment, startedAt,
      completedAt:   new Date().toISOString(),
    });
  }

  // ── QA GATES (TESTS, LINT, BUILD, SECURITY, SECRET_SCAN) ─────────────
  ['TESTS', 'LINT', 'BUILD', 'SECURITY', 'SECRET_SCAN', 'RELEASE_READINESS'].forEach(s => {
    completedStages.push(s);
    logger.log(PIPELINE_EVENT.STAGE_PASSED, { stage: s, simulated: true });
  });
  checkpoints.reach(CHECKPOINT.QA_PASSED);
  checkpoints.reach(CHECKPOINT.SECURITY_PASSED);
  checkpoints.reach(CHECKPOINT.RELEASE_READY);

  // ── AUTO DEPLOY POLICY ────────────────────────────────────────────────
  const deployPolicy = canAutoDeploy({
    allCriticalGatesPass:   true,
    noMissingSecrets:       true,
    noBillingAction:        !costResult.requiresHuman,
    noLegalApproval:        !approvalResult.required,
    noDomainBlocker:        environment !== 'PRODUCTION',
    rollbackReady:          true,
    observabilityReady:     true,
    healthChecksReady:      true,
    environmentAllowed:     environment !== 'PRODUCTION',
    humanApprovalSatisfied: !approvalResult.required,
  });

  completedStages.push('DEPLOY_READINESS');

  // ── STAGING (if applicable) ────────────────────────────────────────────
  const stagingPolicy = resolveStagingPolicy({ environment });

  if (stagingPolicy === 'STAGING_FIRST' || environment === 'STAGING') {
    logger.log(PIPELINE_EVENT.STAGE_STARTED, { stage: 'STAGING' });
    const stagingResult = runStagingSmokeQA({ projectId: artifact.projectId, isReal: false });
    if (stagingResult.status === 'PASS') {
      checkpoints.reach(CHECKPOINT.STAGING_VERIFIED);
      completedStages.push('STAGING_VERIFIED');
      logger.log(PIPELINE_EVENT.STAGE_PASSED, { stage: 'STAGING' });
    }
  }

  // ── DEPLOY PLAN + EXECUTION ─────────────────────────────────────────
  completedStages.push('DEPLOY_PLAN');
  logger.log(PIPELINE_EVENT.DEPLOY_STARTED, { projectId: artifact.projectId, mode: adapterMode });

  const adapter      = createDeployAdapter(adapterMode);
  const deployPlan   = {
    projectId:       artifact.projectId,
    buildCommand:    'npm run build',
    outputDir:       'dist',
    environment,
    secretsRequired: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'],
  };

  adapter.prepare(deployPlan);
  adapter.validate(deployPlan);
  const deployResult  = adapter.deploy(deployPlan);
  adapter.verify(deployResult);

  completedStages.push('DEPLOY_EXECUTION');
  logger.log(PIPELINE_EVENT.DEPLOY_COMPLETED, { deployId: deployResult.deployId, url: deployResult.simulatedUrl });

  // ── POST DEPLOY ────────────────────────────────────────────────────────
  ['POST_DEPLOY_QA', 'RUNTIME_RENDER_CHECK', 'HEALTH_CHECK'].forEach(s => {
    completedStages.push(s);
    logger.log(PIPELINE_EVENT.STAGE_PASSED, { stage: s, simulated: true });
  });
  logger.log(PIPELINE_EVENT.HEALTH_CHECK, { status: 'HEALTHY', simulated: true });

  checkpoints.reach(CHECKPOINT.PRODUCTION_VERIFIED);

  // ── RELEASE MANIFEST + ROLLBACK ─────────────────────────────────────
  const rollbackResult = adapter.rollback(deployResult);
  completedStages.push('RELEASE_MANIFEST', 'ROLLBACK_READY');

  // ── HANDOFF + FINAL URL ───────────────────────────────────────────────
  completedStages.push('FINAL_HANDOFF', 'FINAL_URL');
  checkpoints.reach(CHECKPOINT.HANDOFF_READY);

  // ── AUTONOMY SCORE ─────────────────────────────────────────────────────
  const autonomyScore = calculateProductionAutonomyScore({
    totalStages:      27,
    automaticStages:  completedStages.length,
    manualActions:    approvalResult.triggers.length,
    externalAuthCount: (brief.integrations ?? []).length,
    deployIsAuto:     deployPolicy.decision === AUTO_DEPLOY_DECISION.AUTO_DEPLOY_ALLOWED,
    qaIsAuto:         true,
    securityIsAuto:   true,
    rollbackIsAuto:   true,
    handoffIsAuto:    true,
  });

  // ── TIME ESTIMATE ──────────────────────────────────────────────────────
  const timeEstimate = estimateProductionTime({
    stages:        completedStages,
    manualActions: approvalResult.triggers,
  });

  const completedAt = new Date().toISOString();
  logger.log(PIPELINE_EVENT.PIPELINE_COMPLETED, { projectId: artifact.projectId, status: RESULT_STATUS.SIMULATED });

  return buildProductionResult({
    projectId:      artifact.projectId,
    status:         RESULT_STATUS.SIMULATED,
    project:        artifact,
    release: {
      releaseId:    `REL-${artifact.projectId}`,
      version:      '1.0.0',
      deployId:     deployResult.deployId,
      buildPassed:  true,
      testsPassed:  true,
    },
    url: {
      previewUrl:   deployResult.simulatedUrl,
      productionUrl: null,
      status:       'SIMULATED',
      verified:     true,
    },
    completedStages,
    blockedStages,
    manualActions:  approvalResult.triggers.map(t => ({ type: t, completed: false })),
    warnings,
    health:         { status: 'HEALTHY', simulated: true },
    rollback:       { available: true, command: rollbackResult.message },
    handoff: {
      ready:        true,
      adminUrl:     deployResult.simulatedUrl,
      roleSummary:  artifact.roles,
      manualPending: automationResult.manualBlocks ?? [],
    },
    autonomyScore,
    duration:       timeEstimate,
    environment,
    startedAt,
    completedAt,
  });
}

export const PIPELINE_ORCHESTRATOR_VERSION = '1.0.0';
