// Multi-Agent Engine V2 — ADV-17 barrel export
// Orchestration + Delegation + Supervision + Handoff + Shared Memory

// ── System ──────────────────────────────────────────────────────────────────
export { SYSTEM_STATE, createMultiAgentSystem, MULTI_AGENT_SYSTEM_VERSION } from './system/multiAgentSystem.js';
export { AGENT_AUTONOMY_LEVEL, DEFAULT_AUTONOMY_LEVEL, isHigherAutonomy, createAutonomyPolicy } from './system/agentAutonomyLevel.js';

// ── Roles ────────────────────────────────────────────────────────────────────
export { AGENT_ROLE, createAgentRoleDefinition } from './roles/agentRoleDefinition.js';

// ── Supervisor ───────────────────────────────────────────────────────────────
export { createSupervisorAgentPolicy } from './supervisor/supervisorAgentPolicy.js';

// ── Specialist ───────────────────────────────────────────────────────────────
export { createSpecialistAgentDefinition } from './specialist/specialistAgentDefinition.js';
export { createAgentSpecialistRegistry, buildDefaultRegistry } from './specialist/agentSpecialistRegistry.js';

// ── Tasks ────────────────────────────────────────────────────────────────────
export { TASK_STATUS, TASK_TYPE, TASK_PRIORITY, TASK_RISK, createAgentTask } from './tasks/agentTask.js';
export { createAgentTaskGraph } from './tasks/agentTaskGraph.js';
export { decomposeAgentObjective } from './tasks/taskDecomposer.js';

// ── Selection ────────────────────────────────────────────────────────────────
export { selectAgentForTask } from './selection/agentSelector.js';
export { buildAgentTeam } from './selection/dynamicTeamBuilder.js';

// ── Delegation ───────────────────────────────────────────────────────────────
export { createAgentDelegationContract } from './delegation/agentDelegationContract.js';
export { DELEGATION_STATUS, delegateAgentTask } from './delegation/delegationEngine.js';
export { EXEC_CLASSIFICATION, createAgentParallelExecutionPlanner } from './delegation/parallelExecutionPlanner.js';
export { createAgentWriteCoordinator } from './delegation/writeCoordinator.js';

// ── Context ──────────────────────────────────────────────────────────────────
export { CONTEXT_SECTION, createSharedAgentContext } from './context/sharedAgentContext.js';
export { createSharedContextPolicy } from './context/sharedContextPolicy.js';
export { MEMORY_TYPE, createMultiAgentMemoryPolicy } from './context/multiAgentMemoryPolicy.js';

// ── Handoff ──────────────────────────────────────────────────────────────────
export { HANDOFF_TYPE, createAgentHandoff } from './handoff/agentHandoff.js';
export { createAgentHandoffQualityEvaluator } from './handoff/handoffQualityEvaluator.js';

// ── Conflicts ────────────────────────────────────────────────────────────────
export { CONFLICT_TYPE, createAgentConflictDetector } from './conflicts/conflictDetector.js';
export { createAgentConflictResolutionPolicy } from './conflicts/conflictResolutionPolicy.js';
export { CONSENSUS_METHOD, createAgentConsensusPolicy } from './conflicts/consensusPolicy.js';
export { createAgentCriticPolicy, createQAAgentProfile } from './conflicts/criticPolicy.js';

// ── Permissions ──────────────────────────────────────────────────────────────
export { PERMISSION_SCOPE, createMultiAgentPermissionPolicy } from './permissions/multiAgentPermissionPolicy.js';
export { createAgentPermissionEscalationPolicy } from './permissions/permissionEscalationPolicy.js';
export { APPROVAL_TRIGGER, createMultiAgentHumanApprovalPolicy } from './permissions/humanApprovalPolicy.js';

// ── Reliability ──────────────────────────────────────────────────────────────
export { STOP_REASON, createMultiAgentStopPolicy } from './reliability/stopPolicy.js';
export { LOOP_TYPE, createAgentLoopDetector } from './reliability/loopDetector.js';
export { DEADLOCK_TYPE, createAgentDeadlockDetector } from './reliability/deadlockDetector.js';
export { RECOVERY_ACTION, createMultiAgentRecoveryPolicy } from './reliability/recoveryPolicy.js';
export { createAgentReplacementPolicy } from './reliability/agentReplacementPolicy.js';
export { createMultiAgentCheckpoint } from './reliability/checkpoint.js';
export { IDEMPOTENCY_DOMAIN, createMultiAgentIdempotencyPolicy } from './reliability/idempotencyPolicy.js';

// ── Output ───────────────────────────────────────────────────────────────────
export { aggregateMultiAgentResults } from './output/resultAggregator.js';
export { createMultiAgentResponseComposer } from './output/responseComposer.js';
export { createMultiAgentDecisionSummary } from './output/decisionSummary.js';

// ── Quality ──────────────────────────────────────────────────────────────────
export { computeMultiAgentQualityScore } from './quality/qualityScore.js';
export { MULTIAGENT_GATE_STATUS, MULTIAGENT_BLOCK_REASON, evaluateMultiAgentQualityGate } from './quality/qualityGate.js';
export { computeMultiAgentEfficiencyScore } from './quality/efficiencyScore.js';
export { EVAL_DIMENSION_V2, createAgentEvaluationV2 } from './quality/agentEvaluationV2.js';

// ── Teams ────────────────────────────────────────────────────────────────────
export { TEAM_PRESET, getTeamPreset, buildTeamFromPreset } from './teams/teamPresets.js';
export { createMultiAgentClientProfile } from './teams/clientProfile.js';

// ── Security ─────────────────────────────────────────────────────────────────
export { SECURITY_BLOCK_REASON, createMultiAgentSecurityPolicy } from './security/securityPolicy.js';
export { createAgentDelegationInjectionGuard } from './security/injectionGuard.js';
export { DATA_SENSITIVITY, createMultiAgentPrivacyPolicy } from './security/privacyPolicy.js';

// ── Performance ──────────────────────────────────────────────────────────────
export { createMultiAgentPerformancePolicy } from './performance/performancePolicy.js';

// ── Trace ────────────────────────────────────────────────────────────────────
export { createMultiAgentTrace } from './trace/multiAgentTrace.js';
export { BUDGET_EXCEEDED_REASON, createMultiAgentBudgetPolicy } from './trace/budgetPolicy.js';

// ── Bridges ──────────────────────────────────────────────────────────────────
export { MULTIAGENT_EVENT, emitMultiAgentEvent, createMultiAgentObservabilityBridge } from './bridges/observabilityBridge.js';
export { createV1CompatibilityBridge, V1_COMPATIBILITY_BRIDGE_VERSION } from './bridges/v1CompatibilityBridge.js';
export { createMultiAgentAIRouterBridge, MULTIAGENT_AI_ROUTER_BRIDGE_VERSION } from './bridges/aiRouterBridge.js';
export { createMultiAgentMCPBridge, MULTIAGENT_MCP_BRIDGE_VERSION } from './bridges/mcpBridge.js';
export { createMultiAgentBusinessTruthBridge, MULTIAGENT_BUSINESS_TRUTH_BRIDGE_VERSION } from './bridges/businessTruthBridge.js';
export { CICD_MULTIAGENT_CHECK, createMultiAgentCICDBridge, MULTIAGENT_CICD_BRIDGE_VERSION } from './bridges/cicdBridge.js';
export { PROD_MULTIAGENT_CHECK, createMultiAgentProductionBridge, MULTIAGENT_PRODUCTION_BRIDGE_VERSION } from './bridges/productionBridge.js';
export { LEAD_ACTION, createMultiAgentLeadEngineBridge, MULTIAGENT_LEAD_ENGINE_BRIDGE_VERSION } from './bridges/leadEngineBridge.js';
export { CRM_ACTION, createMultiAgentCRMBridge, MULTIAGENT_CRM_BRIDGE_VERSION } from './bridges/crmBridge.js';

// ── Fixtures ─────────────────────────────────────────────────────────────────
export { TEAM_FIXTURES } from './fixtures/teamFixtures.js';
export { GOOD_WORKFLOW_FIXTURES } from './fixtures/goodWorkflowFixtures.js';
export { FAILURE_WORKFLOW_FIXTURES } from './fixtures/failureWorkflowFixtures.js';

// ── Meta ─────────────────────────────────────────────────────────────────────
export const MULTI_AGENT_LAYER_VERSION = '2.0.0';
export const ADV17_STATUS             = '100_PERCENT';
export const MULTI_AGENT_V2_INTEGRATED = true;

export const MULTI_AGENT_GUARDRAILS = Object.freeze({
  FACTORY_AGENCY_SCOPE_ONLY:    true,
  NO_REAL_EXTERNAL_ACTIONS:     true,
  NO_REAL_SPEND:                true,
  NO_REAL_OUTREACH:             true,
  UNLIMITED_AUTONOMY_FORBIDDEN: true,
  SELF_PERMISSION_GRANT:        false,
  CROSS_CLIENT_MEMORY:          false,
  BUSINESS_TRUTH_BYPASS:        false,
  INFINITE_LOOPS:               false,
  CHAIN_OF_THOUGHT_EXPOSED:     false,
});
