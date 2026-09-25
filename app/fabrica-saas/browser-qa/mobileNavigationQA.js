// Mobile Navigation QA — ADV-06
// Evaluates navigation patterns on mobile viewports.

export const MOBILE_NAV_PATTERN = Object.freeze({
  HAMBURGER:    'HAMBURGER',
  BOTTOM_TAB:   'BOTTOM_TAB',
  DRAWER:       'DRAWER',
  FULL_MENU:    'FULL_MENU',
  NONE:         'NONE',
});

export const MOBILE_NAV_ISSUE = Object.freeze({
  NO_MOBILE_NAV:       'NO_MOBILE_NAV',
  DESKTOP_NAV_SHOWN:   'DESKTOP_NAV_SHOWN',
  MENU_UNREACHABLE:    'MENU_UNREACHABLE',
  MENU_NOT_CLOSABLE:   'MENU_NOT_CLOSABLE',
  LINKS_TOO_CLOSE:     'LINKS_TOO_CLOSE',
  OVERFLOW_HIDDEN:     'OVERFLOW_HIDDEN',
  BACKDROP_MISSING:    'BACKDROP_MISSING',
  FOCUS_TRAP_MISSING:  'FOCUS_TRAP_MISSING',
});

export const MOBILE_NAV_STATUS = Object.freeze({
  PASS: 'PASS',
  WARN: 'WARN',
  FAIL: 'FAIL',
});

export function createMobileNavDefinition(pattern, options = {}) {
  if (!MOBILE_NAV_PATTERN[pattern]) return { valid: false, error: `unknown pattern: ${pattern}` };
  return Object.freeze({
    valid:              true,
    pattern,
    triggerSelector:    options.triggerSelector ?? '[aria-label*="menu" i], .hamburger, .nav-toggle',
    menuSelector:       options.menuSelector    ?? 'nav, [role="navigation"], .mobile-menu',
    closeSelector:      options.closeSelector   ?? null,
    hasBackdrop:        options.hasBackdrop     ?? (pattern === MOBILE_NAV_PATTERN.DRAWER),
    hasFocusTrap:       options.hasFocusTrap    ?? false,
    isReal:             false,
  });
}

export function evaluateMobileNav(navDef = {}, snapshot = {}) {
  if (!navDef.valid) return { valid: false, error: 'invalid nav definition' };

  const issues = [];
  if (snapshot.desktopNavVisible) {
    issues.push({ type: MOBILE_NAV_ISSUE.DESKTOP_NAV_SHOWN, severity: 'BLOCKING' });
  }
  if (!snapshot.mobileNavPresent && navDef.pattern !== MOBILE_NAV_PATTERN.NONE) {
    issues.push({ type: MOBILE_NAV_ISSUE.NO_MOBILE_NAV, severity: 'BLOCKING' });
  }
  if (snapshot.mobileNavPresent && !snapshot.menuReachable) {
    issues.push({ type: MOBILE_NAV_ISSUE.MENU_UNREACHABLE, severity: 'BLOCKING' });
  }
  if (snapshot.mobileNavPresent && !snapshot.menuClosable) {
    issues.push({ type: MOBILE_NAV_ISSUE.MENU_NOT_CLOSABLE, severity: 'WARNING' });
  }
  if (navDef.hasBackdrop && !snapshot.backdropPresent) {
    issues.push({ type: MOBILE_NAV_ISSUE.BACKDROP_MISSING, severity: 'WARNING' });
  }
  if (snapshot.linksOverlapping) {
    issues.push({ type: MOBILE_NAV_ISSUE.LINKS_TOO_CLOSE, severity: 'WARNING' });
  }

  const blocking = issues.filter(i => i.severity === 'BLOCKING');
  const status   = blocking.length > 0 ? MOBILE_NAV_STATUS.FAIL
    : issues.length > 0                ? MOBILE_NAV_STATUS.WARN
    : MOBILE_NAV_STATUS.PASS;

  return Object.freeze({
    valid:        true,
    pattern:      navDef.pattern,
    status,
    issueCount:   issues.length,
    blockingCount:blocking.length,
    issues,
    isReal:       false,
  });
}

export function checkTapTargetSize(elements = []) {
  const MIN_SIZE_PX = 44;
  const tooSmall = elements.filter(el => el.width < MIN_SIZE_PX || el.height < MIN_SIZE_PX);
  return {
    valid:        true,
    total:        elements.length,
    tooSmallCount:tooSmall.length,
    tooSmall,
    passes:       tooSmall.length === 0,
    isReal:       false,
  };
}

export const MOBILE_NAVIGATION_QA_VERSION = '1.0.0';
