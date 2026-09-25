// Health Dashboard Registry — ADV-20

export const HEALTH_DASHBOARD_REGISTRY = Object.freeze({
  version: '4.4.0',
  name: 'ADV-20 Health Dashboard Transversal',
  scope: 'FACTORY_AGENCY',

  guardrails: Object.freeze({
    NO_REAL_ALERT_SEND: true,
    NO_REAL_EXTERNAL_ACTION: true,
    NO_REAL_DEPLOY: true,
    NO_REAL_COST: true,
    CP04_TOUCHED: false,
    MAKE_MODE: 'DRY_RUN',
    AGENT_CAN_SILENCE_CRITICAL: false,
    AGENT_CAN_ALTER_SCORE: false,
    LEGAL_CERTIFICATION: false,
    SCORE_IS_DETERMINISTIC: true,
  }),

  modules: Object.freeze({
    // Core
    healthDimension:       { path: 'health/core/healthDimension.js', dimensions: 27, statuses: 7 },
    healthSignal:          { path: 'health/core/healthSignal.js' },
    healthSnapshot:        { path: 'health/core/healthSnapshot.js' },
    healthAggregator:      { path: 'health/core/healthAggregator.js', adv01Connected: true },
    overallHealthScore:    { path: 'health/core/overallHealthScore.js', deterministic: true },
    healthWeightPolicy:    { path: 'health/core/healthWeightPolicy.js', profiles: 5 },

    // Adapters (23)
    productionReadiness:   { path: 'health/adapters/productionReadinessHealth.js', adv04Connected: true },
    testHealth:            { path: 'health/adapters/testHealthAdapter.js' },
    cicdHealth:            { path: 'health/adapters/cicdHealthAdapter.js', adv02Connected: true },
    buildHealth:           { path: 'health/adapters/buildHealthAdapter.js' },
    observabilityHealth:   { path: 'health/adapters/observabilityHealthAdapter.js', adv01Connected: true },
    securityHealth:        { path: 'health/adapters/securityHealthAdapter.js', adv19Connected: true },
    privacyHealth:         { path: 'health/adapters/privacyHealthAdapter.js', adv19Connected: true },
    gdprHealth:            { path: 'health/adapters/gdprHealthAdapter.js', adv19Connected: true, legalCertification: false },
    cmpHealth:             { path: 'health/adapters/cmpHealthAdapter.js', adv19Connected: true },
    backupHealth:          { path: 'health/adapters/backupHealthAdapter.js', adv18Connected: true },
    businessTruthHealth:   { path: 'health/adapters/businessTruthHealthAdapter.js', adv10bConnected: true },
    aiRouterHealth:        { path: 'health/adapters/aiRouterHealthAdapter.js', adv16Connected: true },
    agentHealth:           { path: 'health/adapters/agentHealthAdapter.js', adv03Connected: true, adv10Connected: true },
    multiagentHealth:      { path: 'health/adapters/multiagentHealthAdapter.js', adv17Connected: true },
    mcpHealth:             { path: 'health/adapters/mcpHealthAdapter.js', adv12Connected: true },
    voiceHealth:           { path: 'health/adapters/voiceHealthAdapter.js', adv11Connected: true, noRealCall: true },
    crmHealth:             { path: 'health/adapters/crmHealthAdapter.js', adv09Connected: true, noRealData: true },
    leadHealth:            { path: 'health/adapters/leadHealthAdapter.js', adv08Connected: true },
    socialHealth:          { path: 'health/adapters/socialHealthAdapter.js', adv14Connected: true, noRealPublish: true },
    mediaHealth:           { path: 'health/adapters/mediaHealthAdapter.js', adv13Connected: true },
    browserQAHealth:       { path: 'health/adapters/browserQAHealthAdapter.js', adv06Connected: true },
    runtimeHealth:         { path: 'health/adapters/runtimeHealthAdapter.js', adv15Connected: true },
    clientIsolationHealth: { path: 'health/adapters/clientIsolationHealthAdapter.js', adv19Connected: true, isolationDomains: 10 },

    // Signals
    freshnessPolicy:       { path: 'health/signals/healthSignalFreshnessPolicy.js' },
    unknownPolicy:         { path: 'health/signals/unknownHealthPolicy.js' },

    // History
    healthHistory:         { path: 'health/history/healthHistory.js', noRealDB: true },
    healthTrend:           { path: 'health/history/healthTrend.js' },

    // Risk
    healthRisk:            { path: 'health/risk/healthRisk.js' },
    riskPrioritization:    { path: 'health/risk/riskPrioritization.js' },

    // Actions
    nextActionEngine:      { path: 'health/actions/healthNextActionEngine.js', priorities: 5, ownerTypes: 7 },

    // Alerts
    healthAlert:           { path: 'health/alerts/healthAlert.js', alertTypes: 10, noRealAlertSend: true },
    healthAlertPolicy:     { path: 'health/alerts/healthAlertPolicy.js', noRealAlertSend: true },
    alertDeduplicator:     { path: 'health/alerts/healthAlertDeduplicator.js' },

    // Bridges (9)
    incidentBridge:          { path: 'health/bridges/incidentBridge.js', adv01Connected: true, adv19Connected: true, noRealIncident: true },
    multiagentBridge:        { path: 'health/bridges/multiagentBridge.js', adv17Connected: true, canSilenceCritical: false },
    aiRouterBridge:          { path: 'health/bridges/aiRouterBridge.js', adv16Connected: true, coreIsDeterministic: true },
    backupBridge:            { path: 'health/bridges/backupBridge.js', adv18Connected: true },
    securityBridge:          { path: 'health/bridges/securityBridge.js', adv19Connected: true },
    productionPipelineBridge: { path: 'health/bridges/productionPipelineBridge.js', adv04Connected: true, canDeploy: false },
    cicdBridge:              { path: 'health/bridges/cicdBridge.js', adv02Connected: true },
    makeBridge:              { path: 'health/bridges/makeBridge.js', mode: 'DRY_RUN', noRealScenario: true },
    observabilityBridge:     { path: 'health/bridges/observabilityBridge.js', adv01Connected: true, obsEvents: 8 },

    // Dashboard
    dashboardModel:        { path: 'health/dashboard/healthDashboardModel.js', sections: 13, noCP04: true },
    executiveSummary:      { path: 'health/dashboard/healthExecutiveSummary.js' },
    technicalView:         { path: 'health/dashboard/healthTechnicalView.js', secretsExcluded: true },
    clientView:            { path: 'health/dashboard/healthClientView.js', sensitiveInfoExcluded: true },
    agencyView:            { path: 'health/dashboard/healthAgencyView.js', fixtureOnly: true },
    factoryView:           { path: 'health/dashboard/factoryHealthView.js', noCP04: true },
    generatedSaaSProfile:  { path: 'health/dashboard/generatedSaaSHealthProfile.js', canInheritHealthFramework: true },
    mobileDashboard:       { path: 'health/dashboard/healthMobileDashboardModel.js', compact: true },
    detailedDashboard:     { path: 'health/dashboard/healthDetailedDashboardModel.js' },

    // Components
    componentStatus:       { path: 'health/components/healthComponentStatus.js' },
    serviceStatus:         { path: 'health/components/healthServiceStatus.js', noRealPing: true },
    dependencyMap:         { path: 'health/components/healthDependencyMap.js' },
    rootCauseAnalyzer:     { path: 'health/components/healthRootCauseAnalyzer.js', heuristic: true },
    scoreExplanation:      { path: 'health/components/healthScoreExplanation.js', deterministic: true },
    serviceObjective:      { path: 'health/components/healthServiceObjective.js', sloTypes: 5, noRealMeasurement: true },
    maintenanceProfile:    { path: 'health/components/maintenanceHealthProfile.js' },
    businessImpact:        { path: 'health/components/healthBusinessImpact.js', noRealRevenueData: true },
    automationProfile:     { path: 'health/components/automationHealthProfile.js', engines: ['MAKE','MCP','AGENT','VOICE','BROWSER'], mode: 'DRY_RUN' },

    // Accessibility
    visualSemantics:       { path: 'health/accessibility/healthVisualSemantics.js', colorIndependent: true },

    // Quality
    qualityScore:          { path: 'health/quality/healthDashboardQualityScore.js', factors: 9 },
    qualityGate:           { path: 'health/quality/healthDashboardQualityGate.js', blockReasons: 7 },

    // Fixtures
    healthyFixtures:       { path: 'health/fixtures/healthyFixtures.js', count: 21 },
    failureFixtures:       { path: 'health/fixtures/failureFixtures.js', count: 21 },
    cascadingFixtures:     { path: 'health/fixtures/cascadingFixtures.js', count: 6 },
    recoveryFixtures:      { path: 'health/fixtures/recoveryFixtures.js', count: 6 },

    // Index
    healthIndex:           { path: 'health/index.js' },
  }),

  totalModules: 69,
  adapters: 23,
  bridges: 9,
  fixtureScenarios: 54,
  qualityFactors: 9,
  qualityGateBlockReasons: 7,
  healthDimensions: 27,
  healthStatuses: 7,
  isolationDomains: 10,
  obsEvents: 8,
});
