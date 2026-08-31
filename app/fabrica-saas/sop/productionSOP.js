// Production SOP — FASE 13: proceso declarativo de preparación y despliegue

import { createSOP, SOP_STEP_TYPES } from './sopEngine.js';

export const PRODUCTION_ENVIRONMENTS = Object.freeze({
  STAGING:     'STAGING',
  PRODUCTION:  'PRODUCTION',
});

export const DEPLOY_STATUS = Object.freeze({
  READY:    'READY',
  BLOCKED:  'BLOCKED',
  DEPLOYED: 'DEPLOYED',
  ROLLBACK: 'ROLLBACK',
});

/**
 * Validate production readiness before deploy.
 * This does NOT execute deploy — declarative only.
 */
export function validateProductionReadiness(checks = {}) {
  const required = [
    'qa_pass',
    'security_pass',
    'build_pass',
    'delivery_manifest_exists',
    'no_critical_open_crs',
    'env_variables_configured',
    'rollback_plan_exists',
  ];

  const missing = required.filter(k => !checks[k]);
  const warnings = [];

  if (!checks.staging_validated) warnings.push('staging not validated');
  if (!checks.performance_check) warnings.push('performance check not run');
  if (!checks.post_deploy_qa_plan) warnings.push('no post-deploy QA plan');

  return {
    status:       missing.length === 0 ? DEPLOY_STATUS.READY : DEPLOY_STATUS.BLOCKED,
    gate:         'PRODUCTION_GATE',
    missing,
    warnings,
    ready:        missing.length === 0,
    disclaimer:   'Deploy execution requires human authorization. This is a readiness check only.',
  };
}

export const sopProduction = createSOP({
  id:      'PRODUCTION_DEPLOY',
  title:   'Production Deploy',
  purpose: 'Ensure safe, validated, reversible production deployment',
  scope:   'All agency product deployments',
  owner:   'DEVELOPER',
  participants: ['DEVELOPER', 'QA', 'PROJECT_MANAGER', 'AGENCY_OWNER'],
  trigger: 'Delivery readiness gate passes, client accepted',
  requiredInputs: [
    'qaReport', 'securityApproval', 'buildArtifact',
    'deliveryManifest', 'rollbackPlan', 'envConfig',
  ],
  steps: [
    { label: 'Verify QA gate passed', type: SOP_STEP_TYPES.GATE, gate: 'qa_pass', owner: 'QA' },
    { label: 'Verify security approved', type: SOP_STEP_TYPES.GATE, gate: 'security_pass', owner: 'QA' },
    { label: 'Verify build artifact ready', type: SOP_STEP_TYPES.GATE, gate: 'build_pass', owner: 'DEVELOPER' },
    { label: 'Verify env variables configured', type: SOP_STEP_TYPES.GATE, gate: 'env_variables_configured', owner: 'DEVELOPER' },
    { label: 'Agency owner authorization', type: SOP_STEP_TYPES.GATE, gate: 'agency_owner_authorizes_deploy', owner: 'AGENCY_OWNER' },
    { label: 'Deploy to production (human action)', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER' },
    { label: 'Post-deploy smoke test', type: SOP_STEP_TYPES.GATE, gate: 'smoke_test_pass', owner: 'QA' },
    { label: 'Verify production is live and functional', type: SOP_STEP_TYPES.ACTION, owner: 'QA' },
    { label: 'Record deploy in manifest', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER' },
    { label: 'Hand off to client handoff SOP', type: SOP_STEP_TYPES.HANDOFF, owner: 'PROJECT_MANAGER' },
  ],
  decisionRules: [
    'If smoke test fails → rollback immediately',
    'If rollback fails → escalate AGENCY_OWNER + SUPPORT',
    'No deploy without agency owner authorization',
  ],
  qualityChecks: ['Smoke test passes', 'Deploy recorded in manifest'],
  securityChecks: ['Production secrets set in environment, not in code', 'Deploy access logged'],
  handoff: 'Deployed product → Client Handoff SOP',
  escalation: 'AGENCY_OWNER immediately on rollback',
  completionCriteria: ['Smoke test pass', 'Product live', 'Deploy recorded'],
  artifacts: ['Deploy record', 'Post-deploy QA report', 'Updated delivery manifest'],
  metrics: ['deploy_success_rate', 'rollback_rate', 'smoke_test_pass_rate'],
  bpmnRef: 'BPMN_AGENCY.production',
}).sop;

export const PRODUCTION_SOP_VERSION = '1.0.0';
