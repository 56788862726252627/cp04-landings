// Desktop Experience Profile — ADV-07

export const DESKTOP_BREAKPOINT = Object.freeze({ min: 1200 });

export function createDesktopProfile(options = {}) {
  const {
    maxContentWidth = 1200,
    gridColumns     = 12,
    density         = 'BALANCED',
    hasSidebar      = false,
    sidebarWidth    = 0,
  } = options;

  const densityConfig = {
    COMPACT:  { defaultCols: 4, formCols: 3, padding: 16 },
    BALANCED: { defaultCols: 3, formCols: 2, padding: 24 },
    SPACIOUS: { defaultCols: 3, formCols: 2, padding: 32 },
  };
  const dc = densityConfig[density] ?? densityConfig.BALANCED;

  return Object.freeze({
    breakpoint:      DESKTOP_BREAKPOINT,
    maxContentWidth,
    gridColumns,
    density,
    hasSidebar,
    sidebarWidth,
    defaultCardCols: dc.defaultCols,
    formCols:        dc.formCols,
    contentPadding:  dc.padding,
    supportsKeyboardWorkflows: true,
    dataRichDashboards: true,
    multiColumnLayouts: true,
    isReal: false,
  });
}

export function resolveDesktopLayout(profile = {}) {
  const hasSidebar = profile.navigationPattern === 'SIDEBAR_APP' || profile.navigationPattern === 'CRM_FIRST';
  return createDesktopProfile({
    hasSidebar,
    sidebarWidth: hasSidebar ? 280 : 0,
    density: profile.visualDensity ?? 'BALANCED',
  });
}

export const DESKTOP_EXPERIENCE_PROFILE_VERSION = '1.0.0';
