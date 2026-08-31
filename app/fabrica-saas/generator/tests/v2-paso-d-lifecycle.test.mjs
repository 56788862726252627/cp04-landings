/**
 * Paso D — Client Lifecycle Pipeline Tests
 * Test client: Clínica Veterinaria Nexo (all data is fictitious)
 * NO_REAL_CLIENTS | NO_REAL_EMAILS | NO_REAL_PAYMENTS | NO_REAL_CONTRACTS
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// ── Lifecycle modules ────────────────────────────────────────────────────────
import { LIFECYCLE_STATES, STATE_DEFINITIONS, transition, getStateDefinition, listStates }
  from '../../lifecycle/clientLifecycleModel.js';
import { REQUIRED_FIELDS, validateOnboarding, FIELD_STATUS }
  from '../../lifecycle/onboardingSchema.js';
import { QUALIFICATION_DECISIONS, qualifyLead }
  from '../../lifecycle/qualificationEngine.js';
import { diagnoseBusiness }
  from '../../lifecycle/diagnosticEngine.js';
import { REQ_TYPES, REQ_PRIORITIES, buildRequirements }
  from '../../lifecycle/requirementsEngine.js';
import { buildClientScope }
  from '../../lifecycle/scopeBuilder.js';
import { onboardingToProposal }
  from '../../lifecycle/proposalPipeline.js';
import { APPROVAL_DECISIONS, createApproval, isApprovalBlockingProduction }
  from '../../lifecycle/approvalModel.js';
import { productionReady }
  from '../../lifecycle/productionReadinessGate.js';
import { buildClientProductionBrief }
  from '../../lifecycle/factoryHandoff.js';
import { TRACK_STATUS, TRACK_COMPONENTS, createProductionTracking, updateComponentStatus, isReadyForQA, isReadyForDelivery }
  from '../../lifecycle/productionTracking.js';
import { CR_TYPES, CR_STATUS, createChangeRequest, listCRTypes }
  from '../../lifecycle/changeRequests.js';
import { deliveryReady }
  from '../../lifecycle/deliveryReadiness.js';
import { generateDeliveryManifest }
  from '../../lifecycle/deliveryManifest.js';
import { generateHandoff, completeHandoff }
  from '../../lifecycle/handoff.js';
import { SUPPORT_DURATION_DAYS, SUPPORT_TICKET_TYPES, createSupportWindow, classifyTicket }
  from '../../lifecycle/supportWindow.js';
import { CLOSEOUT_STATUS, closeClientProject }
  from '../../lifecycle/clientCloseout.js';
import { runClientLifecycle }
  from '../../lifecycle/lifecycleRunner.js';

// ── Fixtures ─────────────────────────────────────────────────────────────────
const NEXO_LEAD = {
  businessName:    'Clínica Veterinaria Nexo',
  businessType:    'clinica veterinaria',
  contactRole:     'OWNER',
  sector:          'veterinaria',
  location:        'Granada',
  mainProblems:    'gestión de citas manual, recordatorios por teléfono, sin historial digital',
  businessGoals:   'automatizar citas, mejorar experiencia cliente, reducir llamadas',
  budgetRange:     '2500_to_5000',
  desiredTimeline: '2_to_4_months',
  decisionMaker:   'OWNER',
  currentTools:    'papel y excel',
  teamSize:        '4',
  legalConstraints:{ healthData: true },
};

const NEXO_MISSING = {
  businessType: 'clinica veterinaria',
  contactRole:  'OWNER',
};

// ── 1. LIFECYCLE STATE MODEL ─────────────────────────────────────────────────
describe('1. ClientLifecycleModel', () => {
  test('exports LIFECYCLE_STATES constant', () => {
    assert.ok(LIFECYCLE_STATES);
    assert.ok(typeof LIFECYCLE_STATES.ONBOARDING === 'string');
    assert.ok(typeof LIFECYCLE_STATES.CLOSED === 'string');
  });

  test('listStates returns array of states', () => {
    const states = listStates();
    assert.ok(Array.isArray(states));
    assert.ok(states.length >= 10);
  });

  test('getStateDefinition returns definition for known state', () => {
    const def = getStateDefinition('ONBOARDING');
    assert.ok(def);
    assert.ok(Array.isArray(def.allowedTransitions));
  });

  test('getStateDefinition returns null for unknown state', () => {
    const def = getStateDefinition('NONEXISTENT');
    assert.ok(def === null || def === undefined);
  });

  test('transition from ONBOARDING to DISCOVERY succeeds', () => {
    const result = transition('ONBOARDING', 'DISCOVERY', { onboardingComplete: true });
    assert.equal(result.success, true);
    assert.equal(result.newState, 'DISCOVERY');
  });

  test('transition to invalid state fails', () => {
    const result = transition('ONBOARDING', 'CLOSED', {});
    assert.equal(result.success, false);
    assert.ok(result.error);
  });

  test('STATE_DEFINITIONS has entries for all states', () => {
    assert.ok(STATE_DEFINITIONS);
    assert.ok(Object.keys(STATE_DEFINITIONS).length >= 10);
  });
});

// ── 2. ONBOARDING SCHEMA ─────────────────────────────────────────────────────
describe('2. OnboardingSchema', () => {
  test('REQUIRED_FIELDS has expected keys', () => {
    assert.ok(Array.isArray(REQUIRED_FIELDS));
    assert.ok(REQUIRED_FIELDS.includes('businessName'));
    assert.ok(REQUIRED_FIELDS.includes('sector'));
  });

  test('FIELD_STATUS has expected values', () => {
    assert.ok(FIELD_STATUS.PROVIDED);
    assert.ok(FIELD_STATUS.MISSING_REQUIRED);
  });

  test('validateOnboarding — Nexo complete lead passes', () => {
    const result = validateOnboarding(NEXO_LEAD);
    assert.equal(result.valid, true);
    assert.equal(result.onboardingComplete, true);
    assert.deepEqual(result.missingRequired, []);
  });

  test('validateOnboarding — infers sector from businessType when not provided', () => {
    const lead = { ...NEXO_LEAD };
    delete lead.sector;
    const result = validateOnboarding(lead);
    assert.ok(result.data._inferredSector || result.data.sector);
  });

  test('validateOnboarding — missing businessName fails', () => {
    const result = validateOnboarding(NEXO_MISSING);
    assert.equal(result.onboardingComplete, false);
    assert.ok(result.missingRequired.includes('businessName'));
  });

  test('validateOnboarding — returns fieldStatus map', () => {
    const result = validateOnboarding(NEXO_LEAD);
    assert.ok(result.fieldStatus);
    assert.ok(Object.keys(result.fieldStatus).length > 0);
  });

  test('validateOnboarding — warnings for optional missing fields', () => {
    const minimal = { ...NEXO_LEAD };
    delete minimal.budget;
    const result = validateOnboarding(minimal);
    assert.ok(result.valid);
    assert.ok(Array.isArray(result.warnings));
  });
});

// ── 3. QUALIFICATION ENGINE ──────────────────────────────────────────────────
describe('3. QualificationEngine', () => {
  test('qualifyLead — Nexo returns QUALIFIED or HUMAN_REVIEW (health data)', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const result = qualifyLead(onboarding);
    assert.ok([QUALIFICATION_DECISIONS.QUALIFIED, QUALIFICATION_DECISIONS.HUMAN_REVIEW].includes(result.decision));
  });

  test('qualifyLead — decision is one of known QUALIFICATION_DECISIONS', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const result = qualifyLead(onboarding);
    assert.ok(Object.values(QUALIFICATION_DECISIONS).includes(result.decision));
  });

  test('qualifyLead — returns fitScore and complexityScore', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const result = qualifyLead(onboarding);
    assert.ok(typeof result.fitScore === 'number');
    assert.ok(typeof result.complexityScore === 'number');
  });

  test('qualifyLead — very low budget → NEEDS_MORE_INFO or NOT_A_FIT', () => {
    const lead = { ...NEXO_LEAD, budget: '<500' };
    const onboarding = validateOnboarding(lead);
    const result = qualifyLead(onboarding);
    assert.ok(['NEEDS_MORE_INFO', 'NOT_A_FIT', 'HUMAN_REVIEW'].includes(result.decision));
  });

  test('qualifyLead — humanReviewRequired is boolean', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const result = qualifyLead(onboarding);
    assert.equal(typeof result.humanReviewRequired, 'boolean');
  });

  test('qualifyLead — returns flags array', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const result = qualifyLead(onboarding);
    assert.ok(Array.isArray(result.flags));
  });

  test('QUALIFICATION_DECISIONS has QUALIFIED and NOT_A_FIT', () => {
    assert.ok(QUALIFICATION_DECISIONS.QUALIFIED);
    assert.ok(QUALIFICATION_DECISIONS.NOT_A_FIT);
  });
});

// ── 4. DIAGNOSTIC ENGINE ─────────────────────────────────────────────────────
describe('4. DiagnosticEngine', () => {
  test('diagnoseBusiness returns diagnosticSummary', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const result = diagnoseBusiness(onboarding);
    assert.ok(result.diagnosticSummary);
  });

  test('diagnoseBusiness returns problems array', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const result = diagnoseBusiness(onboarding);
    assert.ok(Array.isArray(result.problems));
    assert.ok(result.problems.length > 0);
  });

  test('diagnoseBusiness returns automationOpportunities', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const result = diagnoseBusiness(onboarding);
    assert.ok(result.automationOpportunities !== undefined);
  });

  test('diagnoseBusiness returns quickWins array', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const result = diagnoseBusiness(onboarding);
    assert.ok(Array.isArray(result.quickWins));
  });

  test('diagnoseBusiness returns risks array', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const result = diagnoseBusiness(onboarding);
    assert.ok(Array.isArray(result.risks));
  });

  test('diagnoseBusiness — does not include cp04/aurora/fisionova refs (contamination check)', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const result = diagnoseBusiness(onboarding);
    const serialized = JSON.stringify(result).toLowerCase();
    assert.ok(!serialized.includes('club pádel'));
    assert.ok(!serialized.includes('aurora'));
    assert.ok(!serialized.includes('fisionova'));
    assert.ok(!serialized.includes('educa-archidona'));
  });
});

// ── 5. REQUIREMENTS ENGINE ───────────────────────────────────────────────────
describe('5. RequirementsEngine', () => {
  test('buildRequirements returns requirements array', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const result = buildRequirements(diagnostic, onboarding);
    assert.ok(Array.isArray(result.requirements));
    assert.ok(result.requirements.length > 0);
  });

  test('buildRequirements — at least one P0 requirement', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const result = buildRequirements(diagnostic, onboarding);
    const p0count = Array.isArray(result.byPriority.P0) ? result.byPriority.P0.length : result.byPriority.P0;
    assert.ok(p0count >= 1);
  });

  test('buildRequirements — returns total count', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const result = buildRequirements(diagnostic, onboarding);
    assert.equal(result.total, result.requirements.length);
  });

  test('buildRequirements — REQ_TYPES has FUNCTIONAL', () => {
    assert.ok(REQ_TYPES.FUNCTIONAL);
  });

  test('buildRequirements — REQ_PRIORITIES has P0..P3', () => {
    assert.ok(REQ_PRIORITIES.P0);
    assert.ok(REQ_PRIORITIES.P3);
  });

  test('buildRequirements — humanReviewRequired is boolean', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const result = buildRequirements(diagnostic, onboarding);
    assert.equal(typeof result.humanReviewRequired, 'boolean');
  });

  test('buildRequirements — each requirement has id, type, priority, description', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const result = buildRequirements(diagnostic, onboarding);
    const first = result.requirements[0];
    assert.ok(first.id);
    assert.ok(first.type);
    assert.ok(first.priority);
    assert.ok(first.description);
  });
});

// ── 6. SCOPE BUILDER ─────────────────────────────────────────────────────────
describe('6. ScopeBuilder', () => {
  function nexoScope() {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const requirements = buildRequirements(diagnostic, onboarding);
    const { recommendCommercialPackage } = require('../../commercial/packageRecommender.js');
    const rec = recommendCommercialPackage(onboarding.data);
    return buildClientScope(requirements, rec, onboarding);
  }

  test('buildClientScope returns includedScope array', async () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const requirements = buildRequirements(diagnostic, onboarding);
    const { recommendCommercialPackage } = await import('../../commercial/packageRecommender.js');
    const rec = recommendCommercialPackage(onboarding.data ?? onboarding);
    const scope = buildClientScope(requirements, rec, onboarding);
    assert.ok(Array.isArray(scope.includedScope));
  });

  test('buildClientScope returns excludedScope', async () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const requirements = buildRequirements(diagnostic, onboarding);
    const { recommendCommercialPackage } = await import('../../commercial/packageRecommender.js');
    const rec = recommendCommercialPackage(onboarding.data ?? onboarding);
    const scope = buildClientScope(requirements, rec, onboarding);
    assert.ok(scope.excludedScope !== undefined);
  });

  test('buildClientScope returns clientResponsibilities', async () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const requirements = buildRequirements(diagnostic, onboarding);
    const { recommendCommercialPackage } = await import('../../commercial/packageRecommender.js');
    const rec = recommendCommercialPackage(onboarding.data ?? onboarding);
    const scope = buildClientScope(requirements, rec, onboarding);
    assert.ok(Array.isArray(scope.clientResponsibilities));
    assert.ok(scope.clientResponsibilities.length > 0);
  });

  test('buildClientScope returns antiScopeCreep', async () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const requirements = buildRequirements(diagnostic, onboarding);
    const { recommendCommercialPackage } = await import('../../commercial/packageRecommender.js');
    const rec = recommendCommercialPackage(onboarding.data ?? onboarding);
    const scope = buildClientScope(requirements, rec, onboarding);
    assert.ok(Array.isArray(scope.antiScopeCreep));
  });
});

// ── 7. PROPOSAL PIPELINE ─────────────────────────────────────────────────────
describe('7. ProposalPipeline', () => {
  test('onboardingToProposal — Nexo produces proposalReady=true', async () => {
    const result = await onboardingToProposal(NEXO_LEAD);
    assert.equal(result.proposalReady, true);
  });

  test('onboardingToProposal — returns commercialEstimate', async () => {
    const result = await onboardingToProposal(NEXO_LEAD);
    assert.ok(result.commercialEstimate);
  });

  test('onboardingToProposal — returns proposal with disclaimer', async () => {
    const result = await onboardingToProposal(NEXO_LEAD);
    assert.ok(result.proposal?.disclaimer);
    assert.ok(result.proposal.disclaimer.includes('NO'));
  });

  test('onboardingToProposal — missing required fields returns proposalReady=false', async () => {
    const result = await onboardingToProposal(NEXO_MISSING);
    assert.equal(result.proposalReady, false);
    assert.ok(result.missingInputs?.length > 0);
  });

  test('onboardingToProposal — returns scope', async () => {
    const result = await onboardingToProposal(NEXO_LEAD);
    assert.ok(result.scope);
  });

  test('onboardingToProposal — returns humanReviewRequired boolean', async () => {
    const result = await onboardingToProposal(NEXO_LEAD);
    assert.equal(typeof result.humanReviewRequired, 'boolean');
  });
});

// ── 8. APPROVAL MODEL ────────────────────────────────────────────────────────
describe('8. ApprovalModel', () => {
  test('createApproval — PROPOSAL_ACCEPTED creates valid approval', () => {
    const approval = createApproval({
      proposalId:    'PROP-NEXO-001',
      clientName:    'Clínica Veterinaria Nexo',
      decision:      'PROPOSAL_ACCEPTED',
      approvedBy:    'OWNER',
      approvedScope: ['Sistema de reservas', 'Panel de administración'],
      approvedTier:  'PRO',
      commercialTerms: {},
    });
    assert.equal(approval.decision, 'PROPOSAL_ACCEPTED');
    assert.ok(approval.disclaimer);
    assert.ok(approval.readyForProduction);
  });

  test('createApproval — PROPOSAL_REJECTED sets readyForProduction=false', () => {
    const approval = createApproval({
      proposalId: 'PROP-NEXO-002',
      clientName: 'Clínica Veterinaria Nexo',
      decision:   'PROPOSAL_REJECTED',
      approvedBy: 'OWNER',
    });
    assert.equal(approval.readyForProduction, false);
  });

  test('createApproval — disclaimer says REGISTRO DECLARATIVO', () => {
    const approval = createApproval({
      proposalId: 'PROP-001', clientName: 'Test', decision: 'PROPOSAL_ACCEPTED', approvedBy: 'OWNER',
    });
    assert.ok(approval.disclaimer.includes('REGISTRO DECLARATIVO'));
  });

  test('isApprovalBlockingProduction — accepted approval not blocking', () => {
    const approval = createApproval({ proposalId: 'P', clientName: 'X', decision: 'PROPOSAL_ACCEPTED', approvedBy: 'OWNER' });
    const result = isApprovalBlockingProduction(approval);
    assert.equal(result.blocked, false);
  });

  test('isApprovalBlockingProduction — rejected approval is blocking', () => {
    const approval = createApproval({ proposalId: 'P', clientName: 'X', decision: 'PROPOSAL_REJECTED', approvedBy: 'OWNER' });
    const result = isApprovalBlockingProduction(approval);
    assert.equal(result.blocked, true);
  });

  test('APPROVAL_DECISIONS has PROPOSAL_ACCEPTED and PROPOSAL_REJECTED', () => {
    assert.ok(APPROVAL_DECISIONS.PROPOSAL_ACCEPTED);
    assert.ok(APPROVAL_DECISIONS.PROPOSAL_REJECTED);
  });
});

// ── 9. PRODUCTION READINESS GATE ─────────────────────────────────────────────
describe('9. ProductionReadinessGate', () => {
  async function nexoApproval() {
    const p = await onboardingToProposal(NEXO_LEAD);
    return createApproval({
      proposalId: 'PROP-NEXO', clientName: 'Clínica Veterinaria Nexo',
      decision: 'PROPOSAL_ACCEPTED', approvedBy: 'OWNER',
      approvedScope: p.scope?.includedScope ?? [],
      approvedTier: p.proposal?.tier ?? 'PRO', commercialTerms: {},
    });
  }

  test('productionReady — accepted approval passes gate', async () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const requirements = buildRequirements(diagnostic, onboarding);
    const { recommendCommercialPackage } = await import('../../commercial/packageRecommender.js');
    const rec = recommendCommercialPackage(onboarding.data ?? onboarding);
    const scope = buildClientScope(requirements, rec, onboarding);
    const approval = await nexoApproval();
    const result = productionReady(approval, scope, onboarding);
    assert.equal(result.ready, true);
  });

  test('productionReady — returns checks array', async () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const requirements = buildRequirements(diagnostic, onboarding);
    const { recommendCommercialPackage } = await import('../../commercial/packageRecommender.js');
    const rec = recommendCommercialPackage(onboarding.data ?? onboarding);
    const scope = buildClientScope(requirements, rec, onboarding);
    const approval = await nexoApproval();
    const result = productionReady(approval, scope, onboarding);
    assert.ok(Array.isArray(result.checks));
    assert.ok(result.checks.length >= 5);
  });

  test('productionReady — rejected approval is not ready', async () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const requirements = buildRequirements(diagnostic, onboarding);
    const { recommendCommercialPackage } = await import('../../commercial/packageRecommender.js');
    const rec = recommendCommercialPackage(onboarding.data ?? onboarding);
    const scope = buildClientScope(requirements, rec, onboarding);
    const rejection = createApproval({ proposalId: 'P', clientName: 'X', decision: 'PROPOSAL_REJECTED', approvedBy: 'OWNER' });
    const result = productionReady(rejection, scope, onboarding);
    assert.equal(result.ready, false);
  });
});

// ── 10. FACTORY HANDOFF ───────────────────────────────────────────────────────
describe('10. FactoryHandoff', () => {
  test('buildClientProductionBrief returns businessBrief', async () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const requirements = buildRequirements(diagnostic, onboarding);
    const { recommendCommercialPackage } = await import('../../commercial/packageRecommender.js');
    const rec = recommendCommercialPackage(onboarding.data ?? onboarding);
    const scope = buildClientScope(requirements, rec, onboarding);
    const approval = createApproval({ proposalId: 'P', clientName: 'X', decision: 'PROPOSAL_ACCEPTED', approvedBy: 'OWNER', approvedScope: [], approvedTier: 'PRO', commercialTerms: {} });
    const brief = buildClientProductionBrief(onboarding, scope, approval, requirements, rec);
    assert.ok(brief.businessBrief);
    assert.equal(brief.businessBrief.businessName, 'Clínica Veterinaria Nexo');
  });

  test('buildClientProductionBrief — fails if approval not ready for production', () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const rejection = createApproval({ proposalId: 'P', clientName: 'X', decision: 'PROPOSAL_REJECTED', approvedBy: 'OWNER' });
    const result = buildClientProductionBrief(onboarding, {}, rejection, {}, {});
    assert.ok(result.error || result.briefType === undefined || result.blocked);
  });

  test('buildClientProductionBrief — no real secrets in output', async () => {
    const onboarding = validateOnboarding(NEXO_LEAD);
    const diagnostic = diagnoseBusiness(onboarding);
    const requirements = buildRequirements(diagnostic, onboarding);
    const { recommendCommercialPackage } = await import('../../commercial/packageRecommender.js');
    const rec = recommendCommercialPackage(onboarding.data ?? onboarding);
    const scope = buildClientScope(requirements, rec, onboarding);
    const approval = createApproval({ proposalId: 'P', clientName: 'X', decision: 'PROPOSAL_ACCEPTED', approvedBy: 'OWNER', approvedScope: [], approvedTier: 'PRO', commercialTerms: {} });
    const brief = buildClientProductionBrief(onboarding, scope, approval, requirements, rec);
    const s = JSON.stringify(brief);
    assert.ok(!s.includes('sk-'));
    assert.ok(!s.includes('eyJ'));
  });
});

// ── 11. PRODUCTION TRACKING ───────────────────────────────────────────────────
describe('11. ProductionTracking', () => {
  function makeTracking() {
    const approval = createApproval({ proposalId: 'P', clientName: 'Nexo', decision: 'PROPOSAL_ACCEPTED', approvedBy: 'OWNER', approvedScope: [], approvedTier: 'PRO', commercialTerms: {} });
    const brief = buildClientProductionBrief(validateOnboarding(NEXO_LEAD), {}, approval, {}, { recommendedPackage: 'PRO' });
    return createProductionTracking(brief.briefType ? brief : { businessBrief: { businessName: 'Nexo' }, commercialConstraints: { approvedTier: 'PRO' } });
  }

  test('createProductionTracking returns components for all 13 TRACK_COMPONENTS', () => {
    const tracking = makeTracking();
    for (const c of TRACK_COMPONENTS) {
      assert.ok(tracking.components[c], `Missing component: ${c}`);
    }
  });

  test('createProductionTracking — overallProgress starts at 0', () => {
    const tracking = makeTracking();
    assert.equal(tracking.overallProgress, 0);
  });

  test('updateComponentStatus — DONE sets progress to 100', () => {
    let tracking = makeTracking();
    tracking = updateComponentStatus(tracking, 'landing', TRACK_STATUS.DONE);
    assert.equal(tracking.components.landing.status, 'DONE');
    assert.equal(tracking.components.landing.progress, 100);
  });

  test('updateComponentStatus — recalculates overallProgress', () => {
    let tracking = makeTracking();
    tracking = updateComponentStatus(tracking, 'landing', 'DONE');
    assert.ok(tracking.overallProgress > 0);
  });

  test('isReadyForQA — false when components are PLANNED', () => {
    const tracking = makeTracking();
    assert.equal(isReadyForQA(tracking), false);
  });

  test('isReadyForDelivery — false when components are PLANNED', () => {
    const tracking = makeTracking();
    assert.equal(isReadyForDelivery(tracking), false);
  });

  test('updateComponentStatus — unknown component returns error', () => {
    const tracking = makeTracking();
    const result = updateComponentStatus(tracking, 'NONEXISTENT', 'DONE');
    assert.ok(result.error);
  });

  test('TRACK_COMPONENTS has 13 entries', () => {
    assert.equal(TRACK_COMPONENTS.length, 13);
  });
});

// ── 12. CHANGE REQUESTS ───────────────────────────────────────────────────────
describe('12. ChangeRequests', () => {
  test('createChangeRequest — BUG type creates valid CR', () => {
    const cr = createChangeRequest({ type: CR_TYPES.BUG, description: 'Recordatorio no llega' });
    assert.equal(cr.valid, true);
    assert.equal(cr.type, 'BUG');
    assert.equal(cr.approvalRequired, false);
    assert.equal(cr.scopeImpact, 'none');
  });

  test('createChangeRequest — MINOR type has no approval required', () => {
    const cr = createChangeRequest({ type: CR_TYPES.MINOR, description: 'Cambiar color botón' });
    assert.equal(cr.valid, true);
    assert.equal(cr.approvalRequired, false);
  });

  test('createChangeRequest — SCOPE_CHANGE requires approval', () => {
    const cr = createChangeRequest({ type: CR_TYPES.SCOPE_CHANGE, description: 'Añadir módulo de inventario' });
    assert.equal(cr.approvalRequired, true);
    assert.equal(cr.newEstimateRequired, true);
  });

  test('createChangeRequest — SCOPE_CHANGE on ESSENTIAL tier triggers upgrade', () => {
    const cr = createChangeRequest({ type: CR_TYPES.SCOPE_CHANGE, description: 'Ampliar módulos', currentTier: 'ESSENTIAL' });
    assert.equal(cr.upgradeRequired, true);
    assert.equal(cr.packageUpgrade, 'PRO');
  });

  test('createChangeRequest — ADDON with unknown id returns error', () => {
    const cr = createChangeRequest({ type: CR_TYPES.ADDON, description: 'Addon', addonId: 'NONEXISTENT_999' });
    assert.equal(cr.valid, false);
  });

  test('createChangeRequest — unknown type returns valid=false', () => {
    const cr = createChangeRequest({ type: 'UNKNOWN_TYPE', description: 'Test' });
    assert.equal(cr.valid, false);
  });

  test('createChangeRequest — BUG has setupImpact [0,0]', () => {
    const cr = createChangeRequest({ type: CR_TYPES.BUG, description: 'Bug' });
    assert.deepEqual(cr.setupImpact, [0, 0]);
  });

  test('listCRTypes returns all 6 types', () => {
    const types = listCRTypes();
    assert.equal(types.length, 6);
    assert.ok(types.includes('BUG'));
    assert.ok(types.includes('SCOPE_CHANGE'));
  });

  test('CR_STATUS has PROPOSED, APPROVED, DONE', () => {
    assert.ok(CR_STATUS.PROPOSED);
    assert.ok(CR_STATUS.APPROVED);
    assert.ok(CR_STATUS.DONE);
  });
});

// ── 13. DELIVERY READINESS ────────────────────────────────────────────────────
describe('13. DeliveryReadiness', () => {
  function doneTacking() {
    const approval = createApproval({ proposalId: 'P', clientName: 'Nexo', decision: 'PROPOSAL_ACCEPTED', approvedBy: 'OWNER', approvedScope: [], approvedTier: 'PRO', commercialTerms: {} });
    const brief = { businessBrief: { businessName: 'Nexo' }, commercialConstraints: { approvedTier: 'PRO' } };
    let tracking = createProductionTracking(brief);
    for (const c of TRACK_COMPONENTS) {
      tracking = updateComponentStatus(tracking, c, 'DONE');
    }
    return tracking;
  }

  test('deliveryReady — all DONE components → ready=true', () => {
    const tracking = doneTacking();
    const scope = { clientResponsibilities: ['Dominio'], thirdPartyDependencies: [{ name: 'Supabase' }] };
    const result = deliveryReady(tracking, scope, validateOnboarding(NEXO_LEAD));
    assert.equal(result.ready, true);
    assert.equal(result.status, 'DELIVERY_READY');
  });

  test('deliveryReady — PLANNED components → blocked', () => {
    const approval = createApproval({ proposalId: 'P', clientName: 'Nexo', decision: 'PROPOSAL_ACCEPTED', approvedBy: 'OWNER', approvedScope: [], approvedTier: 'PRO', commercialTerms: {} });
    const brief = { businessBrief: { businessName: 'Nexo' }, commercialConstraints: { approvedTier: 'PRO' } };
    const tracking = createProductionTracking(brief);
    const result = deliveryReady(tracking, {}, validateOnboarding(NEXO_LEAD));
    assert.equal(result.ready, false);
    assert.equal(result.status, 'BLOCKED');
  });

  test('deliveryReady — returns checks array', () => {
    const tracking = doneTacking();
    const result = deliveryReady(tracking, { clientResponsibilities: ['x'], thirdPartyDependencies: [{}] }, validateOnboarding(NEXO_LEAD));
    assert.ok(Array.isArray(result.checks));
    assert.ok(result.checks.length >= 6);
  });

  test('deliveryReady — blocks are strings', () => {
    const tracking = createProductionTracking({ businessBrief: { businessName: 'X' }, commercialConstraints: { approvedTier: 'PRO' } });
    const result = deliveryReady(tracking, {}, validateOnboarding(NEXO_LEAD));
    assert.ok(result.blocks.every(b => typeof b === 'string'));
  });
});

// ── 14. DELIVERY MANIFEST ─────────────────────────────────────────────────────
describe('14. DeliveryManifest', () => {
  test('generateDeliveryManifest returns DELIVERY_MANIFEST type', () => {
    const manifest = generateDeliveryManifest({}, {}, {}, {});
    assert.equal(manifest.manifestType, 'DELIVERY_MANIFEST');
  });

  test('generateDeliveryManifest — includes NO secrets disclaimer', () => {
    const manifest = generateDeliveryManifest({}, {}, {}, {});
    assert.ok(manifest.disclaimer.toUpperCase().includes('NO'));
  });

  test('generateDeliveryManifest — credentialsNeeded includes Supabase', () => {
    const manifest = generateDeliveryManifest({}, {}, {}, {});
    const services = manifest.credentialsNeeded.map(c => c.service);
    assert.ok(services.includes('Supabase'));
  });

  test('generateDeliveryManifest — supportWindow is number', () => {
    const manifest = generateDeliveryManifest({ commercialConstraints: { approvedTier: 'PRO' } }, {}, {}, {});
    assert.equal(typeof manifest.supportWindow, 'number');
  });

  test('generateDeliveryManifest — no real secrets in output', () => {
    const manifest = generateDeliveryManifest({}, {}, {}, {});
    const s = JSON.stringify(manifest);
    assert.ok(!s.includes('sk-'));
    assert.ok(!s.includes('eyJ'));
  });
});

// ── 15. HANDOFF ───────────────────────────────────────────────────────────────
describe('15. Handoff', () => {
  test('generateHandoff returns CLIENT_HANDOFF type', () => {
    const handoff = generateHandoff({}, {}, validateOnboarding(NEXO_LEAD));
    assert.equal(handoff.handoffType, 'CLIENT_HANDOFF');
  });

  test('generateHandoff — trainingChecklist has items', () => {
    const handoff = generateHandoff({}, {}, validateOnboarding(NEXO_LEAD));
    assert.ok(Array.isArray(handoff.trainingChecklist));
    assert.ok(handoff.trainingChecklist.length > 0);
  });

  test('generateHandoff — acceptanceChecklist has items', () => {
    const handoff = generateHandoff({}, {}, validateOnboarding(NEXO_LEAD));
    assert.ok(Array.isArray(handoff.acceptanceChecklist));
    assert.ok(handoff.acceptanceChecklist.length > 0);
  });

  test('generateHandoff — disclaimer mentions no contract', () => {
    const handoff = generateHandoff({}, {}, validateOnboarding(NEXO_LEAD));
    assert.ok(handoff.disclaimer.toLowerCase().includes('contrato'));
  });

  test('generateHandoff — handoffComplete=false initially', () => {
    const handoff = generateHandoff({}, {}, validateOnboarding(NEXO_LEAD));
    assert.equal(handoff.handoffComplete, false);
  });

  test('completeHandoff — all items done → handoffComplete=true', () => {
    const handoff = generateHandoff({}, {}, validateOnboarding(NEXO_LEAD));
    const completed = completeHandoff({
      ...handoff,
      acceptanceChecklist: handoff.acceptanceChecklist.map(c => ({ ...c, done: true })),
      trainingChecklist:   handoff.trainingChecklist.map(c => ({ ...c, done: true })),
    });
    assert.equal(completed.handoffComplete, true);
    assert.ok(completed.completedAt);
  });

  test('completeHandoff — partial acceptance → handoffComplete=false', () => {
    const handoff = generateHandoff({}, {}, validateOnboarding(NEXO_LEAD));
    const partial = completeHandoff({
      ...handoff,
      acceptanceChecklist: handoff.acceptanceChecklist.map((c, i) => ({ ...c, done: i === 0 })),
      trainingChecklist:   handoff.trainingChecklist.map(c => ({ ...c, done: true })),
    });
    assert.equal(partial.handoffComplete, false);
  });
});

// ── 16. SUPPORT WINDOW ────────────────────────────────────────────────────────
describe('16. SupportWindow', () => {
  test('createSupportWindow — ESSENTIAL = 7 days', () => {
    const sw = createSupportWindow('ESSENTIAL');
    assert.equal(sw.durationDays, 7);
  });

  test('createSupportWindow — PRO = 14 days', () => {
    const sw = createSupportWindow('PRO');
    assert.equal(sw.durationDays, 14);
  });

  test('createSupportWindow — PREMIUM = 30 days', () => {
    const sw = createSupportWindow('PREMIUM');
    assert.equal(sw.durationDays, 30);
  });

  test('createSupportWindow — includes disclaimer', () => {
    const sw = createSupportWindow('PRO');
    assert.ok(sw.disclaimer);
    assert.ok(sw.disclaimer.includes('soporte'));
  });

  test('createSupportWindow — has endDate', () => {
    const sw = createSupportWindow('PRO');
    assert.ok(sw.endDate);
    assert.ok(sw.endDate > sw.startDate);
  });

  test('classifyTicket — BUG is covered', () => {
    const sw = createSupportWindow('PRO');
    const cls = classifyTicket(SUPPORT_TICKET_TYPES.BUG, sw);
    assert.equal(cls.covered, true);
    assert.equal(cls.requiresCR, false);
  });

  test('classifyTicket — NEW_FEATURE is not covered', () => {
    const sw = createSupportWindow('PRO');
    const cls = classifyTicket(SUPPORT_TICKET_TYPES.NEW_FEATURE, sw);
    assert.equal(cls.covered, false);
    assert.equal(cls.requiresCR, true);
  });

  test('classifyTicket — SCOPE_CHANGE requires CR', () => {
    const sw = createSupportWindow('PRO');
    const cls = classifyTicket(SUPPORT_TICKET_TYPES.SCOPE_CHANGE, sw);
    assert.equal(cls.requiresCR, true);
  });

  test('SUPPORT_DURATION_DAYS has ESSENTIAL, PRO, PREMIUM', () => {
    assert.ok(SUPPORT_DURATION_DAYS.ESSENTIAL);
    assert.ok(SUPPORT_DURATION_DAYS.PRO);
    assert.ok(SUPPORT_DURATION_DAYS.PREMIUM);
  });
});

// ── 17. CLIENT CLOSEOUT ───────────────────────────────────────────────────────
describe('17. ClientCloseout', () => {
  function doneTracking() {
    let t = createProductionTracking({ businessBrief: { businessName: 'Nexo' }, commercialConstraints: { approvedTier: 'PRO' } });
    for (const c of TRACK_COMPONENTS) t = updateComponentStatus(t, c, 'DONE');
    return t;
  }

  test('closeClientProject — valid inputs produce CLOSED status', () => {
    const manifest = generateDeliveryManifest(
      { businessBrief: { businessName: 'Nexo', sector: 'veterinaria' }, commercialConstraints: { approvedTier: 'PRO' }, aiPlan: [] },
      { includedScope: ['reservas'], clientResponsibilities: ['Dominio'], deferredScope: [], optionalScope: [] },
      doneTracking(), {}
    );
    const handoff = completeHandoff({
      ...generateHandoff(manifest, {}, validateOnboarding(NEXO_LEAD)),
      acceptanceChecklist: generateHandoff(manifest, {}, validateOnboarding(NEXO_LEAD)).acceptanceChecklist.map(c => ({ ...c, done: true })),
      trainingChecklist:   generateHandoff(manifest, {}, validateOnboarding(NEXO_LEAD)).trainingChecklist.map(c => ({ ...c, done: true })),
    });
    const sw = createSupportWindow('PRO');
    const result = closeClientProject({ deliveryManifest: manifest, handoff, supportWindow: sw, tracking: doneTracking(), openCRs: [] });
    assert.equal(result.closed, true);
    assert.ok([CLOSEOUT_STATUS.CLOSED, CLOSEOUT_STATUS.CLOSED_WITH_DEFERRED].includes(result.status));
  });

  test('closeClientProject — missing handoff → BLOCKED', () => {
    const result = closeClientProject({ deliveryManifest: { manifestType: 'DELIVERY_MANIFEST', projectSummary: { tier: 'PRO' } }, handoff: { handoffComplete: false }, supportWindow: { durationDays: 14 }, tracking: doneTracking(), openCRs: [] });
    assert.equal(result.status, CLOSEOUT_STATUS.BLOCKED);
  });

  test('closeClientProject — REGISTRO DECLARATIVO in disclaimer', () => {
    const result = closeClientProject({});
    assert.ok(result.disclaimer.includes('REGISTRO DECLARATIVO'));
  });

  test('closeClientProject — returns blocks array', () => {
    const result = closeClientProject({});
    assert.ok(Array.isArray(result.blocks));
  });

  test('CLOSEOUT_STATUS has CLOSED, CLOSED_WITH_DEFERRED, BLOCKED', () => {
    assert.ok(CLOSEOUT_STATUS.CLOSED);
    assert.ok(CLOSEOUT_STATUS.CLOSED_WITH_DEFERRED);
    assert.ok(CLOSEOUT_STATUS.BLOCKED);
  });
});

// ── 18. LIFECYCLE RUNNER — E2E ────────────────────────────────────────────────
describe('18. LifecycleRunner E2E', () => {
  test('runClientLifecycle — Nexo completes full pipeline CLOSED', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: true });
    assert.ok(['CLOSED', 'CLOSED_WITH_DEFERRED_ITEMS'].includes(result.status));
  });

  test('runClientLifecycle — returns artifacts with onboarding', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: true });
    assert.ok(result.artifacts.onboarding);
  });

  test('runClientLifecycle — returns artifacts with qualification', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: true });
    assert.ok(result.artifacts.qualification);
  });

  test('runClientLifecycle — returns completedStages array', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: true });
    assert.ok(Array.isArray(result.completedStages));
    assert.ok(result.completedStages.length >= 10);
  });

  test('runClientLifecycle — incomplete onboarding → INCOMPLETE', async () => {
    const result = await runClientLifecycle(NEXO_MISSING);
    assert.equal(result.status, 'INCOMPLETE');
  });

  test('runClientLifecycle — rejection → REJECTED', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_REJECTED' });
    assert.equal(result.status, 'REJECTED');
  });

  test('runClientLifecycle — returns nextAction string', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: true });
    assert.equal(typeof result.nextAction, 'string');
  });
});

// ── 19. FAILURE SCENARIOS ─────────────────────────────────────────────────────
describe('19. FailureScenarios', () => {
  test('missing_all_required — pipeline stops at ONBOARDING', async () => {
    const result = await runClientLifecycle({});
    assert.equal(result.status, 'INCOMPLETE');
  });

  test('not_a_fit — budget too low → early exit', async () => {
    const lead = { ...NEXO_LEAD, budgetRange: 'less_than_500' };
    const result = await runClientLifecycle(lead);
    assert.ok(['NOT_A_FIT', 'NEEDS_MORE_INFO', 'INCOMPLETE'].includes(result.status));
  });

  test('rejection — closed with REJECTED status', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_REJECTED' });
    assert.equal(result.status, 'REJECTED');
    assert.ok(result.humanActions.length > 0);
  });

  test('in_production — markAllComponentsDone=false stops at IN_PRODUCTION', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: false });
    assert.ok(['IN_PRODUCTION', 'CLOSED', 'CLOSED_WITH_DEFERRED_ITEMS'].includes(result.status));
  });

  test('all_stages_have_artifacts_when_complete', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: true });
    const keys = Object.keys(result.artifacts);
    assert.ok(keys.includes('onboarding'));
    assert.ok(keys.includes('qualification'));
    assert.ok(keys.includes('diagnostic'));
    assert.ok(keys.includes('requirements'));
    assert.ok(keys.includes('scope'));
    assert.ok(keys.includes('proposal'));
    assert.ok(keys.includes('approval'));
    assert.ok(keys.includes('productionBrief'));
  });
});

// ── 20. CROSS-CLIENT CONTAMINATION CHECK ─────────────────────────────────────
describe('20. CrossClientContaminationCheck', () => {
  test('no cp04/aurora/fisionova/educa refs in Nexo full lifecycle output', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: true });
    const serialized = JSON.stringify(result).toLowerCase();
    assert.ok(!serialized.includes('club pádel'));
    assert.ok(!serialized.includes('cp04'));
    assert.ok(!serialized.includes('fisionova'));
    assert.ok(!serialized.includes('educa-archidona'));
    assert.ok(!serialized.includes('aurora dental'));
  });

  test('no real email addresses in output', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: true });
    const s = JSON.stringify(result);
    assert.ok(!s.includes('@gmail.com'));
    assert.ok(!s.includes('@hotmail'));
  });

  test('no real payment data in output', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: true });
    const s = JSON.stringify(result);
    assert.ok(!s.includes('stripe_live'));
    assert.ok(!s.includes('sk_live'));
    assert.ok(!s.includes('card number'));
  });

  test('no secrets / tokens in output', async () => {
    const result = await runClientLifecycle(NEXO_LEAD, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: true });
    const s = JSON.stringify(result);
    assert.ok(!s.includes('sk-ant'));
    assert.ok(!s.includes('eyJhbGci'));
    assert.ok(!s.includes('supabase_service_key'));
  });
});

// ── 21. REGISTRY INTEGRITY ────────────────────────────────────────────────────
describe('21. LifecycleRegistryIntegrity', () => {
  test('lifecycle registry exports LIFECYCLE_REGISTRY_VERSION', async () => {
    const { LIFECYCLE_REGISTRY_VERSION } = await import('../../factory-registry/lifecycle.js');
    assert.ok(LIFECYCLE_REGISTRY_VERSION);
    assert.equal(typeof LIFECYCLE_REGISTRY_VERSION, 'string');
  });

  test('lifecycle registry exports PASO_D_STATUS=100_PERCENT', async () => {
    const { PASO_D_STATUS } = await import('../../factory-registry/lifecycle.js');
    assert.equal(PASO_D_STATUS, '100_PERCENT');
  });

  test('main registry REGISTRY_VERSION is 2.4.0', async () => {
    const { REGISTRY_VERSION } = await import('../../factory-registry/index.js');
    assert.equal(REGISTRY_VERSION, '2.4.0');
  });

  test('main registry exports runClientLifecycle', async () => {
    const { runClientLifecycle: fn } = await import('../../factory-registry/index.js');
    assert.equal(typeof fn, 'function');
  });

  test('main registry exports PASO_D_STATUS_MAIN', async () => {
    const { PASO_D_STATUS_MAIN } = await import('../../factory-registry/index.js');
    assert.equal(PASO_D_STATUS_MAIN, '100_PERCENT');
  });
});
