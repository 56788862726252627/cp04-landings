// Security SOP — FASE 12: proceso de seguridad operativa

import { createSOP, SOP_STEP_TYPES } from './sopEngine.js';

export const DATA_CLASSIFICATION = Object.freeze({
  PUBLIC:       'PUBLIC',
  INTERNAL:     'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
  RESTRICTED:   'RESTRICTED',
});

export const CREDENTIAL_OWNERSHIP = Object.freeze({
  CLIENT:  'CLIENT',   // client owns and manages
  AGENCY:  'AGENCY',   // agency manages on behalf
  SHARED:  'SHARED',   // both have read access
});

/**
 * Classify data sensitivity.
 */
export function classifyData(dataType = '') {
  const type = dataType.toLowerCase();
  if (['health', 'medical', 'financial', 'payment', 'password', 'token', 'secret', 'credential'].some(k => type.includes(k))) {
    return DATA_CLASSIFICATION.RESTRICTED;
  }
  if (['email', 'phone', 'address', 'name', 'personal', 'pii'].some(k => type.includes(k))) {
    return DATA_CLASSIFICATION.CONFIDENTIAL;
  }
  if (['internal', 'config', 'setting', 'admin'].some(k => type.includes(k))) {
    return DATA_CLASSIFICATION.INTERNAL;
  }
  return DATA_CLASSIFICATION.PUBLIC;
}

/**
 * Validate credential handoff plan.
 * Enforces: agency does NOT retain production credentials.
 */
export function validateCredentialPlan(plan = {}) {
  const violations = [];

  if (plan.agencyStoresSecret === true) {
    violations.push('VIOLATION: agency must not store client production secrets');
  }
  if (plan.secretsInCodebase === true) {
    violations.push('VIOLATION: secrets must not be in codebase');
  }
  if (!plan.ownership) violations.push('credential ownership not defined');
  if (!plan.rotationPolicy) violations.push('rotation policy not defined');
  if (!plan.accessReviewSchedule) violations.push('access review schedule not defined');

  return {
    valid:       violations.length === 0,
    violations,
    outcome:     violations.length === 0 ? 'APPROVED' : 'BLOCKED',
  };
}

export const sopSecurity = createSOP({
  id:      'SECURITY_BASELINE',
  title:   'Security Baseline',
  purpose: 'Ensure all products and operations meet baseline security standards',
  scope:   'All agency products, code, and operations',
  owner:   'QA',
  participants: ['QA', 'DEVELOPER', 'AI_SPECIALIST', 'AGENCY_OWNER'],
  trigger: 'Any product entering QA or delivery phase',
  requiredInputs: ['productCode', 'credentialPlan', 'dataClassification'],
  steps: [
    { label: 'Classify data types in product', type: SOP_STEP_TYPES.ACTION, owner: 'QA' },
    { label: 'Verify no real credentials in codebase', type: SOP_STEP_TYPES.GATE, gate: 'no_secrets_in_code', owner: 'QA' },
    { label: 'Verify least-privilege for each role', type: SOP_STEP_TYPES.GATE, gate: 'least_privilege_applied', owner: 'QA' },
    { label: 'Verify demo data is truly fictitious', type: SOP_STEP_TYPES.GATE, gate: 'demo_data_clean', owner: 'QA' },
    { label: 'Validate credential plan (client owns creds)', type: SOP_STEP_TYPES.GATE, gate: 'credential_plan_valid', owner: 'QA' },
    { label: 'Check production endpoints not exposed in UI', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER' },
    { label: 'Review third-party integrations for data leakage', type: SOP_STEP_TYPES.ACTION, owner: 'QA' },
    { label: 'Document incident handling procedure', type: SOP_STEP_TYPES.ACTION, owner: 'QA' },
    { label: 'Verify agency access revoked post-handoff plan', type: SOP_STEP_TYPES.ACTION, owner: 'PROJECT_MANAGER' },
  ],
  decisionRules: [
    'Any RESTRICTED data → HUMAN_REVIEW before production',
    'Secrets in code → immediate block',
    'Health data → privacy flag required',
  ],
  qualityChecks: ['Security checklist complete', 'Credential plan approved'],
  securityChecks: [
    'No secrets in .env committed',
    'No real PII in demo data',
    'Webhook URLs not logged',
    'AI agents do not store credentials',
  ],
  handoff: 'Security approval → Production deploy gate',
  escalation: 'AGENCY_OWNER for RESTRICTED data findings',
  completionCriteria: ['All security gates pass', 'Credential plan approved', 'Data classified'],
  artifacts: ['Security checklist', 'Credential plan', 'Data classification map'],
  metrics: ['security_violation_rate', 'credential_rotation_compliance'],
  bpmnRef: 'BPMN_AGENCY.security',
}).sop;

export const SECURITY_SOP_VERSION = '1.0.0';
