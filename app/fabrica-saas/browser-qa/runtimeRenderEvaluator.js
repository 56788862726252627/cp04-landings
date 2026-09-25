// Runtime Render Evaluator — ADV-06
// Extends deploy/runtimeRenderGate.js with browser-context evaluation logic.

import { RENDER_GATE_STATUS, RENDER_FAILURE_TYPES, auditRuntimeRender } from '../deploy/runtimeRenderGate.js';

export { RENDER_GATE_STATUS, RENDER_FAILURE_TYPES };

export const EVALUATOR_VERDICT = Object.freeze({
  PASS:         'PASS',
  WARN:         'WARN',
  FAIL:         'FAIL',
  CRITICAL_FAIL:'CRITICAL_FAIL',
});

export function evaluateRenderChecks(checks = []) {
  if (!Array.isArray(checks) || checks.length === 0) {
    return { valid: false, error: 'checks array required' };
  }

  const criticalFailed = checks.filter(c => !c.passed && c.severity === 'CRITICAL');
  const warnFailed     = checks.filter(c => !c.passed && c.severity === 'WARN');
  const passed         = checks.filter(c => c.passed);

  let verdict;
  if (criticalFailed.length > 0) verdict = EVALUATOR_VERDICT.CRITICAL_FAIL;
  else if (warnFailed.length > 0) verdict = EVALUATOR_VERDICT.WARN;
  else if (checks.length - passed.length > 0) verdict = EVALUATOR_VERDICT.FAIL;
  else                            verdict = EVALUATOR_VERDICT.PASS;

  // Supplemental: build map for auditRuntimeRender reference only
  const checksMap = Object.fromEntries(checks.map(c => [c.id, c.passed]));
  const audit = auditRuntimeRender(checksMap, { url: 'fixture' });

  return Object.freeze({
    valid:           true,
    verdict,
    passCount:       passed.length,
    failCount:       checks.length - passed.length,
    criticalCount:   criticalFailed.length,
    warnCount:       warnFailed.length,
    audit,
    criticalFailures: criticalFailed.map(c => c.id ?? c.type),
    isReal:          false,
  });
}

export function buildBrowserRenderChecks(domSnapshot = {}) {
  const {
    hasBody = true,
    hasRoot = true,
    rootHasChildren = true,
    jsErrors = [],
    bundleLoaded = true,
    mimeCorrect = true,
  } = domSnapshot;

  return [
    { id: 'RG-01', type: RENDER_FAILURE_TYPES.BLANK_BODY,     passed: hasBody,          severity: 'CRITICAL' },
    { id: 'RG-02', type: RENDER_FAILURE_TYPES.EMPTY_ROOT,     passed: hasRoot,           severity: 'CRITICAL' },
    { id: 'RG-03', type: RENDER_FAILURE_TYPES.EMPTY_ROOT,     passed: rootHasChildren,  severity: 'CRITICAL' },
    { id: 'RG-04', type: RENDER_FAILURE_TYPES.RUNTIME_EXCEPTION, passed: jsErrors.length === 0, severity: 'CRITICAL' },
    { id: 'RG-05', type: RENDER_FAILURE_TYPES.MISSING_JS_ASSET, passed: bundleLoaded,   severity: 'CRITICAL' },
    { id: 'RG-06', type: RENDER_FAILURE_TYPES.WRONG_MIME_TYPE,  passed: mimeCorrect,    severity: 'WARN' },
  ];
}

export function interpretRenderVerdict(verdict) {
  const INTERPRETATIONS = {
    [EVALUATOR_VERDICT.PASS]:          { blocking: false, message: 'Page renders correctly' },
    [EVALUATOR_VERDICT.WARN]:          { blocking: false, message: 'Page renders with warnings' },
    [EVALUATOR_VERDICT.FAIL]:          { blocking: true,  message: 'Page render failed' },
    [EVALUATOR_VERDICT.CRITICAL_FAIL]: { blocking: true,  message: 'Critical render failure — blank screen or JS crash' },
  };
  return INTERPRETATIONS[verdict] ?? { blocking: true, message: 'Unknown verdict' };
}

export const RUNTIME_RENDER_EVALUATOR_VERSION = '1.0.0';
