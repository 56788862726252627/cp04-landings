// Visual QA Foundation — PASO G
// Plans and records visual QA. Playwright execution blocked without browser runtime.

export const BREAKPOINTS = Object.freeze({
  MOBILE:  390,
  TABLET:  768,
  DESKTOP: 1440,
});

export const VISUAL_QA_STATUS = Object.freeze({
  PASS:         'PASS',
  FAIL:         'FAIL',
  WARNING:      'WARNING',
  NOT_EXECUTED: 'NOT_EXECUTED',
  BLOCKED:      'BLOCKED',
});

export const VISUAL_SCREENS = [
  { id: 'VS-01', name: 'Landing / home',        path: '/',           critical: true },
  { id: 'VS-02', name: 'Login',                 path: '/login',      critical: true },
  { id: 'VS-03', name: 'Dashboard (auth)',      path: '/dashboard',  critical: true },
  { id: 'VS-04', name: 'Primary module 1',      path: null,          critical: false },
  { id: 'VS-05', name: 'Primary module 2',      path: null,          critical: false },
  { id: 'VS-06', name: '404 / error state',     path: '/not-found',  critical: false },
];

const VISUAL_CHECKS = [
  { id: 'VC-01', name: 'No horizontal overflow',      critical: true  },
  { id: 'VC-02', name: 'No clipped content',          critical: true  },
  { id: 'VC-03', name: 'No hidden critical controls', critical: true  },
  { id: 'VC-04', name: 'Touch targets ≥ 44px',        critical: false },
  { id: 'VC-05', name: 'No broken layout',            critical: true  },
  { id: 'VC-06', name: 'No blank/white screen',       critical: true  },
  { id: 'VC-07', name: 'No loading deadlock',         critical: true  },
  { id: 'VC-08', name: 'Modal usability on mobile',   critical: false },
];

/**
 * Build the visual QA plan (screen × breakpoint matrix).
 * Does not execute — reports what needs to be tested.
 */
export function buildVisualQAPlan(options = {}) {
  const screenPaths = options.screenPaths ?? {};
  const screens = VISUAL_SCREENS.map(s => ({
    ...s,
    path: screenPaths[s.id] ?? s.path,
  }));

  const plan = [];
  for (const screen of screens) {
    for (const [bpName, bpWidth] of Object.entries(BREAKPOINTS)) {
      plan.push({
        screenId:   screen.id,
        screenName: screen.name,
        path:       screen.path,
        breakpoint: bpName,
        width:      bpWidth,
        checks:     VISUAL_CHECKS.map(c => ({ ...c, status: VISUAL_QA_STATUS.NOT_EXECUTED })),
      });
    }
  }

  return {
    valid:        true,
    planId:       `VQA-${Date.now()}`,
    totalEntries: plan.length,
    screens:      screens.length,
    breakpoints:  Object.keys(BREAKPOINTS).length,
    checks:       VISUAL_CHECKS.length,
    plan,
    browserRequired: true,
    disclaimer:   'Visual QA plan requires Playwright or browser runtime. NOT_EXECUTED in Paso G.',
  };
}

/**
 * Record visual QA results from fixture data (Paso G — no real browser).
 */
export function recordVisualQAResults(results = []) {
  if (!Array.isArray(results)) return { valid: false, error: 'results must be array' };

  const critical = results.filter(r =>
    VISUAL_CHECKS.find(c => c.id === r.checkId)?.critical && r.status === VISUAL_QA_STATUS.FAIL
  );

  const passed = results.filter(r => r.status === VISUAL_QA_STATUS.PASS).length;
  const score  = results.length > 0 ? Math.round((passed / results.length) * 100) : 0;

  return {
    valid:   true,
    status:  critical.length > 0 ? VISUAL_QA_STATUS.FAIL : VISUAL_QA_STATUS.PASS,
    total:   results.length,
    passed,
    failed:  results.filter(r => r.status === VISUAL_QA_STATUS.FAIL).length,
    score,
    criticalFailed: critical.length,
    results,
  };
}

export const VISUAL_QA_VERSION = '1.0.0';
