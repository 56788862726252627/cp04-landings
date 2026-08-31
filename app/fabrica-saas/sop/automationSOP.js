// Automation SOP — FASE 10: proceso para diseño y operación de automatizaciones Make

import { createSOP, SOP_STEP_TYPES } from './sopEngine.js';

export const AUTOMATION_ENVIRONMENTS = Object.freeze({
  DESIGN:      'DESIGN',
  STAGING:     'STAGING',
  PRODUCTION:  'PRODUCTION',
});

export const AUTOMATION_ERROR_STRATEGIES = Object.freeze({
  RETRY:       'RETRY',
  HUMAN_REVIEW:'HUMAN_REVIEW',
  FAIL_SAFE:   'FAIL_SAFE',
  SKIP:        'SKIP',
});

/**
 * Define an automation scenario spec.
 */
export function defineAutomation(params = {}) {
  const errors = [];

  if (!params.automationId)   errors.push('automationId required');
  if (!params.businessNeed)   errors.push('businessNeed required');
  if (!params.trigger)        errors.push('trigger required');

  if (errors.length > 0) return { valid: false, errors, automation: null };

  const automation = {
    automationId:       params.automationId,
    name:               params.name ?? params.automationId,
    businessNeed:       params.businessNeed,
    trigger:            params.trigger,
    inputs:             Array.isArray(params.inputs) ? params.inputs : [],
    steps:              Array.isArray(params.steps) ? params.steps : [],
    outputs:            Array.isArray(params.outputs) ? params.outputs : [],
    errorHandling:      params.errorHandling ?? AUTOMATION_ERROR_STRATEGIES.HUMAN_REVIEW,
    humanReviewTrigger: params.humanReviewTrigger ?? 'consecutive_failures >= 3',
    securityChecks:     Array.isArray(params.securityChecks) ? params.securityChecks : [
      'no real credentials in scenario config',
      'webhook URLs not exposed in logs',
    ],
    testCoverage:       params.testCoverage ?? false,
    stagingValidated:   params.stagingValidated ?? false,
    productionReady:    params.productionReady ?? false,
    makeCompatible:     true,
    monitoring:         params.monitoring ?? null,
    rollbackPlan:       params.rollbackPlan ?? null,
    documentation:      params.documentation ?? null,
  };

  return { valid: true, errors: [], automation };
}

/**
 * Check production readiness of an automation.
 */
export function automationProductionGate(automation = {}) {
  const blocks = [];
  const warnings = [];

  if (!automation.businessNeed)    blocks.push('businessNeed not documented');
  if (!automation.trigger)         blocks.push('trigger not defined');
  if (automation.steps.length === 0) blocks.push('no steps defined');
  if (!automation.testCoverage)    blocks.push('test coverage not confirmed');
  if (!automation.stagingValidated) blocks.push('staging not validated');
  if (!automation.errorHandling)   blocks.push('error handling not defined');

  if (!automation.monitoring)      warnings.push('no monitoring configured');
  if (!automation.rollbackPlan)    warnings.push('no rollback plan');
  if (!automation.documentation)   warnings.push('no documentation');

  return {
    ready:    blocks.length === 0,
    gate:     'AUTOMATION_PRODUCTION_GATE',
    outcome:  blocks.length === 0 ? 'PASS' : 'BLOCKED',
    blocks,
    warnings,
  };
}

export const sopAutomation = createSOP({
  id:      'AUTOMATION_LIFECYCLE',
  title:   'Automation Lifecycle',
  purpose: 'Design, test, stage and operate Make automations safely',
  scope:   'All Make scenarios in agency products',
  owner:   'AUTOMATION_SPECIALIST',
  participants: ['AUTOMATION_SPECIALIST', 'QA', 'PROJECT_MANAGER', 'DEVELOPER'],
  trigger: 'Automation required by scope',
  requiredInputs: ['businessNeed', 'trigger', 'inputs', 'expectedOutputs'],
  steps: [
    { label: 'Document business need', type: SOP_STEP_TYPES.ACTION, owner: 'AUTOMATION_SPECIALIST' },
    { label: 'Define trigger', type: SOP_STEP_TYPES.ACTION, owner: 'AUTOMATION_SPECIALIST' },
    { label: 'Define inputs and outputs', type: SOP_STEP_TYPES.ACTION, owner: 'AUTOMATION_SPECIALIST' },
    { label: 'Design scenario steps', type: SOP_STEP_TYPES.ACTION, owner: 'AUTOMATION_SPECIALIST' },
    { label: 'Define error handling', type: SOP_STEP_TYPES.ACTION, owner: 'AUTOMATION_SPECIALIST' },
    { label: 'Define human review trigger', type: SOP_STEP_TYPES.ACTION, owner: 'AUTOMATION_SPECIALIST' },
    { label: 'Security check: no real creds in config', type: SOP_STEP_TYPES.GATE, gate: 'automation_security_ok', owner: 'QA' },
    { label: 'Write automation tests', type: SOP_STEP_TYPES.ACTION, owner: 'QA' },
    { label: 'Validate on staging', type: SOP_STEP_TYPES.GATE, gate: 'automation_staging_ok', owner: 'AUTOMATION_SPECIALIST' },
    { label: 'Production readiness gate', type: SOP_STEP_TYPES.GATE, gate: 'automation_production_ready', owner: 'PROJECT_MANAGER' },
    { label: 'Document in Make manifest', type: SOP_STEP_TYPES.ACTION, owner: 'AUTOMATION_SPECIALIST' },
    { label: 'Hand off to production', type: SOP_STEP_TYPES.HANDOFF, owner: 'PROJECT_MANAGER' },
  ],
  decisionRules: [
    'No production deploy without staging validation',
    'Error handling must be defined before staging',
    'Human review trigger required for critical flows',
  ],
  qualityChecks: ['Staging validated', 'Tests pass', 'Error handling documented'],
  securityChecks: ['No real creds in scenario', 'Webhook URLs not in logs'],
  handoff: 'Automation manifest → Factory delivery artifacts',
  escalation: 'PROJECT_MANAGER if staging repeatedly fails',
  completionCriteria: ['stagingValidated=true', 'productionReady=true', 'documented in Make manifest'],
  artifacts: ['Automation spec', 'Make manifest entry', 'Test report'],
  metrics: ['automation_uptime_rate', 'human_escalation_rate', 'avg_execution_time_ms'],
  bpmnRef: 'BPMN_AUTOMATION.main',
}).sop;

export const AUTOMATION_SOP_VERSION = '1.0.0';
