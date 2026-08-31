// Runtime Render Gate — PASO G
// Detects blank screen / runtime failure patterns. Mandatory gate.

export const RENDER_GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export const RENDER_FAILURE_TYPES = Object.freeze({
  BLANK_BODY:              'BLANK_BODY',
  EMPTY_ROOT:              'EMPTY_ROOT',
  UNHANDLED_RENDER_ERROR:  'UNHANDLED_RENDER_ERROR',
  MISSING_JS_ASSET:        'MISSING_JS_ASSET',
  JS_BUNDLE_404:           'JS_BUNDLE_404',
  WRONG_MIME_TYPE:         'WRONG_MIME_TYPE',
  RUNTIME_EXCEPTION:       'RUNTIME_EXCEPTION',
  INFINITE_RENDER_LOOP:    'INFINITE_RENDER_LOOP',
  ERROR_BOUNDARY_OUTPUT:   'ERROR_BOUNDARY_OUTPUT',
});

const RENDER_CHECKS = [
  { id: 'RG-01', name: 'Body not blank',             failureType: RENDER_FAILURE_TYPES.BLANK_BODY,             critical: true  },
  { id: 'RG-02', name: 'Root element has children',  failureType: RENDER_FAILURE_TYPES.EMPTY_ROOT,             critical: true  },
  { id: 'RG-03', name: 'No unhandled render error',  failureType: RENDER_FAILURE_TYPES.UNHANDLED_RENDER_ERROR, critical: true  },
  { id: 'RG-04', name: 'JS assets loaded',           failureType: RENDER_FAILURE_TYPES.MISSING_JS_ASSET,       critical: true  },
  { id: 'RG-05', name: 'No JS 404s',                 failureType: RENDER_FAILURE_TYPES.JS_BUNDLE_404,          critical: true  },
  { id: 'RG-06', name: 'Correct MIME for JS',        failureType: RENDER_FAILURE_TYPES.WRONG_MIME_TYPE,        critical: false },
  { id: 'RG-07', name: 'No runtime exception',       failureType: RENDER_FAILURE_TYPES.RUNTIME_EXCEPTION,      critical: true  },
  { id: 'RG-08', name: 'No infinite render loop',    failureType: RENDER_FAILURE_TYPES.INFINITE_RENDER_LOOP,   critical: true  },
  { id: 'RG-09', name: 'No ErrorBoundary output',    failureType: RENDER_FAILURE_TYPES.ERROR_BOUNDARY_OUTPUT,  critical: true  },
];

/**
 * Evaluate the runtime render gate from check results.
 * @param {object} checks — { 'RG-01': true|false }
 * @param {object} context — { url, environment }
 */
export function auditRuntimeRender(checks = {}, context = {}) {
  const hasChecks = Object.keys(checks).length > 0;

  if (!hasChecks) {
    return {
      valid:   true,
      status:  RENDER_GATE_STATUS.BLOCKED,
      reason:  'No check results provided — browser runtime required for live render audit',
      url:     context.url ?? 'NOT_PROVIDED',
      results: RENDER_CHECKS.map(c => ({ ...c, status: 'NOT_EXECUTED' })),
      disclaimer: 'Runtime render gate requires a live URL. BLOCKED in Paso G without browser runtime.',
    };
  }

  const results = RENDER_CHECKS.map(check => {
    const passed = checks[check.id] === true;
    return { ...check, passed, status: passed ? RENDER_GATE_STATUS.PASS : RENDER_GATE_STATUS.FAIL };
  });

  const criticalFailed = results.filter(r => r.critical && !r.passed);

  const status = criticalFailed.length > 0 ? RENDER_GATE_STATUS.FAIL : RENDER_GATE_STATUS.PASS;

  return {
    valid:          true,
    status,
    url:            context.url ?? 'fixture',
    environment:    context.environment ?? 'unknown',
    totalChecks:    RENDER_CHECKS.length,
    passed:         results.filter(r => r.passed).length,
    criticalFailed: criticalFailed.length,
    failureTypes:   criticalFailed.map(r => r.failureType),
    results,
    disclaimer:     'Runtime render gate is mandatory before considering any deploy valid.',
  };
}

export const RUNTIME_RENDER_VERSION = '1.0.0';
