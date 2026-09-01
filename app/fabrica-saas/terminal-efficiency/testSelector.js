// Test Selector — ADV-05
// Maps changed files to the minimal set of tests required.

export const TEST_SCOPE = Object.freeze({
  TARGETED: 'TARGETED',
  MODULE:   'MODULE',
  FULL:     'FULL',
});

const MODULE_TEST_MAP = Object.freeze({
  'terminal-efficiency':   'v2-adv05-terminal-efficiency.test.mjs',
  'production-pipeline':   'v2-adv04-production-pipeline.test.mjs',
  'agent-engine':          'v2-adv03-agent-engine.test.mjs',
  'observability':         'v2-adv01-observability.test.mjs',
  'cicd':                  'v2-adv02-cicd.test.mjs',
  'generator':             'v2-generator.test.mjs',
  'factory-registry':      'v2-paso-a-gates.test.mjs',
});

const FULL_SUITE_TRIGGERS = [
  /src\/saas-core\//,
  /factory-registry\//,
  /\/index\.js$/,
  /worker\.js$/,
  /auth/,
];

export function selectAffectedTests(changedFiles = []) {
  if (!Array.isArray(changedFiles)) return { valid: false, error: 'changedFiles must be array' };
  if (changedFiles.length === 0) return { valid: true, scope: TEST_SCOPE.TARGETED, tests: [], reason: 'no changes', isReal: false };

  const needsFull = changedFiles.some(f => FULL_SUITE_TRIGGERS.some(p => p.test(f)));
  if (needsFull) {
    return {
      valid: true, scope: TEST_SCOPE.FULL,
      tests: Object.values(MODULE_TEST_MAP),
      reason: 'core/shared file changed — full suite required', isReal: false,
    };
  }

  const targeted = new Set();
  for (const file of changedFiles) {
    for (const [moduleKey, testFile] of Object.entries(MODULE_TEST_MAP)) {
      if (file.includes(moduleKey)) targeted.add(testFile);
    }
  }

  if (targeted.size === 0) {
    return {
      valid: true, scope: TEST_SCOPE.FULL,
      tests: Object.values(MODULE_TEST_MAP),
      reason: 'module unknown — full suite as fallback', isReal: false,
    };
  }

  return {
    valid: true,
    scope: targeted.size <= 2 ? TEST_SCOPE.TARGETED : TEST_SCOPE.MODULE,
    tests: [...targeted],
    fullTestsSaved: Object.values(MODULE_TEST_MAP).length - targeted.size,
    isReal: false,
  };
}

export const TEST_SELECTOR_VERSION = '1.0.0';
