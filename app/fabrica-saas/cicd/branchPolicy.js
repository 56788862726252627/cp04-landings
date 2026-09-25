// Branch Policy — ADV-02 CI/CD Automatizado
// BranchPolicy: modelo de política de ramas. Documenta y recomienda protecciones.
// NO modifica reglas GitHub reales en esta mejora.

export const BRANCH_TYPE = Object.freeze({
  FEATURE:  'FEATURE',
  MAIN:     'MAIN',
  RELEASE:  'RELEASE',
  HOTFIX:   'HOTFIX',
  DOCS:     'DOCS',
});

export const POLICY_STATUS = Object.freeze({
  COMPLIANT:     'COMPLIANT',
  VIOLATION:     'VIOLATION',
  WARNING:       'WARNING',
  NOT_EVALUATED: 'NOT_EVALUATED',
});

const DEFAULT_POLICIES = {
  [BRANCH_TYPE.MAIN]: {
    directPushAllowed:   false,
    reviewRequired:      true,
    minApprovals:        1,
    requiredChecks:      ['test', 'lint', 'build', 'secret-quick-scan', 'quality-gate'],
    releaseAllowed:      true,
    deployAllowed:       true,
    deleteProtected:     true,
    forceProtected:      true,
  },
  [BRANCH_TYPE.FEATURE]: {
    directPushAllowed:   true,
    reviewRequired:      false,
    minApprovals:        0,
    requiredChecks:      [],
    releaseAllowed:      false,
    deployAllowed:       false,
    deleteProtected:     false,
    forceProtected:      false,
  },
  [BRANCH_TYPE.RELEASE]: {
    directPushAllowed:   false,
    reviewRequired:      true,
    minApprovals:        1,
    requiredChecks:      ['test', 'lint', 'build', 'secret-quick-scan', 'quality-gate', 'release-readiness'],
    releaseAllowed:      true,
    deployAllowed:       true,
    deleteProtected:     true,
    forceProtected:      true,
  },
  [BRANCH_TYPE.DOCS]: {
    directPushAllowed:   true,
    reviewRequired:      false,
    minApprovals:        0,
    requiredChecks:      ['lint'],
    releaseAllowed:      false,
    deployAllowed:       false,
    deleteProtected:     false,
    forceProtected:      false,
  },
};

function detectBranchType(branchName) {
  if (branchName === 'main' || branchName === 'master') return BRANCH_TYPE.MAIN;
  if (branchName.startsWith('feature/'))   return BRANCH_TYPE.FEATURE;
  if (branchName.startsWith('release/'))   return BRANCH_TYPE.RELEASE;
  if (branchName.startsWith('hotfix/'))    return BRANCH_TYPE.HOTFIX;
  if (branchName.startsWith('docs/'))      return BRANCH_TYPE.DOCS;
  return BRANCH_TYPE.FEATURE;
}

/**
 * Get the recommended policy for a branch.
 */
export function getBranchPolicy(branchName, overrides = {}) {
  if (!branchName) return { valid: false, error: 'branchName required' };

  const type   = detectBranchType(branchName);
  const base   = DEFAULT_POLICIES[type] ?? DEFAULT_POLICIES[BRANCH_TYPE.FEATURE];
  const policy = { ...base, ...overrides, branchName, type };

  return { valid: true, policy: Object.freeze(policy) };
}

/**
 * Check if a proposed action is allowed by the branch policy.
 */
export function checkPolicyCompliance(branchName, action, context = {}) {
  const { policy } = getBranchPolicy(branchName);
  if (!policy) return { valid: false, error: 'unknown branch' };

  const violations = [];

  if (action === 'direct_push' && !policy.directPushAllowed) {
    violations.push({ rule: 'direct_push_not_allowed', severity: 'CRITICAL', message: `Direct push to ${branchName} is prohibited` });
  }
  if (action === 'deploy' && !policy.deployAllowed) {
    violations.push({ rule: 'deploy_not_allowed', severity: 'HIGH', message: `Deploy from ${branchName} is not permitted` });
  }
  if (action === 'force_push' && policy.forceProtected) {
    violations.push({ rule: 'force_push_protected', severity: 'CRITICAL', message: `Force push to ${branchName} is prohibited` });
  }
  if (action === 'release' && !policy.releaseAllowed) {
    violations.push({ rule: 'release_not_allowed', severity: 'HIGH', message: `Release from ${branchName} is not permitted` });
  }
  if (action === 'merge' && policy.reviewRequired && !(context.approved)) {
    violations.push({ rule: 'review_required', severity: 'HIGH', message: `Merge to ${branchName} requires ${policy.minApprovals} review(s)` });
  }

  const passedChecks  = (context.passedChecks ?? []);
  const missingChecks = policy.requiredChecks.filter(c => !passedChecks.includes(c));
  if (action === 'merge' && missingChecks.length > 0) {
    violations.push({ rule: 'required_checks_missing', severity: 'HIGH', message: `Missing required checks: ${missingChecks.join(', ')}` });
  }

  const status = violations.length === 0 ? POLICY_STATUS.COMPLIANT : POLICY_STATUS.VIOLATION;

  return {
    valid:      true,
    status,
    compliant:  violations.length === 0,
    violations,
    policy,
    disclaimer: 'Branch protection rules must also be configured in GitHub repository settings.',
  };
}

/**
 * Generate GitHub branch protection recommendation (not applied automatically).
 */
export function generateProtectionRecommendation(branchName) {
  const { policy } = getBranchPolicy(branchName);
  if (!policy) return null;

  return Object.freeze({
    branch:         branchName,
    type:           policy.type,
    recommendation: {
      required_status_checks:   { strict: true, contexts: policy.requiredChecks },
      enforce_admins:           policy.type === BRANCH_TYPE.MAIN,
      required_pull_request_reviews: policy.reviewRequired ? { required_approving_review_count: policy.minApprovals } : null,
      restrictions:             null,
      allow_force_pushes:       !policy.forceProtected,
      allow_deletions:          !policy.deleteProtected,
    },
    disclaimer: 'Apply via: gh api repos/{owner}/{repo}/branches/{branch}/protection — requires admin permissions.',
  });
}

export const BRANCH_POLICY_VERSION = '1.0.0';
