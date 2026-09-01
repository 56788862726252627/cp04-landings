// Smart E2E Selector — ADV-06
// Connects to ADV-05 ChangeImpactAnalyzer to select only affected E2E tests.

export const E2E_SELECTION_REASON = Object.freeze({
  FILE_CHANGED:       'FILE_CHANGED',
  DEPENDENCY_CHANGED: 'DEPENDENCY_CHANGED',
  FORCE_ALL:          'FORCE_ALL',
  ROUTE_CHANGED:      'ROUTE_CHANGED',
  STYLE_CHANGED:      'STYLE_CHANGED',
  AUTH_CHANGED:       'AUTH_CHANGED',
  ALWAYS_RUN:         'ALWAYS_RUN',
});

export const E2E_SELECTION_STRATEGY = Object.freeze({
  TARGETED:  'TARGETED',
  EXPANDED:  'EXPANDED',
  FULL_SUITE:'FULL_SUITE',
});

const ALWAYS_RUN_TESTS = ['SMOKE', 'RENDER', 'CONSOLE'];

const FILE_TO_TEST_MAP = {
  '.jsx':         ['RENDER', 'CONTROLS', 'RESPONSIVE', 'CRITICAL_FLOWS'],
  '.css':         ['VISUAL', 'RESPONSIVE', 'SCREENSHOTS'],
  'router':       ['ROUTES', 'CRITICAL_FLOWS'],
  'auth':         ['AUTH_SURFACE', 'ROLE_SURFACE'],
  'form':         ['FORMS', 'CRITICAL_FLOWS'],
  'nav':          ['MOBILE_NAV', 'KEYBOARD', 'ROUTES'],
  'a11y':         ['ACCESSIBILITY', 'KEYBOARD'],
  'worker':       ['NETWORK', 'CONSOLE'],
};

export function selectE2ETests(changedFiles = [], allTests = [], options = {}) {
  const { forceAll = false, riskLevel = 'LOW' } = options;

  if (forceAll || riskLevel === 'CRITICAL') {
    return Object.freeze({
      valid:     true,
      strategy:  E2E_SELECTION_STRATEGY.FULL_SUITE,
      selected:  allTests,
      reason:    E2E_SELECTION_REASON.FORCE_ALL,
      count:     allTests.length,
      isReal:    false,
    });
  }

  const selectedIds = new Set(ALWAYS_RUN_TESTS);

  for (const file of changedFiles) {
    for (const [pattern, tests] of Object.entries(FILE_TO_TEST_MAP)) {
      if (file.includes(pattern)) tests.forEach(t => selectedIds.add(t));
    }
  }

  const selected = allTests.filter(t => selectedIds.has(t.id ?? t.type ?? t));
  const strategy = selected.length >= allTests.length * 0.8
    ? E2E_SELECTION_STRATEGY.FULL_SUITE
    : selected.length > ALWAYS_RUN_TESTS.length
    ? E2E_SELECTION_STRATEGY.EXPANDED
    : E2E_SELECTION_STRATEGY.TARGETED;

  return Object.freeze({
    valid:    true,
    strategy,
    selected,
    skipped:  allTests.filter(t => !selectedIds.has(t.id ?? t.type ?? t)),
    reason:   E2E_SELECTION_REASON.FILE_CHANGED,
    count:    selected.length,
    savedTests: allTests.length - selected.length,
    isReal:   false,
  });
}

export function estimateE2ESavings(selection = {}) {
  if (!selection.valid) return { valid: false, error: 'invalid selection' };
  const avgTestSeconds = 15;
  const saved = (selection.savedTests ?? 0) * avgTestSeconds;
  return Object.freeze({
    valid:         true,
    savedTests:    selection.savedTests ?? 0,
    savedSeconds:  saved,
    savedMinutes:  Math.ceil(saved / 60),
    strategy:      selection.strategy,
    isReal:        false,
  });
}

export const SMART_E2E_SELECTOR_VERSION = '1.0.0';
