// Form QA — ADV-06
// Detects and evaluates form quality issues in browser QA.

export const FORM_ISSUE_TYPE = Object.freeze({
  MISSING_LABEL:       'MISSING_LABEL',
  MISSING_PLACEHOLDER: 'MISSING_PLACEHOLDER',
  MISSING_VALIDATION:  'MISSING_VALIDATION',
  SUBMIT_DEAD:         'SUBMIT_DEAD',
  NO_ERROR_STATE:      'NO_ERROR_STATE',
  NO_SUCCESS_STATE:    'NO_SUCCESS_STATE',
  AUTOCOMPLETE_OFF:    'AUTOCOMPLETE_OFF',
  FIELD_TYPE_WRONG:    'FIELD_TYPE_WRONG',
});

export const FORM_QA_STATUS = Object.freeze({
  PASS: 'PASS',
  WARN: 'WARN',
  FAIL: 'FAIL',
});

export function createFormDefinition(params = {}) {
  const { id, name, fields = [], submitSelector, successIndicator, errorIndicator } = params;
  if (!id)   return { valid: false, error: 'id required' };
  if (!name) return { valid: false, error: 'name required' };
  if (fields.length === 0) return { valid: false, error: 'at least one field required' };

  return Object.freeze({
    valid: true, id, name, fields,
    submitSelector: submitSelector ?? 'button[type="submit"], input[type="submit"]',
    successIndicator: successIndicator ?? null,
    errorIndicator:   errorIndicator ?? null,
    isReal: false,
  });
}

export function createFormField(name, type, options = {}) {
  const VALID_TYPES = ['text', 'email', 'tel', 'password', 'number', 'date', 'select', 'textarea', 'checkbox', 'radio'];
  if (!VALID_TYPES.includes(type)) return { valid: false, error: `unknown type: ${type}` };
  return Object.freeze({
    valid:        true,
    name,
    type,
    required:     options.required ?? false,
    selector:     options.selector ?? `[name="${name}"], #${name}`,
    hasLabel:     options.hasLabel ?? true,
    hasPlaceholder: options.hasPlaceholder ?? (type !== 'checkbox' && type !== 'radio'),
    hasValidation:  options.hasValidation ?? options.required,
    autocomplete:   options.autocomplete ?? 'on',
    isReal:         false,
  });
}

export function evaluateFormFields(fields = []) {
  const issues = [];
  for (const f of fields) {
    if (!f.hasLabel)        issues.push({ field: f.name, type: FORM_ISSUE_TYPE.MISSING_LABEL, severity: 'BLOCKING' });
    if (f.hasPlaceholder === false) issues.push({ field: f.name, type: FORM_ISSUE_TYPE.MISSING_PLACEHOLDER, severity: 'WARNING' });
    if (f.required && !f.hasValidation) issues.push({ field: f.name, type: FORM_ISSUE_TYPE.MISSING_VALIDATION, severity: 'WARNING' });
    if (f.autocomplete === 'off' && ['email','password','tel'].includes(f.type)) {
      issues.push({ field: f.name, type: FORM_ISSUE_TYPE.AUTOCOMPLETE_OFF, severity: 'WARNING' });
    }
  }
  return issues;
}

export function evaluateForm(formDef = {}, formSnapshot = {}) {
  if (!formDef.valid) return { valid: false, error: 'invalid form definition' };

  const fieldIssues   = evaluateFormFields(formDef.fields);
  const submitPresent = formSnapshot.submitPresent ?? true;
  const allIssues     = [...fieldIssues];

  if (!submitPresent) allIssues.push({ field: 'submit', type: FORM_ISSUE_TYPE.SUBMIT_DEAD, severity: 'BLOCKING' });
  if (formDef.successIndicator && !formSnapshot.hasSuccessState) {
    allIssues.push({ field: 'form', type: FORM_ISSUE_TYPE.NO_SUCCESS_STATE, severity: 'WARNING' });
  }

  const blocking = allIssues.filter(i => i.severity === 'BLOCKING');
  const status   = blocking.length > 0 ? FORM_QA_STATUS.FAIL
    : allIssues.length > 0             ? FORM_QA_STATUS.WARN
    : FORM_QA_STATUS.PASS;

  return Object.freeze({
    valid:     true,
    formId:    formDef.id,
    status,
    issueCount:allIssues.length,
    blocking:  blocking.length,
    issues:    allIssues,
    isReal:    false,
  });
}

export const FORM_QA_VERSION = '1.0.0';
