// Bundle Runtime Check — ADV-06
// Validates bundle integrity and runtime constraints for factory SaaS apps.

export const BUNDLE_CHECK = Object.freeze({
  JS_LOADS:          'JS_LOADS',
  CSS_LOADS:         'CSS_LOADS',
  NO_CONSOLE_ERRORS: 'NO_CONSOLE_ERRORS',
  BUNDLE_SIZE_OK:    'BUNDLE_SIZE_OK',
  NO_DUPLICATE_LIBS: 'NO_DUPLICATE_LIBS',
  SOURCE_MAP_OK:     'SOURCE_MAP_OK',
  NO_DEV_ARTIFACTS:  'NO_DEV_ARTIFACTS',
  MODULE_COUNT_OK:   'MODULE_COUNT_OK',
});

export const BUNDLE_STATUS = Object.freeze({
  PASS: 'PASS',
  WARN: 'WARN',
  FAIL: 'FAIL',
});

const BUNDLE_THRESHOLDS = Object.freeze({
  MAX_JS_KB:      500,
  MAX_CSS_KB:     100,
  MAX_MODULES:    200,
  MAX_CHUNK_KB:   250,
});

export function createBundlePolicy(overrides = {}) {
  return Object.freeze({
    ...BUNDLE_THRESHOLDS,
    ...overrides,
    blockOnJsLoadFail:   true,
    blockOnCssLoadFail:  false,
    blockOnSizeBreach:   false,
    isReal:              false,
  });
}

export function evaluateBundleSize(sizes = {}, policy = {}) {
  const p = { ...BUNDLE_THRESHOLDS, ...policy };
  const issues = [];

  if ((sizes.totalJsKb ?? 0) > p.MAX_JS_KB) {
    issues.push({ check: BUNDLE_CHECK.BUNDLE_SIZE_OK, severity: 'WARNING', actual: sizes.totalJsKb, limit: p.MAX_JS_KB });
  }
  if ((sizes.totalCssKb ?? 0) > p.MAX_CSS_KB) {
    issues.push({ check: BUNDLE_CHECK.BUNDLE_SIZE_OK, severity: 'WARNING', actual: sizes.totalCssKb, limit: p.MAX_CSS_KB });
  }
  if ((sizes.moduleCount ?? 0) > p.MAX_MODULES) {
    issues.push({ check: BUNDLE_CHECK.MODULE_COUNT_OK, severity: 'WARNING', actual: sizes.moduleCount, limit: p.MAX_MODULES });
  }

  const blocking = issues.filter(i => i.severity === 'BLOCKING');
  return Object.freeze({
    valid:   true,
    status:  blocking.length > 0 ? BUNDLE_STATUS.FAIL : issues.length > 0 ? BUNDLE_STATUS.WARN : BUNDLE_STATUS.PASS,
    issues,
    blocking:blocking.length,
    isReal:  false,
  });
}

export function evaluateBundleRuntime(checks = {}) {
  const results = [];

  if (checks[BUNDLE_CHECK.JS_LOADS] === false) {
    results.push({ check: BUNDLE_CHECK.JS_LOADS, passed: false, severity: 'CRITICAL' });
  } else {
    results.push({ check: BUNDLE_CHECK.JS_LOADS, passed: true });
  }

  if (checks[BUNDLE_CHECK.CSS_LOADS] === false) {
    results.push({ check: BUNDLE_CHECK.CSS_LOADS, passed: false, severity: 'WARNING' });
  } else {
    results.push({ check: BUNDLE_CHECK.CSS_LOADS, passed: true });
  }

  const devArtifacts = checks[BUNDLE_CHECK.NO_DEV_ARTIFACTS] ?? true;
  if (!devArtifacts) {
    results.push({ check: BUNDLE_CHECK.NO_DEV_ARTIFACTS, passed: false, severity: 'WARNING' });
  } else {
    results.push({ check: BUNDLE_CHECK.NO_DEV_ARTIFACTS, passed: true });
  }

  const failed   = results.filter(r => !r.passed);
  const critical = failed.filter(r => r.severity === 'CRITICAL');

  const status = critical.length > 0 ? BUNDLE_STATUS.FAIL
    : failed.length > 0              ? BUNDLE_STATUS.WARN
    : BUNDLE_STATUS.PASS;

  return Object.freeze({
    valid:   true,
    status,
    results,
    failed:  failed.length,
    critical:critical.length,
    isReal:  false,
  });
}

export const BUNDLE_RUNTIME_CHECK_VERSION = '1.0.0';
