// E2E Test Definition — ADV-06
// Defines shapes and types for browser E2E tests in the factory.

export const E2E_TEST_TYPE = Object.freeze({
  SMOKE:        'SMOKE',
  FUNCTIONAL:   'FUNCTIONAL',
  REGRESSION:   'REGRESSION',
  VISUAL:       'VISUAL',
  ACCESSIBILITY:'ACCESSIBILITY',
  PERFORMANCE:  'PERFORMANCE',
  SECURITY:     'SECURITY',
});

export const E2E_TEST_STATUS = Object.freeze({
  PENDING:  'PENDING',
  RUNNING:  'RUNNING',
  PASSED:   'PASSED',
  FAILED:   'FAILED',
  SKIPPED:  'SKIPPED',
  FLAKY:    'FLAKY',
});

export const E2E_PRIORITY = Object.freeze({
  P0: 'P0',
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
});

export function createE2ETest(params = {}) {
  const { id, name, type, priority = E2E_PRIORITY.P1, route, steps = [], tags = [] } = params;
  if (!id)    return { valid: false, error: 'id required' };
  if (!name)  return { valid: false, error: 'name required' };
  if (!type || !E2E_TEST_TYPE[type]) return { valid: false, error: `invalid type: ${type}` };
  if (!route) return { valid: false, error: 'route required' };
  if (steps.length === 0) return { valid: false, error: 'at least one step required' };

  return Object.freeze({
    valid:     true,
    id,
    name,
    type,
    priority,
    route,
    steps,
    tags,
    status:    E2E_TEST_STATUS.PENDING,
    isReal:    false,
  });
}

export function createE2EStep(action, selector, value = null) {
  const VALID_ACTIONS = ['navigate', 'click', 'fill', 'assert', 'wait', 'screenshot', 'scroll'];
  if (!VALID_ACTIONS.includes(action)) {
    return { valid: false, error: `unknown action: ${action}` };
  }
  return Object.freeze({ valid: true, action, selector, value, isReal: false });
}

export function groupTestsByPriority(tests = []) {
  const groups = { P0: [], P1: [], P2: [], P3: [] };
  for (const t of tests) {
    if (t.valid && groups[t.priority]) groups[t.priority].push(t);
  }
  return { valid: true, groups, totalCount: tests.filter(t => t.valid).length, isReal: false };
}

export function buildSmokeTestSuite(routes = []) {
  if (!Array.isArray(routes) || routes.length === 0) {
    return { valid: false, error: 'routes array required' };
  }
  const tests = routes.map((route, i) => createE2ETest({
    id:       `SMOKE-${i + 1}`,
    name:     `Smoke test: ${route}`,
    type:     E2E_TEST_TYPE.SMOKE,
    priority: E2E_PRIORITY.P0,
    route,
    steps:    [
      createE2EStep('navigate', route),
      createE2EStep('assert', 'body', 'visible'),
    ],
    tags: ['smoke', 'auto'],
  }));
  return { valid: true, tests, count: tests.length, isReal: false };
}

export const E2E_TEST_DEFINITION_VERSION = '1.0.0';
