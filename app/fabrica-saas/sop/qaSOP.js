// QA SOP — FASE 11: proceso unificado de QA

import { createSOP, SOP_STEP_TYPES } from './sopEngine.js';

export const QA_CHECK_TYPES = Object.freeze({
  FUNCTIONAL:    'FUNCTIONAL',
  DEAD_CONTROLS: 'DEAD_CONTROLS',
  MOBILE:        'MOBILE',
  RESPONSIVE:    'RESPONSIVE',
  ACCESSIBILITY: 'ACCESSIBILITY',
  PERFORMANCE:   'PERFORMANCE',
  SECURITY:      'SECURITY',
  PRIVACY:       'PRIVACY',
  ROLE_ISOLATION:'ROLE_ISOLATION',
  CONTAMINATION: 'CROSS_CLIENT_CONTAMINATION',
  TESTS:         'TESTS',
  LINT:          'LINT',
  BUILD:         'BUILD',
});

export const QA_OUTCOMES = Object.freeze({
  PASS:         'PASS',
  FAIL:         'FAIL',
  BLOCKED:      'BLOCKED',
  HUMAN_REVIEW: 'HUMAN_REVIEW',
});

const P0_CHECKS = [
  QA_CHECK_TYPES.FUNCTIONAL,
  QA_CHECK_TYPES.DEAD_CONTROLS,
  QA_CHECK_TYPES.MOBILE,
  QA_CHECK_TYPES.BUILD,
  QA_CHECK_TYPES.SECURITY,
  QA_CHECK_TYPES.TESTS,
];

const P1_CHECKS = [
  QA_CHECK_TYPES.ACCESSIBILITY,
  QA_CHECK_TYPES.PRIVACY,
  QA_CHECK_TYPES.PERFORMANCE,
  QA_CHECK_TYPES.ROLE_ISOLATION,
  QA_CHECK_TYPES.CONTAMINATION,
  QA_CHECK_TYPES.LINT,
  QA_CHECK_TYPES.RESPONSIVE,
];

/**
 * Run a QA gate given a results map.
 * @param {object} results - keys are QA_CHECK_TYPES values, values are true/false/null
 */
export function runQAGate(results = {}) {
  const p0Results = P0_CHECKS.map(check => ({
    check,
    priority: 'P0',
    result: results[check] ?? null,
    pass:   results[check] === true,
  }));

  const p1Results = P1_CHECKS.map(check => ({
    check,
    priority: 'P1',
    result: results[check] ?? null,
    pass:   results[check] === true,
  }));

  const p0Failures = p0Results.filter(r => !r.pass);
  const p1Failures = p1Results.filter(r => !r.pass);
  const hasPrivacyIssue = results[QA_CHECK_TYPES.PRIVACY] === false;

  const outcome = p0Failures.length > 0
    ? QA_OUTCOMES.BLOCKED
    : hasPrivacyIssue
      ? QA_OUTCOMES.HUMAN_REVIEW
      : QA_OUTCOMES.PASS;

  return {
    gate:         'QA_GATE',
    outcome,
    p0:           p0Results,
    p1:           p1Results,
    p0Failures:   p0Failures.map(r => r.check),
    p1Failures:   p1Failures.map(r => r.check),
    blocked:      outcome === QA_OUTCOMES.BLOCKED,
    humanReview:  outcome === QA_OUTCOMES.HUMAN_REVIEW,
    score: Math.round(
      (p0Results.filter(r => r.pass).length / P0_CHECKS.length) * 70 +
      (p1Results.filter(r => r.pass).length / P1_CHECKS.length) * 30
    ),
  };
}

export const sopQA = createSOP({
  id:      'QA_UNIFIED',
  title:   'Unified QA Process',
  purpose: 'Validate product quality across functional, mobile, security and cross-client dimensions',
  scope:   'All factory-generated products before delivery',
  owner:   'QA',
  participants: ['QA', 'DEVELOPER', 'PROJECT_MANAGER'],
  trigger: 'Product generation complete',
  requiredInputs: ['generatedProduct', 'scopeDocument'],
  steps: [
    { label: 'Functional QA — all features work as specified', type: SOP_STEP_TYPES.GATE, gate: QA_CHECK_TYPES.FUNCTIONAL, owner: 'QA' },
    { label: 'Dead controls QA — no broken buttons/links', type: SOP_STEP_TYPES.GATE, gate: QA_CHECK_TYPES.DEAD_CONTROLS, owner: 'QA' },
    { label: 'Mobile QA — responsive on 320px to 1440px', type: SOP_STEP_TYPES.GATE, gate: QA_CHECK_TYPES.MOBILE, owner: 'QA' },
    { label: 'Build check — npm run build passes', type: SOP_STEP_TYPES.GATE, gate: QA_CHECK_TYPES.BUILD, owner: 'DEVELOPER' },
    { label: 'Security review — no exposed secrets, OWASP basics', type: SOP_STEP_TYPES.GATE, gate: QA_CHECK_TYPES.SECURITY, owner: 'QA' },
    { label: 'Tests — all unit/integration tests pass', type: SOP_STEP_TYPES.GATE, gate: QA_CHECK_TYPES.TESTS, owner: 'DEVELOPER' },
    { label: 'Accessibility — WCAG AA basic', type: SOP_STEP_TYPES.ACTION, owner: 'QA', optional: true },
    { label: 'Privacy — GDPR, health data handled', type: SOP_STEP_TYPES.ACTION, owner: 'QA', optional: true },
    { label: 'Role isolation — roles only see own data', type: SOP_STEP_TYPES.ACTION, owner: 'QA', optional: true },
    { label: 'Cross-client contamination — no refs to other clients', type: SOP_STEP_TYPES.ACTION, owner: 'QA', optional: true },
    { label: 'Lint — 0 errors', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER', optional: true },
    { label: 'Generate QA report', type: SOP_STEP_TYPES.ACTION, owner: 'QA' },
    { label: 'Approve or block delivery', type: SOP_STEP_TYPES.DECISION, decision: 'qa_decision', owner: 'QA' },
  ],
  decisionRules: [
    'P0 failure → BLOCKED (delivery cannot proceed)',
    'P1 failure → warning (delivery can proceed with documented limitation)',
    'privacy=false → HUMAN_REVIEW',
  ],
  qualityChecks: ['QA report signed by QA role'],
  securityChecks: ['QA checks for localStorage tokens', 'QA checks for exposed secrets'],
  handoff: 'QA report → Delivery readiness gate',
  escalation: 'PROJECT_MANAGER if P0 failures exceed 3 cycles',
  completionCriteria: ['All P0 checks pass', 'QA report generated'],
  artifacts: ['QA report', 'Delivery readiness record'],
  metrics: ['qa_pass_first_attempt', 'p0_failure_rate', 'avg_qa_cycle_count'],
  bpmnRef: 'BPMN_FACTORY.qa',
}).sop;

export { P0_CHECKS, P1_CHECKS };
export const QA_SOP_VERSION = '1.0.0';
