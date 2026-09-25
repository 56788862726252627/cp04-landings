// Factory SOP — FASE 7: proceso de generación de producto en la fábrica SaaS

import { createSOP, SOP_STEP_TYPES } from './sopEngine.js';

export const FACTORY_SOP_ID = 'FACTORY_PRODUCT_GENERATION';

export const sopFactoryGeneration = createSOP({
  id:      FACTORY_SOP_ID,
  title:   'Factory Product Generation',
  purpose: 'Transform a validated production brief into a delivered SaaS product',
  scope:   'All factory-generated SaaS products',
  owner:   'DEVELOPER',
  participants: ['DEVELOPER', 'AI_SPECIALIST', 'QA', 'PROJECT_MANAGER'],
  trigger: 'Production brief approved',
  requiredInputs: ['productionBrief', 'scopeDocument', 'approvalRecord'],
  steps: [
    { label: 'Validate production brief', type: SOP_STEP_TYPES.GATE, gate: 'brief_valid', owner: 'DEVELOPER' },
    { label: 'Resolve vertical configuration', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER' },
    { label: 'Apply branding tokens', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER' },
    { label: 'Select experience preset', type: SOP_STEP_TYPES.ACTION, owner: 'AI_SPECIALIST' },
    { label: 'Plan module list', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER' },
    { label: 'Define roles and permissions', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER' },
    { label: 'Plan data model', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER' },
    { label: 'Plan AI agents (if scope includes AI)', type: SOP_STEP_TYPES.ACTION, owner: 'AI_SPECIALIST', optional: true },
    { label: 'Plan Make automations (if scope includes automation)', type: SOP_STEP_TYPES.ACTION, owner: 'AUTOMATION_SPECIALIST', optional: true },
    { label: 'Generate product components', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER' },
    { label: 'Run functional QA gate', type: SOP_STEP_TYPES.GATE, gate: 'functional_qa', owner: 'QA' },
    { label: 'Run dead controls QA gate', type: SOP_STEP_TYPES.GATE, gate: 'dead_control_qa', owner: 'QA' },
    { label: 'Run mobile QA gate', type: SOP_STEP_TYPES.GATE, gate: 'mobile_qa', owner: 'QA' },
    { label: 'Run build', type: SOP_STEP_TYPES.GATE, gate: 'build_passes', owner: 'DEVELOPER' },
    { label: 'Run security review', type: SOP_STEP_TYPES.GATE, gate: 'security_review', owner: 'QA' },
    { label: 'Generate delivery artifacts', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER' },
    { label: 'Hand off to Delivery', type: SOP_STEP_TYPES.HANDOFF, owner: 'PROJECT_MANAGER' },
  ],
  decisionRules: [
    'If QA gate fails → block delivery, open QA ticket',
    'If build fails → developer fixes, re-run',
    'If scope includes AI → AI_SPECIALIST reviews model selection',
  ],
  qualityChecks: [
    'All P0 requirements implemented',
    'No dead controls',
    'Mobile responsive',
    'Security review passed',
    'Documentation complete',
  ],
  securityChecks: [
    'No real client credentials in codebase',
    'No production secrets in output files',
    'Least privilege for AI agent tools',
  ],
  handoff: 'Delivery artifacts + QA report → Delivery SOP',
  escalation: 'PROJECT_MANAGER if QA gate blocks repeatedly',
  completionCriteria: [
    'All P0 components status=DONE',
    'Build passes',
    'Delivery manifest generated',
  ],
  artifacts: [
    'Generated product',
    'QA report',
    'Delivery manifest',
    'Automation manifest',
    'AI manifest',
  ],
  metrics: ['generation_time_hours', 'qa_pass_first_attempt_rate'],
  bpmnRef: 'BPMN_FACTORY.main',
}).sop;

export const FACTORY_SOP_STAGES = [
  'brief_validation',
  'vertical_resolution',
  'branding',
  'experience_selection',
  'module_planning',
  'roles',
  'data_model',
  'ai_planning',
  'make_planning',
  'generation',
  'qa',
  'build',
  'delivery_artifacts',
];

export function getFactoryStageOwner(stage) {
  const owners = {
    brief_validation:    'DEVELOPER',
    vertical_resolution: 'DEVELOPER',
    branding:            'DEVELOPER',
    experience_selection:'AI_SPECIALIST',
    module_planning:     'DEVELOPER',
    roles:               'DEVELOPER',
    data_model:          'DEVELOPER',
    ai_planning:         'AI_SPECIALIST',
    make_planning:       'AUTOMATION_SPECIALIST',
    generation:          'DEVELOPER',
    qa:                  'QA',
    build:               'DEVELOPER',
    delivery_artifacts:  'DEVELOPER',
  };
  return owners[stage] ?? 'DEVELOPER';
}

export const FACTORY_SOP_VERSION = '1.0.0';
