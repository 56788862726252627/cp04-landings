// Keyboard QA — ADV-06
// Evaluates keyboard navigation quality in browser QA.

export const KEYBOARD_CHECK = Object.freeze({
  TAB_ORDER_LOGICAL:    'TAB_ORDER_LOGICAL',
  FOCUS_NOT_TRAPPED:    'FOCUS_NOT_TRAPPED',
  FOCUS_VISIBLE:        'FOCUS_VISIBLE',
  ENTER_ACTIVATES:      'ENTER_ACTIVATES',
  SPACE_ACTIVATES:      'SPACE_ACTIVATES',
  ESCAPE_CLOSES_MODAL:  'ESCAPE_CLOSES_MODAL',
  ARROW_NAV_MENU:       'ARROW_NAV_MENU',
  SKIP_LINK_WORKS:      'SKIP_LINK_WORKS',
  NO_KEYBOARD_TRAP:     'NO_KEYBOARD_TRAP',
});

export const KEYBOARD_QA_STATUS = Object.freeze({
  PASS: 'PASS',
  WARN: 'WARN',
  FAIL: 'FAIL',
});

const CHECK_SEVERITY = {
  [KEYBOARD_CHECK.TAB_ORDER_LOGICAL]:   'SERIOUS',
  [KEYBOARD_CHECK.FOCUS_NOT_TRAPPED]:   'CRITICAL',
  [KEYBOARD_CHECK.FOCUS_VISIBLE]:       'SERIOUS',
  [KEYBOARD_CHECK.ENTER_ACTIVATES]:     'SERIOUS',
  [KEYBOARD_CHECK.SPACE_ACTIVATES]:     'MODERATE',
  [KEYBOARD_CHECK.ESCAPE_CLOSES_MODAL]: 'SERIOUS',
  [KEYBOARD_CHECK.ARROW_NAV_MENU]:      'MODERATE',
  [KEYBOARD_CHECK.SKIP_LINK_WORKS]:     'MODERATE',
  [KEYBOARD_CHECK.NO_KEYBOARD_TRAP]:    'CRITICAL',
};

export function buildKeyboardTestPlan(options = {}) {
  const { hasModal = false, hasMenu = false, hasSkipLink = true } = options;
  const checks = [
    KEYBOARD_CHECK.TAB_ORDER_LOGICAL,
    KEYBOARD_CHECK.FOCUS_VISIBLE,
    KEYBOARD_CHECK.ENTER_ACTIVATES,
    KEYBOARD_CHECK.NO_KEYBOARD_TRAP,
  ];
  if (hasModal)    checks.push(KEYBOARD_CHECK.ESCAPE_CLOSES_MODAL);
  if (hasMenu)     checks.push(KEYBOARD_CHECK.ARROW_NAV_MENU);
  if (hasSkipLink) checks.push(KEYBOARD_CHECK.SKIP_LINK_WORKS);

  return Object.freeze({
    valid:  true,
    checks,
    count:  checks.length,
    isReal: false,
  });
}

export function evaluateKeyboardChecks(plan = {}, results = {}) {
  if (!plan.valid) return { valid: false, error: 'invalid plan' };

  const evaluated = plan.checks.map(id => ({
    id,
    severity: CHECK_SEVERITY[id] ?? 'MODERATE',
    passed:   results[id] ?? true,
  }));

  const failed   = evaluated.filter(c => !c.passed);
  const critical = failed.filter(c => c.severity === 'CRITICAL');
  const serious  = failed.filter(c => c.severity === 'SERIOUS');

  const status = (critical.length + serious.length) > 0 ? KEYBOARD_QA_STATUS.FAIL
    : failed.length > 0                                  ? KEYBOARD_QA_STATUS.WARN
    : KEYBOARD_QA_STATUS.PASS;

  return Object.freeze({
    valid:    true,
    status,
    total:    evaluated.length,
    passed:   evaluated.filter(c => c.passed).length,
    failed:   failed.length,
    critical: critical.length,
    results:  evaluated,
    isReal:   false,
  });
}

export const KEYBOARD_QA_VERSION = '1.0.0';
