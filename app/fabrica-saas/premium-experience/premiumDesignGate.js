// Premium Design Gate — ADV-07

export const DESIGN_GATE_RESULT = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  BLOCKED: 'BLOCKED',
});

export const BLOCKING_ISSUE = Object.freeze({
  BROKEN_RESPONSIVE:  'BROKEN_RESPONSIVE',
  CRITICAL_OVERLAP:   'CRITICAL_OVERLAP',
  UNUSABLE_FORM:      'UNUSABLE_FORM',
  DEAD_CTA:           'DEAD_CTA',
  MISSING_NAVIGATION: 'MISSING_NAVIGATION',
  CONTRAST_FAIL:      'CONTRAST_FAIL',
  BLANK_STATE:        'BLANK_STATE',
  MOBILE_UNUSABLE:    'MOBILE_UNUSABLE',
});

export function evaluatePremiumDesignGate(report = {}) {
  const blockingIssues = [];
  const warnings       = [];

  if (report.hasHorizontalScroll)     blockingIssues.push(BLOCKING_ISSUE.BROKEN_RESPONSIVE);
  if (report.hasCriticalOverlap)      blockingIssues.push(BLOCKING_ISSUE.CRITICAL_OVERLAP);
  if (report.hasUnusableForm)         blockingIssues.push(BLOCKING_ISSUE.UNUSABLE_FORM);
  if (report.hasDeadCTA)              blockingIssues.push(BLOCKING_ISSUE.DEAD_CTA);
  if (report.missingNavigation)       blockingIssues.push(BLOCKING_ISSUE.MISSING_NAVIGATION);
  if (report.contrastFailCritical)    blockingIssues.push(BLOCKING_ISSUE.CONTRAST_FAIL);
  if (report.hasBlankScreen)          blockingIssues.push(BLOCKING_ISSUE.BLANK_STATE);
  if (report.mobileUnusable)          blockingIssues.push(BLOCKING_ISSUE.MOBILE_UNUSABLE);

  if (report.slowLoading)             warnings.push('slow loading > 3s');
  if (report.lowContrastWarning)      warnings.push('low contrast on secondary text');
  if (report.missingEmptyStates)      warnings.push('missing empty state UI');

  const result = blockingIssues.length > 0 ? DESIGN_GATE_RESULT.BLOCKED
    : warnings.length > 0                   ? DESIGN_GATE_RESULT.WARNING
    : DESIGN_GATE_RESULT.PASS;

  return Object.freeze({
    result,
    blockingIssues,
    warnings,
    blocked:   result === DESIGN_GATE_RESULT.BLOCKED,
    passed:    result === DESIGN_GATE_RESULT.PASS,
    isReal:    false,
  });
}

export const PREMIUM_DESIGN_GATE_VERSION = '1.0.0';
