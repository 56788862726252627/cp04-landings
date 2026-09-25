// Mobile Experience Profile — ADV-07

export const MIN_TAP_TARGET = 44;
export const SAFE_AREA_INSET = 20;

export const MOBILE_PATTERN = Object.freeze({
  BOTTOM_NAV:  'BOTTOM_NAV',
  HAMBURGER:   'HAMBURGER',
  DRAWER:      'DRAWER',
  TABS:        'TABS',
});

export function createMobileProfile(options = {}) {
  const {
    pattern       = MOBILE_PATTERN.BOTTOM_NAV,
    moduleCount   = 4,
    stickyBottomCta = false,
  } = options;

  const bottomNavItems = pattern === MOBILE_PATTERN.BOTTOM_NAV
    ? Math.min(moduleCount, 5)
    : 0;

  return Object.freeze({
    pattern,
    minTapTarget:       MIN_TAP_TARGET,
    safeAreaInset:      SAFE_AREA_INSET,
    bottomNavItems,
    stickyBottomCta,
    usesDrawer:         pattern === MOBILE_PATTERN.DRAWER,
    formsMobileKeyboard: true,
    tablesConvertToCards: true,
    modalsFullScreen:   false,
    isReal: false,
  });
}

export function validateMobileTargets(elements = []) {
  const tooSmall = elements.filter(el => (el.width ?? 0) < MIN_TAP_TARGET || (el.height ?? 0) < MIN_TAP_TARGET);
  return Object.freeze({
    valid:      tooSmall.length === 0,
    tooSmall:   tooSmall.length,
    total:      elements.length,
    minTarget:  MIN_TAP_TARGET,
    isReal:     false,
  });
}

export const MOBILE_EXPERIENCE_PROFILE_VERSION = '1.0.0';
