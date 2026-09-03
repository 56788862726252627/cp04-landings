// ADV-20 Health Dashboard — Comprehensive Test Suite
// 250+ tests covering all 69 modules, guardrails, priority rules, cascade scenarios

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Core
import { HEALTH_DIMENSION, HEALTH_STATUS } from '../../health/core/healthDimension.js';
import { createHealthSignal } from '../../health/core/healthSignal.js';
import { createHealthSnapshot } from '../../health/core/healthSnapshot.js';
import { createHealthAggregator } from '../../health/core/healthAggregator.js';
import { computeOverallHealthScore } from '../../health/core/overallHealthScore.js';
import { createHealthWeightPolicy, WEIGHT_PROFILE } from '../../health/core/healthWeightPolicy.js';

// Adapters
import { createProductionReadinessHealth, PRODUCTION_READINESS_STATUS } from '../../health/adapters/productionReadinessHealth.js';
import { createTestHealthAdapter as createTestHealthSignal } from '../../health/adapters/testHealthAdapter.js';
import { createCICDHealthAdapter as createCicdHealthSignal } from '../../health/adapters/cicdHealthAdapter.js';
import { createBuildHealthAdapter as createBuildHealthSignal, BUILD_DURATION_CLASS } from '../../health/adapters/buildHealthAdapter.js';
import { createObservabilityHealthAdapter as createObservabilityHealthSignal } from '../../health/adapters/observabilityHealthAdapter.js';
import { createSecurityHealthAdapter as createSecurityHealthSignal } from '../../health/adapters/securityHealthAdapter.js';
import { createPrivacyHealthAdapter as createPrivacyHealthSignal } from '../../health/adapters/privacyHealthAdapter.js';
import { createGDPRHealthAdapter as createGdprHealthSignal } from '../../health/adapters/gdprHealthAdapter.js';
import { createCMPHealthAdapter as createCmpHealthSignal } from '../../health/adapters/cmpHealthAdapter.js';
import { createBackupHealthAdapter as createBackupHealthSignal, BACKUP_FRESHNESS } from '../../health/adapters/backupHealthAdapter.js';
import { createBusinessTruthHealthAdapter as createBusinessTruthHealthSignal } from '../../health/adapters/businessTruthHealthAdapter.js';
import { createAIRouterHealthAdapter as createAiRouterHealthSignal } from '../../health/adapters/aiRouterHealthAdapter.js';
import { createAgentHealthAdapter as createAgentHealthSignal } from '../../health/adapters/agentHealthAdapter.js';
import { createMultiagentHealthAdapter as createMultiagentHealthSignal } from '../../health/adapters/multiagentHealthAdapter.js';
import { createMCPHealthAdapter as createMcpHealthSignal } from '../../health/adapters/mcpHealthAdapter.js';
import { createVoiceHealthAdapter as createVoiceHealthSignal } from '../../health/adapters/voiceHealthAdapter.js';
import { createCRMHealthAdapter as createCrmHealthSignal } from '../../health/adapters/crmHealthAdapter.js';
import { createLeadHealthAdapter as createLeadHealthSignal } from '../../health/adapters/leadHealthAdapter.js';
import { createSocialHealthAdapter as createSocialHealthSignal } from '../../health/adapters/socialHealthAdapter.js';
import { createMediaHealthAdapter as createMediaHealthSignal } from '../../health/adapters/mediaHealthAdapter.js';
import { createBrowserQAHealthAdapter as createBrowserQAHealthSignal } from '../../health/adapters/browserQAHealthAdapter.js';
import { createRuntimeHealthAdapter as createRuntimeHealthSignal } from '../../health/adapters/runtimeHealthAdapter.js';
import { createClientIsolationHealthAdapter as createClientIsolationHealthSignal, ISOLATION_DOMAIN_HEALTH } from '../../health/adapters/clientIsolationHealthAdapter.js';

// Signals
import { createHealthSignalFreshnessPolicy, SIGNAL_FRESHNESS } from '../../health/signals/healthSignalFreshnessPolicy.js';
import { createUnknownHealthPolicy, UNKNOWN_IMPACT } from '../../health/signals/unknownHealthPolicy.js';

// History
import { createHealthHistory } from '../../health/history/healthHistory.js';
import { computeHealthTrend, TREND_STATUS } from '../../health/history/healthTrend.js';

// Risk
import { createHealthRisk, RISK_IMPACT, RISK_LIKELIHOOD } from '../../health/risk/healthRisk.js';
import { prioritizeHealthRisks } from '../../health/risk/riskPrioritization.js';

// Actions
import { createHealthNextAction, generateNextActions, ACTION_PRIORITY, OWNER_TYPE } from '../../health/actions/healthNextActionEngine.js';

// Alerts
import { createHealthAlert, ALERT_TYPE } from '../../health/alerts/healthAlert.js';
import { createHealthAlertPolicy } from '../../health/alerts/healthAlertPolicy.js';
import { deduplicateAlerts } from '../../health/alerts/healthAlertDeduplicator.js';

// Bridges
import { createIncidentBridge, INCIDENT_FOUNDATION_STATUS } from '../../health/bridges/incidentBridge.js';
import { createMultiagentBridge } from '../../health/bridges/multiagentBridge.js';
import { createAIRouterBridge as createAiRouterBridge } from '../../health/bridges/aiRouterBridge.js';
import { createHealthBackupBridge as createBackupBridge } from '../../health/bridges/backupBridge.js';
import { createHealthSecurityBridge as createSecurityBridge } from '../../health/bridges/securityBridge.js';
import { createHealthProductionPipelineBridge as createProductionPipelineBridge } from '../../health/bridges/productionPipelineBridge.js';
import { createHealthCICDBridge as createCicdBridge } from '../../health/bridges/cicdBridge.js';
import { createHealthMakeBridge as createMakeBridge } from '../../health/bridges/makeBridge.js';
import { createHealthObservabilityBridge as createObservabilityBridge, HEALTH_OBS_EVENT } from '../../health/bridges/observabilityBridge.js';

// Dashboard
import { DASHBOARD_SECTION, createHealthDashboardModel } from '../../health/dashboard/healthDashboardModel.js';
import { createHealthExecutiveSummary } from '../../health/dashboard/healthExecutiveSummary.js';
import { createHealthTechnicalView } from '../../health/dashboard/healthTechnicalView.js';
import { createHealthClientView } from '../../health/dashboard/healthClientView.js';
import { createHealthAgencyView } from '../../health/dashboard/healthAgencyView.js';
import { createFactoryHealthView } from '../../health/dashboard/factoryHealthView.js';
import { createGeneratedSaaSHealthProfile } from '../../health/dashboard/generatedSaaSHealthProfile.js';
import { createHealthMobileDashboardModel } from '../../health/dashboard/healthMobileDashboardModel.js';
import { createHealthDetailedDashboardModel } from '../../health/dashboard/healthDetailedDashboardModel.js';

// Components
import { createHealthComponentStatus } from '../../health/components/healthComponentStatus.js';
import { createHealthServiceStatus, SERVICE_TYPE } from '../../health/components/healthServiceStatus.js';
import { createHealthDependencyMap } from '../../health/components/healthDependencyMap.js';
import { createHealthRootCauseAnalyzer, ROOT_CAUSE_CONFIDENCE } from '../../health/components/healthRootCauseAnalyzer.js';
import { createHealthScoreExplanation } from '../../health/components/healthScoreExplanation.js';
import { createHealthServiceObjective, SLO_TYPE, SLO_STATUS } from '../../health/components/healthServiceObjective.js';
import { createMaintenanceHealthProfile, MAINTENANCE_ISSUE_TYPE } from '../../health/components/maintenanceHealthProfile.js';
import { createHealthBusinessImpact, BUSINESS_IMPACT_LEVEL } from '../../health/components/healthBusinessImpact.js';
import { createAutomationHealthProfile, AUTOMATION_ENGINE, AUTOMATION_HEALTH_STATUS } from '../../health/components/automationHealthProfile.js';

// Accessibility
import { createHealthVisualSemantics, VISUAL_ICON, VISUAL_LABEL, VISUAL_ARIA_LABEL } from '../../health/accessibility/healthVisualSemantics.js';

// Quality
import { computeHealthDashboardQualityScore, QUALITY_FACTOR } from '../../health/quality/healthDashboardQualityScore.js';
import { runHealthDashboardQualityGate, QUALITY_GATE_BLOCK_REASON } from '../../health/quality/healthDashboardQualityGate.js';

// Fixtures
import { ALL_HEALTHY_FIXTURES, HEALTHY_FIXTURE_ALL_GREEN, HEALTHY_FIXTURE_WARNING_ACCEPTABLE, HEALTHY_FIXTURE_QUALITY_GATE_PASSES } from '../../health/fixtures/healthyFixtures.js';
import { ALL_FAILURE_FIXTURES, FAILURE_FIXTURE_HIGH_SCORE_BUT_BLOCKED, FAILURE_FIXTURE_STALE_SIGNALS, FAILURE_FIXTURE_SECRET_LEAK, FAILURE_FIXTURE_CROSS_CLIENT_LEAK } from '../../health/fixtures/failureFixtures.js';
import { ALL_CASCADING_FIXTURES, CASCADE_BUSINESS_TRUTH_TO_AGENTS, CASCADE_CMP_TO_GDPR_TO_MARKETING } from '../../health/fixtures/cascadingFixtures.js';
import { ALL_RECOVERY_FIXTURES, RECOVERY_CI_SECRET_REMOVED } from '../../health/fixtures/recoveryFixtures.js';

// Index
import { HEALTH_GUARDRAILS, ADV20_VERSION } from '../../health/index.js';

// Registry
import { HEALTH_DASHBOARD_REGISTRY } from '../../factory-registry/healthDashboard.js';
import { REGISTRY_VERSION, PASO_ADV20_STATUS } from '../../factory-registry/index.js';

const D = HEALTH_DIMENSION;
const S = HEALTH_STATUS;

// ── CORE ──────────────────────────────────────────────────────────────────────

describe('HEALTH_DIMENSION', () => {
  it('has 27 dimensions', () => {
    assert.equal(Object.keys(HEALTH_DIMENSION).length, 27);
  });
  it('has all required dimensions', () => {
    assert.ok(D.SECURITY);
    assert.ok(D.CLIENT_ISOLATION);
    assert.ok(D.PRODUCTION_READINESS);
    assert.ok(D.BACKUPS);
    assert.ok(D.RESTORE);
    assert.ok(D.BUSINESS_TRUTH);
  });
  it('is frozen', () => {
    assert.ok(Object.isFrozen(HEALTH_DIMENSION));
  });
});

describe('HEALTH_STATUS', () => {
  it('has 7 statuses', () => {
    assert.equal(Object.keys(HEALTH_STATUS).length, 7);
  });
  it('includes BLOCKED and UNKNOWN', () => {
    assert.ok(S.BLOCKED);
    assert.ok(S.UNKNOWN);
    assert.ok(S.NOT_APPLICABLE);
  });
  it('is frozen', () => {
    assert.ok(Object.isFrozen(HEALTH_STATUS));
  });
});

describe('createHealthSignal', () => {
  it('requires dimension and status', () => {
    const s = createHealthSignal({ dimension: D.SECURITY, status: S.HEALTHY });
    assert.equal(s.dimension, D.SECURITY);
    assert.equal(s.status, S.HEALTHY);
  });
  it('returns error for missing dimension', () => {
    const s = createHealthSignal({});
    assert.ok(s.error);
  });
  it('has isReal=false', () => {
    const s = createHealthSignal({ dimension: D.SYSTEM, status: S.HEALTHY });
    assert.equal(s.isReal, false);
  });
  it('is frozen', () => {
    const s = createHealthSignal({ dimension: D.SYSTEM, status: S.HEALTHY });
    assert.ok(Object.isFrozen(s));
  });
  it('has timestamp', () => {
    const s = createHealthSignal({ dimension: D.SYSTEM, status: S.HEALTHY });
    assert.ok(s.timestamp);
  });
});

describe('createHealthSnapshot', () => {
  it('aggregates signals correctly', () => {
    const signals = [
      createHealthSignal({ dimension: D.SECURITY, status: S.HEALTHY, score: 95 }),
      createHealthSignal({ dimension: D.CLIENT_ISOLATION, status: S.HEALTHY, score: 99 }),
    ];
    const snap = createHealthSnapshot({ signals });
    assert.ok(snap.overallStatus);
    assert.equal(snap.isReal, false);
  });
  it('is frozen', () => {
    const snap = createHealthSnapshot({});
    assert.ok(Object.isFrozen(snap));
  });
});

describe('createHealthAggregator', () => {
  it('has adv01Connected=true', () => {
    const agg = createHealthAggregator({});
    assert.equal(agg.adv01Connected, true);
  });
  it('addSignal and aggregate work', () => {
    const agg = createHealthAggregator({});
    agg.addSignal(createHealthSignal({ dimension: D.SECURITY, status: S.HEALTHY, score: 95 }));
    const snap = agg.aggregate();
    assert.ok(snap.overallScore >= 0);
    assert.equal(snap.isReal, false);
  });
  it('addSignals accepts array', () => {
    const agg = createHealthAggregator({});
    agg.addSignals([
      createHealthSignal({ dimension: D.SECURITY, status: S.HEALTHY, score: 90 }),
      createHealthSignal({ dimension: D.CLIENT_ISOLATION, status: S.HEALTHY, score: 95 }),
    ]);
    const snap = agg.aggregate();
    assert.ok(snap.overallScore > 0);
  });
  it('reset clears signals', () => {
    const agg = createHealthAggregator({});
    agg.addSignal(createHealthSignal({ dimension: D.SYSTEM, status: S.HEALTHY, score: 90 }));
    agg.reset();
    const snap = agg.aggregate();
    assert.equal(snap.overallScore, 0);
  });
});

describe('computeOverallHealthScore', () => {
  it('returns BLOCKED when any signal is BLOCKED', () => {
    const signals = [
      { dimension: D.SECURITY, status: S.BLOCKED, score: 0 },
      { dimension: D.SYSTEM, status: S.HEALTHY, score: 99 },
    ];
    const result = computeOverallHealthScore(signals);
    assert.equal(result.overallStatus, S.BLOCKED);
  });
  it('high score never hides BLOCKED', () => {
    const signals = [
      { dimension: D.SYSTEM, status: S.HEALTHY, score: 100 },
      { dimension: D.APPLICATION, status: S.HEALTHY, score: 100 },
      { dimension: D.SECURITY, status: S.BLOCKED, score: 0 },
    ];
    const result = computeOverallHealthScore(signals);
    assert.equal(result.overallStatus, S.BLOCKED);
  });
  it('returns grade A+ for score >= 90', () => {
    const signals = [
      { dimension: D.SECURITY, status: S.HEALTHY, score: 95 },
      { dimension: D.CLIENT_ISOLATION, status: S.HEALTHY, score: 97 },
    ];
    const result = computeOverallHealthScore(signals);
    assert.equal(result.grade, 'A+');
  });
  it('isReal=false', () => {
    const result = computeOverallHealthScore([]);
    assert.equal(result.isReal, false);
  });
});

describe('createHealthWeightPolicy', () => {
  it('has 5 weight profiles', () => {
    assert.equal(Object.keys(WEIGHT_PROFILE).length, 5);
  });
  it('SECURITY_FIRST assigns highest weight to SECURITY', () => {
    const policy = createHealthWeightPolicy({ profile: WEIGHT_PROFILE.SECURITY_FIRST });
    assert.ok(policy.weights[D.SECURITY] >= 15);
  });
  it('isReal=false', () => {
    const policy = createHealthWeightPolicy({});
    assert.equal(policy.isReal, false);
  });
});

// ── ADAPTERS ──────────────────────────────────────────────────────────────────

describe('productionReadinessAdapter', () => {
  it('has adv04Connected=true', () => {
    const r = createProductionReadinessHealth({});
    assert.equal(r.adv04Connected, true);
  });
  it('canDeploy=false always', () => {
    const r = createProductionReadinessHealth({ allCriticalDimensionsHealthy: true });
    assert.equal(r.canDeploy, false);
  });
  it('isReal=false', () => {
    const r = createProductionReadinessHealth({});
    assert.equal(r.isReal, false);
  });
  it('has PRODUCTION_READINESS_STATUS', () => {
    assert.ok(PRODUCTION_READINESS_STATUS.READY);
    assert.ok(PRODUCTION_READINESS_STATUS.BLOCKED);
  });
});

describe('testHealthAdapter', () => {
  it('HEALTHY for all passing', () => {
    const s = createTestHealthSignal({ totalTests: 100, passingTests: 98 });
    assert.equal(s.status, S.HEALTHY);
  });
  it('CRITICAL when failing critical suite', () => {
    const s = createTestHealthSignal({ totalTests: 100, passingTests: 40, failingTests: 60, criticalSuites: [{ failing: true }] });
    assert.equal(s.status, S.CRITICAL);
  });
  it('isReal=false', () => {
    const s = createTestHealthSignal({ totalTests: 100, passingTests: 80 });
    assert.equal(s.isReal, false);
  });
});

describe('cicdHealthAdapter', () => {
  it('BLOCKED when secretScanPass=false', () => {
    const s = createCicdHealthSignal({ secretScanPass: false });
    assert.equal(s.status, S.BLOCKED);
  });
  it('has adv02Connected=true', () => {
    const s = createCicdHealthSignal({});
    assert.equal(s.adv02Connected, true);
  });
  it('isReal=false', () => {
    const s = createCicdHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('buildHealthAdapter', () => {
  it('has BUILD_DURATION_CLASS', () => {
    assert.ok(BUILD_DURATION_CLASS.FAST);
    assert.ok(BUILD_DURATION_CLASS.TIMEOUT);
  });
  it('isReal=false', () => {
    const s = createBuildHealthSignal({ buildPassed: true });
    assert.equal(s.isReal, false);
  });
  it('CRITICAL when buildPassed=false', () => {
    const s = createBuildHealthSignal({ buildPassed: false });
    assert.equal(s.status, S.CRITICAL);
  });
});

describe('observabilityHealthAdapter', () => {
  it('has adv01Connected=true', () => {
    const s = createObservabilityHealthSignal({});
    assert.equal(s.adv01Connected, true);
  });
  it('isReal=false', () => {
    const s = createObservabilityHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('securityHealthAdapter', () => {
  it('BLOCKED on secretLeak', () => {
    const s = createSecurityHealthSignal({ secretLeak: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('BLOCKED on crossClientAccess', () => {
    const s = createSecurityHealthSignal({ crossClientAccess: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('BLOCKED on privilegeEscalation', () => {
    const s = createSecurityHealthSignal({ privilegeEscalation: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('has adv19Connected=true', () => {
    const s = createSecurityHealthSignal({});
    assert.equal(s.adv19Connected, true);
  });
  it('isReal=false', () => {
    const s = createSecurityHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('privacyHealthAdapter', () => {
  it('BLOCKED on marketingNoConsent', () => {
    const s = createPrivacyHealthSignal({ marketingNoConsent: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('BLOCKED on piiOversharing', () => {
    const s = createPrivacyHealthSignal({ piiOversharing: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('has adv19Connected=true', () => {
    const s = createPrivacyHealthSignal({});
    assert.equal(s.adv19Connected, true);
  });
  it('isReal=false', () => {
    const s = createPrivacyHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('gdprHealthAdapter', () => {
  it('legalCertification=false always', () => {
    const s = createGdprHealthSignal({ compliant: true });
    assert.equal(s.legalCertification, false);
  });
  it('has adv19Connected=true', () => {
    const s = createGdprHealthSignal({});
    assert.equal(s.adv19Connected, true);
  });
  it('isReal=false', () => {
    const s = createGdprHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('cmpHealthAdapter', () => {
  it('BLOCKED on forcedAccept', () => {
    const s = createCmpHealthSignal({ forcedAccept: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('BLOCKED on nonEssentialDefaultOn', () => {
    const s = createCmpHealthSignal({ nonEssentialDefaultOn: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('BLOCKED on withdrawImpossible', () => {
    const s = createCmpHealthSignal({ withdrawImpossible: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('has adv19Connected=true', () => {
    const s = createCmpHealthSignal({});
    assert.equal(s.adv19Connected, true);
  });
  it('isReal=false', () => {
    const s = createCmpHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('backupHealthAdapter', () => {
  it('BLOCKED when not encrypted', () => {
    const s = createBackupHealthSignal({ backupAgeHours: 2, encrypted: false });
    assert.equal(s.status, S.BLOCKED);
  });
  it('FRESH for age < 24h', () => {
    const s = createBackupHealthSignal({ backupAgeHours: 5, encrypted: true });
    assert.equal(s.freshness, BACKUP_FRESHNESS.FRESH);
  });
  it('STALE for age > 72h', () => {
    const s = createBackupHealthSignal({ backupAgeHours: 200, encrypted: true });
    assert.equal(s.freshness, BACKUP_FRESHNESS.STALE);
  });
  it('has adv18Connected=true', () => {
    const s = createBackupHealthSignal({});
    assert.equal(s.adv18Connected, true);
  });
  it('isReal=false', () => {
    const s = createBackupHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('businessTruthHealthAdapter', () => {
  it('CRITICAL when sourceAvailable=false', () => {
    const s = createBusinessTruthHealthSignal({ sourceAvailable: false });
    assert.equal(s.status, S.CRITICAL);
  });
  it('has adv10bConnected=true', () => {
    const s = createBusinessTruthHealthSignal({});
    assert.equal(s.adv10bConnected, true);
  });
  it('isReal=false', () => {
    const s = createBusinessTruthHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('aiRouterHealthAdapter', () => {
  it('CRITICAL when allDown=true and no fallback', () => {
    const s = createAiRouterHealthSignal({ providersHealthy: 0, providersTotal: 3, fallbackReady: false });
    assert.equal(s.status, S.CRITICAL);
  });
  it('BLOCKED on privacyBlocked', () => {
    const s = createAiRouterHealthSignal({ privacyBlocked: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('has adv16Connected=true', () => {
    const s = createAiRouterHealthSignal({});
    assert.equal(s.adv16Connected, true);
  });
  it('isReal=false', () => {
    const s = createAiRouterHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('agentHealthAdapter', () => {
  it('BLOCKED on selfPermissionAttempt', () => {
    const s = createAgentHealthSignal({ selfPermissionAttempt: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('has adv03Connected=true and adv10Connected=true', () => {
    const s = createAgentHealthSignal({});
    assert.equal(s.adv03Connected, true);
    assert.equal(s.adv10Connected, true);
  });
  it('isReal=false', () => {
    const s = createAgentHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('multiagentHealthAdapter', () => {
  it('BLOCKED on loopDetected', () => {
    const s = createMultiagentHealthSignal({ loopDetected: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('BLOCKED on deadlockDetected', () => {
    const s = createMultiagentHealthSignal({ deadlockDetected: true });
    assert.equal(s.status, S.BLOCKED);
  });
  it('has adv17Connected=true', () => {
    const s = createMultiagentHealthSignal({});
    assert.equal(s.adv17Connected, true);
  });
  it('isReal=false', () => {
    const s = createMultiagentHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('mcpHealthAdapter', () => {
  it('BLOCKED when unsafeWriteBlocked=false', () => {
    const s = createMcpHealthSignal({ serversTotal: 2, unsafeWriteBlocked: false });
    assert.equal(s.status, S.BLOCKED);
  });
  it('NOT_APPLICABLE when serversTotal=0', () => {
    const s = createMcpHealthSignal({ serversTotal: 0 });
    assert.equal(s.status, S.NOT_APPLICABLE);
  });
  it('has adv12Connected=true', () => {
    const s = createMcpHealthSignal({});
    assert.equal(s.adv12Connected, true);
  });
  it('isReal=false', () => {
    const s = createMcpHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('voiceHealthAdapter', () => {
  it('BLOCKED when safetyPassed=false', () => {
    const s = createVoiceHealthSignal({ safetyPassed: false });
    assert.equal(s.status, S.BLOCKED);
  });
  it('noRealCall=true', () => {
    const s = createVoiceHealthSignal({});
    assert.equal(s.noRealCall, true);
  });
  it('has adv11Connected=true', () => {
    const s = createVoiceHealthSignal({});
    assert.equal(s.adv11Connected, true);
  });
  it('isReal=false', () => {
    const s = createVoiceHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('crmHealthAdapter', () => {
  it('noRealData=true', () => {
    const s = createCrmHealthSignal({});
    assert.equal(s.noRealData, true);
  });
  it('has adv09Connected=true', () => {
    const s = createCrmHealthSignal({});
    assert.equal(s.adv09Connected, true);
  });
  it('isReal=false', () => {
    const s = createCrmHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('leadHealthAdapter', () => {
  it('has adv08Connected=true', () => {
    const s = createLeadHealthSignal({});
    assert.equal(s.adv08Connected, true);
  });
  it('isReal=false', () => {
    const s = createLeadHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('socialHealthAdapter', () => {
  it('noRealPublish=true', () => {
    const s = createSocialHealthSignal({});
    assert.equal(s.noRealPublish, true);
  });
  it('has adv14Connected=true', () => {
    const s = createSocialHealthSignal({});
    assert.equal(s.adv14Connected, true);
  });
  it('isReal=false', () => {
    const s = createSocialHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('mediaHealthAdapter', () => {
  it('BLOCKED when consentVerified=false', () => {
    const s = createMediaHealthSignal({ consentVerified: false });
    assert.equal(s.status, S.BLOCKED);
  });
  it('has adv13Connected=true', () => {
    const s = createMediaHealthSignal({});
    assert.equal(s.adv13Connected, true);
  });
  it('isReal=false', () => {
    const s = createMediaHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('browserQAHealthAdapter', () => {
  it('CRITICAL when deadControls > 0', () => {
    const s = createBrowserQAHealthSignal({ deadControls: 3, totalControls: 50 });
    assert.equal(s.status, S.CRITICAL);
  });
  it('has adv06Connected=true', () => {
    const s = createBrowserQAHealthSignal({});
    assert.equal(s.adv06Connected, true);
  });
  it('isReal=false', () => {
    const s = createBrowserQAHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('runtimeHealthAdapter', () => {
  it('CRITICAL when runtimeCompatible=false', () => {
    const s = createRuntimeHealthSignal({ runtimeCompatible: false });
    assert.equal(s.status, S.CRITICAL);
  });
  it('has adv15Connected=true', () => {
    const s = createRuntimeHealthSignal({});
    assert.equal(s.adv15Connected, true);
  });
  it('isReal=false', () => {
    const s = createRuntimeHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

describe('clientIsolationHealthAdapter', () => {
  it('BLOCKED when crossClientLeaks > 0', () => {
    const s = createClientIsolationHealthSignal({ crossClientLeaks: 2 });
    assert.equal(s.status, S.BLOCKED);
  });
  it('has adv19Connected=true', () => {
    const s = createClientIsolationHealthSignal({});
    assert.equal(s.adv19Connected, true);
  });
  it('has ISOLATION_DOMAIN_HEALTH with 10 domains', () => {
    assert.equal(Object.keys(ISOLATION_DOMAIN_HEALTH).length, 10);
  });
  it('isReal=false', () => {
    const s = createClientIsolationHealthSignal({});
    assert.equal(s.isReal, false);
  });
});

// ── SIGNALS ───────────────────────────────────────────────────────────────────

describe('healthSignalFreshnessPolicy', () => {
  it('FRESH for signal < 5min', () => {
    const policy = createHealthSignalFreshnessPolicy({});
    const result = policy.evaluate({ timestamp: new Date().toISOString() });
    assert.equal(result.status, SIGNAL_FRESHNESS.FRESH);
    assert.equal(result.trustworthy, true);
  });
  it('STALE for old signal → trustworthy=false', () => {
    const policy = createHealthSignalFreshnessPolicy({});
    const oldTs = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    const result = policy.evaluate({ timestamp: oldTs });
    assert.equal(result.status, SIGNAL_FRESHNESS.STALE);
    assert.equal(result.trustworthy, false);
  });
  it('isReal=false', () => {
    const policy = createHealthSignalFreshnessPolicy({});
    assert.equal(policy.isReal, false);
  });
});

describe('unknownHealthPolicy', () => {
  it('has UNKNOWN_IMPACT', () => {
    assert.ok(UNKNOWN_IMPACT.BLOCKS_PRODUCTION);
    assert.ok(UNKNOWN_IMPACT.WARRANTS_REVIEW);
    assert.ok(UNKNOWN_IMPACT.INFORMATIONAL);
  });
  it('BLOCKS_PRODUCTION for SECURITY', () => {
    const policy = createUnknownHealthPolicy({});
    const result = policy.evaluate({ status: S.UNKNOWN, dimension: D.SECURITY });
    assert.equal(result.impact, UNKNOWN_IMPACT.BLOCKS_PRODUCTION);
  });
  it('BLOCKS_PRODUCTION for CLIENT_ISOLATION', () => {
    const policy = createUnknownHealthPolicy({});
    const result = policy.evaluate({ status: S.UNKNOWN, dimension: D.CLIENT_ISOLATION });
    assert.equal(result.impact, UNKNOWN_IMPACT.BLOCKS_PRODUCTION);
  });
  it('isReal=false', () => {
    const policy = createUnknownHealthPolicy({});
    assert.equal(policy.isReal, false);
  });
});

// ── HISTORY ───────────────────────────────────────────────────────────────────

describe('healthHistory', () => {
  it('addSnapshot and getLatest work', () => {
    const h = createHealthHistory({ maxSize: 10 });
    h.addSnapshot({ overallScore: 90, overallStatus: S.HEALTHY, isReal: false });
    const latest = h.getLatest();
    assert.equal(latest.overallScore, 90);
  });
  it('noRealDB=true', () => {
    const h = createHealthHistory({});
    assert.equal(h.noRealDB, true);
  });
  it('getWindow returns subset', () => {
    const h = createHealthHistory({ maxSize: 10 });
    for (let i = 0; i < 5; i++) {
      h.addSnapshot({ overallScore: 80 + i, overallStatus: S.HEALTHY, isReal: false });
    }
    const window = h.getWindow(3);
    assert.equal(window.length, 3);
  });
  it('clear removes all snapshots', () => {
    const h = createHealthHistory({});
    h.addSnapshot({ overallScore: 90, overallStatus: S.HEALTHY, isReal: false });
    h.clear();
    assert.equal(h.getHistory().length, 0);
  });
  it('isReal=false', () => {
    const h = createHealthHistory({});
    assert.equal(h.isReal, false);
  });
});

describe('computeHealthTrend', () => {
  it('IMPROVING when score increases >5', () => {
    const snapshots = [
      { overallScore: 60 }, { overallScore: 70 }, { overallScore: 80 },
    ];
    const t = computeHealthTrend(snapshots);
    assert.equal(t.status, TREND_STATUS.IMPROVING);
  });
  it('DEGRADING when score drops >5', () => {
    const snapshots = [
      { overallScore: 90 }, { overallScore: 80 }, { overallScore: 70 },
    ];
    const t = computeHealthTrend(snapshots);
    assert.equal(t.status, TREND_STATUS.DEGRADING);
  });
  it('CRITICAL_DEGRADATION when drop >30', () => {
    const snapshots = [
      { overallScore: 95 }, { overallScore: 60 }, { overallScore: 30 },
    ];
    const t = computeHealthTrend(snapshots);
    assert.equal(t.status, TREND_STATUS.CRITICAL_DEGRADATION);
  });
  it('UNKNOWN for empty snapshots', () => {
    const t = computeHealthTrend([]);
    assert.equal(t.status, TREND_STATUS.UNKNOWN);
  });
  it('isReal=false', () => {
    const t = computeHealthTrend([{ overallScore: 80 }]);
    assert.equal(t.isReal, false);
  });
});

// ── RISK ─────────────────────────────────────────────────────────────────────

describe('createHealthRisk', () => {
  it('has RISK_IMPACT and RISK_LIKELIHOOD enums', () => {
    assert.ok(RISK_IMPACT.CRITICAL);
    assert.ok(RISK_LIKELIHOOD.LIKELY);
  });
  it('urgencyScore doubles for productionBlocker', () => {
    const r1 = createHealthRisk({ dimension: D.SECURITY, impact: RISK_IMPACT.HIGH, likelihood: RISK_LIKELIHOOD.POSSIBLE, productionBlocker: false });
    const r2 = createHealthRisk({ dimension: D.SECURITY, impact: RISK_IMPACT.HIGH, likelihood: RISK_LIKELIHOOD.POSSIBLE, productionBlocker: true });
    assert.ok(r2.urgencyScore > r1.urgencyScore);
  });
  it('isReal=false', () => {
    const r = createHealthRisk({ dimension: D.SECURITY });
    assert.equal(r.isReal, false);
  });
});

describe('prioritizeHealthRisks', () => {
  it('puts productionBlockers first', () => {
    const risks = [
      createHealthRisk({ dimension: D.SYSTEM, impact: RISK_IMPACT.LOW, likelihood: RISK_LIKELIHOOD.UNLIKELY, productionBlocker: false }),
      createHealthRisk({ dimension: D.SECURITY, impact: RISK_IMPACT.CRITICAL, likelihood: RISK_LIKELIHOOD.LIKELY, productionBlocker: true }),
    ];
    const result = prioritizeHealthRisks(risks);
    assert.equal(result.prioritized[0].productionBlocker, true);
  });
  it('returns prioritized array', () => {
    const result = prioritizeHealthRisks([]);
    assert.ok(Array.isArray(result.prioritized));
  });
});

// ── ACTIONS ───────────────────────────────────────────────────────────────────

describe('healthNextActionEngine', () => {
  it('has ACTION_PRIORITY and OWNER_TYPE', () => {
    assert.ok(ACTION_PRIORITY.P0_CRITICAL);
    assert.ok(OWNER_TYPE.ENGINEER);
    assert.ok(OWNER_TYPE.SECURITY);
    assert.ok(OWNER_TYPE.LEGAL);
  });
  it('createHealthNextAction returns frozen object', () => {
    const a = createHealthNextAction({ priority: ACTION_PRIORITY.P0_CRITICAL, owner: OWNER_TYPE.SECURITY, action: 'Fix secret leak', dimension: D.SECURITY });
    assert.ok(Object.isFrozen(a));
    assert.equal(a.executed, false);
    assert.equal(a.isReal, false);
  });
  it('generateNextActions from snapshot with criticalIssues', () => {
    const snapshot = {
      criticalIssues: [{ dimension: D.SECURITY, status: S.BLOCKED }],
      warnings: [],
    };
    const actions = generateNextActions(snapshot);
    assert.ok(actions.length > 0);
    assert.equal(actions[0].executed, false);
  });
});

// ── ALERTS ────────────────────────────────────────────────────────────────────

describe('createHealthAlert', () => {
  it('has 10 alert types', () => {
    assert.equal(Object.keys(ALERT_TYPE).length, 10);
  });
  it('sent=false always', () => {
    const a = createHealthAlert({ type: ALERT_TYPE.SECURITY, dimension: D.SECURITY, severity: 'CRITICAL' });
    assert.equal(a.sent, false);
  });
  it('noRealAlertSend=true', () => {
    const a = createHealthAlert({ type: ALERT_TYPE.CLIENT_ISOLATION, dimension: D.CLIENT_ISOLATION });
    assert.equal(a.noRealAlertSend, true);
  });
  it('has dedupKey', () => {
    const a = createHealthAlert({ type: ALERT_TYPE.CRITICAL_FAILURE, dimension: D.SYSTEM });
    assert.ok(a.dedupKey);
  });
  it('isReal=false', () => {
    const a = createHealthAlert({ type: ALERT_TYPE.BACKUP, dimension: D.BACKUPS });
    assert.equal(a.isReal, false);
  });
});

describe('createHealthAlertPolicy', () => {
  it('cooldown=0 for SECURITY', () => {
    const policy = createHealthAlertPolicy({});
    assert.equal(policy.getCooldown(ALERT_TYPE.SECURITY), 0);
  });
  it('cooldown=0 for CLIENT_ISOLATION', () => {
    const policy = createHealthAlertPolicy({});
    assert.equal(policy.getCooldown(ALERT_TYPE.CLIENT_ISOLATION), 0);
  });
  it('noRealAlertSend=true', () => {
    const policy = createHealthAlertPolicy({});
    assert.equal(policy.noRealAlertSend, true);
  });
  it('isReal=false', () => {
    const policy = createHealthAlertPolicy({});
    assert.equal(policy.isReal, false);
  });
});

describe('deduplicateAlerts', () => {
  it('deduplicates same alertType+dimension within window', () => {
    const alerts = [
      createHealthAlert({ type: ALERT_TYPE.SECURITY, dimension: D.SECURITY }),
      createHealthAlert({ type: ALERT_TYPE.SECURITY, dimension: D.SECURITY }),
    ];
    const result = deduplicateAlerts(alerts);
    assert.equal(result.unique.length, 1);
    assert.equal(result.deduplicatedCount, 1);
  });
  it('keeps different alertTypes separate', () => {
    const alerts = [
      createHealthAlert({ type: ALERT_TYPE.SECURITY, dimension: D.SECURITY }),
      createHealthAlert({ type: ALERT_TYPE.CLIENT_ISOLATION, dimension: D.CLIENT_ISOLATION }),
    ];
    const result = deduplicateAlerts(alerts);
    assert.equal(result.unique.length, 2);
  });
  it('isReal=false on result', () => {
    const result = deduplicateAlerts([]);
    assert.equal(result.isReal, false);
  });
});

// ── BRIDGES ───────────────────────────────────────────────────────────────────

describe('incidentBridge', () => {
  it('has INCIDENT_FOUNDATION_STATUS', () => {
    assert.ok(INCIDENT_FOUNDATION_STATUS);
  });
  it('noRealIncident=true', () => {
    const b = createIncidentBridge({});
    assert.equal(b.noRealIncident, true);
  });
  it('adv01Connected and adv19Connected=true', () => {
    const b = createIncidentBridge({});
    assert.equal(b.adv01Connected, true);
    assert.equal(b.adv19Connected, true);
  });
  it('isReal=false', () => {
    const b = createIncidentBridge({});
    assert.equal(b.isReal, false);
  });
});

describe('multiagentBridge', () => {
  it('canSilenceCritical=false', () => {
    const b = createMultiagentBridge({});
    assert.equal(b.canSilenceCritical, false);
  });
  it('canAlterScore=false', () => {
    const b = createMultiagentBridge({});
    assert.equal(b.canAlterScore, false);
  });
  it('canExecuteRemedyCritical=false', () => {
    const b = createMultiagentBridge({});
    assert.equal(b.canExecuteRemedyCritical, false);
  });
  it('adv17Connected=true', () => {
    const b = createMultiagentBridge({});
    assert.equal(b.adv17Connected, true);
  });
  it('inspectHealth works', () => {
    const b = createMultiagentBridge({});
    const snap = { overallStatus: S.HEALTHY, overallScore: 90, criticalIssues: [] };
    const result = b.inspectHealth(snap);
    assert.ok(result.overallStatus);
    assert.equal(result.canAlterScore, false);
  });
  it('isReal=false', () => {
    const b = createMultiagentBridge({});
    assert.equal(b.isReal, false);
  });
});

describe('aiRouterBridge', () => {
  it('coreIsDeterministic=true', () => {
    const b = createAiRouterBridge({});
    assert.equal(b.coreIsDeterministic, true);
  });
  it('llmOptional=true', () => {
    const b = createAiRouterBridge({});
    assert.equal(b.llmOptional, true);
  });
  it('adv16Connected=true', () => {
    const b = createAiRouterBridge({});
    assert.equal(b.adv16Connected, true);
  });
  it('isReal=false', () => {
    const b = createAiRouterBridge({});
    assert.equal(b.isReal, false);
  });
});

describe('backupBridge', () => {
  it('adv18Connected=true', () => {
    const b = createBackupBridge({});
    assert.equal(b.adv18Connected, true);
  });
  it('isReal=false', () => {
    const b = createBackupBridge({});
    assert.equal(b.isReal, false);
  });
});

describe('securityBridge', () => {
  it('adv19Connected=true', () => {
    const b = createSecurityBridge({});
    assert.equal(b.adv19Connected, true);
  });
  it('isReal=false', () => {
    const b = createSecurityBridge({});
    assert.equal(b.isReal, false);
  });
});

describe('productionPipelineBridge', () => {
  it('canDeploy=false', () => {
    const b = createProductionPipelineBridge({});
    assert.equal(b.canDeploy, false);
  });
  it('noRealDeploy=true', () => {
    const b = createProductionPipelineBridge({});
    assert.equal(b.noRealDeploy, true);
  });
  it('adv04Connected=true', () => {
    const b = createProductionPipelineBridge({});
    assert.equal(b.adv04Connected, true);
  });
  it('isReal=false', () => {
    const b = createProductionPipelineBridge({});
    assert.equal(b.isReal, false);
  });
});

describe('cicdBridge', () => {
  it('adv02Connected=true', () => {
    const b = createCicdBridge({});
    assert.equal(b.adv02Connected, true);
  });
  it('isReal=false', () => {
    const b = createCicdBridge({});
    assert.equal(b.isReal, false);
  });
});

describe('makeBridge', () => {
  it('mode=DRY_RUN', () => {
    const b = createMakeBridge({});
    assert.equal(b.mode, 'DRY_RUN');
  });
  it('noRealScenario=true', () => {
    const b = createMakeBridge({});
    assert.equal(b.noRealScenario, true);
  });
  it('isReal=false', () => {
    const b = createMakeBridge({});
    assert.equal(b.isReal, false);
  });
});

describe('observabilityBridge', () => {
  it('has 8 HEALTH_OBS_EVENT types', () => {
    assert.equal(Object.keys(HEALTH_OBS_EVENT).length, 8);
  });
  it('adv01Connected=true', () => {
    const b = createObservabilityBridge({});
    assert.equal(b.adv01Connected, true);
  });
  it('isReal=false', () => {
    const b = createObservabilityBridge({});
    assert.equal(b.isReal, false);
  });
});

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

describe('healthDashboardModel', () => {
  it('has 13 DASHBOARD_SECTION types', () => {
    assert.equal(Object.keys(DASHBOARD_SECTION).length, 13);
  });
  it('noCP04=true', () => {
    const m = createHealthDashboardModel({});
    assert.equal(m.noCP04, true);
  });
  it('isReal=false', () => {
    const m = createHealthDashboardModel({});
    assert.equal(m.isReal, false);
  });
});

describe('healthExecutiveSummary', () => {
  it('has whatsWell, whatsConcerning, whatBlocks, whatToDoNow', () => {
    const s = createHealthExecutiveSummary({ overallStatus: S.HEALTHY, overallScore: 90, criticalIssues: [], warnings: [] }, []);
    assert.ok(Array.isArray(s.whatsWell));
    assert.ok(Array.isArray(s.whatsConcerning));
    assert.ok(Array.isArray(s.whatBlocks));
    assert.ok(Array.isArray(s.whatToDoNow));
  });
  it('isReal=false', () => {
    const s = createHealthExecutiveSummary(null, []);
    assert.equal(s.isReal, false);
  });
});

describe('healthTechnicalView', () => {
  it('secretsExcluded=true', () => {
    const v = createHealthTechnicalView({});
    assert.equal(v.secretsExcluded, true);
  });
  it('isReal=false', () => {
    const v = createHealthTechnicalView({});
    assert.equal(v.isReal, false);
  });
});

describe('healthClientView', () => {
  it('sensitiveInfoExcluded=true', () => {
    const v = createHealthClientView({});
    assert.equal(v.sensitiveInfoExcluded, true);
  });
  it('stackTracesExcluded=true', () => {
    const v = createHealthClientView({});
    assert.equal(v.stackTracesExcluded, true);
  });
  it('secretsExcluded=true', () => {
    const v = createHealthClientView({});
    assert.equal(v.secretsExcluded, true);
  });
  it('isReal=false', () => {
    const v = createHealthClientView({});
    assert.equal(v.isReal, false);
  });
});

describe('healthAgencyView', () => {
  it('fixtureOnly=true', () => {
    const v = createHealthAgencyView({});
    assert.equal(v.fixtureOnly, true);
  });
  it('isReal=false', () => {
    const v = createHealthAgencyView({});
    assert.equal(v.isReal, false);
  });
});

describe('factoryHealthView', () => {
  it('noCP04=true', () => {
    const v = createFactoryHealthView({});
    assert.equal(v.noCP04, true);
  });
  it('factoryScore=100 when all 8 flags true', () => {
    const v = createFactoryHealthView({
      coreHealthy: true, generationReady: true, qualityGatesPassed: true, aiSystemsHealthy: true,
      deploymentReady: true, securityGatePassed: true, backupReady: true, browserQAPassed: true,
    });
    assert.equal(v.factoryScore, 100);
  });
  it('factoryScore=0 when all false', () => {
    const v = createFactoryHealthView({
      coreHealthy: false, generationReady: false, qualityGatesPassed: false, aiSystemsHealthy: false,
      deploymentReady: false, securityGatePassed: false, backupReady: false, browserQAPassed: false,
    });
    assert.equal(v.factoryScore, 0);
  });
  it('factoryScore=50 when 4 of 8 flags true', () => {
    const v = createFactoryHealthView({
      coreHealthy: true, generationReady: true, qualityGatesPassed: true, aiSystemsHealthy: true,
      deploymentReady: false, securityGatePassed: false, backupReady: false, browserQAPassed: false,
    });
    assert.equal(v.factoryScore, 50);
  });
  it('isReal=false', () => {
    const v = createFactoryHealthView({});
    assert.equal(v.isReal, false);
  });
});

describe('generatedSaaSHealthProfile', () => {
  it('canInheritHealthFramework=true', () => {
    const p = createGeneratedSaaSHealthProfile({});
    assert.equal(p.canInheritHealthFramework, true);
  });
  it('isReal=false', () => {
    const p = createGeneratedSaaSHealthProfile({});
    assert.equal(p.isReal, false);
  });
});

describe('healthMobileDashboardModel', () => {
  it('compact=true', () => {
    const m = createHealthMobileDashboardModel({});
    assert.equal(m.compact, true);
  });
  it('limits criticals to 3', () => {
    const snapshot = {
      overallStatus: S.CRITICAL,
      overallScore: 10,
      criticalIssues: Array(10).fill({ dimension: D.SECURITY, status: S.CRITICAL }),
      warnings: [],
    };
    const m = createHealthMobileDashboardModel({ snapshot });
    assert.ok(m.critical.length <= 3);
  });
  it('isReal=false', () => {
    const m = createHealthMobileDashboardModel({});
    assert.equal(m.isReal, false);
  });
});

describe('healthDetailedDashboardModel', () => {
  it('detailed=true', () => {
    const m = createHealthDetailedDashboardModel({});
    assert.equal(m.detailed, true);
  });
  it('isReal=false', () => {
    const m = createHealthDetailedDashboardModel({});
    assert.equal(m.isReal, false);
  });
});

// ── COMPONENTS ────────────────────────────────────────────────────────────────

describe('healthComponentStatus', () => {
  it('requires component', () => {
    const c = createHealthComponentStatus({});
    assert.ok(c.error);
  });
  it('isReal=false', () => {
    const c = createHealthComponentStatus({ component: 'auth-service' });
    assert.equal(c.isReal, false);
  });
  it('is frozen', () => {
    const c = createHealthComponentStatus({ component: 'auth-service' });
    assert.ok(Object.isFrozen(c));
  });
});

describe('healthServiceStatus', () => {
  it('has 7 SERVICE_TYPEs', () => {
    assert.equal(Object.keys(SERVICE_TYPE).length, 7);
  });
  it('noRealPing=true', () => {
    const s = createHealthServiceStatus({ service: 'airtable' });
    assert.equal(s.noRealPing, true);
  });
  it('requires service', () => {
    const s = createHealthServiceStatus({});
    assert.ok(s.error);
  });
  it('isReal=false', () => {
    const s = createHealthServiceStatus({ service: 'stripe' });
    assert.equal(s.isReal, false);
  });
});

describe('healthDependencyMap', () => {
  it('propagateDegradation finds affected components', () => {
    const map = createHealthDependencyMap({
      entries: [
        { component: 'booking-agent', dependencies: [D.BUSINESS_TRUTH] },
        { component: 'social-agent', dependencies: [D.SOCIAL] },
      ],
    });
    const result = map.propagateDegradation(D.BUSINESS_TRUTH);
    assert.ok(result.affected.includes('booking-agent'));
    assert.ok(!result.affected.includes('social-agent'));
  });
  it('getChain returns dependencies for a component', () => {
    const map = createHealthDependencyMap({
      entries: [{ component: 'crm', dependencies: [D.BUSINESS_TRUTH, D.AI_ROUTER] }],
    });
    const chain = map.getChain('crm');
    assert.ok(chain.includes(D.BUSINESS_TRUTH));
  });
  it('isReal=false', () => {
    const map = createHealthDependencyMap({});
    assert.equal(map.isReal, false);
  });
});

describe('healthRootCauseAnalyzer', () => {
  it('returns UNKNOWN for empty criticalIssues', () => {
    const analyzer = createHealthRootCauseAnalyzer({});
    const result = analyzer.analyze({ criticalIssues: [] });
    assert.equal(result.confidence, ROOT_CAUSE_CONFIDENCE.UNKNOWN);
  });
  it('LIKELY when downstream affected', () => {
    const map = createHealthDependencyMap({
      entries: [{ component: 'booking-agent', dependencies: [D.BUSINESS_TRUTH] }],
    });
    const analyzer = createHealthRootCauseAnalyzer({ dependencyMap: map });
    const result = analyzer.analyze({ criticalIssues: [{ dimension: D.BUSINESS_TRUTH, status: S.CRITICAL }] });
    assert.equal(result.rootCauses[0].confidence, ROOT_CAUSE_CONFIDENCE.LIKELY);
  });
  it('heuristic=true always', () => {
    const analyzer = createHealthRootCauseAnalyzer({});
    const result = analyzer.analyze({ criticalIssues: [{ dimension: D.SECURITY, status: S.BLOCKED }] });
    assert.equal(result.rootCauses[0].heuristic, true);
  });
  it('isReal=false', () => {
    const analyzer = createHealthRootCauseAnalyzer({});
    const result = analyzer.analyze({ criticalIssues: [] });
    assert.equal(result.isReal, false);
  });
});

describe('healthScoreExplanation', () => {
  it('grade A+ for score >= 90', () => {
    const e = createHealthScoreExplanation({ score: 95, signals: [], blockers: [] });
    assert.equal(e.grade, 'A+');
  });
  it('grade F for score < 60', () => {
    const e = createHealthScoreExplanation({ score: 40, signals: [], blockers: [] });
    assert.equal(e.grade, 'F');
  });
  it('positive/negative factors derived from signals', () => {
    const signals = [
      { dimension: D.SECURITY, score: 95 },
      { dimension: D.TESTS, score: 30 },
    ];
    const e = createHealthScoreExplanation({ score: 62, signals, blockers: [] });
    assert.ok(e.topPositiveFactors.length > 0);
    assert.ok(e.topNegativeFactors.length > 0);
  });
  it('deterministic=true', () => {
    const e = createHealthScoreExplanation({ score: 80, signals: [], blockers: [] });
    assert.equal(e.deterministic, true);
  });
  it('isReal=false', () => {
    const e = createHealthScoreExplanation({ score: 80, signals: [], blockers: [] });
    assert.equal(e.isReal, false);
  });
});

describe('healthServiceObjective', () => {
  it('has 5 SLO types', () => {
    assert.equal(Object.keys(SLO_TYPE).length, 5);
  });
  it('MET when current >= target', () => {
    const slo = createHealthServiceObjective({ sloType: SLO_TYPE.AVAILABILITY, target: 99.9, current: 99.95, status: SLO_STATUS.MET });
    assert.equal(slo.status, SLO_STATUS.MET);
  });
  it('BREACHED when current < 95% of target', () => {
    const slo = createHealthServiceObjective({ sloType: SLO_TYPE.AVAILABILITY, target: 99.9, current: 90 });
    assert.equal(slo.status, SLO_STATUS.BREACHED);
  });
  it('requires valid sloType', () => {
    const slo = createHealthServiceObjective({ sloType: 'INVALID' });
    assert.ok(slo.error);
  });
  it('noRealMeasurement=true', () => {
    const slo = createHealthServiceObjective({ sloType: SLO_TYPE.AVAILABILITY, target: 99.9, current: 99.5 });
    assert.equal(slo.noRealMeasurement, true);
  });
  it('isReal=false', () => {
    const slo = createHealthServiceObjective({ sloType: SLO_TYPE.AVAILABILITY, target: 99.9, current: 99.5 });
    assert.equal(slo.isReal, false);
  });
});

describe('maintenanceHealthProfile', () => {
  it('detects stale dependency', () => {
    const p = createMaintenanceHealthProfile({ staleDependencies: 5 });
    assert.ok(p.issues.some(i => i.type === MAINTENANCE_ISSUE_TYPE.STALE_DEPENDENCY));
  });
  it('detects backup aging (>72h)', () => {
    const p = createMaintenanceHealthProfile({ backupAgingHours: 100 });
    assert.ok(p.issues.some(i => i.type === MAINTENANCE_ISSUE_TYPE.BACKUP_AGING));
  });
  it('hasCritical=true for unresolvedSecurity', () => {
    const p = createMaintenanceHealthProfile({ unresolvedSecurity: 1 });
    assert.equal(p.hasCritical, true);
  });
  it('clean profile has no issues', () => {
    const p = createMaintenanceHealthProfile({});
    assert.equal(p.issues.length, 0);
  });
  it('isReal=false', () => {
    const p = createMaintenanceHealthProfile({});
    assert.equal(p.isReal, false);
  });
});

describe('healthBusinessImpact', () => {
  it('CRITICAL on complianceRisk', () => {
    const i = createHealthBusinessImpact({ complianceRisk: true });
    assert.equal(i.level, BUSINESS_IMPACT_LEVEL.CRITICAL);
  });
  it('CRITICAL on dataAtRisk', () => {
    const i = createHealthBusinessImpact({ dataAtRisk: true });
    assert.equal(i.level, BUSINESS_IMPACT_LEVEL.CRITICAL);
  });
  it('HIGH on bookingBlocked', () => {
    const i = createHealthBusinessImpact({ bookingBlocked: true });
    assert.equal(i.level, BUSINESS_IMPACT_LEVEL.HIGH);
  });
  it('NONE with no issues', () => {
    const i = createHealthBusinessImpact({});
    assert.equal(i.level, BUSINESS_IMPACT_LEVEL.NONE);
  });
  it('noRealRevenueData=true', () => {
    const i = createHealthBusinessImpact({});
    assert.equal(i.noRealRevenueData, true);
  });
  it('isReal=false', () => {
    const i = createHealthBusinessImpact({});
    assert.equal(i.isReal, false);
  });
});

describe('automationHealthProfile', () => {
  it('FAILING when any engine fails', () => {
    const p = createAutomationHealthProfile({
      engines: [{ engine: AUTOMATION_ENGINE.MAKE, status: AUTOMATION_HEALTH_STATUS.FAILING }],
    });
    assert.equal(p.overallStatus, AUTOMATION_HEALTH_STATUS.FAILING);
  });
  it('INACTIVE when no engines', () => {
    const p = createAutomationHealthProfile({ engines: [] });
    assert.equal(p.overallStatus, AUTOMATION_HEALTH_STATUS.INACTIVE);
  });
  it('noRealScenario=true', () => {
    const p = createAutomationHealthProfile({});
    assert.equal(p.noRealScenario, true);
  });
  it('dryRun=true by default', () => {
    const p = createAutomationHealthProfile({});
    assert.equal(p.dryRun, true);
  });
  it('isReal=false', () => {
    const p = createAutomationHealthProfile({});
    assert.equal(p.isReal, false);
  });
});

// ── ACCESSIBILITY ─────────────────────────────────────────────────────────────

describe('healthVisualSemantics', () => {
  it('returns icon and label for HEALTHY', () => {
    const s = createHealthVisualSemantics(S.HEALTHY);
    assert.ok(s.icon);
    assert.equal(s.label, 'Healthy');
  });
  it('returns icon and label for BLOCKED', () => {
    const s = createHealthVisualSemantics(S.BLOCKED);
    assert.ok(s.icon);
    assert.equal(s.label, 'Blocked');
  });
  it('colorIndependent=true', () => {
    const s = createHealthVisualSemantics(S.CRITICAL);
    assert.equal(s.colorIndependent, true);
  });
  it('has ariaLabel for all statuses', () => {
    for (const status of Object.keys(S)) {
      const s = createHealthVisualSemantics(status);
      assert.ok(s.ariaLabel, `Missing ariaLabel for ${status}`);
    }
  });
  it('isReal=false', () => {
    const s = createHealthVisualSemantics(S.UNKNOWN);
    assert.equal(s.isReal, false);
  });
});

// ── QUALITY ───────────────────────────────────────────────────────────────────

describe('computeHealthDashboardQualityScore', () => {
  it('has 9 QUALITY_FACTORs', () => {
    assert.equal(Object.keys(QUALITY_FACTOR).length, 9);
  });
  it('perfect score when all factors=1', () => {
    const allPerfect = {};
    for (const k of Object.keys(QUALITY_FACTOR)) allPerfect[k] = 1;
    const result = computeHealthDashboardQualityScore(allPerfect);
    assert.ok(result.score >= 99);
    assert.equal(result.grade, 'A+');
  });
  it('zero score when all factors=0', () => {
    const result = computeHealthDashboardQualityScore({});
    assert.equal(result.score, 0);
    assert.equal(result.grade, 'F');
  });
  it('isReal=false', () => {
    const result = computeHealthDashboardQualityScore({});
    assert.equal(result.isReal, false);
  });
});

describe('runHealthDashboardQualityGate', () => {
  it('has 7 block reasons', () => {
    assert.equal(Object.keys(QUALITY_GATE_BLOCK_REASON).length, 7);
  });
  it('passes with no violations', () => {
    const result = runHealthDashboardQualityGate({});
    assert.equal(result.passed, true);
    assert.equal(result.blocks.length, 0);
  });
  it('blocks on CRITICAL_SIGNAL_HIDDEN', () => {
    const result = runHealthDashboardQualityGate({ hasCriticalSignals: true, criticalInDashboard: false });
    assert.ok(result.blocks.includes(QUALITY_GATE_BLOCK_REASON.CRITICAL_SIGNAL_HIDDEN));
    assert.equal(result.passed, false);
  });
  it('blocks on CROSS_CLIENT_LEAKAGE', () => {
    const result = runHealthDashboardQualityGate({ crossClientLeakage: true });
    assert.ok(result.blocks.includes(QUALITY_GATE_BLOCK_REASON.CROSS_CLIENT_LEAKAGE));
  });
  it('blocks on STALE_SHOWN_AS_HEALTHY', () => {
    const result = runHealthDashboardQualityGate({ staleShownAsHealthy: true });
    assert.ok(result.blocks.includes(QUALITY_GATE_BLOCK_REASON.STALE_SHOWN_AS_HEALTHY));
  });
  it('blocks on WRONG_PRODUCTION_READINESS', () => {
    const result = runHealthDashboardQualityGate({ productionReadyWhenBlocked: true });
    assert.ok(result.blocks.includes(QUALITY_GATE_BLOCK_REASON.WRONG_PRODUCTION_READINESS));
  });
  it('blocks on SECRET_LEAKAGE', () => {
    const result = runHealthDashboardQualityGate({ secretsExposed: true });
    assert.ok(result.blocks.includes(QUALITY_GATE_BLOCK_REASON.SECRET_LEAKAGE));
  });
  it('isReal=false', () => {
    const result = runHealthDashboardQualityGate({});
    assert.equal(result.isReal, false);
  });
});

// ── FIXTURES ──────────────────────────────────────────────────────────────────

describe('healthyFixtures', () => {
  it('has 21 healthy fixtures', () => {
    assert.equal(ALL_HEALTHY_FIXTURES.length, 21);
  });
  it('ALL_GREEN has productionReady=true', () => {
    assert.equal(HEALTHY_FIXTURE_ALL_GREEN.productionReady, true);
  });
  it('ALL_GREEN has 27 signals', () => {
    assert.equal(HEALTHY_FIXTURE_ALL_GREEN.signals.length, 27);
  });
  it('WARNING_ACCEPTABLE has overallStatus=WARNING but productionReady=true', () => {
    assert.equal(HEALTHY_FIXTURE_WARNING_ACCEPTABLE.overallStatus, S.WARNING);
    assert.equal(HEALTHY_FIXTURE_WARNING_ACCEPTABLE.productionReady, true);
  });
  it('QUALITY_GATE_PASSES: all params false → no blocks', () => {
    const result = runHealthDashboardQualityGate(HEALTHY_FIXTURE_QUALITY_GATE_PASSES.params);
    assert.equal(result.passed, HEALTHY_FIXTURE_QUALITY_GATE_PASSES.expectedPassed);
  });
});

describe('failureFixtures', () => {
  it('has 21 failure fixtures', () => {
    assert.equal(ALL_FAILURE_FIXTURES.length, 21);
  });
  it('HIGH_SCORE_BUT_BLOCKED: overallStatus=BLOCKED', () => {
    assert.equal(FAILURE_FIXTURE_HIGH_SCORE_BUT_BLOCKED.overallStatus, S.BLOCKED);
    assert.equal(FAILURE_FIXTURE_HIGH_SCORE_BUT_BLOCKED.demonstratesPriorityRule, true);
  });
  it('STALE_SIGNALS: overallStatus=UNKNOWN', () => {
    assert.equal(FAILURE_FIXTURE_STALE_SIGNALS.overallStatus, S.UNKNOWN);
    assert.equal(FAILURE_FIXTURE_STALE_SIGNALS.productionReady, false);
  });
  it('SECRET_LEAK: productionReady=false', () => {
    assert.equal(FAILURE_FIXTURE_SECRET_LEAK.productionReady, false);
    assert.equal(FAILURE_FIXTURE_SECRET_LEAK.overallStatus, S.BLOCKED);
  });
  it('CROSS_CLIENT_LEAK: productionReady=false', () => {
    assert.equal(FAILURE_FIXTURE_CROSS_CLIENT_LEAK.productionReady, false);
  });
  it('all failure fixtures have productionReady=false', () => {
    for (const f of ALL_FAILURE_FIXTURES) {
      assert.equal(f.productionReady, false, `${f.id} should have productionReady=false`);
    }
  });
});

describe('cascadingFixtures', () => {
  it('has 6 cascading fixtures', () => {
    assert.equal(ALL_CASCADING_FIXTURES.length, 6);
  });
  it('CASCADE_BUSINESS_TRUTH_TO_AGENTS: social unaffected', () => {
    assert.ok(CASCADE_BUSINESS_TRUTH_TO_AGENTS.unaffected.includes(D.SOCIAL));
  });
  it('CASCADE_BUSINESS_TRUTH_TO_AGENTS: stage2 has AGENTS degraded', () => {
    const agentSig = CASCADE_BUSINESS_TRUTH_TO_AGENTS.stage2.signals.find(s => s.dimension === D.AGENTS);
    assert.ok(agentSig);
    assert.equal(agentSig.status, S.CRITICAL);
  });
  it('CASCADE_CMP_TO_GDPR: stage2 blocks social and media', () => {
    const socialSig = CASCADE_CMP_TO_GDPR_TO_MARKETING.stage2.signals.find(s => s.dimension === D.SOCIAL);
    assert.ok(socialSig);
    assert.equal(socialSig.status, S.BLOCKED);
  });
  it('all cascading fixtures have productionReady=false', () => {
    for (const f of ALL_CASCADING_FIXTURES) {
      assert.equal(f.productionReady, false, `${f.id} should have productionReady=false`);
    }
  });
});

describe('recoveryFixtures', () => {
  it('has 6 recovery fixtures', () => {
    assert.equal(ALL_RECOVERY_FIXTURES.length, 6);
  });
  it('RECOVERY_CI_SECRET_REMOVED: 3 timeline stages', () => {
    assert.equal(RECOVERY_CI_SECRET_REMOVED.timeline.length, 3);
  });
  it('RECOVERY_CI_SECRET_REMOVED: stage1 BLOCKED, stage3 HEALTHY', () => {
    assert.equal(RECOVERY_CI_SECRET_REMOVED.timeline[0].overallStatus, S.BLOCKED);
    assert.equal(RECOVERY_CI_SECRET_REMOVED.timeline[2].overallStatus, S.HEALTHY);
    assert.equal(RECOVERY_CI_SECRET_REMOVED.timeline[2].productionReady, true);
  });
  it('all recovery fixtures have IMPROVING expected trend', () => {
    for (const f of ALL_RECOVERY_FIXTURES) {
      assert.equal(f.expectedTrend, 'IMPROVING', `${f.id} should have IMPROVING trend`);
    }
  });
});

// ── GUARDRAILS ────────────────────────────────────────────────────────────────

describe('HEALTH_GUARDRAILS', () => {
  it('NO_REAL_ALERT_SEND=true', () => {
    assert.equal(HEALTH_GUARDRAILS.NO_REAL_ALERT_SEND, true);
  });
  it('NO_REAL_EXTERNAL_ACTION=true', () => {
    assert.equal(HEALTH_GUARDRAILS.NO_REAL_EXTERNAL_ACTION, true);
  });
  it('NO_REAL_DEPLOY=true', () => {
    assert.equal(HEALTH_GUARDRAILS.NO_REAL_DEPLOY, true);
  });
  it('NO_REAL_COST=true', () => {
    assert.equal(HEALTH_GUARDRAILS.NO_REAL_COST, true);
  });
  it('CP04_TOUCHED=false', () => {
    assert.equal(HEALTH_GUARDRAILS.CP04_TOUCHED, false);
  });
  it('BOT_TRADING_TOUCHED=false', () => {
    assert.equal(HEALTH_GUARDRAILS.BOT_TRADING_TOUCHED, false);
  });
  it('AURORA_TOUCHED=false', () => {
    assert.equal(HEALTH_GUARDRAILS.AURORA_TOUCHED, false);
  });
  it('FISIONOVA_TOUCHED=false', () => {
    assert.equal(HEALTH_GUARDRAILS.FISIONOVA_TOUCHED, false);
  });
  it('EDUCA_ARCHIDONA_TOUCHED=false', () => {
    assert.equal(HEALTH_GUARDRAILS.EDUCA_ARCHIDONA_TOUCHED, false);
  });
  it('REAL_INCIDENT_MUTATED=false', () => {
    assert.equal(HEALTH_GUARDRAILS.REAL_INCIDENT_MUTATED, false);
  });
  it('REAL_BACKUP_RESTORED=false', () => {
    assert.equal(HEALTH_GUARDRAILS.REAL_BACKUP_RESTORED, false);
  });
  it('REAL_DEPLOYMENT_EXECUTED=false', () => {
    assert.equal(HEALTH_GUARDRAILS.REAL_DEPLOYMENT_EXECUTED, false);
  });
  it('SECRET_LEAKED=false', () => {
    assert.equal(HEALTH_GUARDRAILS.SECRET_LEAKED, false);
  });
  it('CROSS_CLIENT_DATA_EXPOSED=false', () => {
    assert.equal(HEALTH_GUARDRAILS.CROSS_CLIENT_DATA_EXPOSED, false);
  });
  it('MAKE_MODE=DRY_RUN', () => {
    assert.equal(HEALTH_GUARDRAILS.MAKE_MODE, 'DRY_RUN');
  });
  it('AGENT_CAN_SILENCE_CRITICAL=false', () => {
    assert.equal(HEALTH_GUARDRAILS.AGENT_CAN_SILENCE_CRITICAL, false);
  });
  it('AGENT_CAN_ALTER_SCORE=false', () => {
    assert.equal(HEALTH_GUARDRAILS.AGENT_CAN_ALTER_SCORE, false);
  });
  it('AGENT_CAN_EXECUTE_REMEDY_CRITICAL=false', () => {
    assert.equal(HEALTH_GUARDRAILS.AGENT_CAN_EXECUTE_REMEDY_CRITICAL, false);
  });
  it('SCORE_IS_DETERMINISTIC=true', () => {
    assert.equal(HEALTH_GUARDRAILS.SCORE_IS_DETERMINISTIC, true);
  });
  it('LEGAL_CERTIFICATION=false', () => {
    assert.equal(HEALTH_GUARDRAILS.LEGAL_CERTIFICATION, false);
  });
  it('is frozen', () => {
    assert.ok(Object.isFrozen(HEALTH_GUARDRAILS));
  });
});

// ── REGISTRY ──────────────────────────────────────────────────────────────────

describe('HEALTH_DASHBOARD_REGISTRY', () => {
  it('version=4.4.0', () => {
    assert.equal(HEALTH_DASHBOARD_REGISTRY.version, '4.4.0');
  });
  it('has 69 total modules', () => {
    assert.ok(HEALTH_DASHBOARD_REGISTRY.totalModules >= 69);
  });
  it('has 23 adapters', () => {
    assert.equal(HEALTH_DASHBOARD_REGISTRY.adapters, 23);
  });
  it('has 9 bridges', () => {
    assert.equal(HEALTH_DASHBOARD_REGISTRY.bridges, 9);
  });
  it('has 27 health dimensions', () => {
    assert.equal(HEALTH_DASHBOARD_REGISTRY.healthDimensions, 27);
  });
  it('has 7 health statuses', () => {
    assert.equal(HEALTH_DASHBOARD_REGISTRY.healthStatuses, 7);
  });
  it('guardrails.NO_REAL_ALERT_SEND=true', () => {
    assert.equal(HEALTH_DASHBOARD_REGISTRY.guardrails.NO_REAL_ALERT_SEND, true);
  });
  it('guardrails.CP04_TOUCHED=false', () => {
    assert.equal(HEALTH_DASHBOARD_REGISTRY.guardrails.CP04_TOUCHED, false);
  });
  it('scope=FACTORY_AGENCY', () => {
    assert.equal(HEALTH_DASHBOARD_REGISTRY.scope, 'FACTORY_AGENCY');
  });
  it('is frozen', () => {
    assert.ok(Object.isFrozen(HEALTH_DASHBOARD_REGISTRY));
  });
});

describe('factory-registry/index.js ADV-20', () => {
  it('REGISTRY_VERSION=4.4.0', () => {
    assert.equal(REGISTRY_VERSION, '4.4.0');
  });
  it('PASO_ADV20_STATUS=100_PERCENT', () => {
    assert.equal(PASO_ADV20_STATUS, '100_PERCENT');
  });
});

describe('ADV20_VERSION', () => {
  it('is 1.0.0', () => {
    assert.equal(ADV20_VERSION, '1.0.0');
  });
});

// ── INTEGRATION / PRIORITY RULES ──────────────────────────────────────────────

describe('Priority Rule: BLOCKED overrides high score', () => {
  it('aggregator returns BLOCKED when one signal is BLOCKED', () => {
    const agg = createHealthAggregator({});
    agg.addSignals([
      createHealthSignal({ dimension: D.SYSTEM, status: S.HEALTHY, score: 100 }),
      createHealthSignal({ dimension: D.APPLICATION, status: S.HEALTHY, score: 100 }),
      createHealthSignal({ dimension: D.BUILD, status: S.HEALTHY, score: 100 }),
      createHealthSignal({ dimension: D.SECURITY, status: S.BLOCKED, score: 0 }),
    ]);
    const snap = agg.aggregate();
    assert.equal(snap.overallStatus, S.BLOCKED);
    assert.equal(snap.productionReady, false);
  });
  it('score=95 with BLOCKED → BLOCKED', () => {
    const result = computeOverallHealthScore([
      { dimension: D.SYSTEM, status: S.HEALTHY, score: 100 },
      { dimension: D.SECURITY, status: S.BLOCKED, score: 0 },
    ]);
    assert.equal(result.overallStatus, S.BLOCKED);
  });
});

describe('UNKNOWN critical dimension blocks production', () => {
  it('UNKNOWN SECURITY → production blocked', () => {
    const policy = createUnknownHealthPolicy({});
    const result = policy.evaluate({ status: S.UNKNOWN, dimension: D.SECURITY });
    assert.equal(result.impact, UNKNOWN_IMPACT.BLOCKS_PRODUCTION);
    assert.equal(result.blocksProduction, true);
  });
  it('UNKNOWN CLIENT_ISOLATION → production blocked', () => {
    const policy = createUnknownHealthPolicy({});
    const result = policy.evaluate({ status: S.UNKNOWN, dimension: D.CLIENT_ISOLATION });
    assert.equal(result.blocksProduction, true);
  });
  it('UNKNOWN BUSINESS_TRUTH → production blocked', () => {
    const policy = createUnknownHealthPolicy({});
    const result = policy.evaluate({ status: S.UNKNOWN, dimension: D.BUSINESS_TRUTH });
    assert.equal(result.blocksProduction, true);
  });
});

describe('Integration: signal → aggregator → snapshot → executive summary', () => {
  it('healthy signals produce summary with isReal=false', () => {
    const agg = createHealthAggregator({});
    agg.addSignals([
      createHealthSignal({ dimension: D.SECURITY, status: S.HEALTHY, score: 95 }),
      createHealthSignal({ dimension: D.CLIENT_ISOLATION, status: S.HEALTHY, score: 99 }),
      createHealthSignal({ dimension: D.PRODUCTION_READINESS, status: S.HEALTHY, score: 92 }),
    ]);
    const snap = agg.aggregate();
    const summary = createHealthExecutiveSummary(snap, []);
    assert.ok(Array.isArray(summary.whatsWell));
    assert.equal(snap.isReal, false);
  });
  it('blocked signal produces BLOCKED snapshot and whatBlocks', () => {
    const agg = createHealthAggregator({});
    agg.addSignals([
      createHealthSignal({ dimension: D.SECURITY, status: S.BLOCKED, score: 0, message: 'Secret leaked' }),
      createHealthSignal({ dimension: D.CLIENT_ISOLATION, status: S.HEALTHY, score: 99 }),
    ]);
    const snap = agg.aggregate();
    assert.equal(snap.overallStatus, S.BLOCKED);
    const summary = createHealthExecutiveSummary(snap, []);
    assert.ok(summary.whatBlocks.length > 0);
  });
});

describe('Integration: cascade — BusinessTruth↓ → Agents↓, Social unaffected', () => {
  it('fixture stage2 has AGENTS CRITICAL but SOCIAL not in signals', () => {
    const stage2Signals = CASCADE_BUSINESS_TRUTH_TO_AGENTS.stage2.signals;
    const agentSig = stage2Signals.find(s => s.dimension === D.AGENTS);
    const socialSig = stage2Signals.find(s => s.dimension === D.SOCIAL);
    assert.ok(agentSig, 'AGENTS signal should exist in stage2');
    assert.ok(!socialSig, 'SOCIAL should not be in cascade stage2');
    assert.equal(agentSig.status, S.CRITICAL);
  });
});
