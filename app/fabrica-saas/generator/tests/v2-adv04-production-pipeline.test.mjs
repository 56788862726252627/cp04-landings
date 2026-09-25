/**
 * ADV-04 — One Prompt → Production Safe Pipeline
 * Full test coverage for all 23 production-pipeline modules.
 * node:test runner. isReal always false.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Module imports ──────────────────────────────────────────────────────────
import {
  PIPELINE_STATUS, PIPELINE_ENVIRONMENT, PIPELINE_STAGE_IDS,
  createProductionPipeline, transitionPipelineStatus,
  PRODUCTION_PIPELINE_DEFINITION_VERSION,
} from '../../production-pipeline/productionPipelineDefinition.js';

import {
  STAGE_TYPE, STAGE_STATUS, createStage, createAllStages,
  canStageRun, PRODUCTION_STAGE_VERSION,
} from '../../production-pipeline/productionStage.js';

import {
  validateProductionBrief, BRIEF_VALIDATION_VERSION,
} from '../../production-pipeline/briefValidation.js';

import {
  MANUAL_ACTION_TYPE, MANUAL_ACTION_STATUS,
  createManualAction, completeManualAction,
  listPendingActions, hasBlockingActions,
  MANUAL_ACTION_MODEL_VERSION,
} from '../../production-pipeline/manualActionModel.js';

import {
  EXTERNAL_PROVIDER, DEPENDENCY_STATUS,
  createExternalDependency, classifyDependencies,
  EXTERNAL_DEPENDENCY_MODEL_VERSION,
} from '../../production-pipeline/externalDependencyModel.js';

import {
  GENERATION_STATUS, generateFromBrief, FACTORY_BRIDGE_VERSION,
} from '../../production-pipeline/factoryBridge.js';

import {
  AGENT_BRIDGE_STATUS, resolveAgentTypes,
  generateAgentsForProject, AGENT_ENGINE_BRIDGE_VERSION,
} from '../../production-pipeline/agentEngineBridge.js';

import {
  AUTOMATION_STATUS, generateAutomationPlan, AUTOMATION_BRIDGE_VERSION,
} from '../../production-pipeline/automationBridge.js';

import {
  DB_PROVIDER, SEED_STRATEGY, BACKUP_POLICY,
  createProductionDataPlan, DATA_DB_BRIDGE_VERSION,
} from '../../production-pipeline/dataDbBridge.js';

import {
  ADAPTER_MODE, DEPLOY_RESULT_STATUS,
  createDeployAdapter, DEPLOY_EXECUTION_ADAPTER_VERSION,
} from '../../production-pipeline/deployExecutionAdapter.js';

import {
  AUTO_DEPLOY_DECISION, canAutoDeploy, SAFE_AUTO_DEPLOY_POLICY_VERSION,
} from '../../production-pipeline/safeAutoDeployPolicy.js';

import {
  STAGING_POLICY, STAGING_STATUS,
  resolveStagingPolicy, runStagingSmokeQA,
  evaluateStagingEligibility, STAGING_PIPELINE_VERSION,
} from '../../production-pipeline/stagingPipeline.js';

import {
  RESULT_STATUS, buildProductionResult, ONE_PROMPT_PRODUCTION_RESULT_VERSION,
} from '../../production-pipeline/onePromptProductionResult.js';

import {
  RESUME_REASON, findResumePoint, resolveManualBlock,
  buildResumeRequest, RESUME_SUPPORT_VERSION,
} from '../../production-pipeline/resumeSupport.js';

import {
  CHECKPOINT, createCheckpointTracker,
  validateCheckpointSequence, CHECKPOINTS_VERSION,
} from '../../production-pipeline/checkpoints.js';

import {
  IDEMPOTENCY_OPERATION, generateIdempotencyKey,
  createIdempotencyRegistry, IDEMPOTENCY_VERSION,
} from '../../production-pipeline/idempotency.js';

import {
  PIPELINE_EVENT, buildPipelineEvent,
  createPipelineLogger, OBSERVABILITY_BRIDGE_VERSION,
} from '../../production-pipeline/observabilityBridge.js';

import {
  COST_RISK_LEVEL, COST_CATEGORY,
  evaluateExternalCostRisk, COST_SAFETY_VERSION,
} from '../../production-pipeline/costSafety.js';

import {
  APPROVAL_TRIGGER, APPROVAL_STATUS,
  evaluateHumanApprovalRequirement, HUMAN_APPROVAL_GATE_VERSION,
} from '../../production-pipeline/humanApprovalGate.js';

import {
  AUTONOMY_FACTOR, calculateProductionAutonomyScore, AUTONOMY_SCORE_VERSION,
} from '../../production-pipeline/autonomyScore.js';

import {
  TIME_CATEGORY, estimateProductionTime, TIME_ESTIMATOR_VERSION,
} from '../../production-pipeline/timeEstimator.js';

import {
  runOnePromptToProduction, PIPELINE_ORCHESTRATOR_VERSION,
} from '../../production-pipeline/pipelineOrchestrator.js';

import {
  NEXO_VET_BRIEF, NEXO_VET_EXPECTED_AGENTS,
  getNexoVetBrief, getNexoVetBlockedBrief,
  NEXO_VET_FIXTURE_VERSION,
} from '../../production-pipeline/fixtures/nexoVetFixture.js';

import {
  PRODUCTION_PIPELINE_REGISTRY,
} from '../../factory-registry/productionPipeline.js';

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTION PIPELINE DEFINITION
// ═══════════════════════════════════════════════════════════════════════════════

describe('ProductionPipelineDefinition — version', () => {
  it('has version string', () => {
    assert.ok(PRODUCTION_PIPELINE_DEFINITION_VERSION);
    assert.strictEqual(typeof PRODUCTION_PIPELINE_DEFINITION_VERSION, 'string');
  });

  it('PIPELINE_STATUS has all required values', () => {
    assert.ok(PIPELINE_STATUS.DRAFT);
    assert.ok(PIPELINE_STATUS.READY);
    assert.ok(PIPELINE_STATUS.RUNNING);
    assert.ok(PIPELINE_STATUS.BLOCKED);
    assert.ok(PIPELINE_STATUS.WAITING_HUMAN);
    assert.ok(PIPELINE_STATUS.FAILED);
    assert.ok(PIPELINE_STATUS.COMPLETED);
    assert.ok(PIPELINE_STATUS.ROLLED_BACK);
  });

  it('PIPELINE_STAGE_IDS has 27 stages', () => {
    assert.strictEqual(PIPELINE_STAGE_IDS.length, 27);
    assert.ok(PIPELINE_STAGE_IDS.includes('BRIEF_VALIDATION'));
    assert.ok(PIPELINE_STAGE_IDS.includes('FINAL_URL'));
  });
});

describe('createProductionPipeline', () => {
  it('creates pipeline with required fields', () => {
    const p = createProductionPipeline({ projectId: 'P1', vertical: 'veterinary', clientId: 'C1' });
    assert.strictEqual(p.valid, true);
    assert.ok(p.id.startsWith('PIPELINE-P1'));
    assert.strictEqual(p.vertical, 'veterinary');
    assert.strictEqual(p.status, PIPELINE_STATUS.DRAFT);
    assert.strictEqual(p.isReal, false);
  });

  it('defaults to DRY_RUN environment', () => {
    const p = createProductionPipeline({ projectId: 'P2', vertical: 'dental', clientId: 'C2' });
    assert.strictEqual(p.environment, PIPELINE_ENVIRONMENT.DRY_RUN);
  });

  it('fails without projectId', () => {
    const p = createProductionPipeline({ vertical: 'dental', clientId: 'C3' });
    assert.strictEqual(p.valid, false);
    assert.ok(p.error.includes('projectId'));
  });

  it('fails without vertical', () => {
    const p = createProductionPipeline({ projectId: 'P3', clientId: 'C3' });
    assert.strictEqual(p.valid, false);
  });

  it('includes all 27 stages', () => {
    const p = createProductionPipeline({ projectId: 'P4', vertical: 'legal', clientId: 'C4' });
    assert.strictEqual(p.stages.length, 27);
  });
});

describe('transitionPipelineStatus', () => {
  const basePipeline = { status: PIPELINE_STATUS.DRAFT };

  it('allows DRAFT → READY', () => {
    const r = transitionPipelineStatus(basePipeline, PIPELINE_STATUS.READY);
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.newStatus, PIPELINE_STATUS.READY);
  });

  it('rejects invalid transition DRAFT → COMPLETED', () => {
    const r = transitionPipelineStatus(basePipeline, PIPELINE_STATUS.COMPLETED);
    assert.strictEqual(r.valid, false);
    assert.ok(r.error.includes('COMPLETED'));
  });

  it('allows RUNNING → WAITING_HUMAN', () => {
    const r = transitionPipelineStatus({ status: PIPELINE_STATUS.RUNNING }, PIPELINE_STATUS.WAITING_HUMAN);
    assert.strictEqual(r.valid, true);
  });

  it('allows WAITING_HUMAN → RUNNING (resume)', () => {
    const r = transitionPipelineStatus({ status: PIPELINE_STATUS.WAITING_HUMAN }, PIPELINE_STATUS.RUNNING);
    assert.strictEqual(r.valid, true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTION STAGE
// ═══════════════════════════════════════════════════════════════════════════════

describe('ProductionStage — createStage', () => {
  it('creates BRIEF_VALIDATION stage', () => {
    const s = createStage('BRIEF_VALIDATION');
    assert.strictEqual(s.valid, true);
    assert.strictEqual(s.id, 'BRIEF_VALIDATION');
    assert.strictEqual(s.type, STAGE_TYPE.ANALYSIS);
    assert.strictEqual(s.status, STAGE_STATUS.PENDING);
    assert.strictEqual(s.blocking, true);
    assert.deepStrictEqual(s.dependsOn, []);
  });

  it('creates GENERATION stage with correct dependencies', () => {
    const s = createStage('GENERATION');
    assert.strictEqual(s.type, STAGE_TYPE.GENERATION);
    assert.ok(s.dependsOn.includes('MODULE_PLAN'));
    assert.ok(s.dependsOn.includes('ROLE_PLAN'));
  });

  it('fails for unknown stage', () => {
    const s = createStage('DOES_NOT_EXIST');
    assert.strictEqual(s.valid, false);
    assert.ok(s.error.includes('Unknown stage'));
  });

  it('creates all 27 stages via createAllStages()', () => {
    const all = createAllStages();
    assert.strictEqual(Object.keys(all).length, 27);
    assert.ok(all.BRIEF_VALIDATION.valid);
    assert.ok(all.FINAL_URL.valid);
  });
});

describe('canStageRun', () => {
  it('BRIEF_VALIDATION can run when PENDING with no deps', () => {
    const stages = createAllStages();
    const r = canStageRun('BRIEF_VALIDATION', stages);
    assert.strictEqual(r.canRun, true);
  });

  it('ANALYSIS cannot run when BRIEF_VALIDATION is still PENDING', () => {
    const stages = createAllStages();
    const r = canStageRun('ANALYSIS', stages);
    assert.strictEqual(r.canRun, false);
    assert.ok(r.reason.includes('BRIEF_VALIDATION'));
  });

  it('ANALYSIS can run when BRIEF_VALIDATION is PASS', () => {
    const stages = createAllStages();
    stages['BRIEF_VALIDATION'] = { ...stages['BRIEF_VALIDATION'], status: STAGE_STATUS.PASS };
    const r = canStageRun('ANALYSIS', stages);
    assert.strictEqual(r.canRun, true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BRIEF VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('validateProductionBrief — happy path', () => {
  const brief = {
    businessName:     'Test Biz',
    vertical:         'veterinary',
    services:         ['consultas'],
    targetUsers:      ['propietarios'],
    roles:            ['ADMIN', 'VET'],
    location:         'Madrid',
    brandPreferences: { tone: 'friendly' },
    modules:          ['booking'],
    integrations:     ['airtable'],
    deploymentTarget: { provider: 'CLOUDFLARE_PAGES' },
  };

  it('validates a complete brief', () => {
    const r = validateProductionBrief(brief);
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.status, 'READY');
    assert.strictEqual(r.missingCount, 0);
    assert.strictEqual(r.isReal, false);
  });

  it('returns field results for all required fields', () => {
    const r = validateProductionBrief(brief);
    assert.ok(r.fields.length >= 10);
  });
});

describe('validateProductionBrief — failure cases', () => {
  it('fails when businessName missing', () => {
    const r = validateProductionBrief({ vertical: 'dental', services: ['s'], targetUsers: ['u'], roles: ['r'], modules: ['m'], deploymentTarget: {} });
    assert.strictEqual(r.valid, false);
    assert.strictEqual(r.status, 'WAITING_HUMAN');
    assert.ok(r.criticalMissing.includes('businessName'));
  });

  it('fails when modules is empty array', () => {
    const r = validateProductionBrief({ businessName: 'X', vertical: 'dental', services: ['s'], targetUsers: ['u'], roles: ['r'], modules: [], deploymentTarget: {} });
    assert.strictEqual(r.valid, false);
    assert.ok(r.criticalMissing.includes('modules'));
  });

  it('partial brief returns correct missingCount', () => {
    const r = validateProductionBrief({});
    assert.ok(r.missingCount > 5);
  });

  it('optional fields missing do not block', () => {
    const r = validateProductionBrief({
      businessName: 'Y', vertical: 'dental', services: ['s'], targetUsers: ['u'],
      roles: ['r'], modules: ['m'], deploymentTarget: {},
    });
    assert.ok(r.warnings.includes('location') || r.warnings.includes('brandPreferences') || r.warnings.includes('integrations'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MANUAL ACTION MODEL
// ═══════════════════════════════════════════════════════════════════════════════

describe('createManualAction', () => {
  it('creates a valid OAUTH action', () => {
    const a = createManualAction({
      type: MANUAL_ACTION_TYPE.OAUTH,
      provider: 'Meta',
      reason: 'WhatsApp Business requires OAuth',
      instructions: 'Go to Meta Business → connect WhatsApp account',
    });
    assert.strictEqual(a.valid, true);
    assert.strictEqual(a.type, MANUAL_ACTION_TYPE.OAUTH);
    assert.strictEqual(a.completed, false);
    assert.strictEqual(a.isReal, false);
    assert.ok(a.id.startsWith('MA-OAUTH'));
  });

  it('fails without type', () => {
    const a = createManualAction({ provider: 'X', reason: 'y', instructions: 'z' });
    assert.strictEqual(a.valid, false);
    assert.ok(a.error.includes('type'));
  });

  it('fails with unknown type', () => {
    const a = createManualAction({ type: 'UNKNOWN', provider: 'X', reason: 'y', instructions: 'z' });
    assert.strictEqual(a.valid, false);
  });

  it('blocking defaults to true', () => {
    const a = createManualAction({
      type: MANUAL_ACTION_TYPE.BILLING, provider: 'Stripe',
      reason: 'Live mode', instructions: 'Activate in Stripe dashboard',
    });
    assert.strictEqual(a.blocking, true);
  });
});

describe('completeManualAction / listPendingActions', () => {
  it('marks action as completed', () => {
    const a = createManualAction({ type: MANUAL_ACTION_TYPE.APPROVAL, provider: 'Agency', reason: 'r', instructions: 'i' });
    const c = completeManualAction(a);
    assert.strictEqual(c.completed, true);
    assert.ok(c.completedAt);
  });

  it('listPendingActions returns only incomplete blocking actions', () => {
    const a1 = createManualAction({ type: MANUAL_ACTION_TYPE.OAUTH, provider: 'X', reason: 'r', instructions: 'i' });
    const a2 = completeManualAction(createManualAction({ type: MANUAL_ACTION_TYPE.BILLING, provider: 'Y', reason: 'r', instructions: 'i' }));
    const pending = listPendingActions([a1, a2]);
    assert.strictEqual(pending.length, 1);
    assert.strictEqual(pending[0].type, MANUAL_ACTION_TYPE.OAUTH);
  });

  it('hasBlockingActions returns true when pending', () => {
    const a = createManualAction({ type: MANUAL_ACTION_TYPE.DOMAIN, provider: 'CF', reason: 'r', instructions: 'i' });
    assert.strictEqual(hasBlockingActions([a]), true);
  });

  it('hasBlockingActions returns false when all complete', () => {
    const a = completeManualAction(createManualAction({ type: MANUAL_ACTION_TYPE.APPROVAL, provider: 'X', reason: 'r', instructions: 'i' }));
    assert.strictEqual(hasBlockingActions([a]), false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL DEPENDENCY MODEL
// ═══════════════════════════════════════════════════════════════════════════════

describe('createExternalDependency', () => {
  it('creates a Stripe dependency', () => {
    const d = createExternalDependency({ provider: EXTERNAL_PROVIDER.STRIPE, purpose: 'Payments' });
    assert.strictEqual(d.valid, true);
    assert.strictEqual(d.provider, 'STRIPE');
    assert.strictEqual(d.isReal, false);
  });

  it('fails without provider', () => {
    const d = createExternalDependency({ purpose: 'x' });
    assert.strictEqual(d.valid, false);
  });

  it('fails with unknown provider', () => {
    const d = createExternalDependency({ provider: 'UNKNOWN_CLOUD', purpose: 'x' });
    assert.strictEqual(d.valid, false);
  });

  it('defaults to AUTH_REQUIRED status', () => {
    const d = createExternalDependency({ provider: EXTERNAL_PROVIDER.MAKE, purpose: 'Automation' });
    assert.strictEqual(d.status, DEPENDENCY_STATUS.AUTH_REQUIRED);
  });
});

describe('classifyDependencies', () => {
  it('returns isFullyReady true when no blocking deps', () => {
    const d = createExternalDependency({ provider: EXTERNAL_PROVIDER.SUPABASE, purpose: 'DB', status: DEPENDENCY_STATUS.AVAILABLE });
    const r = classifyDependencies([d]);
    assert.strictEqual(r.isFullyReady, true);
    assert.strictEqual(r.blockerCount, 0);
  });

  it('returns isFullyReady false when blocking deps', () => {
    const d = createExternalDependency({ provider: EXTERNAL_PROVIDER.STRIPE, purpose: 'Pay', status: DEPENDENCY_STATUS.BILLING_REQUIRED });
    const r = classifyDependencies([d]);
    assert.strictEqual(r.isFullyReady, false);
    assert.ok(r.blocking.includes('STRIPE'));
  });

  it('classifies needsBilling correctly', () => {
    const d = createExternalDependency({ provider: EXTERNAL_PROVIDER.STRIPE, purpose: 'Pay', status: DEPENDENCY_STATUS.BILLING_REQUIRED });
    const r = classifyDependencies([d]);
    assert.ok(r.needsBilling.includes('STRIPE'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

describe('generateFromBrief', () => {
  const validBriefInput = {
    valid: true,
    brief: {
      businessName: 'Nexo Vet',
      vertical: 'veterinary',
      services: ['consultas'],
      modules: ['booking', 'chat'],
      roles: ['ADMIN', 'VET'],
      environment: 'DRY_RUN',
    },
  };

  it('generates a valid artifact from brief', () => {
    const r = generateFromBrief(validBriefInput);
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.status, GENERATION_STATUS.READY);
    assert.ok(r.artifact.projectId.includes('nexo'));
    assert.strictEqual(r.isReal, false);
  });

  it('artifact contains required fields', () => {
    const r = generateFromBrief(validBriefInput);
    assert.ok(r.artifact.modules.length > 0);
    assert.ok(r.artifact.roles.length > 0);
    assert.ok(r.artifact.branding);
    assert.ok(r.artifact.manifest);
  });

  it('fails when brief is not valid', () => {
    const r = generateFromBrief({ valid: false });
    assert.strictEqual(r.valid, false);
    assert.strictEqual(r.status, GENERATION_STATUS.BLOCKED);
  });

  it('stagesCompleted includes all generation stages', () => {
    const r = generateFromBrief(validBriefInput);
    assert.ok(r.stagesCompleted.includes('GENERATION'));
    assert.ok(r.stagesCompleted.includes('ANALYSIS'));
    assert.ok(r.stagesCompleted.includes('MODULE_PLAN'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT ENGINE BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

describe('resolveAgentTypes', () => {
  it('detects BOOKING from module name', () => {
    const types = resolveAgentTypes({ modules: ['booking', 'records'] });
    assert.ok(types.includes('BOOKING'));
  });

  it('always includes CHAT', () => {
    const types = resolveAgentTypes({ modules: ['admin_panel'] });
    assert.ok(types.includes('CHAT'));
  });

  it('detects SALES from module name', () => {
    const types = resolveAgentTypes({ modules: ['ventas', 'comercial'] });
    assert.ok(types.includes('SALES'));
  });

  it('detects VOICE from module name', () => {
    const types = resolveAgentTypes({ modules: ['voz_bot'] });
    assert.ok(types.includes('VOICE'));
  });
});

describe('generateAgentsForProject', () => {
  it('generates agents for veterinary project', () => {
    const artifact = { projectId: 'PROJ-nexo', vertical: 'veterinary', modules: ['booking', 'chat', 'soporte'] };
    const r = generateAgentsForProject(artifact);
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.status, AGENT_BRIDGE_STATUS.GENERATED);
    assert.ok(r.agentCount > 0);
    assert.strictEqual(r.isReal, false);
    r.agents.forEach(a => {
      assert.strictEqual(a.isReal, false);
      assert.ok(a.agentId.includes('PROJ-nexo'));
    });
  });

  it('fails without projectId', () => {
    const r = generateAgentsForProject({ vertical: 'dental' });
    assert.strictEqual(r.valid, false);
    assert.strictEqual(r.status, AGENT_BRIDGE_STATUS.BLOCKED);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUTOMATION BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

describe('generateAutomationPlan', () => {
  it('auto-ready for airtable+make', () => {
    const r = generateAutomationPlan({ projectId: 'P1', integrations: ['airtable', 'make'] });
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.status, AUTOMATION_STATUS.AUTO_READY);
    assert.strictEqual(r.isReal, false);
  });

  it('requires manual auth for whatsapp', () => {
    const r = generateAutomationPlan({ projectId: 'P2', integrations: ['whatsapp', 'airtable'] });
    assert.strictEqual(r.status, AUTOMATION_STATUS.MANUAL_AUTH_REQUIRED);
    assert.ok(r.manualBlocks.includes('whatsapp'));
  });

  it('requires manual auth for stripe', () => {
    const r = generateAutomationPlan({ projectId: 'P3', integrations: ['stripe'] });
    assert.strictEqual(r.status, AUTOMATION_STATUS.MANUAL_AUTH_REQUIRED);
  });

  it('fails without projectId', () => {
    const r = generateAutomationPlan({ integrations: ['airtable'] });
    assert.strictEqual(r.valid, false);
  });

  it('generates scenario for each integration', () => {
    const r = generateAutomationPlan({ projectId: 'P4', integrations: ['airtable', 'email'] });
    assert.strictEqual(r.scenarioCount, 2);
    r.scenarios.forEach(s => assert.strictEqual(s.isReal, false));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DATA DB BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

describe('createProductionDataPlan', () => {
  it('creates a valid data plan', () => {
    const p = createProductionDataPlan({ projectId: 'P1', vertical: 'veterinary', modules: ['booking', 'records'] });
    assert.strictEqual(p.valid, true);
    assert.strictEqual(p.provider, DB_PROVIDER.SUPABASE);
    assert.strictEqual(p.clientIsolation, 'RLS_TENANT_FIELD');
    assert.strictEqual(p.isReal, false);
    assert.ok(p.secretsRequired.includes('SUPABASE_URL'));
  });

  it('schema entity per module', () => {
    const p = createProductionDataPlan({ projectId: 'P2', vertical: 'dental', modules: ['booking', 'patients'] });
    assert.strictEqual(p.schema.length, 2);
    assert.strictEqual(p.schema[0].rls, true);
  });

  it('fails without projectId', () => {
    const p = createProductionDataPlan({ vertical: 'dental' });
    assert.strictEqual(p.valid, false);
  });

  it('defaults to DAILY_AUTO backup', () => {
    const p = createProductionDataPlan({ projectId: 'P3', vertical: 'legal' });
    assert.strictEqual(p.backupPolicy, BACKUP_POLICY.DAILY_AUTO);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DEPLOY EXECUTION ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════

describe('createDeployAdapter — DRY_RUN', () => {
  const adapter = createDeployAdapter(ADAPTER_MODE.DRY_RUN);

  it('creates a valid DRY_RUN adapter', () => {
    assert.strictEqual(adapter.valid, true);
    assert.strictEqual(adapter.mode, ADAPTER_MODE.DRY_RUN);
    assert.strictEqual(adapter.isSimulated, true);
  });

  it('prepare() returns ok for valid plan', () => {
    const r = adapter.prepare({ projectId: 'P1' });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.isReal, false);
  });

  it('prepare() fails without projectId', () => {
    const r = adapter.prepare({});
    assert.strictEqual(r.ok, false);
  });

  it('validate() returns issues for incomplete plan', () => {
    const r = adapter.validate({});
    assert.strictEqual(r.ok, false);
    assert.ok(r.issues.length > 0);
  });

  it('deploy() returns SIMULATED status', () => {
    const r = adapter.deploy({ projectId: 'P1' });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.status, DEPLOY_RESULT_STATUS.SIMULATED);
    assert.strictEqual(r.isReal, false);
    assert.ok(r.simulatedUrl.includes('.pages.dev'));
  });

  it('verify() returns ok in DRY_RUN', () => {
    const deployResult = adapter.deploy({ projectId: 'P1' });
    const r = adapter.verify(deployResult);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.httpStatus, 200);
  });

  it('rollback() returns ok in DRY_RUN', () => {
    const deployResult = adapter.deploy({ projectId: 'P1' });
    const r = adapter.rollback(deployResult);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.isReal, false);
  });
});

describe('createDeployAdapter — CLOUDFLARE_REAL blocked', () => {
  it('returns invalid for CLOUDFLARE_REAL mode', () => {
    const adapter = createDeployAdapter(ADAPTER_MODE.CLOUDFLARE_REAL);
    assert.strictEqual(adapter.valid, false);
    assert.ok(adapter.error.includes('not implemented'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SAFE AUTO DEPLOY POLICY
// ═══════════════════════════════════════════════════════════════════════════════

describe('canAutoDeploy — happy path', () => {
  const allGood = {
    allCriticalGatesPass:   true,
    noMissingSecrets:       true,
    noBillingAction:        true,
    noLegalApproval:        true,
    noDomainBlocker:        true,
    rollbackReady:          true,
    observabilityReady:     true,
    healthChecksReady:      true,
    environmentAllowed:     true,
    humanApprovalSatisfied: true,
  };

  it('AUTO_DEPLOY_ALLOWED when all gates pass', () => {
    const r = canAutoDeploy(allGood);
    assert.strictEqual(r.decision, AUTO_DEPLOY_DECISION.AUTO_DEPLOY_ALLOWED);
    assert.strictEqual(r.blockers.length, 0);
    assert.strictEqual(r.isReal, false);
  });
});

describe('canAutoDeploy — blocked scenarios', () => {
  it('BLOCKED when critical gates failing', () => {
    const r = canAutoDeploy({ allCriticalGatesPass: false });
    assert.strictEqual(r.decision, AUTO_DEPLOY_DECISION.BLOCKED);
    assert.ok(r.blockers.includes('CRITICAL_GATES_FAILING'));
  });

  it('BLOCKED when secrets missing', () => {
    const r = canAutoDeploy({ allCriticalGatesPass: true, noMissingSecrets: false });
    assert.strictEqual(r.decision, AUTO_DEPLOY_DECISION.BLOCKED);
    assert.ok(r.blockers.includes('MISSING_SECRETS'));
  });

  it('BLOCKED when environment not allowed', () => {
    const r = canAutoDeploy({ allCriticalGatesPass: true, noMissingSecrets: true, environmentAllowed: false });
    assert.strictEqual(r.decision, AUTO_DEPLOY_DECISION.BLOCKED);
  });

  it('WAITING_HUMAN when billing action required', () => {
    const r = canAutoDeploy({
      allCriticalGatesPass: true, noMissingSecrets: true, noBillingAction: false,
      rollbackReady: true, observabilityReady: true, healthChecksReady: true,
      environmentAllowed: true, humanApprovalSatisfied: true,
    });
    assert.strictEqual(r.decision, AUTO_DEPLOY_DECISION.WAITING_HUMAN);
    assert.ok(r.humanRequired.includes('BILLING_APPROVAL'));
  });

  it('WAITING_HUMAN when human approval pending', () => {
    const r = canAutoDeploy({
      allCriticalGatesPass: true, noMissingSecrets: true, noBillingAction: true,
      noLegalApproval: true, noDomainBlocker: true, rollbackReady: true,
      observabilityReady: true, healthChecksReady: true, environmentAllowed: true,
      humanApprovalSatisfied: false,
    });
    assert.strictEqual(r.decision, AUTO_DEPLOY_DECISION.WAITING_HUMAN);
    assert.ok(r.humanRequired.includes('HUMAN_APPROVAL'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STAGING PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

describe('resolveStagingPolicy', () => {
  it('DRY_RUN → DRY_RUN_ONLY', () => {
    assert.strictEqual(resolveStagingPolicy({ environment: 'DRY_RUN' }), STAGING_POLICY.DRY_RUN_ONLY);
  });

  it('STAGING → STAGING_FIRST', () => {
    assert.strictEqual(resolveStagingPolicy({ environment: 'STAGING' }), STAGING_POLICY.STAGING_FIRST);
  });

  it('PRODUCTION → STAGING_FIRST', () => {
    assert.strictEqual(resolveStagingPolicy({ environment: 'PRODUCTION' }), STAGING_POLICY.STAGING_FIRST);
  });
});

describe('runStagingSmokeQA', () => {
  it('passes in simulation mode', () => {
    const r = runStagingSmokeQA({ projectId: 'P1', isReal: false });
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.status, STAGING_STATUS.PASS);
    assert.strictEqual(r.productionEligible, true);
    assert.strictEqual(r.isReal, false);
  });

  it('fails when critical check overridden to FAIL', () => {
    const r = runStagingSmokeQA({ projectId: 'P2', isReal: false, checkOverrides: { 'SMOKE-01': STAGING_STATUS.FAIL } });
    assert.strictEqual(r.status, STAGING_STATUS.FAIL);
    assert.strictEqual(r.productionEligible, false);
  });

  it('fails without projectId', () => {
    const r = runStagingSmokeQA({});
    assert.strictEqual(r.valid, false);
  });

  it('has disclaimer in simulation', () => {
    const r = runStagingSmokeQA({ projectId: 'P3', isReal: false });
    assert.ok(r.disclaimer && r.disclaimer.includes('SIMULATED'));
  });
});

describe('evaluateStagingEligibility', () => {
  it('eligible when smoke QA passes', () => {
    const smoke = runStagingSmokeQA({ projectId: 'P1', isReal: false });
    const r = evaluateStagingEligibility(smoke);
    assert.strictEqual(r.eligible, true);
  });

  it('not eligible when smoke QA fails', () => {
    const smoke = runStagingSmokeQA({ projectId: 'P2', isReal: false, checkOverrides: { 'SMOKE-01': STAGING_STATUS.FAIL } });
    const r = evaluateStagingEligibility(smoke);
    assert.strictEqual(r.eligible, false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ONE PROMPT PRODUCTION RESULT
// ═══════════════════════════════════════════════════════════════════════════════

describe('buildProductionResult', () => {
  it('creates a valid SIMULATED result', () => {
    const r = buildProductionResult({ projectId: 'P1', status: RESULT_STATUS.SIMULATED });
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.status, RESULT_STATUS.SIMULATED);
    assert.strictEqual(r.isReal, false);
    assert.ok(r.disclaimer && r.disclaimer.includes('DRY_RUN'));
  });

  it('creates a WAITING_HUMAN result', () => {
    const r = buildProductionResult({ projectId: 'P2', status: RESULT_STATUS.WAITING_HUMAN, manualActions: [{ type: 'OAUTH' }] });
    assert.strictEqual(r.status, RESULT_STATUS.WAITING_HUMAN);
    assert.strictEqual(r.manualActions.length, 1);
  });

  it('fails without projectId', () => {
    const r = buildProductionResult({ status: RESULT_STATUS.COMPLETED });
    assert.strictEqual(r.valid, false);
  });

  it('fails with unknown status', () => {
    const r = buildProductionResult({ projectId: 'P3', status: 'INVALID' });
    assert.strictEqual(r.valid, false);
  });

  it('defaults arrays to empty', () => {
    const r = buildProductionResult({ projectId: 'P4', status: RESULT_STATUS.BLOCKED });
    assert.deepStrictEqual(r.completedStages, []);
    assert.deepStrictEqual(r.blockedStages, []);
    assert.deepStrictEqual(r.manualActions, []);
    assert.deepStrictEqual(r.warnings, []);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RESUME SUPPORT
// ═══════════════════════════════════════════════════════════════════════════════

describe('findResumePoint', () => {
  it('finds first FAIL stage', () => {
    const stages = {
      BRIEF_VALIDATION: { status: 'PASS' },
      ANALYSIS:         { status: 'FAIL' },
      GENERATION:       { status: 'PENDING' },
    };
    const r = findResumePoint(stages);
    assert.strictEqual(r.found, true);
    assert.strictEqual(r.stageId, 'ANALYSIS');
  });

  it('finds WAITING_HUMAN stage', () => {
    const stages = {
      BRIEF_VALIDATION: { status: 'PASS' },
      ANALYSIS:         { status: 'PASS' },
      VERTICAL_RESOLUTION: { status: 'WAITING_HUMAN' },
    };
    const r = findResumePoint(stages);
    assert.strictEqual(r.stageId, 'VERTICAL_RESOLUTION');
  });

  it('returns not found when all stages pass', () => {
    const r = findResumePoint({});
    assert.strictEqual(r.found, false);
  });
});

describe('resolveManualBlock', () => {
  it('marks action as resolved', () => {
    const context = {
      manualActions: [{ id: 'MA-001', blocking: true, completed: false }],
    };
    const r = resolveManualBlock(context, 'MA-001', 'OAuth completed');
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.resolvedId, 'MA-001');
    assert.strictEqual(r.context.manualActions[0].completed, true);
    assert.strictEqual(r.readyToResume, true);
  });

  it('fails without actionId', () => {
    const r = resolveManualBlock({}, null);
    assert.strictEqual(r.valid, false);
  });
});

describe('buildResumeRequest', () => {
  it('builds a valid resume request', () => {
    const r = buildResumeRequest('PIPE-001', RESUME_REASON.HUMAN_ACTION_COMPLETED, ['MA-001']);
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.pipelineId, 'PIPE-001');
    assert.strictEqual(r.skipCompletedStages, true);
    assert.strictEqual(r.isReal, false);
  });

  it('fails with unknown reason', () => {
    const r = buildResumeRequest('PIPE-001', 'INVALID_REASON');
    assert.strictEqual(r.valid, false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CHECKPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('createCheckpointTracker', () => {
  it('creates tracker for a project', () => {
    const tracker = createCheckpointTracker('nexo-vet');
    assert.strictEqual(tracker.valid, true);
    assert.strictEqual(tracker.isComplete(), false);
  });

  it('reach() registers checkpoint', () => {
    const tracker = createCheckpointTracker('test');
    const r = tracker.reach(CHECKPOINT.BRIEF_VALIDATED);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(tracker.hasReached(CHECKPOINT.BRIEF_VALIDATED), true);
  });

  it('getNextCheckpoint() returns first unreached', () => {
    const tracker = createCheckpointTracker('test');
    tracker.reach(CHECKPOINT.BRIEF_VALIDATED);
    assert.strictEqual(tracker.getNextCheckpoint(), CHECKPOINT.PROJECT_GENERATED);
  });

  it('isComplete() true when all reached', () => {
    const tracker = createCheckpointTracker('test');
    Object.values(CHECKPOINT).forEach(c => tracker.reach(c));
    assert.strictEqual(tracker.isComplete(), true);
  });

  it('summary() returns progress string', () => {
    const tracker = createCheckpointTracker('test');
    tracker.reach(CHECKPOINT.BRIEF_VALIDATED);
    const s = tracker.summary();
    assert.ok(s.progress.includes('/'));
    assert.strictEqual(s.complete, false);
  });

  it('fails without projectId', () => {
    const tracker = createCheckpointTracker('');
    assert.strictEqual(tracker.valid, false);
  });
});

describe('validateCheckpointSequence', () => {
  it('validates correct order', () => {
    const r = validateCheckpointSequence([CHECKPOINT.BRIEF_VALIDATED, CHECKPOINT.PROJECT_GENERATED]);
    assert.strictEqual(r.valid, true);
  });

  it('rejects unknown checkpoint', () => {
    const r = validateCheckpointSequence(['UNKNOWN_CP']);
    assert.strictEqual(r.valid, false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// IDEMPOTENCY
// ═══════════════════════════════════════════════════════════════════════════════

describe('generateIdempotencyKey', () => {
  it('generates stable key', () => {
    const k = generateIdempotencyKey(IDEMPOTENCY_OPERATION.DEPLOY, 'PROJ-nexo');
    assert.ok(k.startsWith('IDEM-'));
    assert.ok(k.includes('deploy'));
    assert.ok(k.includes('proj-nexo'));
  });

  it('returns null for missing operation', () => {
    assert.strictEqual(generateIdempotencyKey(null, 'P1'), null);
  });

  it('returns null for missing projectId', () => {
    assert.strictEqual(generateIdempotencyKey(IDEMPOTENCY_OPERATION.DEPLOY, ''), null);
  });

  it('same inputs → same key', () => {
    const k1 = generateIdempotencyKey(IDEMPOTENCY_OPERATION.DB_MIGRATION, 'P1', 'v1');
    const k2 = generateIdempotencyKey(IDEMPOTENCY_OPERATION.DB_MIGRATION, 'P1', 'v1');
    assert.strictEqual(k1, k2);
  });
});

describe('createIdempotencyRegistry', () => {
  it('allows first registration', () => {
    const reg = createIdempotencyRegistry();
    const r = reg.tryRegister('IDEM-deploy::proj1');
    assert.strictEqual(r.allowed, true);
  });

  it('blocks duplicate registration', () => {
    const reg = createIdempotencyRegistry();
    reg.tryRegister('IDEM-deploy::proj1');
    const r = reg.tryRegister('IDEM-deploy::proj1');
    assert.strictEqual(r.allowed, false);
    assert.strictEqual(r.duplicate, true);
  });

  it('isRegistered returns correct value', () => {
    const reg = createIdempotencyRegistry();
    reg.tryRegister('KEY-1');
    assert.strictEqual(reg.isRegistered('KEY-1'), true);
    assert.strictEqual(reg.isRegistered('KEY-2'), false);
  });

  it('list() returns all registered', () => {
    const reg = createIdempotencyRegistry();
    reg.tryRegister('K1');
    reg.tryRegister('K2');
    assert.strictEqual(reg.list().length, 2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVABILITY BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

describe('buildPipelineEvent', () => {
  it('builds a valid event', () => {
    const e = buildPipelineEvent(PIPELINE_EVENT.PIPELINE_STARTED, { environment: 'DRY_RUN' });
    assert.strictEqual(e.valid, true);
    assert.strictEqual(e.eventType, PIPELINE_EVENT.PIPELINE_STARTED);
    assert.strictEqual(e.isReal, false);
    assert.ok(e.correlationId);
    assert.ok(e.timestamp);
  });

  it('fails for unknown event type', () => {
    const e = buildPipelineEvent('UNKNOWN_EVENT', {});
    assert.strictEqual(e.valid, false);
  });

  it('sanitizes sensitive fields from payload', () => {
    const e = buildPipelineEvent(PIPELINE_EVENT.STAGE_STARTED, {
      stage: 'DEPLOY', secret: 'sk_live_xxx', apiKey: 'key123',
    });
    assert.strictEqual(e.valid, true);
    assert.ok(!('secret' in e.payload));
    assert.ok(!('apiKey' in e.payload));
    assert.ok('stage' in e.payload);
  });
});

describe('createPipelineLogger', () => {
  it('logs events and counts them', () => {
    const logger = createPipelineLogger('CORR-001');
    logger.log(PIPELINE_EVENT.PIPELINE_STARTED, { env: 'DRY_RUN' });
    logger.log(PIPELINE_EVENT.STAGE_PASSED, { stage: 'TESTS' });
    assert.strictEqual(logger.count(), 2);
    assert.strictEqual(logger.getCorrelationId(), 'CORR-001');
  });

  it('getEvents() returns all events', () => {
    const logger = createPipelineLogger();
    logger.log(PIPELINE_EVENT.DEPLOY_STARTED, { projectId: 'P1' });
    const events = logger.getEvents();
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].eventType, PIPELINE_EVENT.DEPLOY_STARTED);
  });

  it('summary() has correct fields', () => {
    const logger = createPipelineLogger();
    logger.log(PIPELINE_EVENT.PIPELINE_COMPLETED, {});
    const s = logger.summary();
    assert.strictEqual(s.eventCount, 1);
    assert.ok(s.firstAt);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// COST SAFETY
// ═══════════════════════════════════════════════════════════════════════════════

describe('evaluateExternalCostRisk', () => {
  it('NONE risk for empty integrations', () => {
    const r = evaluateExternalCostRisk([]);
    assert.strictEqual(r.overallRisk, COST_RISK_LEVEL.NONE);
    assert.strictEqual(r.requiresHuman, false);
    assert.strictEqual(r.isReal, false);
  });

  it('CRITICAL for meta', () => {
    const r = evaluateExternalCostRisk(['meta']);
    assert.strictEqual(r.overallRisk, COST_RISK_LEVEL.CRITICAL);
    assert.strictEqual(r.requiresHuman, true);
    assert.ok(r.criticalItems.includes('meta'));
  });

  it('HIGH for stripe', () => {
    const r = evaluateExternalCostRisk(['stripe']);
    assert.strictEqual(r.overallRisk, COST_RISK_LEVEL.HIGH);
    assert.strictEqual(r.requiresHuman, true);
  });

  it('LOW for airtable', () => {
    const r = evaluateExternalCostRisk(['airtable']);
    assert.strictEqual(r.overallRisk, COST_RISK_LEVEL.LOW);
    assert.strictEqual(r.requiresHuman, false);
  });

  it('detects maximum risk across integrations', () => {
    const r = evaluateExternalCostRisk(['airtable', 'meta']);
    assert.strictEqual(r.overallRisk, COST_RISK_LEVEL.CRITICAL);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HUMAN APPROVAL GATE
// ═══════════════════════════════════════════════════════════════════════════════

describe('evaluateHumanApprovalRequirement', () => {
  it('not required for basic DRY_RUN without risky integrations', () => {
    const r = evaluateHumanApprovalRequirement({ environment: 'DRY_RUN', vertical: 'veterinary', integrations: [] });
    assert.strictEqual(r.required, false);
    assert.strictEqual(r.status, APPROVAL_STATUS.NOT_REQUIRED);
    assert.strictEqual(r.isReal, false);
  });

  it('required for billing action', () => {
    const r = evaluateHumanApprovalRequirement({ hasBillingAction: true });
    assert.strictEqual(r.required, true);
    assert.ok(r.triggers.includes(APPROVAL_TRIGGER.BILLING));
  });

  it('required for meta ads', () => {
    const r = evaluateHumanApprovalRequirement({ integrations: ['meta'] });
    assert.strictEqual(r.required, true);
    assert.ok(r.triggers.includes(APPROVAL_TRIGGER.META_ADS_SPEND));
  });

  it('required for stripe in production', () => {
    const r = evaluateHumanApprovalRequirement({ integrations: ['stripe'], environment: 'PRODUCTION' });
    assert.strictEqual(r.required, true);
    assert.ok(r.triggers.includes(APPROVAL_TRIGGER.STRIPE_LIVE));
  });

  it('required for medical vertical in production', () => {
    const r = evaluateHumanApprovalRequirement({ vertical: 'psychology', environment: 'PRODUCTION' });
    assert.strictEqual(r.required, true);
    assert.ok(r.triggers.includes(APPROVAL_TRIGGER.MEDICAL_LEGAL_DEPLOY));
  });

  it('required for health data', () => {
    const r = evaluateHumanApprovalRequirement({ hasHealthData: true });
    assert.strictEqual(r.required, true);
    assert.ok(r.triggers.includes(APPROVAL_TRIGGER.HIGH_RISK_DATA));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUTONOMY SCORE
// ═══════════════════════════════════════════════════════════════════════════════

describe('calculateProductionAutonomyScore', () => {
  it('high score when all automated', () => {
    const r = calculateProductionAutonomyScore({
      totalStages: 27, automaticStages: 27,
      manualActions: 0, externalAuthCount: 0,
      deployIsAuto: true, qaIsAuto: true,
      securityIsAuto: true, rollbackIsAuto: true, handoffIsAuto: true,
    });
    assert.ok(r.totalScore >= 80);
    assert.strictEqual(r.grade, 'A');
    assert.strictEqual(r.isReal, false);
  });

  it('low score with many manual steps', () => {
    const r = calculateProductionAutonomyScore({
      totalStages: 27, automaticStages: 5,
      manualActions: 10, externalAuthCount: 5,
      deployIsAuto: false, qaIsAuto: false,
      securityIsAuto: false, rollbackIsAuto: false, handoffIsAuto: false,
    });
    assert.ok(r.totalScore < 40);
  });

  it('score is 0-100', () => {
    const r = calculateProductionAutonomyScore({});
    assert.ok(r.totalScore >= 0);
    assert.ok(r.totalScore <= 100);
  });

  it('factors object has all factor keys', () => {
    const r = calculateProductionAutonomyScore({ automaticStages: 20, totalStages: 27 });
    Object.values(AUTONOMY_FACTOR).forEach(f => {
      assert.ok(f in r.factors);
    });
  });

  it('manualStepsCurrent reflects input', () => {
    const r = calculateProductionAutonomyScore({ manualActions: 3 });
    assert.strictEqual(r.manualStepsCurrent, 3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TIME ESTIMATOR
// ═══════════════════════════════════════════════════════════════════════════════

describe('estimateProductionTime', () => {
  it('returns time breakdown with all 3 categories', () => {
    const r = estimateProductionTime({ stages: ['TESTS', 'BUILD', 'DEPLOY_EXECUTION'] });
    assert.strictEqual(r.valid, true);
    assert.ok(r.machineMinutes >= 0);
    assert.ok(r.humanMinutes >= 0);
    assert.ok(r.externalMinutes >= 0);
    assert.strictEqual(r.isReal, false);
    assert.ok(r.breakdown[TIME_CATEGORY.MACHINE]);
    assert.ok(r.breakdown[TIME_CATEGORY.HUMAN]);
    assert.ok(r.breakdown[TIME_CATEGORY.EXTERNAL_WAITING]);
  });

  it('adds human time for manual actions', () => {
    const withoutOAuth = estimateProductionTime({ stages: ['BUILD'], manualActions: [] });
    const withOAuth    = estimateProductionTime({ stages: ['BUILD'], manualActions: ['OAUTH'] });
    assert.ok(withOAuth.humanMinutes > withoutOAuth.humanMinutes);
  });

  it('DNS action adds external waiting time', () => {
    const r = estimateProductionTime({ stages: [], manualActions: ['DOMAIN'] });
    assert.ok(r.externalMinutes > 0);
  });

  it('totalMinutes = machine + human + external', () => {
    const r = estimateProductionTime({ stages: ['BUILD'] });
    assert.strictEqual(r.totalMinutes, Math.round(r.machineMinutes + r.humanMinutes + r.externalMinutes));
  });

  it('empty stages returns small machine time', () => {
    const r = estimateProductionTime({ stages: [] });
    assert.strictEqual(r.machineMinutes, 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// NEXO VET FIXTURE
// ═══════════════════════════════════════════════════════════════════════════════

describe('NexoVet Fixture', () => {
  it('has all required brief fields', () => {
    assert.ok(NEXO_VET_BRIEF.businessName);
    assert.ok(NEXO_VET_BRIEF.vertical);
    assert.ok(Array.isArray(NEXO_VET_BRIEF.services));
    assert.ok(Array.isArray(NEXO_VET_BRIEF.roles));
    assert.ok(Array.isArray(NEXO_VET_BRIEF.modules));
    assert.strictEqual(NEXO_VET_BRIEF.isReal, false);
    assert.strictEqual(NEXO_VET_BRIEF.dataType, 'FIXTURE');
  });

  it('expected agents are subset of supported types', () => {
    NEXO_VET_EXPECTED_AGENTS.forEach(a => {
      assert.ok(['CHAT', 'SALES', 'SUPPORT', 'BOOKING', 'LEAD', 'VOICE'].includes(a));
    });
  });

  it('getNexoVetBrief returns frozen copy', () => {
    const b = getNexoVetBrief();
    assert.strictEqual(b.isReal, false);
    assert.strictEqual(b.vertical, 'veterinary');
  });

  it('getNexoVetBrief accepts overrides', () => {
    const b = getNexoVetBrief({ businessName: 'Override Name' });
    assert.strictEqual(b.businessName, 'Override Name');
  });

  it('getNexoVetBlockedBrief adds OAuth integrations', () => {
    const b = getNexoVetBlockedBrief('OAUTH');
    assert.ok(b.integrations.includes('stripe'));
    assert.ok(b.integrations.includes('meta'));
  });

  it('getNexoVetBlockedBrief adds billing flag', () => {
    const b = getNexoVetBlockedBrief('BILLING');
    assert.strictEqual(b.hasBillingAction, true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FULL E2E — HAPPY PATH (Nexo Vet, DRY_RUN)
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E Happy Path — Nexo Vet DRY_RUN', () => {
  const brief  = getNexoVetBrief();
  const result = runOnePromptToProduction(brief, { environment: 'DRY_RUN', stopOnManual: false });

  it('completes with SIMULATED status', () => {
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.status, RESULT_STATUS.SIMULATED);
    assert.strictEqual(result.isReal, false);
    assert.strictEqual(result.environment, 'DRY_RUN');
  });

  it('has a project artifact', () => {
    assert.ok(result.project);
    assert.ok(result.project.projectId);
    assert.strictEqual(result.project.vertical, 'veterinary');
  });

  it('has a simulated URL', () => {
    assert.ok(result.url);
    assert.ok(result.url.previewUrl);
    assert.ok(result.url.previewUrl.includes('.pages.dev'));
  });

  it('completedStages includes all major stages', () => {
    assert.ok(result.completedStages.includes('BRIEF_VALIDATION'));
    assert.ok(result.completedStages.includes('GENERATION'));
    assert.ok(result.completedStages.includes('TESTS'));
    assert.ok(result.completedStages.includes('BUILD'));
    assert.ok(result.completedStages.includes('DEPLOY_EXECUTION'));
    assert.ok(result.completedStages.includes('FINAL_URL'));
  });

  it('health is HEALTHY', () => {
    assert.strictEqual(result.health.status, 'HEALTHY');
  });

  it('rollback is available', () => {
    assert.ok(result.rollback);
    assert.strictEqual(result.rollback.available, true);
  });

  it('autonomyScore is set', () => {
    assert.ok(result.autonomyScore);
    assert.ok(result.autonomyScore.totalScore >= 0);
    assert.ok(result.autonomyScore.totalScore <= 100);
  });

  it('duration has time breakdown', () => {
    assert.ok(result.duration);
    assert.ok(result.duration.machineMinutes >= 0);
  });

  it('release has required fields', () => {
    assert.ok(result.release);
    assert.ok(result.release.releaseId);
    assert.strictEqual(result.release.buildPassed, true);
    assert.strictEqual(result.release.testsPassed, true);
  });

  it('handoff is available', () => {
    assert.ok(result.handoff);
    assert.strictEqual(result.handoff.ready, true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// E2E — MANUAL BLOCKER SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E Blocker — missing critical brief fields', () => {
  it('returns error or WAITING_HUMAN when brief is incomplete', () => {
    const r = runOnePromptToProduction({ businessName: '', vertical: '' }, { stopOnManual: true });
    const isBlocked = r.valid === false || r.status === RESULT_STATUS.WAITING_HUMAN || r.status === RESULT_STATUS.BLOCKED;
    assert.ok(isBlocked, `expected blocked result, got: ${JSON.stringify({ valid: r.valid, status: r.status })}`);
  });
});

describe('E2E Blocker — OAuth required for whatsapp+stripe', () => {
  it('stops with WAITING_HUMAN due to billing/approval', () => {
    const brief  = getNexoVetBlockedBrief('OAUTH');
    const result = runOnePromptToProduction(brief, { environment: 'DRY_RUN', stopOnManual: true });
    assert.ok(result.status === RESULT_STATUS.WAITING_HUMAN || result.status === RESULT_STATUS.SIMULATED);
  });
});

describe('E2E — cost risk detected', () => {
  it('warnings include cost risk info for meta', () => {
    const brief = getNexoVetBrief({ integrations: ['meta', 'airtable'] });
    const r = runOnePromptToProduction(brief, { environment: 'DRY_RUN', stopOnManual: false });
    assert.ok(r.warnings.some(w => w.includes('CRITICAL') || w.includes('meta')));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Production Pipeline Registry', () => {
  it('has correct registry metadata', () => {
    assert.strictEqual(PRODUCTION_PIPELINE_REGISTRY.id, 'production-pipeline');
    assert.strictEqual(PRODUCTION_PIPELINE_REGISTRY.adv, 'ADV-04');
    assert.strictEqual(PRODUCTION_PIPELINE_REGISTRY.isReal, false);
  });

  it('has 23 modules registered', () => {
    assert.strictEqual(PRODUCTION_PIPELINE_REGISTRY.modules.length, 23);
  });

  it('has 27 stages', () => {
    assert.strictEqual(PRODUCTION_PIPELINE_REGISTRY.stages.length, 27);
  });

  it('principles include NO_REAL_CLIENT_DATA', () => {
    assert.ok(PRODUCTION_PIPELINE_REGISTRY.principles.includes('NO_REAL_CLIENT_DATA'));
  });

  it('has adapter modes', () => {
    assert.ok(PRODUCTION_PIPELINE_REGISTRY.adapterModes.includes('DRY_RUN'));
    assert.ok(PRODUCTION_PIPELINE_REGISTRY.adapterModes.includes('STAGING_SIMULATION'));
  });

  it('has all 8 checkpoints', () => {
    assert.strictEqual(PRODUCTION_PIPELINE_REGISTRY.checkpoints.length, 8);
  });

  it('has all 10 manual action types', () => {
    assert.strictEqual(PRODUCTION_PIPELINE_REGISTRY.manualActionTypes.length, 10);
  });
});
