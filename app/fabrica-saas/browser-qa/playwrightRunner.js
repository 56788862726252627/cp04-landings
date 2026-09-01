// Playwright Runner — ADV-06
// Orchestrates Playwright E2E execution against a fixture app.
// Defines run configurations; actual execution uses `npx playwright test`.

export const RUNNER_MODE = Object.freeze({
  SMOKE:     'SMOKE',
  FULL:      'FULL',
  TARGETED:  'TARGETED',
  HEADLESS:  'HEADLESS',
  HEADED:    'HEADED',
});

export const RUNNER_STATUS = Object.freeze({
  PENDING:   'PENDING',
  RUNNING:   'RUNNING',
  PASSED:    'PASSED',
  FAILED:    'FAILED',
  ABORTED:   'ABORTED',
});

export const PLAYWRIGHT_CONFIG = Object.freeze({
  DEFAULT_PORT:    5180,
  TIMEOUT_MS:      30000,
  RETRIES:         1,
  WORKERS:         1,
  BROWSER:         'chromium',
  OUTPUT_DIR:      'browser-qa/test-results',
  SCREENSHOT_DIR:  'browser-qa/screenshots',
  CONFIG_PATH:     'fabrica-saas/browser-qa/playwright.config.mjs',
});

export function createRunConfig(params = {}) {
  const {
    mode          = RUNNER_MODE.SMOKE,
    port          = PLAYWRIGHT_CONFIG.DEFAULT_PORT,
    fixtureUrl    = null,
    specPattern   = 'browser-qa/e2e/**/*.spec.mjs',
    headed        = false,
    retries       = PLAYWRIGHT_CONFIG.RETRIES,
  } = params;

  const baseUrl = fixtureUrl ?? `http://localhost:${port}`;

  return Object.freeze({
    valid:       true,
    runId:       `PW-RUN-${Date.now()}`,
    mode,
    baseUrl,
    port,
    specPattern,
    headed,
    retries,
    browser:     PLAYWRIGHT_CONFIG.BROWSER,
    timeout:     PLAYWRIGHT_CONFIG.TIMEOUT_MS,
    workers:     PLAYWRIGHT_CONFIG.WORKERS,
    outputDir:   PLAYWRIGHT_CONFIG.OUTPUT_DIR,
    command:     `npx playwright test --config=${PLAYWRIGHT_CONFIG.CONFIG_PATH}`,
    isReal:      false,
  });
}

export function buildRunCommand(config = {}, options = {}) {
  if (!config.valid) return { valid: false, error: 'invalid config' };
  const parts = ['npx', 'playwright', 'test'];
  parts.push(`--config=${PLAYWRIGHT_CONFIG.CONFIG_PATH}`);
  if (options.grep)    parts.push(`--grep="${options.grep}"`);
  if (options.project) parts.push(`--project=${options.project}`);
  if (config.headed)   parts.push('--headed');
  if (config.retries)  parts.push(`--retries=${config.retries}`);

  return Object.freeze({
    valid:   true,
    command: parts.join(' '),
    isReal:  false,
  });
}

export function parseRunnerResult(exitCode = 0, output = '') {
  const passed  = (output.match(/(\d+) passed/)?.[1] ?? '0');
  const failed  = (output.match(/(\d+) failed/)?.[1] ?? '0');
  const skipped = (output.match(/(\d+) skipped/)?.[1] ?? '0');

  const status = exitCode === 0 ? RUNNER_STATUS.PASSED : RUNNER_STATUS.FAILED;

  return Object.freeze({
    valid:    true,
    status,
    exitCode,
    passed:   parseInt(passed, 10),
    failed:   parseInt(failed, 10),
    skipped:  parseInt(skipped, 10),
    allPassed:exitCode === 0,
    isReal:   true, // this reads real exec output
  });
}

export function createRunSummary(config = {}, result = {}) {
  if (!config.valid || !result.valid) return { valid: false, error: 'invalid config or result' };
  return Object.freeze({
    valid:   true,
    runId:   config.runId,
    mode:    config.mode,
    status:  result.status,
    passed:  result.passed,
    failed:  result.failed,
    skipped: result.skipped,
    isReal:  result.isReal ?? false,
  });
}

export const PLAYWRIGHT_RUNNER_VERSION = '1.0.0';
