// ADV-20 Health Dashboard — barrel export + guardrails

// Core
export { HEALTH_DIMENSION, HEALTH_STATUS } from './core/healthDimension.js';
export { createHealthSignal } from './core/healthSignal.js';
export { createHealthSnapshot } from './core/healthSnapshot.js';
export { createHealthAggregator } from './core/healthAggregator.js';
export { computeOverallHealthScore } from './core/overallHealthScore.js';
export { createHealthWeightPolicy, WEIGHT_PROFILE } from './core/healthWeightPolicy.js';

// Adapters
export { createProductionReadinessHealth, PRODUCTION_READINESS_STATUS } from './adapters/productionReadinessHealth.js';
export { createTestHealthAdapter as createTestHealthSignal } from './adapters/testHealthAdapter.js';
export { createCICDHealthAdapter as createCicdHealthSignal } from './adapters/cicdHealthAdapter.js';
export { createBuildHealthAdapter as createBuildHealthSignal, BUILD_DURATION_CLASS } from './adapters/buildHealthAdapter.js';
export { createObservabilityHealthAdapter as createObservabilityHealthSignal } from './adapters/observabilityHealthAdapter.js';
export { createSecurityHealthAdapter as createSecurityHealthSignal } from './adapters/securityHealthAdapter.js';
export { createPrivacyHealthAdapter as createPrivacyHealthSignal } from './adapters/privacyHealthAdapter.js';
export { createGDPRHealthAdapter as createGdprHealthSignal } from './adapters/gdprHealthAdapter.js';
export { createCMPHealthAdapter as createCmpHealthSignal } from './adapters/cmpHealthAdapter.js';
export { createBackupHealthAdapter as createBackupHealthSignal, BACKUP_FRESHNESS } from './adapters/backupHealthAdapter.js';
export { createBusinessTruthHealthAdapter as createBusinessTruthHealthSignal } from './adapters/businessTruthHealthAdapter.js';
export { createAIRouterHealthAdapter as createAiRouterHealthSignal } from './adapters/aiRouterHealthAdapter.js';
export { createAgentHealthAdapter as createAgentHealthSignal } from './adapters/agentHealthAdapter.js';
export { createMultiagentHealthAdapter as createMultiagentHealthSignal } from './adapters/multiagentHealthAdapter.js';
export { createMCPHealthAdapter as createMcpHealthSignal } from './adapters/mcpHealthAdapter.js';
export { createVoiceHealthAdapter as createVoiceHealthSignal } from './adapters/voiceHealthAdapter.js';
export { createCRMHealthAdapter as createCrmHealthSignal } from './adapters/crmHealthAdapter.js';
export { createLeadHealthAdapter as createLeadHealthSignal } from './adapters/leadHealthAdapter.js';
export { createSocialHealthAdapter as createSocialHealthSignal } from './adapters/socialHealthAdapter.js';
export { createMediaHealthAdapter as createMediaHealthSignal } from './adapters/mediaHealthAdapter.js';
export { createBrowserQAHealthAdapter as createBrowserQAHealthSignal } from './adapters/browserQAHealthAdapter.js';
export { createRuntimeHealthAdapter as createRuntimeHealthSignal } from './adapters/runtimeHealthAdapter.js';
export { createClientIsolationHealthAdapter as createClientIsolationHealthSignal, ISOLATION_DOMAIN_HEALTH } from './adapters/clientIsolationHealthAdapter.js';

// Signals
export { createHealthSignalFreshnessPolicy, FRESHNESS_STATUS, SIGNAL_FRESHNESS } from './signals/healthSignalFreshnessPolicy.js';
export { createUnknownHealthPolicy, UNKNOWN_IMPACT } from './signals/unknownHealthPolicy.js';

// History
export { createHealthHistory } from './history/healthHistory.js';
export { computeHealthTrend, TREND_STATUS } from './history/healthTrend.js';

// Risk
export { createHealthRisk, RISK_IMPACT, RISK_LIKELIHOOD } from './risk/healthRisk.js';
export { prioritizeHealthRisks } from './risk/riskPrioritization.js';

// Actions
export { createHealthNextAction, generateNextActions, ACTION_PRIORITY, OWNER_TYPE } from './actions/healthNextActionEngine.js';

// Alerts
export { createHealthAlert, ALERT_TYPE } from './alerts/healthAlert.js';
export { createHealthAlertPolicy } from './alerts/healthAlertPolicy.js';
export { createHealthAlertDeduplicator, deduplicateAlerts } from './alerts/healthAlertDeduplicator.js';

// Bridges
export { createIncidentBridge, INCIDENT_FOUNDATION_STATUS } from './bridges/incidentBridge.js';
export { createMultiagentBridge } from './bridges/multiagentBridge.js';
export { createAIRouterBridge, createAIRouterBridge as createAiRouterBridge } from './bridges/aiRouterBridge.js';
export { createHealthBackupBridge, createHealthBackupBridge as createBackupBridge } from './bridges/backupBridge.js';
export { createHealthSecurityBridge, createHealthSecurityBridge as createSecurityBridge } from './bridges/securityBridge.js';
export { createHealthProductionPipelineBridge, createHealthProductionPipelineBridge as createProductionPipelineBridge } from './bridges/productionPipelineBridge.js';
export { createHealthCICDBridge, createHealthCICDBridge as createCicdBridge } from './bridges/cicdBridge.js';
export { createHealthMakeBridge, createHealthMakeBridge as createMakeBridge } from './bridges/makeBridge.js';
export { createHealthObservabilityBridge, createHealthObservabilityBridge as createObservabilityBridge, HEALTH_OBS_EVENT } from './bridges/observabilityBridge.js';

// Dashboard
export { DASHBOARD_SECTION, createHealthDashboardModel } from './dashboard/healthDashboardModel.js';
export { createHealthExecutiveSummary } from './dashboard/healthExecutiveSummary.js';
export { createHealthTechnicalView } from './dashboard/healthTechnicalView.js';
export { createHealthClientView } from './dashboard/healthClientView.js';
export { createHealthAgencyView } from './dashboard/healthAgencyView.js';
export { createFactoryHealthView } from './dashboard/factoryHealthView.js';
export { createGeneratedSaaSHealthProfile } from './dashboard/generatedSaaSHealthProfile.js';
export { createHealthMobileDashboardModel } from './dashboard/healthMobileDashboardModel.js';
export { createHealthDetailedDashboardModel } from './dashboard/healthDetailedDashboardModel.js';

// Components
export { createHealthComponentStatus } from './components/healthComponentStatus.js';
export { createHealthServiceStatus, SERVICE_TYPE } from './components/healthServiceStatus.js';
export { createHealthDependencyMap } from './components/healthDependencyMap.js';
export { createHealthRootCauseAnalyzer, ROOT_CAUSE_CONFIDENCE } from './components/healthRootCauseAnalyzer.js';
export { createHealthScoreExplanation } from './components/healthScoreExplanation.js';
export { createHealthServiceObjective, SLO_TYPE, SLO_STATUS } from './components/healthServiceObjective.js';
export { createMaintenanceHealthProfile, MAINTENANCE_ISSUE_TYPE } from './components/maintenanceHealthProfile.js';
export { createHealthBusinessImpact, BUSINESS_IMPACT_LEVEL } from './components/healthBusinessImpact.js';
export { createAutomationHealthProfile, AUTOMATION_ENGINE, AUTOMATION_HEALTH_STATUS } from './components/automationHealthProfile.js';

// Accessibility
export { createHealthVisualSemantics, VISUAL_ICON, VISUAL_LABEL, VISUAL_ARIA_LABEL } from './accessibility/healthVisualSemantics.js';

// Quality
export { computeHealthDashboardQualityScore, QUALITY_FACTOR } from './quality/healthDashboardQualityScore.js';
export { runHealthDashboardQualityGate, QUALITY_GATE_BLOCK_REASON } from './quality/healthDashboardQualityGate.js';

// Fixtures
export { ALL_HEALTHY_FIXTURES } from './fixtures/healthyFixtures.js';
export { ALL_FAILURE_FIXTURES } from './fixtures/failureFixtures.js';
export { ALL_CASCADING_FIXTURES } from './fixtures/cascadingFixtures.js';
export { ALL_RECOVERY_FIXTURES } from './fixtures/recoveryFixtures.js';

export const HEALTH_GUARDRAILS = Object.freeze({
  NO_REAL_ALERT_SEND: true,
  NO_REAL_EXTERNAL_ACTION: true,
  NO_REAL_DEPLOY: true,
  NO_REAL_COST: true,
  CP04_TOUCHED: false,
  BOT_TRADING_TOUCHED: false,
  AURORA_TOUCHED: false,
  FISIONOVA_TOUCHED: false,
  EDUCA_ARCHIDONA_TOUCHED: false,
  REAL_INCIDENT_MUTATED: false,
  REAL_BACKUP_RESTORED: false,
  REAL_DEPLOYMENT_EXECUTED: false,
  SECRET_LEAKED: false,
  CROSS_CLIENT_DATA_EXPOSED: false,
  MAKE_MODE: 'DRY_RUN',
  AGENT_CAN_SILENCE_CRITICAL: false,
  AGENT_CAN_ALTER_SCORE: false,
  AGENT_CAN_EXECUTE_REMEDY_CRITICAL: false,
  SCORE_IS_DETERMINISTIC: true,
  LEGAL_CERTIFICATION: false,
});

export const ADV20_VERSION = '1.0.0';
export const ADV20_NAME = 'Health Dashboard Transversal';
