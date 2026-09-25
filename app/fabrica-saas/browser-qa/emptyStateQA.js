// Empty State QA — ADV-06
// Validates empty state UI patterns (no data, no results, first-time user, etc.).

export const EMPTY_STATE_TYPE = Object.freeze({
  NO_RESULTS:   'NO_RESULTS',
  NO_DATA:      'NO_DATA',
  FIRST_TIME:   'FIRST_TIME',
  FILTERED_OUT: 'FILTERED_OUT',
  NO_PERMISSION:'NO_PERMISSION',
});

export const EMPTY_QA_STATUS = Object.freeze({
  PASS: 'PASS',
  WARN: 'WARN',
  FAIL: 'FAIL',
});

export const EMPTY_ISSUE = Object.freeze({
  BLANK_CONTAINER:   'BLANK_CONTAINER',
  NO_ILLUSTRATION:   'NO_ILLUSTRATION',
  NO_CTA:            'NO_CTA',
  NO_MESSAGE:        'NO_MESSAGE',
  CONFUSING_WORDING: 'CONFUSING_WORDING',
});

export function createEmptyStateDefinition(params = {}) {
  const { id, type, selector, hasCTA = true, hasIllustration = false, hasMessage = true } = params;
  if (!id)   return { valid: false, error: 'id required' };
  if (!type || !EMPTY_STATE_TYPE[type]) return { valid: false, error: `invalid type: ${type}` };

  return Object.freeze({
    valid: true, id, type,
    selector: selector ?? '[data-empty], .empty-state, .no-results',
    hasCTA, hasIllustration, hasMessage, isReal: false,
  });
}

export function evaluateEmptyState(definition = {}, snapshot = {}) {
  if (!definition.valid) return { valid: false, error: 'invalid definition' };

  const issues = [];
  if (snapshot.containerBlank) {
    issues.push({ type: EMPTY_ISSUE.BLANK_CONTAINER, severity: 'BLOCKING' });
  }
  if (definition.hasMessage && !snapshot.messageVisible) {
    issues.push({ type: EMPTY_ISSUE.NO_MESSAGE, severity: 'BLOCKING' });
  }
  if (definition.hasCTA && !snapshot.ctaVisible) {
    issues.push({ type: EMPTY_ISSUE.NO_CTA, severity: 'WARNING' });
  }
  if (definition.hasIllustration && !snapshot.illustrationVisible) {
    issues.push({ type: EMPTY_ISSUE.NO_ILLUSTRATION, severity: 'WARNING' });
  }

  const blocking = issues.filter(i => i.severity === 'BLOCKING');
  const status   = blocking.length > 0 ? EMPTY_QA_STATUS.FAIL
    : issues.length > 0                ? EMPTY_QA_STATUS.WARN
    : EMPTY_QA_STATUS.PASS;

  return Object.freeze({
    valid:      true,
    id:         definition.id,
    type:       definition.type,
    status,
    issueCount: issues.length,
    blocking:   blocking.length,
    issues,
    isReal:     false,
  });
}

export const EMPTY_STATE_QA_VERSION = '1.0.0';
