// Responsive QA — ADV-06
// Extends deploy/visualQA.js with responsive viewport evaluation.

import { BREAKPOINTS, VISUAL_QA_STATUS } from '../deploy/visualQA.js';

export { BREAKPOINTS, VISUAL_QA_STATUS };

export const VIEWPORT = Object.freeze({
  MOBILE_S:  { name: 'MOBILE_S',  width: 320,  height: 568,  label: 'iPhone SE' },
  MOBILE_M:  { name: 'MOBILE_M',  width: 390,  height: 844,  label: 'iPhone 14' },
  TABLET:    { name: 'TABLET',    width: 768,  height: 1024, label: 'iPad' },
  DESKTOP:   { name: 'DESKTOP',   width: 1280, height: 800,  label: 'Desktop' },
  DESKTOP_L: { name: 'DESKTOP_L', width: 1920, height: 1080, label: 'Desktop XL' },
});

export const RESPONSIVE_ISSUE = Object.freeze({
  HORIZONTAL_SCROLL: 'HORIZONTAL_SCROLL',
  CONTENT_OVERFLOW:  'CONTENT_OVERFLOW',
  TEXT_TRUNCATED:    'TEXT_TRUNCATED',
  NAV_BROKEN:        'NAV_BROKEN',
  BUTTONS_OVERLAP:   'BUTTONS_OVERLAP',
  IMAGE_OVERFLOW:    'IMAGE_OVERFLOW',
  FONT_TOO_SMALL:    'FONT_TOO_SMALL',
  TAP_TARGET_SMALL:  'TAP_TARGET_SMALL',
});

export function createResponsiveTestSuite(viewports = null) {
  const vps = viewports ?? Object.values(VIEWPORT);
  return Object.freeze({
    valid:     true,
    viewports: vps,
    checkPerViewport: 3,
    totalChecks:      vps.length * 3,
    isReal:    false,
  });
}

export function evaluateViewportResult(viewport, checks = []) {
  if (!viewport) return { valid: false, error: 'viewport required' };
  const issues   = checks.filter(c => !c.passed);
  const blocking = issues.filter(c => [
    RESPONSIVE_ISSUE.HORIZONTAL_SCROLL,
    RESPONSIVE_ISSUE.NAV_BROKEN,
    RESPONSIVE_ISSUE.BUTTONS_OVERLAP,
  ].includes(c.issueType));

  const status = blocking.length > 0 ? VISUAL_QA_STATUS.FAIL
    : issues.length > 0              ? VISUAL_QA_STATUS.WARN
    : VISUAL_QA_STATUS.PASS;

  return Object.freeze({
    valid:        true,
    viewport:     viewport.name,
    width:        viewport.width,
    status,
    issueCount:   issues.length,
    blockingCount:blocking.length,
    issues,
    isReal:       false,
  });
}

export function evaluateAllViewports(viewportResults = []) {
  if (!Array.isArray(viewportResults)) return { valid: false, error: 'array required' };
  const failed   = viewportResults.filter(r => r.status === VISUAL_QA_STATUS.FAIL);
  const warned   = viewportResults.filter(r => r.status === VISUAL_QA_STATUS.WARN);
  const passed   = viewportResults.filter(r => r.status === VISUAL_QA_STATUS.PASS);

  const status = failed.length > 0 ? VISUAL_QA_STATUS.FAIL
    : warned.length > 0            ? VISUAL_QA_STATUS.WARN
    : VISUAL_QA_STATUS.PASS;

  return Object.freeze({
    valid:    true,
    status,
    tested:   viewportResults.length,
    passed:   passed.length,
    warned:   warned.length,
    failed:   failed.length,
    results:  viewportResults,
    isReal:   false,
  });
}

export function isMobileViewport(viewport) {
  return viewport?.width <= 768;
}

export const RESPONSIVE_QA_VERSION = '1.0.0';
