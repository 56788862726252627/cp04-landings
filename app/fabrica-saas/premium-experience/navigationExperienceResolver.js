// Navigation Experience Resolver — ADV-07

export const NAV_PATTERN = Object.freeze({
  SIDEBAR:      'SIDEBAR',
  TOP_NAV:      'TOP_NAV',
  TABS:         'TABS',
  BOTTOM_NAV:   'BOTTOM_NAV',
  DRAWER:       'DRAWER',
  HYBRID:       'HYBRID',
});

export function resolveNavigationPattern(brief = {}) {
  const {
    moduleCount     = 3,
    mobileUsageRate = 0.5,
    complexity      = 'LOW',
    overridePattern,
  } = brief;

  if (overridePattern && NAV_PATTERN[overridePattern]) {
    return Object.freeze({ pattern: overridePattern, source: 'OVERRIDE', isReal: false });
  }

  let pattern;
  if (mobileUsageRate > 0.65 && moduleCount <= 5) {
    pattern = NAV_PATTERN.BOTTOM_NAV;
  } else if (moduleCount >= 8 || (complexity === 'HIGH' && mobileUsageRate < 0.4)) {
    pattern = NAV_PATTERN.SIDEBAR;
  } else if (moduleCount >= 5 && mobileUsageRate >= 0.4) {
    pattern = NAV_PATTERN.DRAWER;
  } else {
    pattern = NAV_PATTERN.TOP_NAV;
  }

  return Object.freeze({
    pattern,
    source:          'RULES',
    moduleCount,
    mobileUsageRate,
    complexity,
    mobilePattern:   mobileUsageRate > 0.5 ? NAV_PATTERN.BOTTOM_NAV : NAV_PATTERN.DRAWER,
    isReal:          false,
  });
}

export function buildNavConfig(pattern = NAV_PATTERN.TOP_NAV, modules = []) {
  const topItems = modules.slice(0, 7);
  const overflow = modules.slice(7);
  return Object.freeze({
    pattern,
    primaryItems:    topItems,
    overflowItems:   overflow,
    hasSearch:       modules.length > 5,
    hasUserMenu:     true,
    collapseOnMobile: pattern !== NAV_PATTERN.BOTTOM_NAV,
    isReal:          false,
  });
}

export const NAVIGATION_EXPERIENCE_RESOLVER_VERSION = '1.0.0';
