// Tablet Experience Profile — ADV-07

export const TABLET_BREAKPOINT = Object.freeze({ min: 768, max: 1199 });

export function createTabletProfile(options = {}) {
  const {
    hasSidebar    = false,
    sidebarWidth  = 240,
    columns       = 2,
  } = options;

  return Object.freeze({
    breakpoint:         TABLET_BREAKPOINT,
    hasSidebar,
    sidebarWidth:       hasSidebar ? sidebarWidth : 0,
    usesSplitLayout:    hasSidebar,
    columns,
    formColumns:        Math.min(columns, 2),
    sidePanels:         true,
    touchControls:      true,
    isNotDesktopShrunk: true,
    isReal: false,
  });
}

export function resolveTabletLayout(layoutPattern = 'TOP_NAV', moduleCount = 3) {
  const hasSidebar = layoutPattern === 'SIDEBAR_APP' || layoutPattern === 'CRM_FIRST' || moduleCount >= 7;
  return createTabletProfile({ hasSidebar, columns: hasSidebar ? 2 : 2 });
}

export const TABLET_EXPERIENCE_PROFILE_VERSION = '1.0.0';
