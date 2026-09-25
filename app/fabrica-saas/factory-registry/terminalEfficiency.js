// Terminal Efficiency Registry — ADV-05

export const TERMINAL_EFFICIENCY_REGISTRY = Object.freeze({
  id:          'terminal-efficiency',
  adv:         'ADV-05',
  version:     '1.0.0',
  description: 'Terminal efficiency, command minimization and safe autonomy engine',
  isReal:      false,

  modules: [
    'safeCommandPolicy', 'commandBatcher', 'validationPlanner',
    'changeImpactAnalyzer', 'validationResultCache', 'terminalCheckpoint',
    'parallelExecutionPlanner', 'failFastPolicy', 'safeRetryPolicy',
    'repoContextSnapshot', 'activeScopeManager', 'qualityGateRunner',
    'autoContinuePolicy', 'terminalWorkflowRunner', 'humanInterruptionPolicy',
    'gitEfficiencyHelper', 'testSelector', 'buildSelector',
    'observabilityIntegration', 'terminalEfficiencyMetrics', 'speedupCalculator',
    'fixtures/efficiencyFixture', 'index',
  ],

  commandTiers: ['SAFE_AUTO', 'SAFE_WITH_SCOPE', 'HUMAN_REQUIRED', 'BLOCKED'],
  validationModes: ['FAST', 'MODULE', 'FULL', 'CRITICAL'],
  impactLevels:    ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  checkpoints: [
    'AUDIT_DONE', 'IMPLEMENTATION_DONE', 'TARGETED_TESTS_PASS',
    'FULL_TESTS_PASS', 'LINT_PASS', 'BUILD_PASS', 'PR_CREATED', 'CI_PASS', 'MERGED',
  ],

  targets: {
    commandReductionPercent:     50,
    confirmationReductionPercent: 90,
    wallClockSpeedupPercent:     15,
    centralTarget:               22,
  },

  principles: [
    'SPEED_NEVER_REDUCES_SECURITY',
    'NO_REAL_CLIENT_DATA',
    'NO_AUTO_APPROVE_BILLING',
    'NO_AUTO_APPROVE_OAUTH',
    'NO_DESTRUCTIVE_AUTO',
    'FACTORY_SCOPE_ONLY',
    'isReal_false_always',
  ],
});
