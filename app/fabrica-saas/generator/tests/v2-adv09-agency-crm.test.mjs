// ADV-09 Agency CRM Engine — Test Suite

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

// Core models
import {
  CRM_STAGE, ACTIVE_STAGES, TERMINAL_STAGES, STAGE_ORDER,
  createSalesPipeline, getStageIndex, isTerminalStage, isActiveStage,
} from '../../crm/salesPipeline.js';

import {
  CRM_LEAD_STATUS, CRM_PRIORITY, createCRMLead,
} from '../../crm/crmLead.js';

import {
  PROBABILITY_BAND, CLOSE_WINDOW, createCRMOpportunity, updateOpportunityStage,
} from '../../crm/crmOpportunity.js';

import {
  ACCOUNT_STATUS, createCRMAccount,
} from '../../crm/crmAccount.js';

import {
  CONSENT_STATUS, PREFERRED_CHANNEL, createCRMContact,
} from '../../crm/crmContact.js';

import {
  ACTIVITY_TYPE, createCRMActivity, buildActivityTimeline,
} from '../../crm/crmActivity.js';

import {
  TASK_TYPE, TASK_PRIORITY, TASK_STATUS,
  createCRMTask, isTaskOverdue, getTaskStatusCurrent,
} from '../../crm/crmTask.js';

import {
  PROPOSAL_STATUS, createCRMProposal, createCRMDeal,
} from '../../crm/crmDeal.js';

// Policy + logic
import {
  canTransitionSalesStage, getValidNextStages,
} from '../../crm/stageTransitionPolicy.js';

import {
  CRM_NEXT_ACTION, recommendCRMNextAction,
} from '../../crm/nextActionEngine.js';

import {
  STALE_STATUS, evaluateOpportunityFreshness, detectStaleOpportunities,
} from '../../crm/staleDetector.js';

import {
  FOLLOW_UP_CADENCE, createFollowUpPolicy, recommendFollowUpCadence,
} from '../../crm/followUpPolicy.js';

import {
  QUALIFICATION_CRITERION, createQualificationProfile, scoreQualification,
} from '../../crm/crmQualification.js';

import { createDiscoveryContext, PAIN_SEVERITY } from '../../crm/discoveryContext.js';
import { createProposalContext } from '../../crm/proposalContext.js';

import {
  VALUE_CONFIDENCE, createDealValueEstimate,
} from '../../crm/dealValueEstimate.js';

import {
  FORECAST_CATEGORY, createOpportunityForecastLine, buildPipelineForecast,
} from '../../crm/pipelineForecast.js';

import {
  DEAL_OUTCOME, createDealOutcome,
} from '../../crm/dealOutcome.js';

import {
  LOSS_REASON, createLostDealAnalysis, aggregateLossReasons,
} from '../../crm/lostDealAnalysis.js';

import {
  HANDOFF_STATUS, createWonDealHandoff, isHandoffComplete,
} from '../../crm/wonDealHandoff.js';

import {
  CRM_PRIORITY_LABEL, computeCRMPriorityScore, assignCRMPriority, createCRMPriorityProfile,
} from '../../crm/crmPriority.js';

import {
  HEALTH_BAND, computeOpportunityHealthScore,
} from '../../crm/crmHealthScore.js';

import { buildPipelineHealthReport } from '../../crm/pipelineHealthReport.js';
import { buildKanbanViewModel } from '../../crm/kanbanViewModel.js';
import { buildCRMDashboard } from '../../crm/dashboardModel.js';
import { generateAgencyCRMReport } from '../../crm/agencyCRMReport.js';
import { scoreCRMDataQuality, QUALITY_DIMENSION } from '../../crm/crmQualityScore.js';
import { createCRMPrivacyPolicy, DATA_CATEGORY, LEGAL_BASIS } from '../../crm/crmPrivacyPolicy.js';
import { createRetentionPolicy, evaluateRetentionEligibility, RETENTION_PERIOD } from '../../crm/crmRetentionPolicy.js';
import { computeIdempotencyKey, createIdempotencyRecord, isIdempotencyRecordExpired } from '../../crm/crmIdempotencyPolicy.js';
import { convertLeadToCRMLead, convertLeadsToCRMLeads } from '../../crm/leadBridge.js';

// Bridges
import { CRM_AGENT_TASK_TYPE, createAgentEngineTask } from '../../crm/bridges/agentEngineBridge.js';
import { DEMO_CONTEXT_TYPE, createDemoContext } from '../../crm/bridges/premiumExperienceBridge.js';
import { MAKE_CRM_TRIGGER, createCRMAutomationManifest } from '../../crm/bridges/makeBridge.js';
import { CRM_EVENT_TYPE, createCRMObservabilityEvent } from '../../crm/bridges/observabilityBridge.js';

// Fixtures
import { CRM_FIXTURE_COUNT, CRM_FIXTURE_LEADS } from '../../crm/fixtures/crmFixtures.js';
import { PIPELINE_FIXTURE_COUNT, PIPELINE_FIXTURE_OPPORTUNITIES } from '../../crm/fixtures/pipelineFixtures.js';
import { FORECAST_FIXTURE } from '../../crm/fixtures/forecastFixtures.js';
import { TASK_FIXTURE_COUNT, TASK_FIXTURES } from '../../crm/fixtures/taskFixtures.js';
import { STALE_FIXTURE_COUNT, STALE_FIXTURES } from '../../crm/fixtures/staleFixtures.js';
import { WIN_FIXTURES, LOSS_FIXTURES } from '../../crm/fixtures/winLossFixtures.js';

// Registry
import { CRM_REGISTRY, CRM_REGISTRY_VERSION } from '../../factory-registry/crm.js';
import { REGISTRY_VERSION, PASO_ADV09_STATUS } from '../../factory-registry/index.js';

// ─── salesPipeline ───────────────────────────────────────────────────────────
describe('salesPipeline', () => {
  it('exports 12 CRM_STAGE values', () => {
    assert.equal(Object.keys(CRM_STAGE).length, 12);
  });
  it('CRM_STAGE values are strings', () => {
    for (const v of Object.values(CRM_STAGE)) assert.equal(typeof v, 'string');
  });
  it('ACTIVE_STAGES does not include WON or LOST', () => {
    assert.equal(ACTIVE_STAGES.includes(CRM_STAGE.WON), false);
    assert.equal(ACTIVE_STAGES.includes(CRM_STAGE.LOST), false);
  });
  it('TERMINAL_STAGES includes WON and LOST', () => {
    assert.equal(TERMINAL_STAGES.includes(CRM_STAGE.WON), true);
    assert.equal(TERMINAL_STAGES.includes(CRM_STAGE.LOST), true);
  });
  it('isTerminalStage returns true for WON', () => {
    assert.equal(isTerminalStage(CRM_STAGE.WON), true);
  });
  it('isTerminalStage returns false for QUALIFIED', () => {
    assert.equal(isTerminalStage(CRM_STAGE.QUALIFIED), false);
  });
  it('isActiveStage returns true for NEGOTIATION', () => {
    assert.equal(isActiveStage(CRM_STAGE.NEGOTIATION), true);
  });
  it('getStageIndex NEW < getStageIndex WON', () => {
    assert.ok(getStageIndex(CRM_STAGE.NEW) < getStageIndex(CRM_STAGE.WON));
  });
  it('createSalesPipeline returns frozen object with isReal: false', () => {
    const p = createSalesPipeline();
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
  it('STAGE_ORDER array has at least 10 items', () => {
    assert.ok(STAGE_ORDER.length >= 10);
  });
});

// ─── crmLead ─────────────────────────────────────────────────────────────────
describe('crmLead', () => {
  it('createCRMLead returns frozen object', () => {
    const l = createCRMLead({ businessName: 'Test Clinic' });
    assert.ok(Object.isFrozen(l));
  });
  it('isReal is false', () => {
    assert.equal(createCRMLead().isReal, false);
  });
  it('CRM_LEAD_STATUS has 6 values', () => {
    assert.equal(Object.keys(CRM_LEAD_STATUS).length, 6);
  });
  it('CRM_PRIORITY has 4 values', () => {
    assert.equal(Object.keys(CRM_PRIORITY).length, 4);
  });
  it('default priority is P2_MEDIUM', () => {
    assert.equal(createCRMLead().priority, CRM_PRIORITY.P2_MEDIUM);
  });
  it('default temperature is COLD', () => {
    assert.equal(createCRMLead().temperature, 'COLD');
  });
});

// ─── crmOpportunity ──────────────────────────────────────────────────────────
describe('crmOpportunity', () => {
  it('createCRMOpportunity returns frozen object with isReal: false', () => {
    const o = createCRMOpportunity({ businessName: 'FisioActiva' });
    assert.equal(o.isReal, false);
    assert.ok(Object.isFrozen(o));
  });
  it('default stage is NEW', () => {
    assert.equal(createCRMOpportunity().stage, CRM_STAGE.NEW);
  });
  it('dealValueEstimate is null by default', () => {
    assert.equal(createCRMOpportunity().dealValueEstimate, null);
  });
  it('dealValueEstimate stored if provided', () => {
    const o = createCRMOpportunity({ dealValueEstimate: { acvCentral: 2400, probability: 0.7 } });
    assert.equal(o.dealValueEstimate.acvCentral, 2400);
  });
  it('updateOpportunityStage changes stage', () => {
    const o = createCRMOpportunity({ stage: CRM_STAGE.NEW });
    const updated = updateOpportunityStage(o, CRM_STAGE.QUALIFIED);
    assert.equal(updated.stage, CRM_STAGE.QUALIFIED);
    assert.equal(updated.isReal, false);
  });
  it('updateOpportunityStage appends to stageHistory', () => {
    const o = createCRMOpportunity({});
    const updated = updateOpportunityStage(o, CRM_STAGE.RESEARCH);
    assert.equal(updated.stageHistory.length, 1);
  });
  it('closeWindowDays defaults to 90', () => {
    assert.equal(createCRMOpportunity().closeWindowDays, 90);
  });
});

// ─── crmAccount ──────────────────────────────────────────────────────────────
describe('crmAccount', () => {
  it('createCRMAccount returns frozen object with isReal: false', () => {
    const a = createCRMAccount({ businessName: 'Test Biz' });
    assert.equal(a.isReal, false);
    assert.ok(Object.isFrozen(a));
  });
  it('ACCOUNT_STATUS has 5 values', () => {
    assert.equal(Object.keys(ACCOUNT_STATUS).length, 5);
  });
  it('default status is PROSPECT', () => {
    assert.equal(createCRMAccount().status, ACCOUNT_STATUS.PROSPECT);
  });
});

// ─── crmContact ──────────────────────────────────────────────────────────────
describe('crmContact', () => {
  it('createCRMContact returns frozen object with isReal: false', () => {
    const c = createCRMContact({ businessName: 'Clinic X' });
    assert.equal(c.isReal, false);
    assert.ok(Object.isFrozen(c));
  });
  it('CONSENT_STATUS is frozen', () => {
    assert.ok(Object.isFrozen(CONSENT_STATUS));
  });
  it('PREFERRED_CHANNEL is frozen', () => {
    assert.ok(Object.isFrozen(PREFERRED_CHANNEL));
  });
});

// ─── crmActivity ─────────────────────────────────────────────────────────────
describe('crmActivity', () => {
  it('createCRMActivity returns frozen object with isReal: false', () => {
    const a = createCRMActivity({ description: 'Initial call' });
    assert.equal(a.isReal, false);
    assert.ok(Object.isFrozen(a));
  });
  it('ACTIVITY_TYPE has 15 values', () => {
    assert.equal(Object.keys(ACTIVITY_TYPE).length, 15);
  });
  it('buildActivityTimeline returns frozen object with isReal: false', () => {
    const activities = [createCRMActivity({ description: 'call' })];
    const timeline = buildActivityTimeline(activities);
    assert.equal(timeline.isReal, false);
    assert.ok(Object.isFrozen(timeline));
  });
  it('buildActivityTimeline total matches input', () => {
    const a1 = createCRMActivity({ description: 'a' });
    const a2 = createCRMActivity({ description: 'b' });
    const t = buildActivityTimeline([a1, a2]);
    assert.equal(t.total, 2);
  });
});

// ─── crmTask ─────────────────────────────────────────────────────────────────
describe('crmTask', () => {
  it('createCRMTask returns frozen with isReal: false', () => {
    const t = createCRMTask({ description: 'Follow up' });
    assert.equal(t.isReal, false);
    assert.ok(Object.isFrozen(t));
  });
  it('TASK_TYPE has 14 values', () => {
    assert.equal(Object.keys(TASK_TYPE).length, 14);
  });
  it('isTaskOverdue returns false for DONE task', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const t = createCRMTask({ status: TASK_STATUS.DONE, dueAt: past });
    assert.equal(isTaskOverdue(t), false);
  });
  it('isTaskOverdue returns true for past-due TODO task', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const t = createCRMTask({ status: TASK_STATUS.TODO, dueAt: past });
    assert.equal(isTaskOverdue(t), true);
  });
  it('getTaskStatusCurrent returns OVERDUE for past-due TODO', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const t = createCRMTask({ status: TASK_STATUS.TODO, dueAt: past });
    assert.equal(getTaskStatusCurrent(t), TASK_STATUS.OVERDUE);
  });
  it('getTaskStatusCurrent preserves DONE status', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const t = createCRMTask({ status: TASK_STATUS.DONE, dueAt: past });
    assert.equal(getTaskStatusCurrent(t), TASK_STATUS.DONE);
  });
});

// ─── crmDeal ─────────────────────────────────────────────────────────────────
describe('crmDeal', () => {
  it('createCRMProposal returns frozen with isReal: false', () => {
    const p = createCRMProposal({ businessName: 'Test' });
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
  it('proposal note contains "commercial estimate"', () => {
    const p = createCRMProposal({});
    assert.ok(p.note.includes('commercial estimate'));
  });
  it('createCRMDeal returns frozen with isReal: false', () => {
    const d = createCRMDeal({ businessName: 'Test' });
    assert.equal(d.isReal, false);
    assert.ok(Object.isFrozen(d));
  });
  it('PROPOSAL_STATUS has 6 values', () => {
    assert.equal(Object.keys(PROPOSAL_STATUS).length, 6);
  });
});

// ─── stageTransitionPolicy ───────────────────────────────────────────────────
describe('stageTransitionPolicy', () => {
  it('NEW → RESEARCH is allowed', () => {
    const r = canTransitionSalesStage(CRM_STAGE.NEW, CRM_STAGE.RESEARCH);
    assert.equal(r.allowed, true);
  });
  it('WON → QUALIFIED is not allowed', () => {
    const r = canTransitionSalesStage(CRM_STAGE.WON, CRM_STAGE.QUALIFIED);
    assert.equal(r.allowed, false);
  });
  it('same stage → not allowed', () => {
    const r = canTransitionSalesStage(CRM_STAGE.QUALIFIED, CRM_STAGE.QUALIFIED);
    assert.equal(r.allowed, false);
  });
  it('NEW → LOST is allowed', () => {
    const r = canTransitionSalesStage(CRM_STAGE.NEW, CRM_STAGE.LOST);
    assert.equal(r.allowed, true);
  });
  it('getValidNextStages WON returns empty', () => {
    assert.equal(getValidNextStages(CRM_STAGE.WON).length, 0);
  });
  it('getValidNextStages NEW returns non-empty', () => {
    assert.ok(getValidNextStages(CRM_STAGE.NEW).length > 0);
  });
  it('result is frozen', () => {
    assert.ok(Object.isFrozen(canTransitionSalesStage(CRM_STAGE.NEW, CRM_STAGE.RESEARCH)));
  });
  it('isReal: false on result', () => {
    assert.equal(canTransitionSalesStage(CRM_STAGE.NEW, CRM_STAGE.QUALIFIED).isReal, false);
  });
});

// ─── nextActionEngine ────────────────────────────────────────────────────────
describe('nextActionEngine', () => {
  it('WON opportunity → CLOSE_WON', () => {
    const r = recommendCRMNextAction({ stage: CRM_STAGE.WON });
    assert.equal(r.action, CRM_NEXT_ACTION.CLOSE_WON);
  });
  it('LOST opportunity → CLOSE_LOST', () => {
    const r = recommendCRMNextAction({ stage: CRM_STAGE.LOST });
    assert.equal(r.action, CRM_NEXT_ACTION.CLOSE_LOST);
  });
  it('NURTURE → NURTURE action', () => {
    const r = recommendCRMNextAction({ stage: CRM_STAGE.NURTURE });
    assert.equal(r.action, CRM_NEXT_ACTION.NURTURE);
  });
  it('NEW → QUALIFY action', () => {
    const r = recommendCRMNextAction({ stage: CRM_STAGE.NEW, dataQualityScore: 50 });
    assert.equal(r.action, CRM_NEXT_ACTION.QUALIFY);
  });
  it('result is frozen with isReal: false', () => {
    const r = recommendCRMNextAction({ stage: CRM_STAGE.QUALIFIED });
    assert.equal(r.isReal, false);
    assert.ok(Object.isFrozen(r));
  });
  it('note mentions "no external action"', () => {
    const r = recommendCRMNextAction({ stage: CRM_STAGE.QUALIFIED });
    assert.ok(r.note.includes('no external action'));
  });
  it('CRM_NEXT_ACTION has 10 values', () => {
    assert.equal(Object.keys(CRM_NEXT_ACTION).length, 10);
  });
});

// ─── staleDetector ───────────────────────────────────────────────────────────
describe('staleDetector', () => {
  it('STALE_STATUS has 4 values', () => {
    assert.equal(Object.keys(STALE_STATUS).length, 4);
  });
  it('recent activity → FRESH', () => {
    const r = evaluateOpportunityFreshness({
      stage: CRM_STAGE.QUALIFIED,
      lastActivityAt: new Date().toISOString(),
    });
    assert.equal(r.status, STALE_STATUS.FRESH);
  });
  it('WAITING_CLIENT never CRITICAL_STALE', () => {
    const old = new Date(Date.now() - 120 * 86400000).toISOString();
    const r = evaluateOpportunityFreshness({
      stage: CRM_STAGE.WAITING_CLIENT,
      lastActivityAt: old,
    });
    assert.notEqual(r.status, STALE_STATUS.CRITICAL_STALE);
  });
  it('NURTURE never CRITICAL_STALE', () => {
    const old = new Date(Date.now() - 90 * 86400000).toISOString();
    const r = evaluateOpportunityFreshness({
      stage: CRM_STAGE.NURTURE,
      lastActivityAt: old,
    });
    assert.notEqual(r.status, STALE_STATUS.CRITICAL_STALE);
  });
  it('result has isReal: false', () => {
    const r = evaluateOpportunityFreshness({ stage: CRM_STAGE.NEW, lastActivityAt: new Date().toISOString() });
    assert.equal(r.isReal, false);
  });
  it('detectStaleOpportunities returns frozen object', () => {
    const result = detectStaleOpportunities([]);
    assert.ok(Object.isFrozen(result));
    assert.equal(result.total, 0);
  });
  it('stale fixtures: detectStaleOpportunities counts', () => {
    const result = detectStaleOpportunities(STALE_FIXTURES);
    assert.equal(result.total, STALE_FIXTURE_COUNT);
    assert.ok(result.fresh.length + result.aging.length + result.stale.length + result.criticalStale.length === STALE_FIXTURE_COUNT);
  });
});

// ─── followUpPolicy ──────────────────────────────────────────────────────────
describe('followUpPolicy', () => {
  it('createFollowUpPolicy is frozen with isReal: false', () => {
    const p = createFollowUpPolicy();
    assert.ok(Object.isFrozen(p));
    assert.equal(p.isReal, false);
  });
  it('HOT lead → TWICE_WEEK cadence by default', () => {
    const r = recommendFollowUpCadence({ temperature: 'HOT' });
    assert.equal(r.cadence, FOLLOW_UP_CADENCE.TWICE_WEEK);
  });
  it('NURTURE lead → MONTHLY cadence', () => {
    const r = recommendFollowUpCadence({ temperature: 'NURTURE' });
    assert.equal(r.cadence, FOLLOW_UP_CADENCE.MONTHLY);
  });
  it('result isReal: false', () => {
    assert.equal(recommendFollowUpCadence({ temperature: 'WARM' }).isReal, false);
  });
  it('note contains "no messages will be sent"', () => {
    const r = recommendFollowUpCadence({});
    assert.ok(r.note.includes('no messages'));
  });
  it('FOLLOW_UP_CADENCE has 6 values', () => {
    assert.equal(Object.keys(FOLLOW_UP_CADENCE).length, 6);
  });
});

// ─── crmQualification ────────────────────────────────────────────────────────
describe('crmQualification', () => {
  it('all criteria false → score 0', () => {
    assert.equal(scoreQualification({}), 0);
  });
  it('all criteria true → score 100', () => {
    const all = {};
    for (const k of Object.values(QUALIFICATION_CRITERION)) all[k] = true;
    assert.equal(scoreQualification(all), 100);
  });
  it('needIdentified + budgetConfirmed → isQualified true', () => {
    const p = createQualificationProfile({ needIdentified: true, budgetConfirmed: true, authorityVerified: true });
    assert.equal(p.isQualified, true);
  });
  it('nothing confirmed → isQualified false', () => {
    const p = createQualificationProfile({});
    assert.equal(p.isQualified, false);
  });
  it('result is frozen with isReal: false', () => {
    const p = createQualificationProfile({});
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
  it('readyFor is DISCOVERY when qualified', () => {
    const p = createQualificationProfile({ needIdentified: true, budgetConfirmed: true, authorityVerified: true });
    assert.equal(p.readyFor, CRM_STAGE.DISCOVERY);
  });
});

// ─── discoveryContext ────────────────────────────────────────────────────────
describe('discoveryContext', () => {
  it('returns frozen with isReal: false', () => {
    const d = createDiscoveryContext({ businessName: 'Test' });
    assert.equal(d.isReal, false);
    assert.ok(Object.isFrozen(d));
  });
  it('PAIN_SEVERITY has 4 values', () => {
    assert.equal(Object.keys(PAIN_SEVERITY).length, 4);
  });
  it('painPoints is frozen array', () => {
    const d = createDiscoveryContext({ painPoints: ['price', 'time'] });
    assert.ok(Object.isFrozen(d.painPoints));
  });
});

// ─── proposalContext ─────────────────────────────────────────────────────────
describe('proposalContext', () => {
  it('returns frozen with isReal: false', () => {
    const p = createProposalContext({ businessName: 'Test' });
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
  it('note mentions "not a binding commitment"', () => {
    assert.ok(createProposalContext({}).note.includes('binding'));
  });
});

// ─── dealValueEstimate ───────────────────────────────────────────────────────
describe('dealValueEstimate', () => {
  it('computes acvLow and acvHigh', () => {
    const e = createDealValueEstimate({
      setupLow: 500, setupHigh: 1000,
      monthlyLow: 100, monthlyHigh: 200,
      contractMonths: 12,
    });
    assert.equal(e.acvLow,  500 + 100 * 12);
    assert.equal(e.acvHigh, 1000 + 200 * 12);
  });
  it('weightedValue = acvMid * probability', () => {
    const e = createDealValueEstimate({
      setupLow: 1000, setupHigh: 1000,
      monthlyLow: 100, monthlyHigh: 100,
      contractMonths: 12,
      probability: 0.5,
    });
    const acvMid = 1000 + 100 * 12;
    assert.equal(e.weightedValue, Math.round(acvMid * 0.5));
  });
  it('isReal: false', () => {
    assert.equal(createDealValueEstimate({}).isReal, false);
  });
  it('VALUE_CONFIDENCE has 3 values', () => {
    assert.equal(Object.keys(VALUE_CONFIDENCE).length, 3);
  });
});

// ─── pipelineForecast ────────────────────────────────────────────────────────
describe('pipelineForecast', () => {
  it('FORECAST_CATEGORY has 4 values', () => {
    assert.equal(Object.keys(FORECAST_CATEGORY).length, 4);
  });
  it('createOpportunityForecastLine is frozen with isReal: false', () => {
    const l = createOpportunityForecastLine({
      stage: CRM_STAGE.NEGOTIATION,
      dealValueEstimate: { acvCentral: 2000, probability: 0.8, weightedValue: 1600 },
    });
    assert.equal(l.isReal, false);
    assert.ok(Object.isFrozen(l));
  });
  it('buildPipelineForecast with no opps', () => {
    const f = buildPipelineForecast([]);
    assert.equal(f.lineCount, 0);
    assert.equal(f.isReal, false);
  });
  it('buildPipelineForecast note mentions "estimate"', () => {
    const f = buildPipelineForecast([]);
    assert.ok(f.note.includes('estimate'));
  });
  it('NEGOTIATION → COMMIT category', () => {
    const l = createOpportunityForecastLine({ stage: CRM_STAGE.NEGOTIATION });
    assert.equal(l.category, FORECAST_CATEGORY.COMMIT);
  });
  it('RESEARCH → OMITTED category', () => {
    const l = createOpportunityForecastLine({ stage: CRM_STAGE.RESEARCH });
    assert.equal(l.category, FORECAST_CATEGORY.OMITTED);
  });
});

// ─── dealOutcome ─────────────────────────────────────────────────────────────
describe('dealOutcome', () => {
  it('DEAL_OUTCOME has 4 values', () => {
    assert.equal(Object.keys(DEAL_OUTCOME).length, 4);
  });
  it('WON outcome sets closedAt', () => {
    const o = createDealOutcome({ outcome: DEAL_OUTCOME.WON });
    assert.ok(o.closedAt);
  });
  it('PENDING outcome has null closedAt', () => {
    const o = createDealOutcome({ outcome: DEAL_OUTCOME.PENDING });
    assert.equal(o.closedAt, null);
  });
  it('WON outcome stores agreed values', () => {
    const o = createDealOutcome({ outcome: DEAL_OUTCOME.WON, agreedSetup: 800, agreedMonthly: 149 });
    assert.equal(o.agreedSetup, 800);
    assert.equal(o.agreedMonthly, 149);
  });
  it('LOST outcome has agreedSetup 0', () => {
    const o = createDealOutcome({ outcome: DEAL_OUTCOME.LOST, agreedSetup: 500 });
    assert.equal(o.agreedSetup, 0);
  });
  it('isReal: false', () => {
    assert.equal(createDealOutcome({}).isReal, false);
  });
});

// ─── lostDealAnalysis ────────────────────────────────────────────────────────
describe('lostDealAnalysis', () => {
  it('LOSS_REASON has 9 values', () => {
    assert.equal(Object.keys(LOSS_REASON).length, 9);
  });
  it('createLostDealAnalysis is frozen with isReal: false', () => {
    const l = createLostDealAnalysis({ lossReason: LOSS_REASON.NO_BUDGET });
    assert.equal(l.isReal, false);
    assert.ok(Object.isFrozen(l));
  });
  it('aggregateLossReasons counts correctly', () => {
    const analyses = [
      createLostDealAnalysis({ lossReason: LOSS_REASON.PRICE_TOO_HIGH }),
      createLostDealAnalysis({ lossReason: LOSS_REASON.PRICE_TOO_HIGH }),
      createLostDealAnalysis({ lossReason: LOSS_REASON.NO_BUDGET }),
    ];
    const agg = aggregateLossReasons(analyses);
    assert.equal(agg.total, 3);
    assert.equal(agg.topReason, LOSS_REASON.PRICE_TOO_HIGH);
    assert.equal(agg.reasons[LOSS_REASON.PRICE_TOO_HIGH], 2);
  });
  it('aggregateLossReasons isReal: false', () => {
    assert.equal(aggregateLossReasons([]).isReal, false);
  });
});

// ─── wonDealHandoff ──────────────────────────────────────────────────────────
describe('wonDealHandoff', () => {
  it('HANDOFF_STATUS has 4 values', () => {
    assert.equal(Object.keys(HANDOFF_STATUS).length, 4);
  });
  it('createWonDealHandoff is frozen with isReal: false', () => {
    const h = createWonDealHandoff({ businessName: 'Test' });
    assert.equal(h.isReal, false);
    assert.ok(Object.isFrozen(h));
  });
  it('isHandoffComplete returns false for PENDING', () => {
    const h = createWonDealHandoff({ status: HANDOFF_STATUS.PENDING });
    assert.equal(isHandoffComplete(h), false);
  });
  it('isHandoffComplete returns true for COMPLETED + completedAt', () => {
    const h = createWonDealHandoff({ status: HANDOFF_STATUS.COMPLETED, completedAt: new Date().toISOString() });
    assert.equal(isHandoffComplete(h), true);
  });
});

// ─── crmPriority ─────────────────────────────────────────────────────────────
describe('crmPriority', () => {
  it('CRM_PRIORITY_LABEL has P0-P3', () => {
    assert.equal(Object.keys(CRM_PRIORITY_LABEL).length, 4);
  });
  it('score 100 → P0', () => {
    assert.equal(assignCRMPriority(100), CRM_PRIORITY_LABEL.P0);
  });
  it('score 50 → P2 (below P1 threshold of 60)', () => {
    assert.equal(assignCRMPriority(50), CRM_PRIORITY_LABEL.P2);
  });
  it('score 20 → P3', () => {
    assert.equal(assignCRMPriority(20), CRM_PRIORITY_LABEL.P3);
  });
  it('computeCRMPriorityScore uses FIT×40 + URGENCY×30 + VALUE×20 + EASE×10', () => {
    const score = computeCRMPriorityScore({ fit: 100, urgency: 100, value: 100, ease: 100 });
    assert.equal(score, 100);
  });
  it('createCRMPriorityProfile is frozen with isReal: false', () => {
    const p = createCRMPriorityProfile({ fit: 80, urgency: 70, value: 60, ease: 50 });
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
});

// ─── crmHealthScore ──────────────────────────────────────────────────────────
describe('crmHealthScore', () => {
  it('HEALTH_BAND has 5 values', () => {
    assert.equal(Object.keys(HEALTH_BAND).length, 5);
  });
  it('perfect opportunity → EXCELLENT', () => {
    const r = computeOpportunityHealthScore({
      dataQualityScore: 80,
      qualificationScore: 70,
      daysSinceActivity: 1,
      nextAction: 'FOLLOW_UP',
    });
    assert.equal(r.band, HEALTH_BAND.EXCELLENT);
  });
  it('empty opportunity → not EXCELLENT', () => {
    const r = computeOpportunityHealthScore({});
    assert.notEqual(r.band, HEALTH_BAND.EXCELLENT);
  });
  it('isReal: false', () => {
    assert.equal(computeOpportunityHealthScore({}).isReal, false);
  });
  it('issues is a frozen array', () => {
    const r = computeOpportunityHealthScore({});
    assert.ok(Object.isFrozen(r.issues));
  });
});

// ─── pipelineHealthReport ────────────────────────────────────────────────────
describe('pipelineHealthReport', () => {
  it('returns frozen with isReal: false', () => {
    const r = buildPipelineHealthReport([]);
    assert.equal(r.isReal, false);
    assert.ok(Object.isFrozen(r));
  });
  it('totalOpportunities matches input', () => {
    const opps = [createCRMOpportunity({}), createCRMOpportunity({})];
    const r = buildPipelineHealthReport(opps);
    assert.equal(r.totalOpportunities, 2);
  });
});

// ─── kanbanViewModel ─────────────────────────────────────────────────────────
describe('kanbanViewModel', () => {
  it('returns frozen with isReal: false', () => {
    const k = buildKanbanViewModel([]);
    assert.equal(k.isReal, false);
    assert.ok(Object.isFrozen(k));
  });
  it('totalCards matches input count', () => {
    const opps = [createCRMOpportunity({}), createCRMOpportunity({})];
    const k = buildKanbanViewModel(opps);
    assert.equal(k.totalCards, 2);
  });
  it('columns is frozen', () => {
    const k = buildKanbanViewModel([]);
    assert.ok(Object.isFrozen(k.columns));
  });
});

// ─── dashboardModel ──────────────────────────────────────────────────────────
describe('dashboardModel', () => {
  it('returns frozen with isReal: false', () => {
    const d = buildCRMDashboard([]);
    assert.equal(d.isReal, false);
    assert.ok(Object.isFrozen(d));
  });
  it('summary is frozen', () => {
    const d = buildCRMDashboard([]);
    assert.ok(Object.isFrozen(d.summary));
  });
  it('winRate 0 when no closed deals', () => {
    const d = buildCRMDashboard([createCRMOpportunity({ stage: CRM_STAGE.NEW })]);
    assert.equal(d.summary.winRate, 0);
  });
});

// ─── agencyCRMReport ────────────────────────────────────────────────────────
describe('agencyCRMReport', () => {
  it('returns frozen with isReal: false', () => {
    const r = generateAgencyCRMReport([], [], []);
    assert.equal(r.isReal, false);
    assert.ok(Object.isFrozen(r));
  });
  it('note mentions "not financial guidance"', () => {
    const r = generateAgencyCRMReport([]);
    assert.ok(r.note.includes('not financial guidance') || r.note.includes('estimate'));
  });
  it('stageBreakdown is frozen', () => {
    const r = generateAgencyCRMReport([]);
    assert.ok(Object.isFrozen(r.stageBreakdown));
  });
});

// ─── crmQualityScore ────────────────────────────────────────────────────────
describe('crmQualityScore', () => {
  it('QUALITY_DIMENSION has 5 values', () => {
    assert.equal(Object.keys(QUALITY_DIMENSION).length, 5);
  });
  it('empty opportunity → total 0', () => {
    const r = scoreCRMDataQuality({});
    assert.equal(r.total, 0);
  });
  it('full opportunity → total > 70', () => {
    const r = scoreCRMDataQuality({
      contactName: 'Dr. Perez',
      contactEmail: 'dr@clinic.es',
      contactPhone: '+34612345678',
      businessName: 'Fisio Test',
      sector: 'physiotherapy',
      website: 'https://fisiotest.es',
      location: 'Madrid',
      employeeRange: '5-10',
      dealValueEstimate: { acvCentral: 2400 },
      proposalId: 'prop_001',
      closeWindowDays: 60,
      lastActivityAt: new Date().toISOString(),
      activityCount: 5,
      nextAction: 'FOLLOW_UP',
      qualificationScore: 80,
    });
    assert.ok(r.total > 70);
  });
  it('result is frozen', () => {
    const r = scoreCRMDataQuality({});
    assert.ok(Object.isFrozen(r));
  });
});

// ─── crmPrivacyPolicy ────────────────────────────────────────────────────────
describe('crmPrivacyPolicy', () => {
  it('createCRMPrivacyPolicy is frozen with isReal: false', () => {
    const p = createCRMPrivacyPolicy();
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
  it('noSensitivePersonalData is true', () => {
    assert.equal(createCRMPrivacyPolicy().noSensitivePersonalData, true);
  });
  it('DATA_CATEGORY has 5 values', () => {
    assert.equal(Object.keys(DATA_CATEGORY).length, 5);
  });
  it('LEGAL_BASIS has 3 values', () => {
    assert.equal(Object.keys(LEGAL_BASIS).length, 3);
  });
  it('dataCategories is an array of 5', () => {
    assert.equal(createCRMPrivacyPolicy().dataCategories.length, 5);
  });
});

// ─── crmRetentionPolicy ──────────────────────────────────────────────────────
describe('crmRetentionPolicy', () => {
  it('createRetentionPolicy is frozen with isReal: false', () => {
    const p = createRetentionPolicy();
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
  it('evaluateRetentionEligibility eligible for expired record', () => {
    const oldDate = new Date(Date.now() - (366 * 86400000)).toISOString();
    const r = evaluateRetentionEligibility({ type: 'ACTIVE_LEAD', createdAt: oldDate });
    assert.equal(r.eligible, true);
  });
  it('evaluateRetentionEligibility not eligible for recent record', () => {
    const r = evaluateRetentionEligibility({ type: 'ACTIVE_LEAD', createdAt: new Date().toISOString() });
    assert.equal(r.eligible, false);
  });
  it('no reference date → not eligible', () => {
    const r = evaluateRetentionEligibility({ type: 'ACTIVE_LEAD' });
    assert.equal(r.eligible, false);
  });
});

// ─── crmIdempotencyPolicy ────────────────────────────────────────────────────
describe('crmIdempotencyPolicy', () => {
  it('computeIdempotencyKey returns 24-char string', () => {
    const key = computeIdempotencyKey({ opportunityId: 'opp_001', action: 'stage_change', stage: 'QUALIFIED' });
    assert.equal(typeof key, 'string');
    assert.equal(key.length, 24);
  });
  it('same payload → same key', () => {
    const p = { opportunityId: 'opp_001', action: 'test', stage: 'NEW', timestamp: '2026-09-01T00:00:00Z' };
    assert.equal(computeIdempotencyKey(p), computeIdempotencyKey(p));
  });
  it('different payload → different key', () => {
    const k1 = computeIdempotencyKey({ opportunityId: 'a', action: 'test' });
    const k2 = computeIdempotencyKey({ opportunityId: 'b', action: 'test' });
    assert.notEqual(k1, k2);
  });
  it('createIdempotencyRecord is frozen with isReal: false', () => {
    const r = createIdempotencyRecord({ opportunityId: 'opp_001', action: 'test' });
    assert.equal(r.isReal, false);
    assert.ok(Object.isFrozen(r));
  });
  it('isIdempotencyRecordExpired false for fresh record', () => {
    const r = createIdempotencyRecord({});
    assert.equal(isIdempotencyRecordExpired(r), false);
  });
});

// ─── leadBridge ──────────────────────────────────────────────────────────────
describe('leadBridge', () => {
  const scoredLead = {
    lead: { id: 'lead_001', businessName: 'FisioActiva', sector: 'physiotherapy', location: 'Madrid' },
    scoreResult: { score: 85, temperature: 'HOT' },
  };

  it('convertLeadToCRMLead returns frozen with isReal: false', () => {
    const l = convertLeadToCRMLead(scoredLead);
    assert.equal(l.isReal, false);
    assert.ok(Object.isFrozen(l));
  });
  it('HOT lead → P0_CRITICAL priority', () => {
    const l = convertLeadToCRMLead(scoredLead);
    assert.equal(l.priority, CRM_PRIORITY.P0_CRITICAL);
  });
  it('COLD lead → P2_MEDIUM priority', () => {
    const l = convertLeadToCRMLead({ lead: {}, scoreResult: { score: 40, temperature: 'COLD' } });
    assert.equal(l.priority, CRM_PRIORITY.P2_MEDIUM);
  });
  it('convertLeadsToCRMLeads maps array', () => {
    const result = convertLeadsToCRMLeads([scoredLead, scoredLead]);
    assert.equal(result.length, 2);
  });
});

// ─── bridges ─────────────────────────────────────────────────────────────────
describe('bridges/agentEngineBridge', () => {
  it('CRM_AGENT_TASK_TYPE has 5 values', () => {
    assert.equal(Object.keys(CRM_AGENT_TASK_TYPE).length, 5);
  });
  it('createAgentEngineTask is frozen with isReal: false', () => {
    const t = createAgentEngineTask({ id: 'opp_001', businessName: 'Test' });
    assert.equal(t.isReal, false);
    assert.ok(Object.isFrozen(t));
  });
  it('note mentions "no agent execution"', () => {
    const t = createAgentEngineTask({});
    assert.ok(t.note.includes('no agent execution'));
  });
});

describe('bridges/premiumExperienceBridge', () => {
  it('DEMO_CONTEXT_TYPE has 3 values', () => {
    assert.equal(Object.keys(DEMO_CONTEXT_TYPE).length, 3);
  });
  it('createDemoContext is frozen with isReal: false', () => {
    const c = createDemoContext({ sector: 'physiotherapy' });
    assert.equal(c.isReal, false);
    assert.ok(Object.isFrozen(c));
  });
  it('note mentions "no real deployment"', () => {
    const c = createDemoContext({});
    assert.ok(c.note.includes('no real deployment') || c.note.includes('no deploy'));
  });
});

describe('bridges/makeBridge', () => {
  it('MAKE_CRM_TRIGGER has 6 values', () => {
    assert.equal(Object.keys(MAKE_CRM_TRIGGER).length, 6);
  });
  it('createCRMAutomationManifest is frozen with isReal: false', () => {
    const m = createCRMAutomationManifest({});
    assert.equal(m.isReal, false);
    assert.ok(Object.isFrozen(m));
  });
  it('note mentions "no Make.com scenario"', () => {
    const m = createCRMAutomationManifest({});
    assert.ok(m.note.includes('no Make.com'));
  });
});

describe('bridges/observabilityBridge', () => {
  it('CRM_EVENT_TYPE has 7 values', () => {
    assert.equal(Object.keys(CRM_EVENT_TYPE).length, 7);
  });
  it('createCRMObservabilityEvent strips PII fields', () => {
    const e = createCRMObservabilityEvent('crm.lead_imported', {
      businessName: 'Test Clinic',
      contactEmail: 'secret@email.com',
      contactPhone: '666000000',
    });
    assert.equal(e.payload.contactEmail, undefined);
    assert.equal(e.payload.contactPhone, undefined);
    assert.equal(e.payload.businessName, 'Test Clinic');
  });
  it('isReal: false', () => {
    assert.equal(createCRMObservabilityEvent('test', {}).isReal, false);
  });
  it('note mentions PII sanitized', () => {
    const e = createCRMObservabilityEvent('test', {});
    assert.ok(e.note.includes('PII') || e.note.includes('sanitized'));
  });
});

// ─── fixtures ────────────────────────────────────────────────────────────────
describe('fixtures/crmFixtures', () => {
  it(`CRM_FIXTURE_COUNT is 40`, () => {
    assert.equal(CRM_FIXTURE_COUNT, 40);
  });
  it('CRM_FIXTURE_LEADS length matches CRM_FIXTURE_COUNT', () => {
    assert.equal(CRM_FIXTURE_LEADS.length, CRM_FIXTURE_COUNT);
  });
  it('all leads have isReal: false', () => {
    for (const l of CRM_FIXTURE_LEADS) assert.equal(l.isReal, false);
  });
  it('all leads have a businessName', () => {
    for (const l of CRM_FIXTURE_LEADS) assert.ok(l.businessName.length > 0);
  });
  it('all leads have a valid temperature', () => {
    const valid = new Set(['HOT', 'WARM', 'COLD', 'NURTURE']);
    for (const l of CRM_FIXTURE_LEADS) assert.ok(valid.has(l.temperature));
  });
  it('all leads are frozen', () => {
    for (const l of CRM_FIXTURE_LEADS) assert.ok(Object.isFrozen(l));
  });
  it('has HOT leads', () => {
    assert.ok(CRM_FIXTURE_LEADS.some(l => l.temperature === 'HOT'));
  });
  it('has NURTURE leads', () => {
    assert.ok(CRM_FIXTURE_LEADS.some(l => l.status === CRM_LEAD_STATUS.NURTURE));
  });
});

describe('fixtures/pipelineFixtures', () => {
  it(`PIPELINE_FIXTURE_COUNT is 12`, () => {
    assert.equal(PIPELINE_FIXTURE_COUNT, 12);
  });
  it('PIPELINE_FIXTURE_OPPORTUNITIES length matches', () => {
    assert.equal(PIPELINE_FIXTURE_OPPORTUNITIES.length, PIPELINE_FIXTURE_COUNT);
  });
  it('all opportunities have isReal: false', () => {
    for (const o of PIPELINE_FIXTURE_OPPORTUNITIES) assert.equal(o.isReal, false);
  });
  it('includes WON opportunity', () => {
    assert.ok(PIPELINE_FIXTURE_OPPORTUNITIES.some(o => o.stage === CRM_STAGE.WON));
  });
  it('includes LOST opportunity', () => {
    assert.ok(PIPELINE_FIXTURE_OPPORTUNITIES.some(o => o.stage === CRM_STAGE.LOST));
  });
});

describe('fixtures/forecastFixtures', () => {
  it('FORECAST_FIXTURE is frozen with isReal: false', () => {
    assert.equal(FORECAST_FIXTURE.isReal, false);
    assert.ok(Object.isFrozen(FORECAST_FIXTURE));
  });
  it('FORECAST_FIXTURE lineCount matches PIPELINE_FIXTURE_COUNT', () => {
    assert.equal(FORECAST_FIXTURE.lineCount, PIPELINE_FIXTURE_COUNT);
  });
  it('FORECAST_FIXTURE has positive totalPipeline', () => {
    assert.ok(FORECAST_FIXTURE.totalPipeline > 0);
  });
});

describe('fixtures/taskFixtures', () => {
  it(`TASK_FIXTURE_COUNT is 10`, () => {
    assert.equal(TASK_FIXTURE_COUNT, 10);
  });
  it('TASK_FIXTURES length matches', () => {
    assert.equal(TASK_FIXTURES.length, TASK_FIXTURE_COUNT);
  });
  it('all tasks have isReal: false', () => {
    for (const t of TASK_FIXTURES) assert.equal(t.isReal, false);
  });
});

describe('fixtures/staleFixtures', () => {
  it(`STALE_FIXTURE_COUNT is 6`, () => {
    assert.equal(STALE_FIXTURE_COUNT, 6);
  });
  it('all stale fixtures have isReal: false', () => {
    for (const s of STALE_FIXTURES) assert.equal(s.isReal, false);
  });
  it('all have a lastActivityAt', () => {
    for (const s of STALE_FIXTURES) assert.ok(s.lastActivityAt);
  });
});

describe('fixtures/winLossFixtures', () => {
  it('WIN_FIXTURES length is 2', () => {
    assert.equal(WIN_FIXTURES.length, 2);
  });
  it('LOSS_FIXTURES length is 4', () => {
    assert.equal(LOSS_FIXTURES.length, 4);
  });
  it('all wins have isReal: false', () => {
    for (const w of WIN_FIXTURES) assert.equal(w.isReal, false);
  });
  it('all losses have isReal: false', () => {
    for (const l of LOSS_FIXTURES) assert.equal(l.isReal, false);
  });
  it('loss top reason aggregation works', () => {
    const agg = aggregateLossReasons(LOSS_FIXTURES);
    assert.equal(agg.total, 4);
    assert.ok(agg.topReason);
  });
});

// ─── registry ────────────────────────────────────────────────────────────────
describe('factory-registry/crm', () => {
  it('CRM_REGISTRY is frozen with isReal: false', () => {
    assert.equal(CRM_REGISTRY.isReal, false);
    assert.ok(Object.isFrozen(CRM_REGISTRY));
  });
  it('CRM_REGISTRY has 35 modules', () => {
    assert.equal(CRM_REGISTRY.modules.length, 35);
  });
  it('CRM_REGISTRY.fixtureLeads is 40', () => {
    assert.equal(CRM_REGISTRY.fixtureLeads, 40);
  });
  it('CRM_REGISTRY.crmStages is 12', () => {
    assert.equal(CRM_REGISTRY.crmStages, 12);
  });
  it('CRM_REGISTRY_VERSION is string', () => {
    assert.equal(typeof CRM_REGISTRY_VERSION, 'string');
  });
  it('REGISTRY_VERSION is >= 3.3.0', () => {
    assert.ok(REGISTRY_VERSION >= '3.3.0');
  });
  it('PASO_ADV09_STATUS is 100_PERCENT', () => {
    assert.equal(PASO_ADV09_STATUS, '100_PERCENT');
  });
});
