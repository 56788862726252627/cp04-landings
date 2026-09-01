// Human Interruption Policy — ADV-05
// Decides whether to interrupt the human or proceed autonomously.

export const INTERRUPTION_REASON = Object.freeze({
  OAUTH_REQUIRED:      'OAUTH_REQUIRED',
  BILLING_REQUIRED:    'BILLING_REQUIRED',
  SECRET_NEW:          'SECRET_NEW',
  DESTRUCTIVE_ACTION:  'DESTRUCTIVE_ACTION',
  EXTERNAL_PERMISSION: 'EXTERNAL_PERMISSION',
  UNKNOWN_ERROR:       'UNKNOWN_ERROR',
  REAL_DEPLOY:         'REAL_DEPLOY',
});

export const INTERRUPTION_DECISION = Object.freeze({
  PROCEED_AUTO: 'PROCEED_AUTO',
  INTERRUPT:    'INTERRUPT',
});

const NEVER_INTERRUPT_FOR = [
  'run_tests', 'run_lint', 'run_build',
  'read_file', 'list_files', 'search_code',
  'check_git_status', 'check_git_diff', 'check_git_log',
  'create_file_in_scope', 'edit_file_in_scope',
  'commit_in_scope', 'push_feature_branch',
  'create_pr_with_authorization',
];

const ALWAYS_INTERRUPT_FOR = [
  'oauth', 'mfa', 'new_secret', 'billing', 'payment',
  'real_deploy', 'dns_change', 'destructive_delete',
  'outbound_communication', 'advertising_spend',
];

export function evaluateInterruption(action = '') {
  if (!action) return { valid: false, error: 'action required' };
  const a = action.toLowerCase().replace(/[\s-]/g, '_');

  if (ALWAYS_INTERRUPT_FOR.some(k => a.includes(k))) {
    const reason = ALWAYS_INTERRUPT_FOR.find(k => a.includes(k));
    return {
      valid:    true,
      decision: INTERRUPTION_DECISION.INTERRUPT,
      reason:   INTERRUPTION_REASON.OAUTH_REQUIRED,
      message:  `Human required for: ${reason}`,
      isReal:   false,
    };
  }

  if (NEVER_INTERRUPT_FOR.some(k => a.includes(k))) {
    return {
      valid:    true,
      decision: INTERRUPTION_DECISION.PROCEED_AUTO,
      message:  `Safe to proceed: ${action}`,
      isReal:   false,
    };
  }

  return {
    valid:    true,
    decision: INTERRUPTION_DECISION.PROCEED_AUTO,
    message:  `No interrupt needed for: ${action}`,
    isReal:   false,
  };
}

export function shouldInterrupt(actions = []) {
  const results = actions.map(a => evaluateInterruption(a));
  const required = results.filter(r => r.decision === INTERRUPTION_DECISION.INTERRUPT);
  return {
    shouldInterrupt: required.length > 0,
    requiredFor:     required.map(r => r.message),
    autoActions:     results.filter(r => r.decision === INTERRUPTION_DECISION.PROCEED_AUTO).length,
    isReal:          false,
  };
}

export const HUMAN_INTERRUPTION_POLICY_VERSION = '1.0.0';
