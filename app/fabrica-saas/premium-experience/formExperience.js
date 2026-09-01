// Premium Form Experience — ADV-07

export const FORM_PATTERN = Object.freeze({
  STANDARD:          'STANDARD',
  PROGRESSIVE:       'PROGRESSIVE',
  STRUCTURED:        'STRUCTURED',
  MINIMAL_STEPS:     'MINIMAL_STEPS',
  WIZARD:            'WIZARD',
  INLINE:            'INLINE',
});

export const FORM_ISSUE = Object.freeze({
  NO_LABELS:          'NO_LABELS',
  MISSING_CTA:        'MISSING_CTA',
  TOO_MANY_FIELDS:    'TOO_MANY_FIELDS',
  MISSING_HELPER:     'MISSING_HELPER',
  MISSING_ERROR:      'MISSING_ERROR',
  MISSING_SUCCESS:    'MISSING_SUCCESS',
  MOBILE_KEYBOARD:    'MOBILE_KEYBOARD',
});

const PATTERN_SPECS = Object.freeze({
  STANDARD:      { maxFieldsPerStep: 8,  steps: 1,   useProgressBar: false, useHelperText: true },
  PROGRESSIVE:   { maxFieldsPerStep: 4,  steps: 2,   useProgressBar: true,  useHelperText: true },
  STRUCTURED:    { maxFieldsPerStep: 12, steps: 1,   useProgressBar: false, useHelperText: true  },
  MINIMAL_STEPS: { maxFieldsPerStep: 3,  steps: 3,   useProgressBar: true,  useHelperText: false },
  WIZARD:        { maxFieldsPerStep: 4,  steps: 5,   useProgressBar: true,  useHelperText: true },
  INLINE:        { maxFieldsPerStep: 2,  steps: 1,   useProgressBar: false, useHelperText: false },
});

export function createFormExperience(options = {}) {
  const {
    pattern    = FORM_PATTERN.STANDARD,
    fields     = [],
    submitLabel = 'Enviar',
  } = options;

  const spec = PATTERN_SPECS[pattern] ?? PATTERN_SPECS.STANDARD;
  const steps = Math.ceil(fields.length / spec.maxFieldsPerStep);
  const useWizard = steps > 1 && pattern !== FORM_PATTERN.STRUCTURED;

  return Object.freeze({
    pattern,
    fieldCount:      fields.length,
    steps:           Math.max(steps, 1),
    useWizard,
    useProgressBar:  spec.useProgressBar && steps > 1,
    useHelperText:   spec.useHelperText,
    submitLabel,
    hasSuccess:      true,
    hasError:        true,
    hasLoading:      true,
    mobileKeyboard:  true,
    isReal:          false,
  });
}

export function evaluateFormQuality(form = {}) {
  const issues = [];
  if (!form.fields?.every?.(f => f.label)) issues.push({ type: FORM_ISSUE.NO_LABELS });
  if (!form.submitLabel) issues.push({ type: FORM_ISSUE.MISSING_CTA });
  if ((form.fields?.length ?? 0) > 12) issues.push({ type: FORM_ISSUE.TOO_MANY_FIELDS, count: form.fields.length });
  if (!form.hasError) issues.push({ type: FORM_ISSUE.MISSING_ERROR });
  if (!form.hasSuccess) issues.push({ type: FORM_ISSUE.MISSING_SUCCESS });

  const score = Math.max(0, 100 - issues.length * 15);
  return Object.freeze({ score, issues, valid: issues.length === 0, isReal: false });
}

export const FORM_EXPERIENCE_VERSION = '1.0.0';
