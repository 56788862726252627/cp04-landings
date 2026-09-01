// Loading State QA — ADV-06
// Validates loading state UI patterns in factory SaaS apps.

export const LOADING_PATTERN = Object.freeze({
  SKELETON:   'SKELETON',
  SPINNER:    'SPINNER',
  PROGRESS:   'PROGRESS',
  PLACEHOLDER:'PLACEHOLDER',
  BLUR:       'BLUR',
  NONE:       'NONE',
});

export const LOADING_QA_STATUS = Object.freeze({
  PASS: 'PASS',
  WARN: 'WARN',
  FAIL: 'FAIL',
});

export const LOADING_ISSUE = Object.freeze({
  NO_LOADING_INDICATOR: 'NO_LOADING_INDICATOR',
  LOADING_TOO_LONG:     'LOADING_TOO_LONG',
  LAYOUT_SHIFT:         'LAYOUT_SHIFT',
  FLASH_INCOMPLETE:     'FLASH_INCOMPLETE',
  NO_TIMEOUT_HANDLING:  'NO_TIMEOUT_HANDLING',
});

export function createLoadingDefinition(params = {}) {
  const { id, pattern, selector, maxDurationMs = 3000, hasTimeout = false } = params;
  if (!id)      return { valid: false, error: 'id required' };
  if (!pattern || !LOADING_PATTERN[pattern]) return { valid: false, error: `invalid pattern: ${pattern}` };
  if (!selector) return { valid: false, error: 'selector required' };

  return Object.freeze({
    valid: true, id, pattern, selector, maxDurationMs, hasTimeout, isReal: false,
  });
}

export function evaluateLoadingState(definition = {}, snapshot = {}) {
  if (!definition.valid) return { valid: false, error: 'invalid definition' };

  const issues = [];
  if (definition.pattern !== LOADING_PATTERN.NONE && !snapshot.indicatorPresent) {
    issues.push({ type: LOADING_ISSUE.NO_LOADING_INDICATOR, severity: 'BLOCKING' });
  }
  if (snapshot.durationMs > definition.maxDurationMs) {
    issues.push({ type: LOADING_ISSUE.LOADING_TOO_LONG, severity: 'WARNING', durationMs: snapshot.durationMs });
  }
  if (snapshot.cls > 0.1) {
    issues.push({ type: LOADING_ISSUE.LAYOUT_SHIFT, severity: 'WARNING', cls: snapshot.cls });
  }
  if (!definition.hasTimeout && snapshot.canHangIndefinitely) {
    issues.push({ type: LOADING_ISSUE.NO_TIMEOUT_HANDLING, severity: 'WARNING' });
  }

  const blocking = issues.filter(i => i.severity === 'BLOCKING');
  const status   = blocking.length > 0 ? LOADING_QA_STATUS.FAIL
    : issues.length > 0                ? LOADING_QA_STATUS.WARN
    : LOADING_QA_STATUS.PASS;

  return Object.freeze({
    valid:       true,
    id:          definition.id,
    status,
    issueCount:  issues.length,
    blocking:    blocking.length,
    issues,
    isReal:      false,
  });
}

export function checkPageLoadTime(timingMs = 0) {
  const status = timingMs < 2000  ? 'GOOD'
    : timingMs < 3000             ? 'ACCEPTABLE'
    : timingMs < 6000             ? 'SLOW'
    : 'CRITICAL';
  return { valid: true, timingMs, status, blocking: status === 'CRITICAL', isReal: false };
}

export const LOADING_STATE_QA_VERSION = '1.0.0';
