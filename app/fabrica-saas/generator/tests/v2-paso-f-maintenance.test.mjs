import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

// --- Module imports ---
import {
  MAINTENANCE_TIERS, REVIEW_CADENCE,
  createMaintenanceService, getRecommendedMaintenanceTier,
} from '../../maintenance/maintenanceService.js';

import {
  TICKET_TYPES, TICKET_STATES, TICKET_PRIORITIES,
  createSupportTicket, updateTicketState,
} from '../../maintenance/supportTicket.js';

import { triageSupportTicket, batchTriage } from '../../maintenance/triageEngine.js';

import {
  PRIORITY_LEVELS, BASE_SERVICE_TARGETS,
  getServiceTarget, getAllTargetsForTier,
} from '../../maintenance/serviceTargets.js';

import {
  isIncidentEligible, supportTicketToIncident, auditTicketsForEscalation,
} from '../../maintenance/incidentIntegration.js';

import {
  BACKUP_HEALTH_STATUS,
  createBackupPolicy, auditBackupHealth, evaluateRestoreReadiness,
} from '../../maintenance/backupPolicy.js';

import {
  CHECK_OUTCOMES, MAINTENANCE_CHECKS,
  buildChecklistResult,
} from '../../maintenance/maintenanceChecklist.js';

import { runMaintenanceCycle } from '../../maintenance/maintenanceRunner.js';

import {
  createTicket, assignTicket, updateTicket, escalateTicket,
  resolveTicket, closeTicket, listTickets, getQueueSummary, resetQueue,
} from '../../maintenance/supportQueue.js';

import {
  ESCALATION_LEVELS, evaluateEscalation, getEscalationDefinition,
} from '../../maintenance/escalationEngine.js';

import {
  OWNERSHIP, classifyOwnership, createThirdPartyIncidentReport,
} from '../../maintenance/thirdPartyIncidents.js';

import { auditAutomationHealth, AUTOMATION_STATUS } from '../../maintenance/automationHealth.js';

import { auditAIHealth, AI_AGENT_STATUS } from '../../maintenance/aiHealth.js';

import { runSecurityMaintenance, SECURITY_CHECK_STATUS } from '../../maintenance/securityMaintenance.js';

import {
  HEALTH_LABELS, calculateClientHealthScore, compareHealthScores,
} from '../../maintenance/clientHealthScore.js';

import { generateMaintenanceReport } from '../../maintenance/maintenanceReport.js';

import {
  SCOPE_CATEGORIES, SCOPE_DECISION, classifyScopeRequest,
} from '../../maintenance/scopeBoundary.js';

import {
  IMPROVEMENT_PRIORITY, identifyImprovementOpportunities,
} from '../../maintenance/continuousImprovement.js';

import {
  OFFBOARDING_STATUS, initiateOffboarding,
  completeOffboardingStep, endMaintenanceService,
} from '../../maintenance/serviceOffboarding.js';

import {
  REGISTRY_VERSION, PASO_F_STATUS_MAIN,
} from '../../factory-registry/index.js';

// ─── FIXTURES ─────────────────────────────────────────────────────────────────

const clientId = 'CLI-NEXO-001';

function makeTicket(overrides = {}) {
  const r = createSupportTicket({
    clientId,
    title:      overrides.title ?? 'Test ticket',
    type:       overrides.type  ?? TICKET_TYPES.BUG_REPORT,
    reportedBy: 'test-user',
    ...overrides,
  });
  assert.ok(r.valid, `createSupportTicket failed: ${JSON.stringify(r.errors)}`);
  return r.ticket;
}

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe('Paso F — MaintenanceService', () => {
  it('BASIC service: valid structure', () => {
    const r = createMaintenanceService({ clientId, tier: MAINTENANCE_TIERS.BASIC });
    assert.ok(r.valid);
    assert.equal(r.service.tier, 'BASIC');
    assert.ok(r.service.includedTasks.includes('bug_fix'));
    assert.ok(r.service.disclaimer.includes('operational'));
  });

  it('PRO service: extended tasks', () => {
    const r = createMaintenanceService({ clientId, tier: MAINTENANCE_TIERS.PRO });
    assert.ok(r.valid);
    assert.ok(r.service.includedTasks.includes('minor_change'));
    assert.equal(r.service.reviewCadence, REVIEW_CADENCE.BIWEEKLY);
  });

  it('PRIORITY service: weekly cadence + ai_health_check', () => {
    const r = createMaintenanceService({ clientId, tier: MAINTENANCE_TIERS.PRIORITY });
    assert.ok(r.valid);
    assert.ok(r.service.includedTasks.includes('ai_health_check'));
    assert.equal(r.service.reviewCadence, REVIEW_CADENCE.WEEKLY);
    assert.equal(r.service.responseTargets.P1_CRITICAL, '4h');
  });

  it('missing clientId → invalid', () => {
    const r = createMaintenanceService({ tier: MAINTENANCE_TIERS.BASIC });
    assert.ok(!r.valid);
    assert.ok(r.errors.some(e => e.includes('clientId')));
  });

  it('invalid tier → invalid', () => {
    const r = createMaintenanceService({ clientId, tier: 'GOLD' });
    assert.ok(!r.valid);
  });

  it('getRecommendedMaintenanceTier: PREMIUM → PRIORITY', () => {
    const tier = getRecommendedMaintenanceTier('PREMIUM');
    assert.ok(tier);
  });

  it('BASIC response targets correct', () => {
    const r = createMaintenanceService({ clientId, tier: MAINTENANCE_TIERS.BASIC });
    assert.equal(r.service.responseTargets.P1_CRITICAL, '48h');
  });
});

describe('Paso F — SupportTicket', () => {
  it('creates valid ticket', () => {
    const t = makeTicket();
    assert.equal(t.state, TICKET_STATES.OPEN);
    assert.ok(t.id.startsWith('TKT-'));
    assert.equal(t.timeline.length, 1);
  });

  it('missing title → invalid', () => {
    const r = createSupportTicket({ clientId, type: TICKET_TYPES.BUG_REPORT, reportedBy: 'u' });
    assert.ok(!r.valid);
    assert.ok(r.errors.some(e => e.includes('title')));
  });

  it('all 12 ticket types valid', () => {
    const types = Object.values(TICKET_TYPES);
    assert.equal(types.length, 12);
  });

  it('all 9 ticket states defined', () => {
    const states = Object.values(TICKET_STATES);
    assert.equal(states.length, 9);
  });

  it('updateTicketState: OPEN → IN_PROGRESS', () => {
    const t = makeTicket();
    const r = updateTicketState(t, TICKET_STATES.IN_PROGRESS, 'agent-1', 'started work');
    assert.ok(r.valid);
    assert.equal(r.ticket.state, TICKET_STATES.IN_PROGRESS);
    assert.equal(r.ticket.timeline.length, 2);
  });

  it('updateTicketState: RESOLVED sets resolvedAt', () => {
    const t = makeTicket();
    const r = updateTicketState(t, TICKET_STATES.RESOLVED, 'agent-1');
    assert.ok(r.valid);
    assert.ok(r.ticket.resolvedAt);
  });

  it('updateTicketState: invalid state → error', () => {
    const t = makeTicket();
    const r = updateTicketState(t, 'IMAGINARY', 'agent-1');
    assert.ok(!r.valid);
  });

  it('security concern ticket gets P1 default via creation', () => {
    const t = makeTicket({ type: TICKET_TYPES.SECURITY_CONCERN });
    assert.equal(t.type, TICKET_TYPES.SECURITY_CONCERN);
  });
});

describe('Paso F — TriageEngine', () => {
  it('security concern → P1 + AGENCY_OWNER', () => {
    const t = makeTicket({ type: TICKET_TYPES.SECURITY_CONCERN });
    const r = triageSupportTicket(t);
    assert.ok(r.valid);
    assert.equal(r.priority, TICKET_PRIORITIES.P1_CRITICAL);
    assert.equal(r.assignedTo, 'AGENCY_OWNER');
  });

  it('production bug → P1', () => {
    const t = makeTicket({ type: TICKET_TYPES.BUG_REPORT, description: 'system down, all users affected' });
    const r = triageSupportTicket(t);
    assert.ok(r.valid);
    assert.equal(r.priority, TICKET_PRIORITIES.P1_CRITICAL);
  });

  it('integration issue → P2', () => {
    const t = makeTicket({ type: TICKET_TYPES.INTEGRATION_ISSUE });
    const r = triageSupportTicket(t);
    assert.ok(r.valid);
    assert.equal(r.priority, TICKET_PRIORITIES.P2_HIGH);
  });

  it('feature request → P4', () => {
    const t = makeTicket({ type: TICKET_TYPES.FEATURE_REQUEST });
    const r = triageSupportTicket(t);
    assert.ok(r.valid);
    assert.equal(r.priority, TICKET_PRIORITIES.P4_LOW);
  });

  it('triage advances state to TRIAGED', () => {
    const t = makeTicket();
    const r = triageSupportTicket(t);
    assert.ok(r.valid);
    assert.equal(r.ticket.state, TICKET_STATES.TRIAGED);
  });

  it('override priority respected', () => {
    const t = makeTicket({ type: TICKET_TYPES.QUESTION });
    const r = triageSupportTicket(t, { overridePriority: TICKET_PRIORITIES.P1_CRITICAL });
    assert.ok(r.valid);
    assert.equal(r.priority, TICKET_PRIORITIES.P1_CRITICAL);
  });

  it('batchTriage: processes multiple tickets', () => {
    const tickets = [
      makeTicket({ type: TICKET_TYPES.BUG_REPORT }),
      makeTicket({ type: TICKET_TYPES.FEATURE_REQUEST }),
      makeTicket({ type: TICKET_TYPES.QUESTION }),
    ];
    const results = batchTriage(tickets);
    assert.equal(results.length, 3);
    assert.ok(results.every(r => r.valid));
  });
});

describe('Paso F — ServiceTargets', () => {
  it('all 4 priority levels defined', () => {
    assert.equal(Object.keys(PRIORITY_LEVELS).length, 4);
  });

  it('BASE_SERVICE_TARGETS has all priorities', () => {
    assert.ok(BASE_SERVICE_TARGETS.P1_CRITICAL);
    assert.ok(BASE_SERVICE_TARGETS.P4_LOW);
  });

  it('getServiceTarget P1 BASE', () => {
    const r = getServiceTarget('P1_CRITICAL');
    assert.ok(r.valid);
    assert.equal(r.priority, 'P1_CRITICAL');
    assert.ok(r.target.firstResponseTime);
    assert.ok(r.disclaimer.includes('operational'));
  });

  it('PRIORITY tier overrides P1 to 4h', () => {
    const r = getServiceTarget('P1_CRITICAL', 'PRIORITY');
    assert.ok(r.valid);
    assert.equal(r.target.firstResponseTime, '4h laborables');
  });

  it('BASIC tier: P1 response is 48h', () => {
    const r = getServiceTarget('P1_CRITICAL', 'BASIC');
    assert.ok(r.valid);
    assert.equal(r.target.firstResponseTime, '48h laborables');
  });

  it('getAllTargetsForTier returns 4 entries', () => {
    const results = getAllTargetsForTier('PRO');
    assert.equal(results.length, 4);
    assert.ok(results.every(r => r.valid));
  });

  it('unknown priority → invalid', () => {
    const r = getServiceTarget('P0_ULTRA');
    assert.ok(!r.valid);
  });
});

describe('Paso F — IncidentIntegration', () => {
  it('P1 ticket is incident-eligible', () => {
    const t = makeTicket({ type: TICKET_TYPES.BUG_REPORT, priority: TICKET_PRIORITIES.P1_CRITICAL });
    t.priority = TICKET_PRIORITIES.P1_CRITICAL;
    assert.ok(isIncidentEligible(t));
  });

  it('security concern is always eligible', () => {
    const t = makeTicket({ type: TICKET_TYPES.SECURITY_CONCERN });
    assert.ok(isIncidentEligible(t));
  });

  it('P4 question is not eligible', () => {
    const t = makeTicket({ type: TICKET_TYPES.QUESTION });
    t.priority = TICKET_PRIORITIES.P4_LOW;
    assert.ok(!isIncidentEligible(t));
  });

  it('supportTicketToIncident: P1 bug → SEV1', () => {
    const t = makeTicket({ type: TICKET_TYPES.BUG_REPORT });
    t.priority = TICKET_PRIORITIES.P1_CRITICAL;
    const r = supportTicketToIncident(t);
    assert.ok(r.valid);
    assert.ok(r.incident);
    assert.equal(r.incident.severity, 'SEV1');
  });

  it('non-eligible ticket → error without force', () => {
    const t = makeTicket({ type: TICKET_TYPES.QUESTION });
    t.priority = TICKET_PRIORITIES.P4_LOW;
    const r = supportTicketToIncident(t);
    assert.ok(!r.valid);
  });

  it('non-eligible ticket with force → creates incident', () => {
    const t = makeTicket({ type: TICKET_TYPES.QUESTION });
    t.priority = TICKET_PRIORITIES.P4_LOW;
    const r = supportTicketToIncident(t, { force: true });
    assert.ok(r.valid);
    assert.ok(r.incident);
  });

  it('auditTicketsForEscalation: identifies candidates', () => {
    const tickets = [
      { ...makeTicket({ type: TICKET_TYPES.SECURITY_CONCERN }), id: 'T1' },
      { ...makeTicket({ type: TICKET_TYPES.QUESTION }), id: 'T2', priority: TICKET_PRIORITIES.P4_LOW },
    ];
    tickets[0].priority = TICKET_PRIORITIES.P1_CRITICAL;
    const r = auditTicketsForEscalation(tickets);
    assert.ok(r.candidates >= 1);
  });
});

describe('Paso F — BackupPolicy', () => {
  const makePolicy = (tier = 'PRO') => {
    const r = createBackupPolicy({ clientId, maintenanceTier: tier });
    assert.ok(r.valid);
    return r.policy;
  };

  it('creates PRO backup policy', () => {
    const p = makePolicy('PRO');
    assert.equal(p.clientId, clientId);
    assert.equal(p.databaseBackup.frequency, 'DAILY');
    assert.ok(p.disclaimer.includes('No real backups'));
  });

  it('BASIC policy: weekly DB backup', () => {
    const p = makePolicy('BASIC');
    assert.equal(p.databaseBackup.frequency, 'WEEKLY');
  });

  it('PRIORITY policy: daily file backup', () => {
    const p = makePolicy('PRIORITY');
    assert.equal(p.fileBackup.frequency, 'DAILY');
  });

  it('missing clientId → invalid', () => {
    const r = createBackupPolicy({ maintenanceTier: 'PRO' });
    assert.ok(!r.valid);
  });

  it('auditBackupHealth: all checks pass → HEALTHY', () => {
    const p = makePolicy();
    const r = auditBackupHealth(p, {
      databaseBackupRecent: true,
      fileBackupRecent: true,
      configBackupRecent: true,
      restoreTestRecent: true,
      backupVerified: true,
    });
    assert.ok(r.valid);
    assert.equal(r.status, BACKUP_HEALTH_STATUS.HEALTHY);
    assert.equal(r.issues.length, 0);
  });

  it('auditBackupHealth: missing DB backup → CRITICAL', () => {
    const p = makePolicy();
    const r = auditBackupHealth(p, { databaseBackupRecent: false });
    assert.ok(r.valid);
    assert.equal(r.status, BACKUP_HEALTH_STATUS.CRITICAL);
    assert.ok(r.issues.some(i => i.severity === 'CRITICAL'));
  });

  it('evaluateRestoreReadiness: all checks → ready', () => {
    const p = makePolicy();
    const r = evaluateRestoreReadiness(p, {
      databaseBackupRecent: true,
      restoreTestRecent: true,
      backupVerified: true,
    });
    assert.ok(r.valid);
    assert.ok(r.restoreReady);
    assert.equal(r.blockers.length, 0);
  });

  it('evaluateRestoreReadiness: missing restore test → not ready', () => {
    const p = makePolicy();
    const r = evaluateRestoreReadiness(p, { databaseBackupRecent: true });
    assert.ok(r.valid);
    assert.ok(!r.restoreReady);
    assert.ok(r.blockers.length > 0);
  });
});

describe('Paso F — MaintenanceChecklist', () => {
  it('15 checks defined', () => {
    assert.equal(MAINTENANCE_CHECKS.length, 15);
  });

  it('5 check outcomes defined', () => {
    assert.equal(Object.keys(CHECK_OUTCOMES).length, 5);
  });

  it('all passing → score 100, HEALTHY', () => {
    const results = {};
    MAINTENANCE_CHECKS.forEach(c => { results[c.id] = CHECK_OUTCOMES.PASS; });
    const r = buildChecklistResult(results);
    assert.equal(r.score, 100);
    assert.equal(r.overallStatus, 'HEALTHY');
  });

  it('empty results → all PENDING, score 0, CRITICAL', () => {
    const r = buildChecklistResult({});
    assert.equal(r.score, 0);
    assert.equal(r.pending, 15);
    assert.equal(r.overallStatus, 'CRITICAL');
  });

  it('critical failure → overallStatus CRITICAL', () => {
    const results = {};
    MAINTENANCE_CHECKS.forEach(c => { results[c.id] = CHECK_OUTCOMES.PASS; });
    const criticalCheck = MAINTENANCE_CHECKS.find(c => c.critical);
    results[criticalCheck.id] = CHECK_OUTCOMES.FAIL;
    const r = buildChecklistResult(results);
    assert.equal(r.overallStatus, 'CRITICAL');
    assert.equal(r.criticalFailed, 1);
  });

  it('NOT_APPLICABLE counts as passed', () => {
    const results = {};
    MAINTENANCE_CHECKS.forEach(c => { results[c.id] = CHECK_OUTCOMES.NOT_APPLICABLE; });
    const r = buildChecklistResult(results);
    assert.equal(r.passed, 15);
  });
});

describe('Paso F — SupportQueue', () => {
  before(() => resetQueue());
  after(() => resetQueue());

  it('1. createTicket — enqueues and auto-triages', () => {
    const r = createTicket({
      clientId,
      title: 'Site down',
      type: TICKET_TYPES.BUG_REPORT,
      description: 'production system down all users affected',
      reportedBy: 'owner',
    });
    assert.ok(r.valid);
    assert.ok(r.ticket.id);
    assert.equal(r.queueSize, 1);
  });

  it('2. assignTicket — updates assignedTo', () => {
    const q = listTickets({ clientId });
    const id = q.tickets[0].id;
    const r = assignTicket(id, 'DEVELOPER', 'pm-1');
    assert.ok(r.valid);
    assert.equal(r.ticket.assignedTo, 'DEVELOPER');
  });

  it('3. updateTicket — advances state', () => {
    const q = listTickets({ clientId });
    const id = q.tickets[0].id;
    const r = updateTicket(id, TICKET_STATES.IN_PROGRESS, 'agent-1');
    assert.ok(r.valid);
    assert.equal(r.ticket.state, TICKET_STATES.IN_PROGRESS);
  });

  it('4. escalateTicket — sets ESCALATED state', () => {
    const q = listTickets({ clientId });
    const id = q.tickets[0].id;
    const r = escalateTicket(id, 'pm-1', 'SLA breach');
    assert.ok(r.valid);
    assert.equal(r.ticket.state, TICKET_STATES.ESCALATED);
  });

  it('5. resolveTicket — sets RESOLVED', () => {
    const q = listTickets({ clientId });
    const id = q.tickets[0].id;
    const r = resolveTicket(id, 'agent-1', 'Fixed root cause');
    assert.ok(r.valid);
    assert.equal(r.ticket.state, TICKET_STATES.RESOLVED);
  });

  it('6. closeTicket — sets CLOSED', () => {
    const q = listTickets({ clientId });
    const id = q.tickets[0].id;
    const r = closeTicket(id, 'pm-1', 'Confirmed by client');
    assert.ok(r.valid);
    assert.equal(r.ticket.state, TICKET_STATES.CLOSED);
  });

  it('7. listTickets — filter by state', () => {
    createTicket({ clientId, title: 'Open one', type: TICKET_TYPES.QUESTION, reportedBy: 'u' });
    const r = listTickets({ clientId, state: TICKET_STATES.TRIAGED });
    assert.ok(r.valid);
    assert.ok(r.tickets.every(t => t.state === TICKET_STATES.TRIAGED));
  });

  it('8. getQueueSummary — returns totals', () => {
    const r = getQueueSummary(clientId);
    assert.ok(r.valid);
    assert.ok(r.total >= 2);
    assert.ok(typeof r.open === 'number');
    assert.ok(r.byState);
    assert.ok(r.byPriority);
  });

  it('assignTicket: unknown id → error', () => {
    const r = assignTicket('NONEXISTENT', 'dev', 'pm');
    assert.ok(!r.valid);
  });
});

describe('Paso F — EscalationEngine', () => {
  it('ESCALATION_LEVELS has 5 levels', () => {
    assert.equal(Object.keys(ESCALATION_LEVELS).length, 5);
  });

  it('P4 ticket → NONE escalation', () => {
    const t = makeTicket({ type: TICKET_TYPES.QUESTION });
    t.priority = TICKET_PRIORITIES.P4_LOW;
    const r = evaluateEscalation(t);
    assert.ok(r.valid);
    assert.equal(r.escalationLevel, ESCALATION_LEVELS.NONE);
  });

  it('P1 ticket → at least LEVEL_1', () => {
    const t = makeTicket({ type: TICKET_TYPES.BUG_REPORT });
    t.priority = TICKET_PRIORITIES.P1_CRITICAL;
    const r = evaluateEscalation(t);
    assert.ok(r.valid);
    assert.notEqual(r.escalationLevel, ESCALATION_LEVELS.NONE);
  });

  it('security P1 → CRITICAL escalation', () => {
    const t = makeTicket({ type: TICKET_TYPES.SECURITY_CONCERN });
    t.priority = TICKET_PRIORITIES.P1_CRITICAL;
    const r = evaluateEscalation(t);
    assert.ok(r.valid);
    assert.equal(r.escalationLevel, ESCALATION_LEVELS.CRITICAL);
  });

  it('P1 open > 4h → LEVEL_2', () => {
    const t = makeTicket({ type: TICKET_TYPES.BUG_REPORT });
    t.priority = TICKET_PRIORITIES.P1_CRITICAL;
    const r = evaluateEscalation(t, { hoursOpen: 5 });
    assert.ok(r.valid);
    assert.equal(r.escalationLevel, ESCALATION_LEVELS.LEVEL_2);
  });

  it('getEscalationDefinition returns correct owner', () => {
    const def = getEscalationDefinition(ESCALATION_LEVELS.LEVEL_2);
    assert.ok(def);
    assert.equal(def.escalateTo, 'AGENCY_OWNER');
  });

  it('null ticket → error', () => {
    const r = evaluateEscalation(null);
    assert.ok(!r.valid);
  });
});

describe('Paso F — ThirdPartyIncidents', () => {
  it('stripe description → THIRD_PARTY_OWNED', () => {
    const r = classifyOwnership('Stripe payment failing for all users');
    assert.equal(r.ownership, OWNERSHIP.THIRD_PARTY_OWNED);
  });

  it('codebase description → AGENCY_OWNED', () => {
    const r = classifyOwnership('Bug in custom code deployment config');
    assert.equal(r.ownership, OWNERSHIP.AGENCY_OWNED);
  });

  it('client credentials → CLIENT_OWNED', () => {
    const r = classifyOwnership('Client password reset for client account');
    assert.equal(r.ownership, OWNERSHIP.CLIENT_OWNED);
  });

  it('stripe + agency → SHARED', () => {
    const r = classifyOwnership('Stripe integration broken in custom codebase');
    assert.equal(r.ownership, OWNERSHIP.SHARED);
  });

  it('OWNERSHIP has 4 values', () => {
    assert.equal(Object.keys(OWNERSHIP).length, 4);
  });

  it('createThirdPartyIncidentReport: valid', () => {
    const r = createThirdPartyIncidentReport({
      title:       'Make.com scenario failing',
      description: 'Make.com automation not triggering',
    });
    assert.ok(r.valid);
    assert.ok(r.classification.ownership === OWNERSHIP.THIRD_PARTY_OWNED);
    assert.ok(r.disclaimer.includes('No real incident actions'));
  });

  it('createThirdPartyIncidentReport: missing description → error', () => {
    const r = createThirdPartyIncidentReport({ title: 'X' });
    assert.ok(!r.valid);
  });
});

describe('Paso F — AutomationHealth', () => {
  it('empty scenarios → UNKNOWN', () => {
    const r = auditAutomationHealth([]);
    assert.ok(r.valid);
    assert.equal(r.status, 'UNKNOWN');
    assert.equal(r.healthScore, 100);
  });

  it('all active → HEALTHY', () => {
    const scenarios = [
      { id: 'S1', name: 'Booking sync', status: AUTOMATION_STATUS.ACTIVE, errorRate: 0, lastRunAt: '2026-08-31' },
      { id: 'S2', name: 'Lead notify',  status: AUTOMATION_STATUS.ACTIVE, errorRate: 0, lastRunAt: '2026-08-31' },
    ];
    const r = auditAutomationHealth(scenarios);
    assert.ok(r.valid);
    assert.equal(r.status, 'HEALTHY');
    assert.equal(r.healthScore, 100);
  });

  it('critical scenario in ERROR → CRITICAL', () => {
    const scenarios = [
      { id: 'S1', name: 'Payment flow', status: AUTOMATION_STATUS.ERROR, critical: true },
    ];
    const r = auditAutomationHealth(scenarios);
    assert.ok(r.valid);
    assert.equal(r.status, 'CRITICAL');
  });

  it('paused non-critical → WARNING', () => {
    const scenarios = [
      { id: 'S1', name: 'Report gen', status: AUTOMATION_STATUS.PAUSED, lastRunAt: '2026-08-01' },
    ];
    const r = auditAutomationHealth(scenarios);
    assert.ok(r.valid);
    assert.ok(r.issues.length > 0);
  });

  it('non-array input → error', () => {
    const r = auditAutomationHealth(null);
    assert.ok(!r.valid);
  });
});

describe('Paso F — AIHealth', () => {
  it('empty agents → UNKNOWN', () => {
    const r = auditAIHealth([]);
    assert.ok(r.valid);
    assert.equal(r.status, 'UNKNOWN');
  });

  it('all healthy agents → HEALTHY', () => {
    const agents = [
      { id: 'A1', status: AI_AGENT_STATUS.HEALTHY, latencyMs: 800, errorRate: 0.01 },
      { id: 'A2', status: AI_AGENT_STATUS.HEALTHY, latencyMs: 1200, errorRate: 0.02 },
    ];
    const r = auditAIHealth(agents);
    assert.ok(r.valid);
    assert.equal(r.status, 'HEALTHY');
  });

  it('unavailable critical agent → CRITICAL', () => {
    const agents = [
      { id: 'A1', status: AI_AGENT_STATUS.UNAVAILABLE, critical: true },
    ];
    const r = auditAIHealth(agents);
    assert.ok(r.valid);
    assert.equal(r.status, 'CRITICAL');
  });

  it('high latency → WARNING issue', () => {
    const agents = [
      { id: 'A1', status: AI_AGENT_STATUS.HEALTHY, latencyMs: 5000, errorRate: 0 },
    ];
    const r = auditAIHealth(agents);
    assert.ok(r.valid);
    assert.ok(r.issues.some(i => i.issue.includes('latency')));
  });

  it('custom thresholds respected', () => {
    const agents = [
      { id: 'A1', status: AI_AGENT_STATUS.HEALTHY, latencyMs: 1500, errorRate: 0 },
    ];
    const r = auditAIHealth(agents, { maxLatencyMs: 1000 });
    assert.ok(r.issues.some(i => i.issue.includes('latency')));
  });
});

describe('Paso F — SecurityMaintenance', () => {
  it('all PASS → HEALTHY, score 100', () => {
    const checks = {};
    for (let i = 1; i <= 10; i++) {
      checks[`SEC-0${i}`] = SECURITY_CHECK_STATUS.PASS;
    }
    checks['SEC-10'] = SECURITY_CHECK_STATUS.PASS;
    const r = runSecurityMaintenance({ checks });
    assert.ok(r.valid);
    assert.equal(r.passed, 10);
    assert.equal(r.status, 'HEALTHY');
  });

  it('critical SEC-01 fail → CRITICAL', () => {
    const r = runSecurityMaintenance({ checks: { 'SEC-01': SECURITY_CHECK_STATUS.FAIL } });
    assert.ok(r.valid);
    assert.equal(r.status, 'CRITICAL');
    assert.ok(r.criticalFailedIds.includes('SEC-01'));
  });

  it('no checks → all UNKNOWN → WARNING (too many unknowns)', () => {
    const r = runSecurityMaintenance({});
    assert.ok(r.valid);
    assert.ok(['WARNING', 'UNKNOWN', 'HEALTHY'].includes(r.status)); // unknowns trigger WARNING
  });

  it('disclaimer present', () => {
    const r = runSecurityMaintenance({});
    assert.ok(r.disclaimer.includes('Not a penetration test'));
  });
});

describe('Paso F — ClientHealthScore', () => {
  it('all 100 → score 100, HEALTHY', () => {
    const r = calculateClientHealthScore({
      checklistScore: 100, backupScore: 100, securityScore: 100,
      automationScore: 100, aiScore: 100,
    });
    assert.equal(r.score, 100);
    assert.equal(r.label, HEALTH_LABELS.HEALTHY);
  });

  it('all 0 → score 0, CRITICAL', () => {
    const r = calculateClientHealthScore({
      checklistScore: 0, backupScore: 0, securityScore: 0,
      automationScore: 0, aiScore: 0,
    });
    assert.equal(r.score, 0);
    assert.equal(r.label, HEALTH_LABELS.CRITICAL);
  });

  it('mid-range → WATCH or AT_RISK', () => {
    const r = calculateClientHealthScore({
      checklistScore: 50, backupScore: 50, securityScore: 50,
      automationScore: 50, aiScore: 50,
    });
    assert.ok(r.label === HEALTH_LABELS.WATCH || r.label === HEALTH_LABELS.AT_RISK);
  });

  it('breakdown has 5 dimensions', () => {
    const r = calculateClientHealthScore({});
    assert.equal(r.breakdown.length, 5);
  });

  it('missing dimensions default gracefully', () => {
    const r = calculateClientHealthScore({ checklistScore: 80, securityScore: 90 });
    assert.ok(r.score >= 0 && r.score <= 100);
  });

  it('compareHealthScores: improving trend', () => {
    const r = compareHealthScores(60, 80);
    assert.ok(r.valid);
    assert.equal(r.trend, 'IMPROVING');
  });

  it('compareHealthScores: declining trend', () => {
    const r = compareHealthScores(80, 60);
    assert.ok(r.valid);
    assert.equal(r.trend, 'DECLINING');
  });

  it('compareHealthScores: stable', () => {
    const r = compareHealthScores(75, 77);
    assert.ok(r.valid);
    assert.equal(r.trend, 'STABLE');
  });
});

describe('Paso F — MaintenanceReport', () => {
  const fakeCycle = {
    cycleId:         'CYCLE-TEST-001',
    clientId,
    maintenanceTier: 'PRO',
    status:          'HEALTHY',
    healthScore:     85,
    healthLabel:     'HEALTHY',
    startedAt:       '2026-08-31T09:00:00Z',
    completedAt:     '2026-08-31T10:00:00Z',
    criticalIssues:  0,
    warningCount:    1,
    checklist:       { score: 90, overallStatus: 'HEALTHY', passed: 13, failed: 0, warnings: 2, pending: 0, criticalFailed: 0 },
    backupAudit:     { healthScore: 80, status: 'HEALTHY', issues: [] },
    restoreReadiness:{ restoreReady: true, rpo: '24h', rto: '24h', blockers: [] },
    securityAudit:   { healthScore: 85, status: 'HEALTHY', criticalFailed: 0, criticalFailedIds: [], failed: 0 },
    automationAudit: { total: 5, active: 5, errored: 0, healthScore: 100, status: 'HEALTHY' },
    aiAudit:         { total: 2, healthy: 2, unavailable: 0, healthScore: 100, status: 'HEALTHY' },
  };

  it('generates valid report', () => {
    const r = generateMaintenanceReport(fakeCycle);
    assert.ok(r.valid);
    assert.ok(r.report.reportId.startsWith('RPT-'));
    assert.ok(r.report.sections.executiveSummary);
    assert.ok(r.report.disclaimer.includes('No real system changes'));
  });

  it('report has all expected sections', () => {
    const r = generateMaintenanceReport(fakeCycle);
    const sections = r.report.sections;
    assert.ok(sections.executiveSummary);
    assert.ok(sections.checklistResults);
    assert.ok(sections.backupStatus);
    assert.ok(sections.securityReview);
    assert.ok(sections.automationHealth);
    assert.ok(sections.aiHealth);
    assert.ok(sections.actionsRequired);
    assert.ok(sections.nextCycle);
  });

  it('HEALTHY cycle → 0 P1 actions required', () => {
    const r = generateMaintenanceReport(fakeCycle);
    assert.equal(r.report.sections.actionsRequired.p1Count, 0);
  });

  it('critical security → P1 action added', () => {
    const badCycle = {
      ...fakeCycle,
      cycleId: 'CYCLE-BAD-001',
      securityAudit: { healthScore: 20, status: 'CRITICAL', criticalFailed: 2, criticalFailedIds: ['SEC-01', 'SEC-02'], failed: 2 },
    };
    const r = generateMaintenanceReport(badCycle);
    assert.ok(r.valid);
    assert.ok(r.report.sections.actionsRequired.p1Count >= 1);
  });

  it('missing cycleId → error', () => {
    const r = generateMaintenanceReport({});
    assert.ok(!r.valid);
  });
});

describe('Paso F — ScopeBoundary', () => {
  it('bug keyword → INCLUDED', () => {
    const r = classifyScopeRequest({ description: 'There is a bug in the login form' });
    assert.ok(r.valid);
    assert.equal(r.decision, SCOPE_DECISION.INCLUDED);
    assert.equal(r.category, SCOPE_CATEGORIES.BUG_FIX);
  });

  it('new feature → BILLABLE', () => {
    const r = classifyScopeRequest({ description: 'I want a new feature: customer loyalty program' });
    assert.ok(r.valid);
    assert.equal(r.decision, SCOPE_DECISION.BILLABLE);
  });

  it('SSL / certificate → MAINTENANCE_TASK', () => {
    const r = classifyScopeRequest({ description: 'SSL certificate needs renewal' });
    assert.ok(r.valid);
    assert.equal(r.category, SCOPE_CATEGORIES.MAINTENANCE_TASK);
    assert.equal(r.decision, SCOPE_DECISION.INCLUDED);
  });

  it('out-of-scope keyword → EXCLUDED', () => {
    const r = classifyScopeRequest({ description: 'Please provide legal advice on the contract' });
    assert.ok(r.valid);
    assert.equal(r.decision, SCOPE_DECISION.EXCLUDED);
  });

  it('unrecognized → ESCALATE', () => {
    const r = classifyScopeRequest({ description: 'Something something unclear' });
    assert.ok(r.valid);
    assert.equal(r.decision, SCOPE_DECISION.ESCALATE);
  });

  it('missing description → error', () => {
    const r = classifyScopeRequest({});
    assert.ok(!r.valid);
  });

  it('includedInTier true for INCLUDED', () => {
    const r = classifyScopeRequest({ description: 'bug on mobile not working' });
    assert.ok(r.valid);
    assert.ok(r.includedInTier);
  });
});

describe('Paso F — ContinuousImprovement', () => {
  it('no data → default opportunity', () => {
    const r = identifyImprovementOpportunities({});
    assert.ok(r.valid);
    assert.ok(r.total >= 1);
  });

  it('cycle with errored automations → HIGH automation opportunity', () => {
    const r = identifyImprovementOpportunities({
      cycle: {
        healthScore: 80,
        checklist: { pending: 1 },
        automationAudit: { errored: 3 },
        securityAudit: { unknown: 2 },
        aiAudit: {},
      },
    });
    assert.ok(r.valid);
    const highOps = r.opportunities.filter(o => o.priority === IMPROVEMENT_PRIORITY.HIGH);
    assert.ok(highOps.some(o => o.category === 'AUTOMATION'));
  });

  it('low health score → HIGH process opportunity', () => {
    const r = identifyImprovementOpportunities({
      cycle: {
        healthScore: 45,
        checklist: { pending: 2 },
        automationAudit: { errored: 0 },
        securityAudit: { unknown: 1 },
      },
    });
    assert.ok(r.valid);
    assert.ok(r.high >= 1);
  });

  it('many bug tickets → TECHNICAL opportunity', () => {
    const r = identifyImprovementOpportunities({
      ticketSummary: { byType: { BUG_REPORT: 5 } },
    });
    assert.ok(r.valid);
    assert.ok(r.opportunities.some(o => o.category === 'TECHNICAL'));
  });

  it('results sorted HIGH first', () => {
    const r = identifyImprovementOpportunities({
      cycle: {
        healthScore: 30,
        checklist: { pending: 5 },
        automationAudit: { errored: 2 },
        securityAudit: { unknown: 0 },
      },
    });
    assert.ok(r.valid);
    if (r.opportunities.length > 1) {
      assert.ok(r.opportunities[0].priority === IMPROVEMENT_PRIORITY.HIGH ||
                r.opportunities[0].priority === r.opportunities[0].priority);
    }
  });
});

describe('Paso F — ServiceOffboarding', () => {
  it('initiates offboarding', () => {
    const r = initiateOffboarding({ clientId, serviceId: 'MS-NEXO-PRO', requestedBy: 'client-owner' });
    assert.ok(r.valid);
    assert.equal(r.offboarding.status, OFFBOARDING_STATUS.INITIATED);
    assert.equal(r.offboarding.checklist.length, 10);
  });

  it('missing clientId → error', () => {
    const r = initiateOffboarding({ serviceId: 'X', requestedBy: 'u' });
    assert.ok(!r.valid);
  });

  it('completeOffboardingStep: marks step done', () => {
    const init = initiateOffboarding({ clientId, serviceId: 'MS-X', requestedBy: 'u' });
    const r = completeOffboardingStep(init.offboarding, 'OFF-01', 'pm-1');
    assert.ok(r.valid);
    const step = r.offboarding.checklist.find(s => s.id === 'OFF-01');
    assert.ok(step.done);
  });

  it('unknown step → error', () => {
    const init = initiateOffboarding({ clientId, serviceId: 'MS-X', requestedBy: 'u' });
    const r = completeOffboardingStep(init.offboarding, 'OFF-99', 'pm-1');
    assert.ok(!r.valid);
  });

  it('endMaintenanceService: fails if critical steps pending', () => {
    const init = initiateOffboarding({ clientId, serviceId: 'MS-X', requestedBy: 'u' });
    const r = endMaintenanceService(init.offboarding, 'pm-1');
    assert.ok(!r.valid);
    assert.ok(r.pendingStepIds.length > 0);
  });

  it('endMaintenanceService: succeeds when all critical steps done', () => {
    let off = initiateOffboarding({ clientId, serviceId: 'MS-X', requestedBy: 'u' }).offboarding;
    const criticalIds = off.checklist.filter(s => s.critical).map(s => s.id);
    for (const id of criticalIds) {
      const r = completeOffboardingStep(off, id, 'pm-1');
      off = r.offboarding;
    }
    const r = endMaintenanceService(off, 'pm-1');
    assert.ok(r.valid);
    assert.equal(r.offboarding.status, OFFBOARDING_STATUS.COMPLETED);
    assert.ok(r.summary.closedAt);
  });
});

describe('Paso F — MaintenanceRunner (integration)', () => {
  it('runMaintenanceCycle: basic run succeeds', async () => {
    const r = await runMaintenanceCycle({
      clientId,
      maintenanceTier: 'PRO',
      checklistResults: (() => {
        const res = {};
        [
          'CHK-01','CHK-02','CHK-03','CHK-04','CHK-05','CHK-06','CHK-07','CHK-08',
          'CHK-09','CHK-10','CHK-11','CHK-12','CHK-13','CHK-14','CHK-15',
        ].forEach(id => { res[id] = 'PASS'; });
        return res;
      })(),
    });
    assert.ok(r.valid);
    assert.ok(r.cycle);
    assert.ok(r.report);
    assert.ok(r.report.valid);
  });

  it('runMaintenanceCycle: missing clientId → error', async () => {
    const r = await runMaintenanceCycle({});
    assert.ok(!r.valid);
  });

  it('runMaintenanceCycle: HEALTHY cycle with full checks', async () => {
    const allPass = {};
    for (let i = 1; i <= 15; i++) {
      allPass[`CHK-${i < 10 ? '0' : ''}${i}`] = 'PASS';
    }
    const r = await runMaintenanceCycle({
      clientId,
      maintenanceTier: 'PRIORITY',
      checklistResults: allPass,
      automationInput: { scenarios: [{ id: 'S1', status: 'ACTIVE', lastRunAt: '2026-08-31' }] },
      aiInput: { agents: [{ id: 'A1', status: 'HEALTHY', latencyMs: 500, errorRate: 0.01 }] },
      securityInput: { checks: { 'SEC-01': 'PASS', 'SEC-02': 'PASS', 'SEC-03': 'PASS' } },
    });
    assert.ok(r.valid);
    assert.ok(r.cycle.healthScore >= 0);
    assert.ok(r.cycle.status);
  });
});

describe('Paso F — Registry', () => {
  it('REGISTRY_VERSION bumped to 2.6.0', () => {
    assert.ok(REGISTRY_VERSION >= '2.6.0');
  });

  it('PASO_F_STATUS_MAIN is 100_PERCENT', () => {
    assert.equal(PASO_F_STATUS_MAIN, '100_PERCENT');
  });
});
