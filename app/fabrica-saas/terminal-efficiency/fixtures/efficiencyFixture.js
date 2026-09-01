// Efficiency Fixture — ADV-05
// Simulates a typical Factory improvement for legacy vs. optimized comparison.

export const FIXTURE_VERSION = '1.0.0';

export const LEGACY_EXECUTION = Object.freeze({
  description: 'Typical ADV improvement before efficiency layer',
  commands: [
    'git status', 'git diff', 'ls -la', 'cat file1.js', 'cat file2.js',
    'grep -r "pattern" .', 'node --test tests/a.test.mjs',
    'node --test tests/b.test.mjs', 'node --test tests/c.test.mjs',
    'node --test tests/*.test.mjs', 'node --test tests/*.test.mjs',
    'npx eslint src/', 'npx eslint terminal-efficiency/', 'npm run build',
    'git status', 'git diff --cached', 'git add file1.js',
    'git add file2.js', 'git add file3.js', 'git status',
    'git commit -m "feat"', 'git push origin branch',
    'git log --oneline -5', 'git status',
    'node --test tests/*.test.mjs', 'npm run build',
    'gh pr create', 'gh pr view', 'git status',
    'node --test tests/*.test.mjs',
    'gh pr merge', 'git log --oneline -3',
    'node --test tests/*.test.mjs', 'npm run build',
    'git status', 'git diff', 'git log --oneline -3',
    'npx eslint src/', 'cat file4.js', 'grep "x" file4.js',
  ],
  manualConfirmations: 10,
  validationMinutes:   12,
  wallClockMinutes:    28,
  testRuns:            7,
  buildRuns:           4,
  duplicateChecks:     8,
});

export const OPTIMIZED_EXECUTION = Object.freeze({
  description: 'Same improvement with ADV-05 efficiency layer',
  commands: [
    'git status --short && git diff --stat && git log --oneline -3', // batched
    'node --test generator/tests/v2-adv05-terminal-efficiency.test.mjs', // targeted
    'npx eslint terminal-efficiency/ --max-warnings=0',
    'node --test generator/tests/*.test.mjs', // full gate once
    'npm run build',                           // build once
    'git add terminal-efficiency/ && git commit -m "feat"',
    'git push -u origin feature/factory-advanced-05-terminal-efficiency',
    'gh pr create',
  ],
  manualConfirmations: 0,
  validationMinutes:   5,
  wallClockMinutes:    14,
  testRuns:            2,
  buildRuns:           1,
  duplicateChecks:     0,
});

export const FAILURE_FIXTURES = Object.freeze({
  TEST_FAILURE: {
    description: 'A targeted test fails mid-run',
    overrides: { TARGETED_TESTS: 'FAIL' },
    expectedDecision: 'FAIL_FAST — stop before build',
  },
  LINT_FAILURE: {
    description: 'Lint fails after tests pass',
    overrides: { LINT: 'FAIL' },
    expectedDecision: 'report error, do not block full tests',
  },
  TRANSIENT_NETWORK: {
    description: 'GitHub push fails with ECONNRESET',
    error: 'ECONNRESET during push',
    expectedRetry: 'RETRY once with delay',
  },
  STALE_CHECKPOINT: {
    description: 'Checkpoint shows FULL_TESTS_PASS but headSha changed',
    expectedDecision: 'invalidate checkpoint, rerun from TARGETED_TESTS',
  },
  OUT_OF_SCOPE_WRITE: {
    description: 'Write attempted to src/components/demo/',
    expectedDecision: 'SCOPE BLOCKED — do not write',
  },
  PERMISSION_REQUIRED: {
    description: 'Action requires OAuth token',
    error: 'oauth required for meta',
    expectedDecision: 'WAITING_HUMAN — interrupt for OAuth',
  },
  CACHE_INVALIDATION: {
    description: 'Cached TESTS result stale after new commit',
    expectedDecision: 'invalidate cache entry, rerun tests',
  },
});

export function getLegacyExecution() { return { ...LEGACY_EXECUTION }; }
export function getOptimizedExecution() { return { ...OPTIMIZED_EXECUTION }; }
