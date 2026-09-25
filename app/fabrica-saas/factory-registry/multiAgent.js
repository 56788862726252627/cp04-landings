// ADV-17 — Agent Engine V2 Multi-Agent Registry

export const MULTI_AGENT_REGISTRY = Object.freeze({
  name:    'Agent Engine V2 — Multi-Agent Orchestration',
  version: '2.0.0',
  adv:     'ADV-17',
  status:  '100_PERCENT',

  modules: Object.freeze([
    // System
    'multi-agent/system/multiAgentSystem',
    'multi-agent/system/agentAutonomyLevel',
    // Roles
    'multi-agent/roles/agentRoleDefinition',
    // Supervisor
    'multi-agent/supervisor/supervisorAgentPolicy',
    // Specialist
    'multi-agent/specialist/specialistAgentDefinition',
    'multi-agent/specialist/agentSpecialistRegistry',
    // Tasks
    'multi-agent/tasks/agentTask',
    'multi-agent/tasks/agentTaskGraph',
    'multi-agent/tasks/taskDecomposer',
    // Selection
    'multi-agent/selection/agentSelector',
    'multi-agent/selection/dynamicTeamBuilder',
    // Delegation
    'multi-agent/delegation/agentDelegationContract',
    'multi-agent/delegation/delegationEngine',
    'multi-agent/delegation/parallelExecutionPlanner',
    'multi-agent/delegation/writeCoordinator',
    // Context
    'multi-agent/context/sharedAgentContext',
    'multi-agent/context/sharedContextPolicy',
    'multi-agent/context/multiAgentMemoryPolicy',
    // Handoff
    'multi-agent/handoff/agentHandoff',
    'multi-agent/handoff/handoffQualityEvaluator',
    // Conflicts
    'multi-agent/conflicts/conflictDetector',
    'multi-agent/conflicts/conflictResolutionPolicy',
    'multi-agent/conflicts/consensusPolicy',
    'multi-agent/conflicts/criticPolicy',
    // Permissions
    'multi-agent/permissions/multiAgentPermissionPolicy',
    'multi-agent/permissions/permissionEscalationPolicy',
    'multi-agent/permissions/humanApprovalPolicy',
    // Reliability
    'multi-agent/reliability/stopPolicy',
    'multi-agent/reliability/loopDetector',
    'multi-agent/reliability/deadlockDetector',
    'multi-agent/reliability/recoveryPolicy',
    'multi-agent/reliability/agentReplacementPolicy',
    'multi-agent/reliability/checkpoint',
    'multi-agent/reliability/idempotencyPolicy',
    // Output
    'multi-agent/output/resultAggregator',
    'multi-agent/output/responseComposer',
    'multi-agent/output/decisionSummary',
    // Quality
    'multi-agent/quality/qualityScore',
    'multi-agent/quality/qualityGate',
    'multi-agent/quality/efficiencyScore',
    'multi-agent/quality/agentEvaluationV2',
    // Teams
    'multi-agent/teams/teamPresets',
    'multi-agent/teams/clientProfile',
    // Security
    'multi-agent/security/securityPolicy',
    'multi-agent/security/injectionGuard',
    'multi-agent/security/privacyPolicy',
    // Performance
    'multi-agent/performance/performancePolicy',
    // Trace
    'multi-agent/trace/multiAgentTrace',
    'multi-agent/trace/budgetPolicy',
    // Bridges
    'multi-agent/bridges/observabilityBridge',
    'multi-agent/bridges/v1CompatibilityBridge',
    'multi-agent/bridges/aiRouterBridge',
    'multi-agent/bridges/mcpBridge',
    'multi-agent/bridges/businessTruthBridge',
    'multi-agent/bridges/cicdBridge',
    'multi-agent/bridges/productionBridge',
    'multi-agent/bridges/leadEngineBridge',
    'multi-agent/bridges/crmBridge',
    // Fixtures
    'multi-agent/fixtures/teamFixtures',
    'multi-agent/fixtures/goodWorkflowFixtures',
    'multi-agent/fixtures/failureWorkflowFixtures',
  ]),

  guardrails: Object.freeze({
    FACTORY_AGENCY_SCOPE_ONLY:    true,
    NO_REAL_EXTERNAL_ACTIONS:     true,
    NO_REAL_SPEND:                true,
    NO_REAL_OUTREACH:             true,
    UNLIMITED_AUTONOMY_FORBIDDEN: true,
    SELF_PERMISSION_GRANT:        false,
    CROSS_CLIENT_MEMORY:          false,
    BUSINESS_TRUTH_BYPASS:        false,
    CHAIN_OF_THOUGHT_EXPOSED:     false,
  }),

  keyCapabilities: Object.freeze([
    'Supervisor + Specialist agent architecture',
    'Task decomposition with DFS cycle detection',
    'Parallel execution planning with write coordination',
    'Shared context with private scratch isolation',
    '8 predefined handoff types with quality evaluator',
    'Conflict resolution with priority order (safety > business truth > human > policy)',
    'Consensus with maxCycles cap (no infinite loops)',
    'Human approval gates for payments, Ads, production deploy, sensitive exports',
    'Loop + deadlock detection and recovery',
    '10 quality gate BLOCK_REASONs',
    '7 team presets (SALES/BOOKING/SUPPORT/CONTENT/LEAD/OPERATIONS/GENERAL)',
    'V1 single-agent fallback always available',
    'Client isolation enforced on every memory/context access',
    'Prompt injection guard (8 patterns)',
  ]),
});
