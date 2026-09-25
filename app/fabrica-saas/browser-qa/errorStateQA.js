// Error State QA — ADV-06
// Validates error state UI patterns (network errors, form errors, 404 pages, etc.).

export const ERROR_STATE_TYPE = Object.freeze({
  NOT_FOUND:      'NOT_FOUND',
  SERVER_ERROR:   'SERVER_ERROR',
  NETWORK_ERROR:  'NETWORK_ERROR',
  FORM_INVALID:   'FORM_INVALID',
  PERMISSION:     'PERMISSION',
  SESSION_EXPIRED:'SESSION_EXPIRED',
  RATE_LIMIT:     'RATE_LIMIT',
  GENERIC:        'GENERIC',
});

export const ERROR_QA_STATUS = Object.freeze({
  PASS: 'PASS',
  WARN: 'WARN',
  FAIL: 'FAIL',
});

export const ERROR_STATE_ISSUE = Object.freeze({
  NO_ERROR_MESSAGE:    'NO_ERROR_MESSAGE',
  NO_RECOVERY_ACTION:  'NO_RECOVERY_ACTION',
  TECHNICAL_JARGON:    'TECHNICAL_JARGON',
  BROKEN_LAYOUT:       'BROKEN_LAYOUT',
  MISSING_BACK_LINK:   'MISSING_BACK_LINK',
  EXPOSES_STACK_TRACE: 'EXPOSES_STACK_TRACE',
});

export function createErrorStateDefinition(params = {}) {
  const { id, type, selector, hasMessage = true, hasRecovery = true, hasBackLink = true } = params;
  if (!id)   return { valid: false, error: 'id required' };
  if (!type || !ERROR_STATE_TYPE[type]) return { valid: false, error: `invalid type: ${type}` };

  return Object.freeze({
    valid: true, id, type, selector: selector ?? '[data-error], .error-state, .error-page',
    hasMessage, hasRecovery, hasBackLink, isReal: false,
  });
}

export function evaluateErrorState(definition = {}, snapshot = {}) {
  if (!definition.valid) return { valid: false, error: 'invalid definition' };

  const issues = [];
  if (definition.hasMessage && !snapshot.messageVisible) {
    issues.push({ type: ERROR_STATE_ISSUE.NO_ERROR_MESSAGE, severity: 'BLOCKING' });
  }
  if (definition.hasRecovery && !snapshot.recoveryActionVisible) {
    issues.push({ type: ERROR_STATE_ISSUE.NO_RECOVERY_ACTION, severity: 'WARNING' });
  }
  if (definition.hasBackLink && !snapshot.backLinkVisible) {
    issues.push({ type: ERROR_STATE_ISSUE.MISSING_BACK_LINK, severity: 'WARNING' });
  }
  if (snapshot.stackTraceVisible) {
    issues.push({ type: ERROR_STATE_ISSUE.EXPOSES_STACK_TRACE, severity: 'BLOCKING' });
  }
  if (snapshot.layoutBroken) {
    issues.push({ type: ERROR_STATE_ISSUE.BROKEN_LAYOUT, severity: 'BLOCKING' });
  }

  const blocking = issues.filter(i => i.severity === 'BLOCKING');
  const status   = blocking.length > 0 ? ERROR_QA_STATUS.FAIL
    : issues.length > 0                ? ERROR_QA_STATUS.WARN
    : ERROR_QA_STATUS.PASS;

  return Object.freeze({
    valid:       true,
    errorId:     definition.id,
    errorType:   definition.type,
    status,
    issueCount:  issues.length,
    blocking:    blocking.length,
    issues,
    isReal:      false,
  });
}

export function buildDefaultErrorStates() {
  return [
    createErrorStateDefinition({ id: 'ERR-404', type: ERROR_STATE_TYPE.NOT_FOUND, hasMessage: true, hasRecovery: true }),
    createErrorStateDefinition({ id: 'ERR-NET', type: ERROR_STATE_TYPE.NETWORK_ERROR, hasMessage: true, hasRecovery: true }),
    createErrorStateDefinition({ id: 'ERR-FORM', type: ERROR_STATE_TYPE.FORM_INVALID, hasMessage: true, hasRecovery: false }),
  ];
}

export const ERROR_STATE_QA_VERSION = '1.0.0';
