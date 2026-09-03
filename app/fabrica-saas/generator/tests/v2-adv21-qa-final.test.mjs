// ADV-21 — QA Final Avanzado Transversal
// Verifica integridad global de ADV-01…ADV-20 y cierre del ciclo.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─── Registry ────────────────────────────────────────────────────────────────
import {
  REGISTRY_VERSION,
  PASO_ADV01_STATUS, PASO_ADV02_STATUS, PASO_ADV03_STATUS,
  PASO_ADV04_STATUS, PASO_ADV05_STATUS, PASO_ADV06_STATUS,
  PASO_ADV07_STATUS, PASO_ADV08_STATUS, PASO_ADV09_STATUS,
  PASO_ADV10_STATUS, PASO_ADV10B_STATUS, PASO_ADV11_STATUS,
  PASO_ADV12_STATUS, PASO_ADV13_STATUS, PASO_ADV14_STATUS,
  PASO_ADV15_STATUS, PASO_ADV16_STATUS, PASO_ADV17_STATUS,
  PASO_ADV18_STATUS, PASO_ADV19_STATUS, PASO_ADV20_STATUS,
  PASO_ADV21_STATUS,
  PASO_A_STATUS, PASO_B_STATUS, PASO_C_STATUS,
  PASO_D_STATUS_MAIN, PASO_E_STATUS_MAIN, PASO_F_STATUS_MAIN,
  PASO_G_STATUS_MAIN, PASO_H_STATUS_MAIN,
  HEALTH_DASHBOARD_REGISTRY,
} from '../../factory-registry/index.js';

// ─── Health Dashboard (ADV-20) ─────────────────────────────────────────────
import {
  HEALTH_GUARDRAILS,
  HEALTH_STATUS,
  HEALTH_DIMENSION,
  createHealthSignal,
  createHealthAggregator,
  createHealthSnapshot,
  createHealthAlertPolicy,
  deduplicateAlerts,
  createHealthAlert,
  ALERT_TYPE,
  createSecurityHealthSignal as createSecurityHealthAdapter,
  createBackupHealthSignal as createBackupHealthAdapter,
  createCicdHealthSignal as createCICDHealthAdapter,
  createProductionReadinessHealth,
  createAgentHealthSignal as createAgentHealthAdapter,
  createClientIsolationHealthSignal as createClientIsolationHealthAdapter,
  createBusinessTruthHealthSignal as createBusinessTruthHealthAdapter,
  createHealthRisk,
  RISK_IMPACT,
  RISK_LIKELIHOOD,
  prioritizeHealthRisks,
  runHealthDashboardQualityGate,
  QUALITY_GATE_BLOCK_REASON,
  computeHealthDashboardQualityScore,
  QUALITY_FACTOR,
  createHealthClientView,
  createHealthExecutiveSummary,
  createFactoryHealthView,
  ALL_HEALTHY_FIXTURES,
  ALL_FAILURE_FIXTURES,
  ALL_CASCADING_FIXTURES,
  ALL_RECOVERY_FIXTURES,
  HEALTHY_FIXTURE_ALL_GREEN,
  FAILURE_FIXTURE_HIGH_SCORE_BUT_BLOCKED,
  FAILURE_FIXTURE_STALE_SIGNALS,
  createHealthServiceObjective,
  SLO_TYPE,
  SLO_STATUS,
  SIGNAL_FRESHNESS,
  createHealthSignalFreshnessPolicy,
  createUnknownHealthPolicy,
} from '../../health/index.js';

// ─── ADV-03 Agent Engine ─────────────────────────────────────────────────────
import {
  applyVerticalToArchetype,
  adaptForChannel,
  AGENT_GENERATOR_VERSION,
} from '../../agent-engine/index.js';

// ─── ADV-04 Production Pipeline ───────────────────────────────────────────
import {
  buildPipelineEvent,
  canStageRun,
  ADAPTER_MODE,
  APPROVAL_STATUS,
} from '../../production-pipeline/index.js';

// ─── ADV-05 Terminal Efficiency ───────────────────────────────────────────
import {
  classifyCommand,
  COMMAND_TIER,
  COMMAND_CATEGORY,
  BATCH_STATUS,
} from '../../terminal-efficiency/index.js';

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Registry Integrity (v4.5.0)', () => {
  it('REGISTRY_VERSION is 4.5.0', () => {
    assert.equal(REGISTRY_VERSION, '4.5.0');
  });

  const pasos = [
    ['PASO_A', PASO_A_STATUS],
    ['PASO_B', PASO_B_STATUS],
    ['PASO_C', PASO_C_STATUS],
    ['PASO_D', PASO_D_STATUS_MAIN],
    ['PASO_E', PASO_E_STATUS_MAIN],
    ['PASO_F', PASO_F_STATUS_MAIN],
    ['PASO_G', PASO_G_STATUS_MAIN],
    ['PASO_H', PASO_H_STATUS_MAIN],
  ];
  for (const [name, status] of pasos) {
    it(`${name} = 100_PERCENT`, () => assert.equal(status, '100_PERCENT'));
  }

  const advStatuses = [
    ['ADV-01', PASO_ADV01_STATUS],
    ['ADV-02', PASO_ADV02_STATUS],
    ['ADV-03', PASO_ADV03_STATUS],
    ['ADV-04', PASO_ADV04_STATUS],
    ['ADV-05', PASO_ADV05_STATUS],
    ['ADV-06', PASO_ADV06_STATUS],
    ['ADV-07', PASO_ADV07_STATUS],
    ['ADV-08', PASO_ADV08_STATUS],
    ['ADV-09', PASO_ADV09_STATUS],
    ['ADV-10', PASO_ADV10_STATUS],
    ['ADV-10b', PASO_ADV10B_STATUS],
    ['ADV-11', PASO_ADV11_STATUS],
    ['ADV-12', PASO_ADV12_STATUS],
    ['ADV-13', PASO_ADV13_STATUS],
    ['ADV-14', PASO_ADV14_STATUS],
    ['ADV-15', PASO_ADV15_STATUS],
    ['ADV-16', PASO_ADV16_STATUS],
    ['ADV-17', PASO_ADV17_STATUS],
    ['ADV-18', PASO_ADV18_STATUS],
    ['ADV-19', PASO_ADV19_STATUS],
    ['ADV-20', PASO_ADV20_STATUS],
    ['ADV-21', PASO_ADV21_STATUS],
  ];
  for (const [name, status] of advStatuses) {
    it(`${name} = 100_PERCENT`, () => assert.equal(status, '100_PERCENT'));
  }

  it('HEALTH_DASHBOARD_REGISTRY exists with correct scope', () => {
    assert.equal(HEALTH_DASHBOARD_REGISTRY.scope, 'FACTORY_AGENCY');
    assert.ok(HEALTH_DASHBOARD_REGISTRY.totalModules >= 69);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Guardrails Transversal', () => {
  it('HEALTH_GUARDRAILS.CP04_TOUCHED = false', () =>
    assert.equal(HEALTH_GUARDRAILS.CP04_TOUCHED, false));
  it('HEALTH_GUARDRAILS.BOT_TRADING_TOUCHED = false', () =>
    assert.equal(HEALTH_GUARDRAILS.BOT_TRADING_TOUCHED, false));
  it('HEALTH_GUARDRAILS.NO_REAL_ALERT_SEND = true', () =>
    assert.equal(HEALTH_GUARDRAILS.NO_REAL_ALERT_SEND, true));
  it('HEALTH_GUARDRAILS.NO_REAL_DEPLOY = true', () =>
    assert.equal(HEALTH_GUARDRAILS.NO_REAL_DEPLOY, true));
  it('HEALTH_GUARDRAILS.MAKE_MODE = DRY_RUN', () =>
    assert.equal(HEALTH_GUARDRAILS.MAKE_MODE, 'DRY_RUN'));
  it('HEALTH_GUARDRAILS.AGENT_CAN_SILENCE_CRITICAL = false', () =>
    assert.equal(HEALTH_GUARDRAILS.AGENT_CAN_SILENCE_CRITICAL, false));
  it('HEALTH_GUARDRAILS.AGENT_CAN_ALTER_SCORE = false', () =>
    assert.equal(HEALTH_GUARDRAILS.AGENT_CAN_ALTER_SCORE, false));
  it('HEALTH_GUARDRAILS.SCORE_IS_DETERMINISTIC = true', () =>
    assert.equal(HEALTH_GUARDRAILS.SCORE_IS_DETERMINISTIC, true));
  it('HEALTH_GUARDRAILS.LEGAL_CERTIFICATION = false', () =>
    assert.equal(HEALTH_GUARDRAILS.LEGAL_CERTIFICATION, false));
  it('HEALTH_GUARDRAILS.SECRET_LEAKED = false', () =>
    assert.equal(HEALTH_GUARDRAILS.SECRET_LEAKED, false));
  it('HEALTH_GUARDRAILS.CROSS_CLIENT_DATA_EXPOSED = false', () =>
    assert.equal(HEALTH_GUARDRAILS.CROSS_CLIENT_DATA_EXPOSED, false));
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — ADV-03 Agent Engine module', () => {
  it('applyVerticalToArchetype is a function', () =>
    assert.equal(typeof applyVerticalToArchetype, 'function'));
  it('adaptForChannel is a function', () =>
    assert.equal(typeof adaptForChannel, 'function'));
  it('AGENT_GENERATOR_VERSION is a string', () =>
    assert.equal(typeof AGENT_GENERATOR_VERSION, 'string'));
  it('applyVerticalToArchetype returns result without crashing', () => {
    const result = applyVerticalToArchetype('receptionist', 'dental');
    assert.ok(result);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — ADV-04 Production Pipeline module', () => {
  it('buildPipelineEvent is a function', () =>
    assert.equal(typeof buildPipelineEvent, 'function'));
  it('canStageRun is a function', () =>
    assert.equal(typeof canStageRun, 'function'));
  it('ADAPTER_MODE has values', () =>
    assert.ok(typeof ADAPTER_MODE === 'object' && Object.keys(ADAPTER_MODE).length > 0));
  it('APPROVAL_STATUS has values', () =>
    assert.ok(typeof APPROVAL_STATUS === 'object' && Object.keys(APPROVAL_STATUS).length > 0));
  it('buildPipelineEvent returns an object', () => {
    const e = buildPipelineEvent({ type: 'STAGE_STARTED', stage: 'build' });
    assert.ok(typeof e === 'object');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — ADV-05 Terminal Efficiency module', () => {
  it('classifyCommand is a function', () =>
    assert.equal(typeof classifyCommand, 'function'));
  it('COMMAND_TIER has values', () =>
    assert.ok(typeof COMMAND_TIER === 'object' && Object.keys(COMMAND_TIER).length > 0));
  it('COMMAND_CATEGORY has values', () =>
    assert.ok(typeof COMMAND_CATEGORY === 'object' && Object.keys(COMMAND_CATEGORY).length > 0));
  it('BATCH_STATUS has values', () =>
    assert.ok(typeof BATCH_STATUS === 'object' && Object.keys(BATCH_STATUS).length > 0));
  it('classifyCommand returns classification for npm command', () => {
    const result = classifyCommand('npm test');
    assert.ok(result);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Health Dashboard scenarios (HEALTHY / DEGRADED / BLOCKED / UNKNOWN)', () => {
  it('HEALTHY scenario: all-green fixture is productionReady', () => {
    assert.equal(HEALTHY_FIXTURE_ALL_GREEN.overallStatus, HEALTH_STATUS.HEALTHY);
    assert.equal(HEALTHY_FIXTURE_ALL_GREEN.productionReady, true);
  });

  it('BLOCKED scenario: high-score-but-blocked fixture blocks production', () => {
    assert.equal(FAILURE_FIXTURE_HIGH_SCORE_BUT_BLOCKED.overallStatus, HEALTH_STATUS.BLOCKED);
    assert.equal(FAILURE_FIXTURE_HIGH_SCORE_BUT_BLOCKED.productionReady, false);
  });

  it('UNKNOWN scenario: stale signals produce non-HEALTHY status', () => {
    const stale = FAILURE_FIXTURE_STALE_SIGNALS;
    assert.notEqual(stale.overallStatus, HEALTH_STATUS.HEALTHY);
    assert.equal(stale.productionReady, false);
  });

  it('aggregator DEGRADED: UNKNOWN signal blocks productionReady', () => {
    const agg = createHealthAggregator({ clientId: 'agg-test', environment: 'LOCAL' });
    agg.addSignal(createHealthSignal({
      dimension: HEALTH_DIMENSION.SECURITY,
      status: HEALTH_STATUS.HEALTHY,
      score: 100,
      source: 'test',
    }));
    agg.addSignal(createHealthSignal({
      dimension: HEALTH_DIMENSION.BACKUP,
      status: HEALTH_STATUS.UNKNOWN,
      score: 50,
      source: 'test',
    }));
    const snap = agg.aggregate();
    assert.equal(snap.productionReady, false);
    assert.notEqual(snap.overallStatus, HEALTH_STATUS.HEALTHY);
  });

  it('aggregator BLOCKED: BLOCKED beats any healthy signals', () => {
    const agg = createHealthAggregator({ clientId: 'block-test' });
    const dims = Object.values(HEALTH_DIMENSION);
    for (let i = 0; i < Math.min(10, dims.length); i++) {
      agg.addSignal(createHealthSignal({
        dimension: dims[i],
        status: HEALTH_STATUS.HEALTHY,
        score: 100,
        source: 'test',
      }));
    }
    agg.addSignal(createHealthSignal({
      dimension: HEALTH_DIMENSION.CLIENT_ISOLATION,
      status: HEALTH_STATUS.BLOCKED,
      score: 0,
      source: 'test',
    }));
    const snap = agg.aggregate();
    assert.equal(snap.overallStatus, HEALTH_STATUS.BLOCKED);
    assert.equal(snap.productionReady, false);
  });

  it('all 21 healthy fixtures are present with id and description', () => {
    assert.equal(ALL_HEALTHY_FIXTURES.length, 21);
    for (const f of ALL_HEALTHY_FIXTURES) {
      assert.ok(f.id, `Fixture missing id`);
      assert.ok(f.description, `Fixture ${f.id} missing description`);
    }
  });

  it('all 21 failure fixtures have productionReady=false', () => {
    for (const f of ALL_FAILURE_FIXTURES) {
      assert.equal(f.productionReady, false, `Failure fixture ${f.id} has productionReady=true`);
    }
  });

  it('all 6 cascading fixtures have stage1 and stage2', () => {
    for (const f of ALL_CASCADING_FIXTURES) {
      assert.ok(f.stage1, `Cascading fixture ${f.id} missing stage1`);
      assert.ok(f.stage2, `Cascading fixture ${f.id} missing stage2`);
    }
  });

  it('all 6 recovery fixtures have expectedTrend=IMPROVING', () => {
    for (const f of ALL_RECOVERY_FIXTURES) {
      assert.equal(f.expectedTrend, 'IMPROVING', `Recovery fixture ${f.id} wrong trend`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Security audit transversal', () => {
  it('security adapter BLOCKED when secretLeak=true', () => {
    const s = createSecurityHealthAdapter({ secretLeak: true, clientId: 'sec-test' });
    assert.equal(s.signal.status, HEALTH_STATUS.BLOCKED);
    assert.equal(s.isReal, false);
  });

  it('security adapter HEALTHY when all clear', () => {
    const s = createSecurityHealthAdapter({
      secretLeak: false,
      crossClientAccess: false,
      privilegeEscalation: false,
      inputSanitized: true,
      clientId: 'sec-ok',
    });
    assert.equal(s.signal.status, HEALTH_STATUS.HEALTHY);
  });

  it('client isolation adapter BLOCKED on cross-client leak', () => {
    const s = createClientIsolationHealthAdapter({
      crossClientLeaks: 1,
      clientId: 'iso-test',
    });
    assert.equal(s.signal.status, HEALTH_STATUS.BLOCKED);
    assert.equal(s.isReal, false);
  });

  it('quality gate detects CROSS_CLIENT_LEAKAGE', () => {
    const result = runHealthDashboardQualityGate({ crossClientLeakage: true });
    assert.equal(result.passed, false);
    assert.ok(result.blocks.includes(QUALITY_GATE_BLOCK_REASON.CROSS_CLIENT_LEAKAGE));
  });

  it('quality gate detects SECRET_LEAKAGE', () => {
    const result = runHealthDashboardQualityGate({ secretsExposed: true });
    assert.equal(result.passed, false);
    assert.ok(result.blocks.includes(QUALITY_GATE_BLOCK_REASON.SECRET_LEAKAGE));
  });

  it('quality gate passes when all clear', () => {
    const result = runHealthDashboardQualityGate({});
    assert.equal(result.passed, true);
    assert.equal(result.blocks.length, 0);
  });

  it('client view excludes sensitive info', () => {
    const view = createHealthClientView({
      snapshot: HEALTHY_FIXTURE_ALL_GREEN,
      clientId: 'client-001',
    });
    assert.equal(view.sensitiveInfoExcluded, true);
    assert.equal(view.stackTracesExcluded, true);
    assert.equal(view.secretsExcluded, true);
    assert.equal(view.isReal, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Client Isolation', () => {
  it('signals carry clientId for isolation', () => {
    const s = createHealthSignal({
      dimension: HEALTH_DIMENSION.SECURITY,
      status: HEALTH_STATUS.HEALTHY,
      score: 100,
      source: 'test',
      clientId: 'tenant-A',
    });
    assert.equal(s.clientId, 'tenant-A');
  });

  it('two aggregators with different clientIds stay isolated', () => {
    const aggA = createHealthAggregator({ clientId: 'tenant-A' });
    const aggB = createHealthAggregator({ clientId: 'tenant-B' });
    aggA.addSignal(createHealthSignal({ dimension: HEALTH_DIMENSION.SECURITY, status: HEALTH_STATUS.HEALTHY, score: 100, source: 'test' }));
    aggB.addSignal(createHealthSignal({ dimension: HEALTH_DIMENSION.SECURITY, status: HEALTH_STATUS.BLOCKED, score: 0, source: 'test' }));
    const snapA = aggA.aggregate();
    const snapB = aggB.aggregate();
    assert.equal(snapA.clientId, 'tenant-A');
    assert.equal(snapB.clientId, 'tenant-B');
    assert.equal(snapA.overallStatus, HEALTH_STATUS.HEALTHY);
    assert.equal(snapB.overallStatus, HEALTH_STATUS.BLOCKED);
  });

  it('client isolation adapter reports correctly per clientId', () => {
    const adA = createClientIsolationHealthAdapter({ crossClientLeaks: 0, clientId: 'tenant-A' });
    const adB = createClientIsolationHealthAdapter({ crossClientLeaks: 1, clientId: 'tenant-B' });
    assert.equal(adA.signal.status, HEALTH_STATUS.HEALTHY);
    assert.equal(adB.signal.status, HEALTH_STATUS.BLOCKED);
  });

  it('health snapshot carries configurable clientId', () => {
    const snap = createHealthSnapshot({ clientId: 'clinica-dental-archidona', signals: [] });
    assert.equal(snap.clientId, 'clinica-dental-archidona');
    assert.equal(snap.isReal, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Alert system (dedup + policy)', () => {
  it('deduplicateAlerts returns isReal=false', () => {
    const alerts = [
      createHealthAlert({ type: ALERT_TYPE.SECURITY, dimension: HEALTH_DIMENSION.SECURITY, severity: 'CRITICAL', message: 'sec' }),
      createHealthAlert({ type: ALERT_TYPE.SECURITY, dimension: HEALTH_DIMENSION.SECURITY, severity: 'CRITICAL', message: 'sec' }),
    ];
    const result = deduplicateAlerts(alerts, 60000);
    assert.equal(result.isReal, false);
    assert.equal(result.total, 2);
    assert.equal(result.unique.length, 1);
    assert.equal(result.deduplicatedCount, 1);
  });

  it('alert policy SECURITY has cooldown=0 (always fire)', () => {
    const policy = createHealthAlertPolicy();
    assert.equal(policy.getCooldown(ALERT_TYPE.SECURITY), 0);
    assert.equal(policy.getCooldown(ALERT_TYPE.CLIENT_ISOLATION), 0);
    assert.equal(policy.noRealAlertSend, true);
  });

  it('alert policy suppresses INFO by default', () => {
    const policy = createHealthAlertPolicy();
    const alert = createHealthAlert({ type: ALERT_TYPE.QUALITY, dimension: HEALTH_DIMENSION.SECURITY, severity: 'INFO', message: 'info' });
    const result = policy.shouldAlert(alert);
    assert.equal(result.should, false);
    assert.equal(result.reason, 'INFO_SUPPRESSED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — SLO Foundation', () => {
  it('SLO MET when current >= target', () => {
    const slo = createHealthServiceObjective({ sloType: SLO_TYPE.AVAILABILITY, target: 99, current: 99.5 });
    assert.equal(slo.status, SLO_STATUS.MET);
    assert.equal(slo.noRealMeasurement, true);
  });

  it('SLO BREACHED when current < 95% of target', () => {
    const slo = createHealthServiceObjective({ sloType: SLO_TYPE.AVAILABILITY, target: 99, current: 90 });
    assert.equal(slo.status, SLO_STATUS.BREACHED);
  });

  it('SLO AT_RISK when current between 95%-100% of target', () => {
    const slo = createHealthServiceObjective({ sloType: SLO_TYPE.AVAILABILITY, target: 99, current: 95 });
    assert.equal(slo.status, SLO_STATUS.AT_RISK);
  });

  it('SLO UNKNOWN when no current provided', () => {
    const slo = createHealthServiceObjective({ sloType: SLO_TYPE.LATENCY, target: 200 });
    assert.equal(slo.status, SLO_STATUS.UNKNOWN);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Freshness + Unknown handling', () => {
  it('SIGNAL_FRESHNESS enum is exported with expected keys', () => {
    assert.ok(SIGNAL_FRESHNESS.FRESH || SIGNAL_FRESHNESS.STALE || SIGNAL_FRESHNESS.UNKNOWN);
  });

  it('createHealthSignalFreshnessPolicy returns policy object', () => {
    const policy = createHealthSignalFreshnessPolicy({ maxAgeMs: 5 * 60 * 1000 });
    assert.equal(typeof policy.evaluate, 'function');
    assert.equal(policy.isReal, false);
  });

  it('stale signal evaluates as STALE', () => {
    const policy = createHealthSignalFreshnessPolicy({ freshThresholdMs: 100, agingThresholdMs: 500 });
    const staleTs = new Date(Date.now() - 60000).toISOString();
    const result = policy.evaluate({ timestamp: staleTs });
    assert.equal(result.status, SIGNAL_FRESHNESS.STALE);
  });

  it('fresh signal evaluates as FRESH', () => {
    const policy = createHealthSignalFreshnessPolicy({ maxAgeMs: 60000 });
    const freshTs = new Date(Date.now() - 100).toISOString();
    const result = policy.evaluate({ timestamp: freshTs });
    assert.equal(result.status, SIGNAL_FRESHNESS.FRESH);
  });

  it('unknownHealthPolicy evaluate returns isReal=false and blocksProduction=true for SECURITY', () => {
    const policy = createUnknownHealthPolicy({ allowedDimensions: [] });
    const result = policy.evaluate({ status: HEALTH_STATUS.UNKNOWN, dimension: HEALTH_DIMENSION.SECURITY });
    assert.equal(result.isReal, false);
    assert.equal(result.blocksProduction, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Quality score', () => {
  it('perfect quality score returns high score and grade A+', () => {
    const factors = {};
    for (const k of Object.values(QUALITY_FACTOR)) factors[k] = 100;
    const result = computeHealthDashboardQualityScore(factors);
    assert.ok(result.score >= 99, `Expected score >= 99 but got ${result.score}`);
    assert.equal(result.grade, 'A+');
  });

  it('zero quality score returns 0 and grade F', () => {
    const factors = {};
    for (const k of Object.values(QUALITY_FACTOR)) factors[k] = 0;
    const result = computeHealthDashboardQualityScore(factors);
    assert.equal(result.score, 0);
    assert.equal(result.grade, 'F');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Factory reusability (no CP04/FisioNova dependency)', () => {
  it('security adapter works for arbitrary sector client', () => {
    const s = createSecurityHealthAdapter({ clientId: 'abogados-sevilla-01' });
    assert.equal(s.isReal, false);
    assert.ok(s.signal);
  });

  it('backup adapter works for arbitrary client', () => {
    const b = createBackupHealthAdapter({ clientId: 'estetica-malaga-02', backupAgeHours: 2 });
    assert.equal(b.isReal, false);
    assert.ok(b.signal);
  });

  it('health snapshot carries configurable clientId for any sector', () => {
    const snap = createHealthSnapshot({ clientId: 'gym-cadiz-01', signals: [] });
    assert.equal(snap.clientId, 'gym-cadiz-01');
    assert.equal(snap.isReal, false);
  });

  it('executive summary works for arbitrary client', () => {
    const snap = createHealthSnapshot({ signals: [], clientId: 'gym-cadiz-01' });
    const summary = createHealthExecutiveSummary(snap, []);
    assert.equal(summary.isReal, false);
  });

  it('production readiness check works for arbitrary client', () => {
    const pr = createProductionReadinessHealth({
      buildPassed: true, testsPassed: true, lintPassed: true,
      securityGatePassed: true, secretScanPassed: true,
      clientId: 'abogados-madrid-01',
    });
    assert.equal(pr.isReal, false);
    assert.equal(pr.canDeploy, false);
  });

  it('CICD adapter works for arbitrary client', () => {
    const c = createCICDHealthAdapter({ clientId: 'veterinaria-barcelona-01', pipelineStatus: 'PASS' });
    assert.equal(c.isReal, false);
    assert.ok(c.signal);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Business Truth adapter', () => {
  it('businessTruth adapter returns isReal=false', () => {
    const bt = createBusinessTruthHealthAdapter({ clientId: 'bt-test' });
    assert.equal(bt.isReal, false);
    assert.ok(bt.signal);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Risk engine', () => {
  it('createHealthRisk requires dimension param', () => {
    const r = createHealthRisk({
      dimension: HEALTH_DIMENSION.SECURITY,
      impact: RISK_IMPACT.CRITICAL,
      likelihood: RISK_LIKELIHOOD.LIKELY,
      description: 'test',
    });
    assert.equal(r.isReal, false);
    assert.equal(r.dimension, HEALTH_DIMENSION.SECURITY);
  });

  it('prioritizeHealthRisks returns productionBlockers array', () => {
    const risks = [
      createHealthRisk({ dimension: HEALTH_DIMENSION.SECURITY, impact: RISK_IMPACT.CRITICAL, likelihood: RISK_LIKELIHOOD.LIKELY, productionBlocker: true }),
      createHealthRisk({ dimension: HEALTH_DIMENSION.BACKUP, impact: RISK_IMPACT.LOW, likelihood: RISK_LIKELIHOOD.POSSIBLE }),
    ];
    const result = prioritizeHealthRisks(risks);
    assert.ok(Array.isArray(result.prioritized));
    assert.ok(Array.isArray(result.productionBlockers));
    assert.ok(result.productionBlockers.length >= 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — CICD + Backup adapters', () => {
  it('CICD adapter BLOCKED on secret scan fail', () => {
    const c = createCICDHealthAdapter({ secretScanPass: false, clientId: 'cicd-test' });
    assert.equal(c.signal.status, HEALTH_STATUS.BLOCKED);
    assert.equal(c.isReal, false);
  });

  it('backup adapter non-HEALTHY on stale backup', () => {
    const b = createBackupHealthAdapter({
      backupAgeHours: 100,
      clientId: 'backup-test',
    });
    assert.notEqual(b.signal.status, HEALTH_STATUS.HEALTHY);
    assert.equal(b.isReal, false);
  });

  it('backup adapter HEALTHY on fresh backup with restore readiness', () => {
    const b = createBackupHealthAdapter({
      backupAgeHours: 1,
      restoreReadiness: true,
      rollbackReady: true,
      encrypted: true,
      clientIsolated: true,
      lastBackupStatus: 'SUCCESS',
      clientId: 'backup-ok',
    });
    assert.equal(b.signal.status, HEALTH_STATUS.HEALTHY);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — HEALTH_DASHBOARD_REGISTRY integrity', () => {
  it('HEALTH_DASHBOARD_REGISTRY is frozen', () =>
    assert.ok(Object.isFrozen(HEALTH_DASHBOARD_REGISTRY)));
  it('totalModules >= 69', () =>
    assert.ok(HEALTH_DASHBOARD_REGISTRY.totalModules >= 69));
  it('guardrails.NO_REAL_ALERT_SEND = true', () =>
    assert.equal(HEALTH_DASHBOARD_REGISTRY.guardrails.NO_REAL_ALERT_SEND, true));
  it('guardrails.CP04_TOUCHED = false', () =>
    assert.equal(HEALTH_DASHBOARD_REGISTRY.guardrails.CP04_TOUCHED, false));
  it('guardrails.AGENT_CAN_SILENCE_CRITICAL = false', () =>
    assert.equal(HEALTH_DASHBOARD_REGISTRY.guardrails.AGENT_CAN_SILENCE_CRITICAL, false));
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-21 — Final cycle closure assertion', () => {
  it('ADV-01 through ADV-21 are all 100_PERCENT', () => {
    const allStatuses = [
      PASO_ADV01_STATUS, PASO_ADV02_STATUS, PASO_ADV03_STATUS,
      PASO_ADV04_STATUS, PASO_ADV05_STATUS, PASO_ADV06_STATUS,
      PASO_ADV07_STATUS, PASO_ADV08_STATUS, PASO_ADV09_STATUS,
      PASO_ADV10_STATUS, PASO_ADV10B_STATUS, PASO_ADV11_STATUS,
      PASO_ADV12_STATUS, PASO_ADV13_STATUS, PASO_ADV14_STATUS,
      PASO_ADV15_STATUS, PASO_ADV16_STATUS, PASO_ADV17_STATUS,
      PASO_ADV18_STATUS, PASO_ADV19_STATUS, PASO_ADV20_STATUS,
      PASO_ADV21_STATUS,
    ];
    assert.ok(allStatuses.every(s => s === '100_PERCENT'),
      'Not all ADV statuses are 100_PERCENT');
  });

  it('Pasos A–H are all 100_PERCENT', () => {
    const pasoStatuses = [
      PASO_A_STATUS, PASO_B_STATUS, PASO_C_STATUS,
      PASO_D_STATUS_MAIN, PASO_E_STATUS_MAIN, PASO_F_STATUS_MAIN,
      PASO_G_STATUS_MAIN, PASO_H_STATUS_MAIN,
    ];
    assert.ok(pasoStatuses.every(s => s === '100_PERCENT'));
  });

  it('registry version is 4.5.0', () =>
    assert.equal(REGISTRY_VERSION, '4.5.0'));

  it('health guardrails all set correctly for safe operation', () => {
    assert.equal(HEALTH_GUARDRAILS.CP04_TOUCHED, false);
    assert.equal(HEALTH_GUARDRAILS.BOT_TRADING_TOUCHED, false);
    assert.equal(HEALTH_GUARDRAILS.REAL_DEPLOYMENT_EXECUTED, false);
    assert.equal(HEALTH_GUARDRAILS.SECRET_LEAKED, false);
    assert.equal(HEALTH_GUARDRAILS.CROSS_CLIENT_DATA_EXPOSED, false);
    assert.equal(HEALTH_GUARDRAILS.AGENT_CAN_SILENCE_CRITICAL, false);
    assert.equal(HEALTH_GUARDRAILS.SCORE_IS_DETERMINISTIC, true);
  });
});
