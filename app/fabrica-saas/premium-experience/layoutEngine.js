// Premium Layout Engine — ADV-07

export const LAYOUT_PATTERN = Object.freeze({
  SIDEBAR_APP:     'SIDEBAR_APP',
  TOP_NAV:         'TOP_NAV',
  HYBRID:          'HYBRID',
  DASHBOARD_FIRST: 'DASHBOARD_FIRST',
  SERVICE_FIRST:   'SERVICE_FIRST',
  BOOKING_FIRST:   'BOOKING_FIRST',
  CRM_FIRST:       'CRM_FIRST',
  CONTENT_FIRST:   'CONTENT_FIRST',
  MOBILE_FIRST:    'MOBILE_FIRST',
});

const LAYOUT_RULES = Object.freeze({
  SIDEBAR_APP:     { minModules: 5, suitableFor: ['admin', 'staff', 'crm'], mobileNav: 'DRAWER' },
  TOP_NAV:         { minModules: 2, suitableFor: ['public', 'booking', 'service'], mobileNav: 'HAMBURGER' },
  HYBRID:          { minModules: 4, suitableFor: ['mixed', 'staff', 'admin'], mobileNav: 'BOTTOM_NAV' },
  DASHBOARD_FIRST: { minModules: 3, suitableFor: ['admin', 'manager'], mobileNav: 'BOTTOM_NAV' },
  SERVICE_FIRST:   { minModules: 2, suitableFor: ['public', 'service'], mobileNav: 'HAMBURGER' },
  BOOKING_FIRST:   { minModules: 2, suitableFor: ['booking', 'appointment'], mobileNav: 'BOTTOM_NAV' },
  CRM_FIRST:       { minModules: 4, suitableFor: ['crm', 'legal', 'sales'], mobileNav: 'DRAWER' },
  CONTENT_FIRST:   { minModules: 2, suitableFor: ['blog', 'education'], mobileNav: 'HAMBURGER' },
  MOBILE_FIRST:    { minModules: 1, suitableFor: ['mobile', 'field'], mobileNav: 'BOTTOM_NAV' },
});

const VERTICAL_LAYOUT_MAP = Object.freeze({
  veterinary:  LAYOUT_PATTERN.BOOKING_FIRST,
  legal:       LAYOUT_PATTERN.CRM_FIRST,
  beauty:      LAYOUT_PATTERN.SERVICE_FIRST,
  dental:      LAYOUT_PATTERN.BOOKING_FIRST,
  padel:       LAYOUT_PATTERN.BOOKING_FIRST,
  education:   LAYOUT_PATTERN.CONTENT_FIRST,
  restaurant:  LAYOUT_PATTERN.SERVICE_FIRST,
  estetica:    LAYOUT_PATTERN.SERVICE_FIRST,
  fisio:       LAYOUT_PATTERN.BOOKING_FIRST,
  default:     LAYOUT_PATTERN.TOP_NAV,
});

export function resolveLayoutPattern(brief = {}) {
  const { vertical = 'default', moduleCount = 3, overridePattern } = brief;
  if (overridePattern && LAYOUT_PATTERN[overridePattern]) {
    return Object.freeze({ pattern: overridePattern, source: 'OVERRIDE', isReal: false });
  }
  const basePattern = VERTICAL_LAYOUT_MAP[vertical] ?? LAYOUT_PATTERN.TOP_NAV;
  const rule = LAYOUT_RULES[basePattern];
  const finalPattern = moduleCount >= (rule?.minModules ?? 1) ? basePattern : LAYOUT_PATTERN.TOP_NAV;
  return Object.freeze({ pattern: finalPattern, source: 'VERTICAL', moduleCount, isReal: false });
}

export function createLayoutConfig(pattern = LAYOUT_PATTERN.TOP_NAV, options = {}) {
  const rule = LAYOUT_RULES[pattern] ?? LAYOUT_RULES.TOP_NAV;
  return Object.freeze({
    pattern,
    mobileNav:         rule.mobileNav,
    hasSidebar:        pattern === LAYOUT_PATTERN.SIDEBAR_APP || pattern === LAYOUT_PATTERN.HYBRID || pattern === LAYOUT_PATTERN.CRM_FIRST,
    hasTopBar:         pattern !== LAYOUT_PATTERN.SIDEBAR_APP,
    sidebarWidth:      pattern === LAYOUT_PATTERN.SIDEBAR_APP ? 240 : pattern === LAYOUT_PATTERN.CRM_FIRST ? 280 : 0,
    contentMaxWidth:   options.contentMaxWidth ?? 1200,
    gridColumns:       options.gridColumns ?? 12,
    isReal:            false,
  });
}

export const LAYOUT_ENGINE_VERSION = '1.0.0';
