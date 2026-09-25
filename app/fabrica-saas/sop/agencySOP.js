// Agency SOP — FASE 6: proceso general de agencia de lead a cierre

import { runClientLifecycle } from '../lifecycle/lifecycleRunner.js';

/**
 * newClientToDelivery — orquestador de alto nivel (documentación operativa).
 * Delega la lógica a lifecycleRunner; este SOP añade la capa de
 * responsabilidades, gates y artifacts operativos.
 */
export const AGENCY_SOP_STAGES = Object.freeze([
  'LEAD',
  'QUALIFICATION',
  'DIAGNOSIS',
  'COMMERCIAL',
  'SCOPE',
  'APPROVAL',
  'PRODUCTION',
  'QA',
  'DELIVERY',
  'HANDOFF',
  'SUPPORT',
  'CLOSEOUT',
]);

export const STAGE_OWNERS = Object.freeze({
  LEAD:          'COMMERCIAL',
  QUALIFICATION: 'COMMERCIAL',
  DIAGNOSIS:     'AI_SPECIALIST',
  COMMERCIAL:    'COMMERCIAL',
  SCOPE:         'PROJECT_MANAGER',
  APPROVAL:      'AGENCY_OWNER',
  PRODUCTION:    'DEVELOPER',
  QA:            'QA',
  DELIVERY:      'PROJECT_MANAGER',
  HANDOFF:       'PROJECT_MANAGER',
  SUPPORT:       'SUPPORT',
  CLOSEOUT:      'AGENCY_OWNER',
});

export const STAGE_GATES = Object.freeze({
  LEAD:          ['required_fields_complete'],
  QUALIFICATION: ['budget_qualified', 'decision_maker_confirmed'],
  DIAGNOSIS:     ['client_validates_diagnosis'],
  COMMERCIAL:    ['proposal_generated'],
  SCOPE:         ['scope_document_ready', 'has_p0_requirements'],
  APPROVAL:      ['agency_owner_approves', 'budget_confirmed'],
  PRODUCTION:    ['production_brief_complete'],
  QA:            ['functional_qa', 'build_passes', 'security_review', 'dead_control_qa', 'mobile_qa'],
  DELIVERY:      ['delivery_manifest_complete'],
  HANDOFF:       ['training_complete', 'acceptance_complete'],
  SUPPORT:       ['support_window_active'],
  CLOSEOUT:      ['manifest_exists', 'handoff_complete', 'no_critical_open_crs'],
});

export const STAGE_ARTIFACTS = Object.freeze({
  LEAD:          ['Lead record', 'CRM entry'],
  QUALIFICATION: ['Qualification score', 'Outcome record'],
  DIAGNOSIS:     ['Diagnosis report'],
  COMMERCIAL:    ['Proposal document', 'Estimate'],
  SCOPE:         ['Scope document', 'Requirements list'],
  APPROVAL:      ['Approval record (declarative)'],
  PRODUCTION:    ['Production brief', 'Tracking board'],
  QA:            ['QA report', 'Delivery readiness record'],
  DELIVERY:      ['Delivery manifest'],
  HANDOFF:       ['Handoff record', 'Credential plan'],
  SUPPORT:       ['Support window record', 'Ticket log'],
  CLOSEOUT:      ['Client closeout record (declarative)'],
});

/**
 * runAgencySOP — wraps runClientLifecycle and returns stage-level summary.
 * Does NOT re-implement lifecycle logic.
 */
export async function runAgencySOP(lead = {}, opts = {}) {
  const lifecycleResult = await runClientLifecycle(lead, opts);

  const stageMap = {};
  for (const stage of AGENCY_SOP_STAGES) {
    stageMap[stage] = {
      owner:     STAGE_OWNERS[stage],
      gates:     STAGE_GATES[stage],
      artifacts: STAGE_ARTIFACTS[stage],
      completed: (lifecycleResult.completedStages ?? []).some(s =>
        s.toLowerCase().includes(stage.toLowerCase())
      ),
    };
  }

  return {
    sopId:           'AGENCY_SOP_FULL_PIPELINE',
    status:          lifecycleResult.status,
    currentStage:    lifecycleResult.currentStage,
    stages:          stageMap,
    lifecycle:       lifecycleResult,
    humanActions:    lifecycleResult.humanActions ?? [],
    nextAction:      lifecycleResult.nextAction ?? null,
  };
}

export const AGENCY_SOP_VERSION = '1.0.0';
