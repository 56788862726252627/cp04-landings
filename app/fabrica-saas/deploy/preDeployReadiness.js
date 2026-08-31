// Pre-Deploy Readiness — PASO G
// 22 checks. Any critical failure → BLOCKED.

export const READINESS_OUTCOMES = Object.freeze({
  READY:        'READY',
  BLOCKED:      'BLOCKED',
  HUMAN_REVIEW: 'HUMAN_REVIEW',
});

const CHECKS_DEFINITION = [
  { id: 'scope_approved',            label: 'Scope approved by client',            critical: true  },
  { id: 'requirements_approved',     label: 'Requirements documented + approved',  critical: true  },
  { id: 'production_ready',          label: 'Production readiness gate passed',    critical: true  },
  { id: 'delivery_ready',            label: 'Delivery readiness confirmed',        critical: true  },
  { id: 'tests_pass',                label: 'All tests pass',                      critical: true  },
  { id: 'lint_pass',                 label: 'Lint passes with 0 errors',           critical: true  },
  { id: 'build_pass',                label: 'Build succeeds',                      critical: true  },
  { id: 'functional_gate',           label: 'Functional QA gate passed',           critical: true  },
  { id: 'dead_control_gate',         label: 'No dead controls (buttons/links)',    critical: true  },
  { id: 'mobile_gate',               label: 'Mobile/responsive QA passed',         critical: true  },
  { id: 'accessibility_gate',        label: 'Accessibility checks passed',         critical: false },
  { id: 'security_gate',             label: 'Security gate passed',                critical: true  },
  { id: 'privacy_gate',              label: 'Privacy/GDPR review passed',          critical: false, humanReview: true },
  { id: 'role_isolation',            label: 'Role isolation verified',             critical: true  },
  { id: 'cross_client_isolation',    label: 'Cross-client data isolation verified',critical: true  },
  { id: 'no_real_demo_data',         label: 'No production demo data leaking',     critical: true  },
  { id: 'no_hardcoded_secrets',      label: 'No hardcoded secrets in codebase',    critical: true  },
  { id: 'environment_configured',    label: 'Target environment configured',       critical: true  },
  { id: 'rollback_defined',          label: 'Rollback plan defined',               critical: true  },
  { id: 'backup_policy_defined',     label: 'Backup policy defined',               critical: false },
  { id: 'health_verification_defined', label: 'Health verification defined',       critical: true  },
  { id: 'human_approval',            label: 'Human approval obtained',             critical: true, humanReview: true },
];

/**
 * Evaluate pre-deploy readiness from a checks map.
 * @param {object} checks — { check_id: true|false|'HUMAN_REVIEW' }
 * @param {string} environment
 */
export function evaluatePreDeployReadiness(checks = {}, environment = 'PREVIEW') {
  const results = CHECKS_DEFINITION.map(def => {
    const value = checks[def.id];
    const passed = value === true;
    const humanReview = value === 'HUMAN_REVIEW' || (def.humanReview && value === undefined);
    return { ...def, value, passed, humanReview };
  });

  const criticalFailed = results.filter(r => r.critical && !r.passed && !r.humanReview);
  const humanReviewNeeded = results.filter(r => r.humanReview && !r.passed);
  const totalPassed = results.filter(r => r.passed).length;
  const score = Math.round((totalPassed / CHECKS_DEFINITION.length) * 100);

  let outcome;
  if (criticalFailed.length > 0) {
    outcome = READINESS_OUTCOMES.BLOCKED;
  } else if (humanReviewNeeded.length > 0) {
    outcome = READINESS_OUTCOMES.HUMAN_REVIEW;
  } else {
    outcome = READINESS_OUTCOMES.READY;
  }

  // PRODUCTION always requires human_approval check
  if (environment === 'PRODUCTION' && checks.human_approval !== true) {
    outcome = READINESS_OUTCOMES.BLOCKED;
    if (!criticalFailed.find(r => r.id === 'human_approval')) {
      criticalFailed.push({ id: 'human_approval', label: 'Human approval mandatory for PRODUCTION' });
    }
  }

  return {
    outcome,
    environment,
    score,
    totalChecks:    CHECKS_DEFINITION.length,
    passed:         totalPassed,
    criticalFailed: criticalFailed.length,
    humanReview:    humanReviewNeeded.length,
    criticalFailedIds: criticalFailed.map(r => r.id),
    humanReviewIds: humanReviewNeeded.map(r => r.id),
    results,
    deploymentAllowed: outcome === READINESS_OUTCOMES.READY,
    disclaimer: 'Pre-deploy readiness is an operational gate. Not a legal compliance certification.',
  };
}

export const PRE_DEPLOY_READINESS_VERSION = '1.0.0';
