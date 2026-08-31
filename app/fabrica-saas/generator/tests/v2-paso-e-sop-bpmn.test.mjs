import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// SOP modules
import { PROCESS_CATEGORIES, PROCESS_STATUS, createProcess, registerProcess, getProcess, listProcesses, clearRegistry } from '../../sop/processRegistry.js';
import { AGENCY_ROLES, getRole, listRoles, canPerformAction, hasApprovalAuthority, getEscalationTarget } from '../../sop/operatingRoles.js';
import { SOP_STEP_TYPES, SOP_STATUS, createSOP, validateSOP, runSOP } from '../../sop/sopEngine.js';
import { CLIENT_SOPS, sopLeadIntake, sopQualification, sopDiscovery, ALL_CLIENT_SOPS } from '../../sop/clientSOP.js';
import { AGENCY_SOP_STAGES, STAGE_OWNERS, STAGE_GATES, runAgencySOP } from '../../sop/agencySOP.js';
import { sopFactoryGeneration, FACTORY_SOP_STAGES, getFactoryStageOwner } from '../../sop/factorySOP.js';
import { sopCommercialProposal, validateCommercialGate } from '../../sop/commercialSOP.js';
import { AI_RISK_TIERS, defineAgentProfile, validateAgentProfile, sopAIAgent } from '../../sop/aiAgentSOP.js';
import { defineAutomation, automationProductionGate } from '../../sop/automationSOP.js';
import { QA_CHECK_TYPES, QA_OUTCOMES, runQAGate, P0_CHECKS } from '../../sop/qaSOP.js';
import { DATA_CLASSIFICATION, classifyData, validateCredentialPlan } from '../../sop/securitySOP.js';
import { DEPLOY_STATUS, validateProductionReadiness } from '../../sop/productionSOP.js';
import { TICKET_PRIORITY, classifyTicket } from '../../sop/supportSOP.js';
import { MAINTENANCE_HEALTH_STATUS, runMaintenanceCheck } from '../../sop/maintenanceSOP.js';
import { INCIDENT_SEVERITY, INCIDENT_STATUS, createIncident, classifySeverity, updateIncident, generatePostmortem } from '../../sop/incidentManagement.js';
import { GATE_OUTCOMES, GATE_IDS, commercialGate, scopeGate, productionGate, qaGate, securityGate, deliveryGate, changeGate, incidentGate } from '../../sop/decisionGates.js';

// BPMN modules
import { BPMN_ELEMENT_TYPES, createBPMNProcess, startEvent, endEvent, task, xorGateway, flow, validateBPMNProcess } from '../../bpmn/bpmnEngine.js';
import { bpmnAgencyProcess } from '../../bpmn/bpmnAgency.js';
import { bpmnClientProcess } from '../../bpmn/bpmnClient.js';
import { bpmnFactoryProcess } from '../../bpmn/bpmnFactory.js';
import { bpmnAutomationProcess } from '../../bpmn/bpmnAutomation.js';
import { bpmnIncidentProcess } from '../../bpmn/bpmnIncident.js';
import { exportToJSON, exportToMermaid, exportToXML } from '../../bpmn/bpmnExport.js';
import { mapSOPToBPMN, auditAllMappings } from '../../bpmn/sopBpmnMapping.js';
import { auditProcess, auditProcessList, auditBPMNProcess } from '../../bpmn/processHealthCheck.js';

// Registry
import { PASO_E_STATUS } from '../../factory-registry/sop.js';

// ───────────────────────────────
// SUITE 1 — Process Registry
// ───────────────────────────────
describe('Suite 1 — Process Registry', () => {
  it('PROCESS_CATEGORIES has expected values', () => {
    assert.ok(PROCESS_CATEGORIES.CLIENT);
    assert.ok(PROCESS_CATEGORIES.AGENCY);
    assert.ok(PROCESS_CATEGORIES.AI);
    assert.ok(PROCESS_CATEGORIES.OPERATIONS);
    assert.equal(Object.keys(PROCESS_CATEGORIES).length, 7);
  });

  it('createProcess validates required fields', () => {
    const r = createProcess({});
    assert.equal(r.valid, false);
    assert.ok(r.errors.length > 0);
  });

  it('createProcess returns valid process', () => {
    const r = createProcess({
      processId: 'PROC_001',
      name: 'Test Process',
      category: PROCESS_CATEGORIES.CLIENT,
      ownerRole: 'COMMERCIAL',
      trigger: 'client submits form',
      steps: ['step 1', 'step 2'],
    });
    assert.equal(r.valid, true);
    assert.ok(r.process);
    assert.equal(r.process.processId, 'PROC_001');
    assert.equal(r.process.status, PROCESS_STATUS.ACTIVE);
  });

  it('registerProcess and getProcess work', () => {
    clearRegistry();
    registerProcess({
      processId: 'PROC_REG_001',
      name: 'Registered Process',
      category: PROCESS_CATEGORIES.AGENCY,
      ownerRole: 'PROJECT_MANAGER',
      trigger: 'approved',
      steps: ['do thing'],
    });
    const p = getProcess('PROC_REG_001');
    assert.ok(p);
    assert.equal(p.name, 'Registered Process');
  });

  it('listProcesses filters by category', () => {
    clearRegistry();
    registerProcess({ processId: 'A', name: 'A', category: PROCESS_CATEGORIES.CLIENT, ownerRole: 'x', trigger: 't', steps: ['s'] });
    registerProcess({ processId: 'B', name: 'B', category: PROCESS_CATEGORIES.AGENCY, ownerRole: 'x', trigger: 't', steps: ['s'] });
    const clients = listProcesses(PROCESS_CATEGORIES.CLIENT);
    assert.equal(clients.length, 1);
    assert.equal(clients[0].processId, 'A');
  });
});

// ───────────────────────────────
// SUITE 2 — Operating Roles
// ───────────────────────────────
describe('Suite 2 — Operating Roles', () => {
  it('listRoles returns all 10 roles', () => {
    const roles = listRoles();
    assert.equal(roles.length, 10);
  });

  it('getRole returns COMMERCIAL role', () => {
    const role = getRole(AGENCY_ROLES.COMMERCIAL);
    assert.ok(role);
    assert.equal(role.role, AGENCY_ROLES.COMMERCIAL);
    assert.ok(Array.isArray(role.responsibilities));
    assert.ok(role.responsibilities.length > 0);
  });

  it('getRole returns null for unknown role', () => {
    assert.equal(getRole('UNKNOWN_ROLE'), null);
  });

  it('canPerformAction — COMMERCIAL can qualify_lead', () => {
    const r = canPerformAction(AGENCY_ROLES.COMMERCIAL, 'qualify_lead');
    assert.equal(r.allowed, true);
  });

  it('canPerformAction — DEVELOPER cannot approve_proposal', () => {
    const r = canPerformAction(AGENCY_ROLES.DEVELOPER, 'approve_proposal');
    assert.equal(r.allowed, false);
  });

  it('canPerformAction — unknown role is not allowed', () => {
    const r = canPerformAction('GHOST', 'do_anything');
    assert.equal(r.allowed, false);
    assert.equal(r.reason, 'unknown_role');
  });

  it('hasApprovalAuthority — AGENCY_OWNER has PROPOSAL', () => {
    assert.equal(hasApprovalAuthority(AGENCY_ROLES.AGENCY_OWNER, 'PROPOSAL'), true);
  });

  it('hasApprovalAuthority — DEVELOPER has none', () => {
    assert.equal(hasApprovalAuthority(AGENCY_ROLES.DEVELOPER, 'PROPOSAL'), false);
  });

  it('getEscalationTarget — SUPPORT escalates to PROJECT_MANAGER', () => {
    assert.equal(getEscalationTarget(AGENCY_ROLES.SUPPORT), AGENCY_ROLES.PROJECT_MANAGER);
  });

  it('AGENCY_OWNER escalation is null', () => {
    assert.equal(getEscalationTarget(AGENCY_ROLES.AGENCY_OWNER), null);
  });
});

// ───────────────────────────────
// SUITE 3 — SOP Engine
// ───────────────────────────────
describe('Suite 3 — SOP Engine', () => {
  it('createSOP validates required fields', () => {
    const r = createSOP({});
    assert.equal(r.valid, false);
    assert.ok(r.errors.length > 0);
  });

  it('createSOP returns valid SOP', () => {
    const r = createSOP({
      id: 'TEST_SOP',
      title: 'Test SOP',
      purpose: 'For testing',
      owner: 'COMMERCIAL',
      trigger: 'test trigger',
      steps: [
        { label: 'Do action', type: SOP_STEP_TYPES.ACTION, owner: 'COMMERCIAL' },
        { label: 'Check gate', type: SOP_STEP_TYPES.GATE, gate: 'some_gate', owner: 'QA' },
      ],
    });
    assert.equal(r.valid, true);
    assert.ok(r.sop);
    assert.equal(r.sop.steps.length, 2);
  });

  it('validateSOP returns warnings for missing fields', () => {
    const { sop } = createSOP({
      id: 'MINIMAL_SOP',
      title: 'Minimal',
      purpose: 'test',
      owner: 'QA',
      trigger: 'trigger',
      steps: ['step one'],
    });
    const v = validateSOP(sop);
    assert.equal(v.valid, true);
    assert.ok(v.warnings.length > 0);
    assert.ok(v.score <= 100 && v.score >= 0);
  });

  it('runSOP — PASS when all gates satisfied', () => {
    const { sop } = createSOP({
      id: 'RUN_SOP',
      title: 'Run test',
      purpose: 'x',
      owner: 'QA',
      trigger: 't',
      steps: [
        { label: 'Gate check', type: SOP_STEP_TYPES.GATE, gate: 'my_gate' },
      ],
    });
    const result = runSOP(sop, { my_gate: true });
    assert.equal(result.status, SOP_STATUS.PASS);
  });

  it('runSOP — BLOCKED when gate fails', () => {
    const { sop } = createSOP({
      id: 'BLOCK_SOP',
      title: 'Block test',
      purpose: 'x',
      owner: 'QA',
      trigger: 't',
      steps: [
        { label: 'Gate check', type: SOP_STEP_TYPES.GATE, gate: 'fail_gate' },
      ],
    });
    const result = runSOP(sop, { fail_gate: false });
    assert.equal(result.status, SOP_STATUS.BLOCKED);
    assert.equal(result.blocked, true);
  });

  it('runSOP — HUMAN_REVIEW when gate is HUMAN_REVIEW', () => {
    const { sop } = createSOP({
      id: 'HUMAN_SOP',
      title: 'Human test',
      purpose: 'x',
      owner: 'QA',
      trigger: 't',
      steps: [
        { label: 'Gate check', type: SOP_STEP_TYPES.GATE, gate: 'hr_gate' },
      ],
    });
    const result = runSOP(sop, { hr_gate: 'HUMAN_REVIEW' });
    assert.equal(result.status, SOP_STATUS.HUMAN_REVIEW);
  });
});

// ───────────────────────────────
// SUITE 4 — Client SOPs
// ───────────────────────────────
describe('Suite 4 — Client SOPs', () => {
  it('sopLeadIntake is a valid SOP', () => {
    assert.ok(sopLeadIntake);
    assert.equal(sopLeadIntake.id, CLIENT_SOPS.LEAD_INTAKE);
    assert.equal(sopLeadIntake.owner, 'COMMERCIAL');
    assert.ok(sopLeadIntake.steps.length >= 5);
  });

  it('sopQualification has decision steps', () => {
    const hasDecision = sopQualification.steps.some(s => s.type === SOP_STEP_TYPES.DECISION || s.type === SOP_STEP_TYPES.GATE);
    assert.ok(hasDecision);
  });

  it('sopDiscovery references PROJECT_MANAGER owner', () => {
    assert.equal(sopDiscovery.owner, 'PROJECT_MANAGER');
  });

  it('ALL_CLIENT_SOPS has 12 entries', () => {
    assert.equal(ALL_CLIENT_SOPS.length, 12);
  });

  it('all client SOPs have id, title, owner, steps', () => {
    for (const sop of ALL_CLIENT_SOPS) {
      assert.ok(sop.id, `SOP missing id`);
      assert.ok(sop.title, `SOP ${sop.id} missing title`);
      assert.ok(sop.owner, `SOP ${sop.id} missing owner`);
      assert.ok(sop.steps.length > 0, `SOP ${sop.id} has no steps`);
    }
  });

  it('sopLeadIntake has bpmnRef', () => {
    assert.ok(sopLeadIntake.bpmnRef);
  });
});

// ───────────────────────────────
// SUITE 5 — Agency SOP
// ───────────────────────────────
describe('Suite 5 — Agency SOP', () => {
  it('AGENCY_SOP_STAGES has 12 stages', () => {
    assert.equal(AGENCY_SOP_STAGES.length, 12);
    assert.ok(AGENCY_SOP_STAGES.includes('LEAD'));
    assert.ok(AGENCY_SOP_STAGES.includes('CLOSEOUT'));
  });

  it('STAGE_OWNERS covers all stages', () => {
    for (const stage of AGENCY_SOP_STAGES) {
      assert.ok(STAGE_OWNERS[stage], `Missing owner for stage ${stage}`);
    }
  });

  it('STAGE_GATES covers all stages with at least one gate', () => {
    for (const stage of AGENCY_SOP_STAGES) {
      assert.ok(Array.isArray(STAGE_GATES[stage]), `Missing gates for stage ${stage}`);
      assert.ok(STAGE_GATES[stage].length > 0, `No gates for stage ${stage}`);
    }
  });

  it('runAgencySOP returns structured result for Nexo lead', async () => {
    const nexo = {
      businessName: 'Clínica Veterinaria Nexo',
      businessType: 'clinica veterinaria',
      contactRole: 'OWNER',
      sector: 'veterinaria',
      location: 'Granada',
      mainProblems: 'gestión manual',
      businessGoals: 'automatizar citas',
      budgetRange: '2500_to_5000',
      desiredTimeline: '2_to_4_months',
      decisionMaker: 'OWNER',
      currentTools: 'excel',
      teamSize: '4',
    };
    const result = await runAgencySOP(nexo, { simulateApprovalDecision: 'APPROVED' });
    assert.ok(result.sopId === 'AGENCY_SOP_FULL_PIPELINE');
    assert.ok(result.stages);
    assert.ok(result.lifecycle);
    assert.ok(AGENCY_SOP_STAGES.every(s => result.stages[s]));
  });
});

// ───────────────────────────────
// SUITE 6 — Factory SOP
// ───────────────────────────────
describe('Suite 6 — Factory SOP', () => {
  it('sopFactoryGeneration is valid', () => {
    assert.ok(sopFactoryGeneration);
    assert.equal(sopFactoryGeneration.id, 'FACTORY_PRODUCT_GENERATION');
    assert.ok(sopFactoryGeneration.steps.length >= 15);
  });

  it('FACTORY_SOP_STAGES has correct entries', () => {
    assert.ok(FACTORY_SOP_STAGES.includes('brief_validation'));
    assert.ok(FACTORY_SOP_STAGES.includes('qa'));
    assert.ok(FACTORY_SOP_STAGES.includes('delivery_artifacts'));
    assert.equal(FACTORY_SOP_STAGES.length, 13);
  });

  it('getFactoryStageOwner returns correct owners', () => {
    assert.equal(getFactoryStageOwner('qa'), 'QA');
    assert.equal(getFactoryStageOwner('experience_selection'), 'AI_SPECIALIST');
    assert.equal(getFactoryStageOwner('make_planning'), 'AUTOMATION_SPECIALIST');
    assert.equal(getFactoryStageOwner('unknown_stage'), 'DEVELOPER');
  });

  it('sopFactoryGeneration has security checks', () => {
    assert.ok(sopFactoryGeneration.securityChecks.length > 0);
  });
});

// ───────────────────────────────
// SUITE 7 — Commercial SOP
// ───────────────────────────────
describe('Suite 7 — Commercial SOP', () => {
  it('sopCommercialProposal is valid', () => {
    assert.ok(sopCommercialProposal);
    assert.equal(sopCommercialProposal.owner, 'COMMERCIAL');
  });

  it('validateCommercialGate — PASS with complete data', () => {
    const r = validateCommercialGate({
      packageTier: 'PRO',
      setupPrice: 2400,
      monthlyPrice: 149,
      sector: 'veterinaria',
    });
    assert.equal(r.valid, true);
    assert.equal(r.outcome, 'PASS');
  });

  it('validateCommercialGate — BLOCKED missing packageTier', () => {
    const r = validateCommercialGate({ setupPrice: 2400, monthlyPrice: 149 });
    assert.equal(r.valid, false);
    assert.equal(r.outcome, 'BLOCKED');
    assert.ok(r.errors.includes('missing packageTier'));
  });

  it('validateCommercialGate — warnings for missing addons/third-party', () => {
    const r = validateCommercialGate({
      packageTier: 'ESSENTIAL',
      setupPrice: 1200,
      monthlyPrice: 89,
      sector: 'educacion',
    });
    assert.ok(r.warnings.length > 0);
  });
});

// ───────────────────────────────
// SUITE 8 — AI Agent SOP
// ───────────────────────────────
describe('Suite 8 — AI Agent SOP', () => {
  it('defineAgentProfile — valid LOW risk profile', () => {
    const r = defineAgentProfile({
      agentId: 'chatbot_nexo_v1',
      purpose: 'Answer FAQs for clinic',
      riskTier: AI_RISK_TIERS.LOW,
      allowedTools: ['search_faq', 'read_schedule'],
    });
    assert.equal(r.valid, true);
    assert.equal(r.profile.riskTier, AI_RISK_TIERS.LOW);
    assert.equal(r.profile.testingRequired, true);
  });

  it('defineAgentProfile — HIGH risk gets HUMAN_REVIEW gate', () => {
    const r = defineAgentProfile({
      agentId: 'payment_agent',
      purpose: 'Process payments',
      riskTier: AI_RISK_TIERS.HIGH,
    });
    assert.equal(r.profile.releaseGate, 'HUMAN_REVIEW');
  });

  it('defineAgentProfile — missing required fields returns errors', () => {
    const r = defineAgentProfile({});
    assert.equal(r.valid, false);
    assert.ok(r.errors.length > 0);
  });

  it('validateAgentProfile — HIGH risk without HUMAN_REVIEW gate → violation', () => {
    const r = defineAgentProfile({
      agentId: 'risky_agent',
      purpose: 'Risky',
      riskTier: AI_RISK_TIERS.HIGH,
    });
    const profile = { ...r.profile, releaseGate: 'QA_GATE' };
    const v = validateAgentProfile(profile);
    assert.equal(v.valid, false);
    assert.ok(v.violations.some(v2 => v2.includes('HUMAN_REVIEW')));
  });

  it('validateAgentProfile — LOW risk with READ_WRITE → violation', () => {
    const r = defineAgentProfile({
      agentId: 'simple_bot',
      purpose: 'Simple',
      riskTier: AI_RISK_TIERS.LOW,
    });
    const profile = { ...r.profile, dataAccess: 'READ_WRITE' };
    const v = validateAgentProfile(profile);
    assert.equal(v.valid, false);
  });

  it('validateAgentProfile — empty forbiddenActions → violation', () => {
    const r = defineAgentProfile({
      agentId: 'bot',
      purpose: 'Bot',
      riskTier: AI_RISK_TIERS.MEDIUM,
    });
    const profile = { ...r.profile, forbiddenActions: [] };
    const v = validateAgentProfile(profile);
    assert.equal(v.valid, false);
  });

  it('sopAIAgent is valid and has security checks', () => {
    assert.ok(sopAIAgent);
    assert.ok(sopAIAgent.securityChecks.length > 0);
  });
});

// ───────────────────────────────
// SUITE 9 — Automation SOP
// ───────────────────────────────
describe('Suite 9 — Automation SOP', () => {
  it('defineAutomation — valid', () => {
    const r = defineAutomation({
      automationId: 'booking_confirmation',
      businessNeed: 'Send booking confirmation email',
      trigger: 'New booking created',
      inputs: ['booking_id', 'client_email'],
      steps: ['fetch booking', 'send email'],
      outputs: ['email_sent'],
    });
    assert.equal(r.valid, true);
    assert.equal(r.automation.makeCompatible, true);
  });

  it('defineAutomation — missing required fields', () => {
    const r = defineAutomation({});
    assert.equal(r.valid, false);
    assert.ok(r.errors.length >= 2);
  });

  it('automationProductionGate — BLOCKED when not staged', () => {
    const { automation } = defineAutomation({
      automationId: 'test_auto',
      businessNeed: 'Test',
      trigger: 'trigger',
    });
    const gate = automationProductionGate(automation);
    assert.equal(gate.ready, false);
    assert.equal(gate.outcome, 'BLOCKED');
    assert.ok(gate.blocks.includes('test coverage not confirmed'));
  });

  it('automationProductionGate — PASS when all conditions met', () => {
    const { automation } = defineAutomation({
      automationId: 'ready_auto',
      businessNeed: 'Send notification',
      trigger: 'event',
      steps: ['validate', 'send'],
      testCoverage: true,
      stagingValidated: true,
      errorHandling: 'HUMAN_REVIEW',
    });
    const gate = automationProductionGate(automation);
    assert.equal(gate.ready, true);
    assert.equal(gate.outcome, 'PASS');
  });
});

// ───────────────────────────────
// SUITE 10 — QA SOP
// ───────────────────────────────
describe('Suite 10 — QA SOP', () => {
  it('runQAGate — PASS when all P0 pass', () => {
    const results = {};
    for (const check of P0_CHECKS) results[check] = true;
    const gate = runQAGate(results);
    assert.equal(gate.outcome, QA_OUTCOMES.PASS);
    assert.equal(gate.blocked, false);
  });

  it('runQAGate — BLOCKED when functional_qa fails', () => {
    const results = {};
    for (const check of P0_CHECKS) results[check] = true;
    results[QA_CHECK_TYPES.FUNCTIONAL] = false;
    const gate = runQAGate(results);
    assert.equal(gate.outcome, QA_OUTCOMES.BLOCKED);
    assert.ok(gate.p0Failures.includes(QA_CHECK_TYPES.FUNCTIONAL));
  });

  it('runQAGate — HUMAN_REVIEW when privacy fails', () => {
    const results = {};
    for (const check of P0_CHECKS) results[check] = true;
    results[QA_CHECK_TYPES.PRIVACY] = false;
    const gate = runQAGate(results);
    assert.equal(gate.outcome, QA_OUTCOMES.HUMAN_REVIEW);
  });

  it('runQAGate — score is 0-100', () => {
    const gate = runQAGate({});
    assert.ok(gate.score >= 0 && gate.score <= 100);
  });

  it('P0_CHECKS has 6 checks', () => {
    assert.equal(P0_CHECKS.length, 6);
  });
});

// ───────────────────────────────
// SUITE 11 — Security SOP
// ───────────────────────────────
describe('Suite 11 — Security SOP', () => {
  it('classifyData — health → RESTRICTED', () => {
    assert.equal(classifyData('health_record'), DATA_CLASSIFICATION.RESTRICTED);
  });

  it('classifyData — payment → RESTRICTED', () => {
    assert.equal(classifyData('payment_token'), DATA_CLASSIFICATION.RESTRICTED);
  });

  it('classifyData — email → CONFIDENTIAL', () => {
    assert.equal(classifyData('client_email'), DATA_CLASSIFICATION.CONFIDENTIAL);
  });

  it('classifyData — config → INTERNAL', () => {
    assert.equal(classifyData('admin_config'), DATA_CLASSIFICATION.INTERNAL);
  });

  it('classifyData — public content → PUBLIC', () => {
    assert.equal(classifyData('hero_text'), DATA_CLASSIFICATION.PUBLIC);
  });

  it('validateCredentialPlan — valid plan', () => {
    const r = validateCredentialPlan({
      ownership: 'CLIENT',
      rotationPolicy: 'quarterly',
      accessReviewSchedule: 'annual',
    });
    assert.equal(r.valid, true);
  });

  it('validateCredentialPlan — agency stores secret → violation', () => {
    const r = validateCredentialPlan({
      agencyStoresSecret: true,
      ownership: 'AGENCY',
      rotationPolicy: 'never',
      accessReviewSchedule: 'never',
    });
    assert.equal(r.valid, false);
    assert.ok(r.violations.length > 0);
  });
});

// ───────────────────────────────
// SUITE 12 — Production SOP
// ───────────────────────────────
describe('Suite 12 — Production SOP', () => {
  it('validateProductionReadiness — READY when all checks pass', () => {
    const r = validateProductionReadiness({
      qa_pass: true,
      security_pass: true,
      build_pass: true,
      delivery_manifest_exists: true,
      no_critical_open_crs: true,
      env_variables_configured: true,
      rollback_plan_exists: true,
    });
    assert.equal(r.status, DEPLOY_STATUS.READY);
    assert.equal(r.ready, true);
  });

  it('validateProductionReadiness — BLOCKED when qa fails', () => {
    const r = validateProductionReadiness({ qa_pass: false });
    assert.equal(r.status, DEPLOY_STATUS.BLOCKED);
    assert.ok(r.missing.includes('qa_pass'));
  });

  it('validateProductionReadiness includes disclaimer', () => {
    const r = validateProductionReadiness({});
    assert.ok(r.disclaimer.includes('readiness check'));
  });
});

// ───────────────────────────────
// SUITE 13 — Support SOP
// ───────────────────────────────
describe('Suite 13 — Support SOP', () => {
  it('classifyTicket — BUG is covered, P2_HIGH', () => {
    const r = classifyTicket({ type: 'BUG', description: 'Feature is broken' });
    assert.equal(r.covered, true);
    assert.equal(r.priority, TICKET_PRIORITY.P2_HIGH);
  });

  it('classifyTicket — SCOPE_CHANGE requires CR', () => {
    const r = classifyTicket({ type: 'SCOPE_CHANGE', description: 'Add new feature' });
    assert.equal(r.covered, false);
    assert.equal(r.requiresCR, true);
  });

  it('classifyTicket — TRAINING_QUESTION is covered, P4_LOW', () => {
    const r = classifyTicket({ type: 'TRAINING_QUESTION', description: 'How to use admin' });
    assert.equal(r.covered, true);
    assert.equal(r.priority, TICKET_PRIORITY.P4_LOW);
  });

  it('classifyTicket — "system down" → P1_CRITICAL', () => {
    const r = classifyTicket({ type: 'BUG', description: 'system down for all users' });
    assert.equal(r.priority, TICKET_PRIORITY.P1_CRITICAL);
    assert.equal(r.escalateTo, 'PROJECT_MANAGER');
  });
});

// ───────────────────────────────
// SUITE 14 — Maintenance SOP
// ───────────────────────────────
describe('Suite 14 — Maintenance SOP', () => {
  it('runMaintenanceCheck — HEALTHY when all checks done', () => {
    const r = runMaintenanceCheck({
      dependenciesChecked: true,
      securityPatchesChecked: true,
      backupVerified: true,
      performanceChecked: true,
      integrationHealth: true,
      automationHealth: true,
      aiHealth: true,
      clientChangesReviewed: true,
      documentationUpToDate: true,
    });
    assert.equal(r.status, MAINTENANCE_HEALTH_STATUS.HEALTHY);
    assert.equal(r.criticals.length, 0);
  });

  it('runMaintenanceCheck — CRITICAL when security not checked', () => {
    const r = runMaintenanceCheck({ securityPatchesChecked: false });
    assert.equal(r.status, MAINTENANCE_HEALTH_STATUS.CRITICAL);
  });

  it('runMaintenanceCheck — WARNING when only minor issues', () => {
    const r = runMaintenanceCheck({
      securityPatchesChecked: true,
      dependenciesChecked: false,
    });
    assert.equal(r.status, MAINTENANCE_HEALTH_STATUS.WARNING);
  });

  it('runMaintenanceCheck includes disclaimer', () => {
    const r = runMaintenanceCheck({});
    assert.ok(r.disclaimer.includes('No changes applied'));
  });
});

// ───────────────────────────────
// SUITE 15 — Incident Management
// ───────────────────────────────
describe('Suite 15 — Incident Management', () => {
  it('createIncident — valid SEV1', () => {
    const r = createIncident({ title: 'System down', severity: INCIDENT_SEVERITY.SEV1, reportedBy: 'CLIENT' });
    assert.equal(r.valid, true);
    assert.equal(r.incident.severity, INCIDENT_SEVERITY.SEV1);
    assert.equal(r.incident.status, INCIDENT_STATUS.OPEN);
    assert.equal(r.incident.responseTarget, '15 minutes');
  });

  it('createIncident — SEV3 has 4h response target', () => {
    const r = createIncident({ title: 'Minor bug', severity: INCIDENT_SEVERITY.SEV3, reportedBy: 'SUPPORT' });
    assert.equal(r.incident.responseTarget, '4 hours');
  });

  it('createIncident — missing required fields returns errors', () => {
    const r = createIncident({});
    assert.equal(r.valid, false);
    assert.ok(r.errors.length >= 2);
  });

  it('classifySeverity — system down → SEV1', () => {
    assert.equal(classifySeverity('system down for all users'), INCIDENT_SEVERITY.SEV1);
  });

  it('classifySeverity — broken feature, no workaround → SEV2', () => {
    assert.equal(classifySeverity('major feature broken no workaround'), INCIDENT_SEVERITY.SEV2);
  });

  it('classifySeverity — minor issue → SEV4', () => {
    assert.equal(classifySeverity('cosmetic alignment issue'), INCIDENT_SEVERITY.SEV4);
  });

  it('updateIncident — advance to CONTAINED', () => {
    const { incident } = createIncident({ title: 'Test', severity: INCIDENT_SEVERITY.SEV2, reportedBy: 'SUPPORT' });
    const r = updateIncident(incident, { status: INCIDENT_STATUS.CONTAINED, containment: 'Reverted deploy', updatedBy: 'PM' });
    assert.equal(r.valid, true);
    assert.equal(r.incident.status, INCIDENT_STATUS.CONTAINED);
    assert.ok(r.incident.timeline.length > 1);
  });

  it('generatePostmortem — fails if not resolved', () => {
    const { incident } = createIncident({ title: 'Test', severity: INCIDENT_SEVERITY.SEV3, reportedBy: 'SUPPORT' });
    const r = generatePostmortem(incident);
    assert.equal(r.valid, false);
  });

  it('generatePostmortem — valid after RESOLVED', () => {
    const { incident } = createIncident({ title: 'Test', severity: INCIDENT_SEVERITY.SEV3, reportedBy: 'SUPPORT' });
    const { incident: resolved } = updateIncident(incident, { status: INCIDENT_STATUS.RESOLVED });
    const r = generatePostmortem(resolved);
    assert.equal(r.valid, true);
    assert.ok(r.postmortem.disclaimer.includes('learning document'));
  });
});

// ───────────────────────────────
// SUITE 16 — Decision Gates
// ───────────────────────────────
describe('Suite 16 — Decision Gates', () => {
  it('ALL_GATES has 8 entries', () => {
    assert.equal(Object.keys(GATE_IDS).length, 8);
  });

  it('commercialGate — PASS with full context', () => {
    const r = commercialGate({ budgetQualified: true, decisionMakerConfirmed: true });
    assert.equal(r.outcome, GATE_OUTCOMES.PASS);
    assert.equal(r.pass, true);
  });

  it('commercialGate — BLOCKED when budget not qualified', () => {
    const r = commercialGate({ budgetQualified: false, decisionMakerConfirmed: true, proposalGenerated: true });
    assert.equal(r.outcome, GATE_OUTCOMES.BLOCKED);
    assert.equal(r.pass, false);
  });

  it('commercialGate — HUMAN_REVIEW when humanReviewRequired=true', () => {
    const r = commercialGate({ budgetQualified: true, decisionMakerConfirmed: true, humanReviewRequired: true });
    assert.equal(r.outcome, GATE_OUTCOMES.HUMAN_REVIEW);
  });

  it('qaGate — BLOCKED when functional QA fails', () => {
    const r = qaGate({ functionalQA: false, deadControlQA: true, mobileQA: true, buildPasses: true, securityReview: true, testsPass: true, privacyHumanReview: false });
    assert.equal(r.outcome, GATE_OUTCOMES.BLOCKED);
  });

  it('productionGate — PENDING when required checks missing', () => {
    const r = productionGate({});
    assert.equal(r.outcome, GATE_OUTCOMES.PENDING);
  });

  it('securityGate — BLOCKED when secrets in code', () => {
    const r = securityGate({ noSecretsInCode: false, leastPrivilegeApplied: true, demoDataClean: true, credentialPlanValid: true });
    assert.equal(r.outcome, GATE_OUTCOMES.BLOCKED);
  });

  it('deliveryGate — PASS with complete context', () => {
    const r = deliveryGate({ qaPass: true, deliveryManifestReady: true, clientAccepts: true });
    assert.equal(r.outcome, GATE_OUTCOMES.PASS);
  });

  it('changeGate — HUMAN_REVIEW when scope change approval needed', () => {
    const r = changeGate({ crClassified: true, impactEstimated: true, scopeChangeApproval: true });
    assert.equal(r.outcome, GATE_OUTCOMES.HUMAN_REVIEW);
  });

  it('incidentGate — BLOCKED when containment not in place', () => {
    const r = incidentGate({ incidentSeverity: 'SEV1', incidentOwner: 'PM', containmentInPlace: false });
    assert.equal(r.outcome, GATE_OUTCOMES.BLOCKED);
  });
});

// ───────────────────────────────
// SUITE 17 — BPMN Engine
// ───────────────────────────────
describe('Suite 17 — BPMN Engine', () => {
  it('createBPMNProcess — valid minimal process', () => {
    const r = createBPMNProcess({
      id: 'TEST_PROC',
      name: 'Test',
      pools: [{ id: 'pool1', name: 'Pool', lanes: [], elements: [startEvent('start_x'), endEvent('end_x')] }],
    });
    assert.equal(r.valid, true);
    assert.ok(r.process);
  });

  it('createBPMNProcess — invalid without pools', () => {
    const r = createBPMNProcess({ id: 'X', name: 'X', pools: [] });
    assert.equal(r.valid, false);
  });

  it('validateBPMNProcess — detects duplicate element ids', () => {
    const r = createBPMNProcess({
      id: 'DUP_PROC',
      name: 'Dup',
      pools: [{
        id: 'pool1', name: 'Pool', lanes: [],
        elements: [task('dup_id', 'Task 1'), task('dup_id', 'Task 2'), startEvent('start_x'), endEvent('end_x')],
      }],
    });
    const v = validateBPMNProcess(r.process);
    assert.equal(v.valid, false);
    assert.ok(v.errors.some(e => e.includes('duplicate')));
  });

  it('validateBPMNProcess — detects orphan flow target', () => {
    const r = createBPMNProcess({
      id: 'ORPHAN_PROC',
      name: 'Orphan',
      pools: [{ id: 'pool1', name: 'Pool', lanes: [], elements: [startEvent('start_x'), endEvent('end_x')] }],
      sequenceFlows: [flow('start_x', 'nonexistent_end')],
    });
    const v = validateBPMNProcess(r.process);
    assert.ok(v.errors.some(e => e.includes('nonexistent_end')));
  });

  it('BPMN_ELEMENT_TYPES has all expected types', () => {
    assert.ok(BPMN_ELEMENT_TYPES.PROCESS);
    assert.ok(BPMN_ELEMENT_TYPES.EXCLUSIVE_GATEWAY);
    assert.ok(BPMN_ELEMENT_TYPES.PARALLEL_GATEWAY);
    assert.ok(BPMN_ELEMENT_TYPES.START_EVENT);
    assert.ok(BPMN_ELEMENT_TYPES.END_EVENT);
  });

  it('xorGateway has EXCLUSIVE_GATEWAY type', () => {
    const gw = xorGateway('gw1', 'Decision', ['yes', 'no']);
    assert.equal(gw.type, BPMN_ELEMENT_TYPES.EXCLUSIVE_GATEWAY);
  });
});

// ───────────────────────────────
// SUITE 18 — BPMN Agency Model
// ───────────────────────────────
describe('Suite 18 — BPMN Agency Model', () => {
  it('bpmnAgencyProcess is valid', () => {
    const v = validateBPMNProcess(bpmnAgencyProcess);
    assert.equal(v.valid, true, `Agency BPMN errors: ${v.errors.join(', ')}`);
  });

  it('bpmnAgencyProcess has sopRef', () => {
    assert.equal(bpmnAgencyProcess.sopRef, 'AGENCY_SOP_FULL_PIPELINE');
  });

  it('bpmnAgencyProcess has elements > 20', () => {
    const count = bpmnAgencyProcess.pools.reduce((sum, p) => sum + p.elements.length, 0);
    assert.ok(count >= 20, `expected >= 20 elements, got ${count}`);
  });

  it('bpmnAgencyProcess has sequence flows', () => {
    assert.ok(bpmnAgencyProcess.sequenceFlows.length >= 30);
  });

  it('bpmnAgencyProcess has multiple lanes', () => {
    const lanes = bpmnAgencyProcess.pools[0].lanes;
    assert.ok(lanes.length >= 6);
  });
});

// ───────────────────────────────
// SUITE 19 — BPMN Client Model
// ───────────────────────────────
describe('Suite 19 — BPMN Client Model', () => {
  it('bpmnClientProcess is valid', () => {
    const v = validateBPMNProcess(bpmnClientProcess);
    assert.equal(v.valid, true, `Client BPMN errors: ${v.errors.join(', ')}`);
  });

  it('bpmnClientProcess has 2 pools', () => {
    assert.equal(bpmnClientProcess.pools.length, 2);
  });

  it('bpmnClientProcess has client and agency pools', () => {
    const ids = bpmnClientProcess.pools.map(p => p.id);
    assert.ok(ids.some(id => id.includes('client')));
    assert.ok(ids.some(id => id.includes('agency')));
  });
});

// ───────────────────────────────
// SUITE 20 — BPMN Factory, Automation, Incident
// ───────────────────────────────
describe('Suite 20 — BPMN Factory, Automation, Incident', () => {
  it('bpmnFactoryProcess is valid', () => {
    const v = validateBPMNProcess(bpmnFactoryProcess);
    assert.equal(v.valid, true, `Factory BPMN errors: ${v.errors.join(', ')}`);
  });

  it('bpmnFactoryProcess has parallel gateway', () => {
    const hasParallel = bpmnFactoryProcess.pools.some(p =>
      p.elements.some(e => e.type === BPMN_ELEMENT_TYPES.PARALLEL_GATEWAY)
    );
    assert.ok(hasParallel);
  });

  it('bpmnAutomationProcess is valid', () => {
    const v = validateBPMNProcess(bpmnAutomationProcess);
    assert.equal(v.valid, true, `Automation BPMN errors: ${v.errors.join(', ')}`);
  });

  it('bpmnIncidentProcess is valid', () => {
    const v = validateBPMNProcess(bpmnIncidentProcess);
    assert.equal(v.valid, true, `Incident BPMN errors: ${v.errors.join(', ')}`);
  });

  it('bpmnIncidentProcess has severity gateway', () => {
    const hasGw = bpmnIncidentProcess.pools.some(p =>
      p.elements.some(e => e.type === BPMN_ELEMENT_TYPES.EXCLUSIVE_GATEWAY && e.id.includes('severity'))
    );
    assert.ok(hasGw);
  });
});

// ───────────────────────────────
// SUITE 21 — BPMN Export
// ───────────────────────────────
describe('Suite 21 — BPMN Export', () => {
  it('exportToJSON — valid JSON string', () => {
    const r = exportToJSON(bpmnAgencyProcess);
    assert.equal(r.valid, true);
    assert.equal(r.format, 'JSON');
    const parsed = JSON.parse(r.json);
    assert.equal(parsed.id, 'BPMN_AGENCY_MAIN');
  });

  it('exportToJSON — invalid process returns error', () => {
    const r = exportToJSON({});
    assert.equal(r.valid, false);
  });

  it('exportToMermaid — valid Mermaid string', () => {
    const r = exportToMermaid(bpmnAgencyProcess);
    assert.equal(r.valid, true);
    assert.equal(r.format, 'Mermaid');
    assert.ok(r.mermaid.startsWith('flowchart TD'));
    assert.ok(r.mermaid.includes('-->'));
  });

  it('exportToMermaid — factory process includes parallel gateways as diamonds', () => {
    const r = exportToMermaid(bpmnFactoryProcess);
    assert.ok(r.mermaid.includes('{'));
  });

  it('exportToXML — valid XML string', () => {
    const r = exportToXML(bpmnAgencyProcess);
    assert.equal(r.valid, true);
    assert.equal(r.format, 'XML');
    assert.ok(r.xml.includes('<?xml'));
    assert.ok(r.xml.includes('<process'));
    assert.ok(r.xml.includes('</definitions>'));
    assert.ok(r.disclaimer.includes('Simplified'));
  });

  it('exportToXML — client process generates sequenceFlow elements', () => {
    const r = exportToXML(bpmnClientProcess);
    assert.ok(r.xml.includes('<sequenceFlow'));
  });
});

// ───────────────────────────────
// SUITE 22 — SOP ↔ BPMN Mapping
// ───────────────────────────────
describe('Suite 22 — SOP ↔ BPMN Mapping', () => {
  it('mapSOPToBPMN — returns mapping for lead intake', () => {
    const r = mapSOPToBPMN(sopLeadIntake);
    assert.ok(r.sopId);
    assert.equal(r.sopId, CLIENT_SOPS.LEAD_INTAKE);
    assert.ok(r.bpmnRef);
  });

  it('auditAllMappings — runs without error', () => {
    const r = auditAllMappings();
    assert.ok(typeof r.total === 'number');
    assert.ok(r.total === 12);
    assert.ok(Array.isArray(r.bpmnModels));
    assert.ok(r.bpmnModels.length >= 5);
  });

  it('auditAllMappings — all have sopId and sopTitle', () => {
    const { results } = auditAllMappings();
    for (const res of results) {
      assert.ok(res.sopId, 'missing sopId');
      assert.ok(res.sopTitle, 'missing sopTitle');
    }
  });
});

// ───────────────────────────────
// SUITE 23 — Process Health Check
// ───────────────────────────────
describe('Suite 23 — Process Health Check', () => {
  it('auditProcess — full SOP scores >= 60', () => {
    const r = auditProcess(sopLeadIntake);
    assert.ok(r.healthScore >= 60, `expected >= 60, got ${r.healthScore}`);
  });

  it('auditProcess — empty SOP scores low and is CRITICAL', () => {
    const r = auditProcess({});
    assert.ok(r.healthScore <= 10, `expected <= 10, got ${r.healthScore}`);
    assert.equal(r.status, 'CRITICAL');
  });

  it('auditProcessList — returns aggregate', () => {
    const r = auditProcessList(ALL_CLIENT_SOPS);
    assert.equal(r.total, 12);
    assert.ok(r.avgScore > 0);
    assert.ok(Array.isArray(r.topIssues));
  });

  it('auditBPMNProcess — agency process is healthy', () => {
    const r = auditBPMNProcess(bpmnAgencyProcess);
    assert.equal(r.status, 'HEALTHY', `Agency BPMN health issues: ${r.issues.join(', ')}`);
    assert.ok(r.elementCount > 20);
  });

  it('auditBPMNProcess — empty process is CRITICAL', () => {
    const r = auditBPMNProcess({});
    assert.equal(r.status, 'CRITICAL');
  });
});

// ───────────────────────────────
// SUITE 24 — Nexo Client Test (Fase 27)
// ───────────────────────────────
describe('Suite 24 — Nexo Client E2E through SOPs', () => {
  const nexo = {
    businessName:    'Clínica Veterinaria Nexo',
    businessType:    'clinica veterinaria',
    contactRole:     'OWNER',
    sector:          'veterinaria',
    location:        'Granada',
    mainProblems:    'gestión de citas manual, recordatorios por teléfono',
    businessGoals:   'automatizar citas, mejorar experiencia cliente',
    budgetRange:     '2500_to_5000',
    desiredTimeline: '2_to_4_months',
    decisionMaker:   'OWNER',
    currentTools:    'papel y excel',
    teamSize:        '4',
  };

  it('Nexo qualification SOP validates correctly', () => {
    const v = validateSOP(sopQualification);
    assert.equal(v.valid, true);
    assert.ok(sopQualification.requiredInputs.includes('budgetRange'));
    assert.ok(sopQualification.requiredInputs.includes('decisionMaker'));
  });

  it('Nexo commercial proposal gate — PRO package passes', () => {
    const r = validateCommercialGate({
      packageTier: 'PRO',
      setupPrice: 2400,
      monthlyPrice: 149,
      sector: nexo.sector,
    });
    assert.equal(r.valid, true);
  });

  it('Nexo QA gate — all P0 pass', () => {
    const results = {};
    for (const check of P0_CHECKS) results[check] = true;
    const gate = runQAGate(results);
    assert.equal(gate.outcome, QA_OUTCOMES.PASS);
  });

  it('Nexo production readiness — READY', () => {
    const r = validateProductionReadiness({
      qa_pass: true,
      security_pass: true,
      build_pass: true,
      delivery_manifest_exists: true,
      no_critical_open_crs: true,
      env_variables_configured: true,
      rollback_plan_exists: true,
    });
    assert.equal(r.ready, true);
  });

  it('Nexo AI agent (chatbot) — LOW risk validated', () => {
    const { profile } = defineAgentProfile({
      agentId: 'chatbot_nexo_v1',
      purpose: 'Answer FAQ and help book appointments',
      riskTier: AI_RISK_TIERS.LOW,
      allowedTools: ['search_faqs', 'check_availability'],
    });
    const v = validateAgentProfile(profile);
    assert.equal(v.valid, true);
    assert.equal(v.outcome, 'APPROVED');
  });

  it('Nexo BPMN — agency process can be exported to Mermaid', () => {
    const r = exportToMermaid(bpmnAgencyProcess);
    assert.equal(r.valid, true);
    assert.ok(r.mermaid.length > 100);
  });

  it('Nexo incident (SEV3) — correct classification', () => {
    const sev = classifySeverity('minor issue, workaround available');
    assert.equal(sev, INCIDENT_SEVERITY.SEV3);
    const r = createIncident({
      title: 'Booking notifications delayed',
      severity: sev,
      reportedBy: 'CLIENT_OWNER',
    });
    assert.equal(r.valid, true);
    assert.equal(r.incident.severity, INCIDENT_SEVERITY.SEV3);
  });
});

// ───────────────────────────────
// SUITE 25 — Failure Scenarios (Fase 28)
// ───────────────────────────────
describe('Suite 25 — Failure Scenarios', () => {
  it('lead_not_qualified — commercialGate blocks', () => {
    const r = commercialGate({ budgetQualified: false, decisionMakerConfirmed: true, proposalGenerated: true });
    assert.equal(r.outcome, GATE_OUTCOMES.BLOCKED);
  });

  it('missing_requirements — scopeGate blocked', () => {
    const r = scopeGate({ scopeDocumentReady: false, hasP0Requirements: true, requirementsApproved: true });
    assert.equal(r.outcome, GATE_OUTCOMES.BLOCKED);
  });

  it('proposal_rejected — proposal_outcome leads to close', () => {
    const sopResult = runSOP(sopProposalReview, { proposal_outcome: 'rejected' });
    assert.equal(sopResult.sopId, CLIENT_SOPS.PROPOSAL_REVIEW);
  });

  it('scope_change — changeGate requires approval', () => {
    const r = changeGate({ crClassified: true, scopeChangeApproval: true });
    assert.equal(r.outcome, GATE_OUTCOMES.HUMAN_REVIEW);
  });

  it('production_blocked — productionGate blocked when qa fails', () => {
    const r = productionGate({ qaPass: false, securityPass: true, buildPass: true, envConfigured: true });
    assert.equal(r.outcome, GATE_OUTCOMES.BLOCKED);
  });

  it('qa_failed — QA gate blocks P0 failure', () => {
    const r = qaGate({ functionalQA: false, deadControlQA: true, mobileQA: true, buildPasses: true, securityReview: true, testsPass: true, privacyHumanReview: false });
    assert.equal(r.outcome, GATE_OUTCOMES.BLOCKED);
  });

  it('security_failed — securityGate blocks secrets in code', () => {
    const r = securityGate({ noSecretsInCode: false, leastPrivilegeApplied: true, demoDataClean: true, credentialPlanValid: true });
    assert.equal(r.outcome, GATE_OUTCOMES.BLOCKED);
  });

  it('incident_sev1 — response target 15 minutes', () => {
    const r = createIncident({ title: 'Down', severity: INCIDENT_SEVERITY.SEV1, reportedBy: 'CLIENT' });
    assert.equal(r.incident.responseTarget, '15 minutes');
  });

  it('incident_sev3 — response target 4 hours', () => {
    const r = createIncident({ title: 'Minor', severity: INCIDENT_SEVERITY.SEV3, reportedBy: 'SUPPORT' });
    assert.equal(r.incident.responseTarget, '4 hours');
  });

  it('missing_owner — auditProcess flags it', () => {
    const r = auditProcess({ id: 'X', title: 'X', steps: ['s'] });
    assert.ok(r.issues.includes('missing_owner'));
  });

  it('dead_process_step — empty steps flagged', () => {
    const r = auditProcess({ id: 'X', title: 'X', owner: 'QA', steps: [] });
    assert.ok(r.issues.includes('dead_step'));
  });
});

// ───────────────────────────────
// SUITE 26 — Cross-Client Contamination + Registry
// ───────────────────────────────
describe('Suite 26 — Cross-Client Contamination + Registry', () => {
  it('no CP04-specific refs in SOP ids', () => {
    for (const sop of ALL_CLIENT_SOPS) {
      assert.ok(!sop.id.toLowerCase().includes('cp04'), `cp04 found in SOP id: ${sop.id}`);
    }
  });

  it('no Aurora refs in client SOPs', () => {
    for (const sop of ALL_CLIENT_SOPS) {
      assert.ok(!JSON.stringify(sop).toLowerCase().includes('aurora'), `aurora found in SOP: ${sop.id}`);
    }
  });

  it('no FisioNova refs in BPMN models', () => {
    const bpmnStr = JSON.stringify([bpmnAgencyProcess, bpmnClientProcess, bpmnFactoryProcess]);
    assert.ok(!bpmnStr.toLowerCase().includes('fisionova'));
  });

  it('PASO_E_STATUS is 100_PERCENT', () => {
    assert.equal(PASO_E_STATUS, '100_PERCENT');
  });

  it('Registry exports PASO_E_STATUS', async () => {
    const registry = await import('../../factory-registry/index.js');
    assert.equal(registry.PASO_E_STATUS_MAIN, '100_PERCENT');
    assert.equal(registry.REGISTRY_VERSION, '2.5.0');
  });
});

// Re-import for proposal review test (needed by failure scenario)
import { sopProposalReview } from '../../sop/clientSOP.js';
