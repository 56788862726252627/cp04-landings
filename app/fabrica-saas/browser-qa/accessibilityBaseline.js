// Accessibility Baseline — ADV-06
// WCAG 2.1 AA baseline checks for factory SaaS browser QA.

export const A11Y_CHECK = Object.freeze({
  LANG_ATTR:        'LANG_ATTR',
  IMG_ALT:          'IMG_ALT',
  BUTTON_LABEL:     'BUTTON_LABEL',
  LINK_TEXT:        'LINK_TEXT',
  FORM_LABELS:      'FORM_LABELS',
  COLOR_CONTRAST:   'COLOR_CONTRAST',
  SKIP_LINK:        'SKIP_LINK',
  FOCUS_VISIBLE:    'FOCUS_VISIBLE',
  HEADING_ORDER:    'HEADING_ORDER',
  LANDMARK_ROLES:   'LANDMARK_ROLES',
  ARIA_VALID:       'ARIA_VALID',
  ZOOM_SUPPORT:     'ZOOM_SUPPORT',
});

export const A11Y_SEVERITY = Object.freeze({
  CRITICAL: 'CRITICAL',
  SERIOUS:  'SERIOUS',
  MODERATE: 'MODERATE',
  MINOR:    'MINOR',
});

export const A11Y_WCAG_LEVEL = Object.freeze({
  A:   'A',
  AA:  'AA',
  AAA: 'AAA',
});

const CHECK_METADATA = {
  [A11Y_CHECK.LANG_ATTR]:      { severity: A11Y_SEVERITY.CRITICAL, level: A11Y_WCAG_LEVEL.A,  rule: '3.1.1' },
  [A11Y_CHECK.IMG_ALT]:        { severity: A11Y_SEVERITY.CRITICAL, level: A11Y_WCAG_LEVEL.A,  rule: '1.1.1' },
  [A11Y_CHECK.BUTTON_LABEL]:   { severity: A11Y_SEVERITY.SERIOUS,  level: A11Y_WCAG_LEVEL.A,  rule: '4.1.2' },
  [A11Y_CHECK.LINK_TEXT]:      { severity: A11Y_SEVERITY.SERIOUS,  level: A11Y_WCAG_LEVEL.A,  rule: '2.4.4' },
  [A11Y_CHECK.FORM_LABELS]:    { severity: A11Y_SEVERITY.CRITICAL, level: A11Y_WCAG_LEVEL.A,  rule: '1.3.1' },
  [A11Y_CHECK.COLOR_CONTRAST]: { severity: A11Y_SEVERITY.SERIOUS,  level: A11Y_WCAG_LEVEL.AA, rule: '1.4.3' },
  [A11Y_CHECK.SKIP_LINK]:      { severity: A11Y_SEVERITY.MODERATE, level: A11Y_WCAG_LEVEL.A,  rule: '2.4.1' },
  [A11Y_CHECK.FOCUS_VISIBLE]:  { severity: A11Y_SEVERITY.SERIOUS,  level: A11Y_WCAG_LEVEL.AA, rule: '2.4.11' },
  [A11Y_CHECK.HEADING_ORDER]:  { severity: A11Y_SEVERITY.MODERATE, level: A11Y_WCAG_LEVEL.A,  rule: '1.3.1' },
  [A11Y_CHECK.LANDMARK_ROLES]: { severity: A11Y_SEVERITY.MODERATE, level: A11Y_WCAG_LEVEL.A,  rule: '1.3.6' },
  [A11Y_CHECK.ARIA_VALID]:     { severity: A11Y_SEVERITY.SERIOUS,  level: A11Y_WCAG_LEVEL.A,  rule: '4.1.2' },
  [A11Y_CHECK.ZOOM_SUPPORT]:   { severity: A11Y_SEVERITY.SERIOUS,  level: A11Y_WCAG_LEVEL.AA, rule: '1.4.4' },
};

export function buildA11yChecklist(level = A11Y_WCAG_LEVEL.AA) {
  const levelOrder = { A: 1, AA: 2, AAA: 3 };
  const targetLevel = levelOrder[level] ?? 2;
  const checks = Object.entries(CHECK_METADATA)
    .filter(([, meta]) => levelOrder[meta.level] <= targetLevel)
    .map(([id, meta]) => ({ id, ...meta, passed: null }));
  return { valid: true, level, checks, count: checks.length, isReal: false };
}

export function evaluateA11yChecklist(checklist = {}, results = {}) {
  if (!checklist.valid) return { valid: false, error: 'invalid checklist' };

  const evaluated = checklist.checks.map(c => ({
    ...c,
    passed: results[c.id] ?? true,
  }));

  const failed   = evaluated.filter(c => !c.passed);
  const critical = failed.filter(c => c.severity === A11Y_SEVERITY.CRITICAL);
  const serious  = failed.filter(c => c.severity === A11Y_SEVERITY.SERIOUS);

  const blocking = [...critical, ...serious];
  const status   = critical.length > 0 ? 'FAIL'
    : serious.length > 0               ? 'FAIL'
    : failed.length > 0                ? 'WARN'
    : 'PASS';

  return Object.freeze({
    valid:         true,
    status,
    level:         checklist.level,
    totalChecks:   evaluated.length,
    passed:        evaluated.filter(c => c.passed).length,
    failed:        failed.length,
    criticalCount: critical.length,
    seriousCount:  serious.length,
    blocking:      blocking.length,
    results:       evaluated,
    isReal:        false,
  });
}

export const ACCESSIBILITY_BASELINE_VERSION = '1.0.0';
