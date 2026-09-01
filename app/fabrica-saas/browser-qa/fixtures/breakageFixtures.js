// Breakage Fixtures — ADV-06
// Fixtures for testing QA gates against known-broken scenarios.

export const BREAKAGE_TYPE = Object.freeze({
  BLANK_PAGE:      'BLANK_PAGE',
  JS_ERROR:        'JS_ERROR',
  NETWORK_404:     'NETWORK_404',
  DEAD_BUTTON:     'DEAD_BUTTON',
  HORIZONTAL_SCROLL:'HORIZONTAL_SCROLL',
  MISSING_LABELS:  'MISSING_LABELS',
  STACK_TRACE:     'STACK_TRACE',
  SLOW_LCP:        'SLOW_LCP',
  CLS_VIOLATION:   'CLS_VIOLATION',
});

export const BLANK_PAGE_BREAKAGE = Object.freeze({
  type:        BREAKAGE_TYPE.BLANK_PAGE,
  domSnapshot: { hasBody: false, hasRoot: false, rootHasChildren: false, jsErrors: [], bundleLoaded: false },
  expectedGate:'RENDER',
  expectedFail: true,
  isReal:      false,
});

export const JS_ERROR_BREAKAGE = Object.freeze({
  type:        BREAKAGE_TYPE.JS_ERROR,
  consoleMessages: [
    { level: 'ERROR', text: 'TypeError: Cannot read property foo of undefined', url: '/index.js' },
    { level: 'ERROR', text: 'Uncaught ReferenceError: myFunc is not defined', url: '/app.js' },
  ],
  expectedGate:'CONSOLE',
  expectedFail: true,
  isReal:      false,
});

export const NETWORK_404_BREAKAGE = Object.freeze({
  type:         BREAKAGE_TYPE.NETWORK_404,
  requests: [
    { url: 'http://localhost:5180/main.js', failed: true, status: 404, resourceType: 'script', errorText: '' },
    { url: 'http://localhost:5180/style.css', failed: true, status: 404, resourceType: 'stylesheet', errorText: '' },
  ],
  expectedGate: 'NETWORK',
  expectedFail: true,
  isReal:       false,
});

export const DEAD_BUTTON_BREAKAGE = Object.freeze({
  type:     BREAKAGE_TYPE.DEAD_BUTTON,
  elements: [
    { tag: 'button', text: 'Reservar Cita', onclick: null, hasEventListener: false, disabled: false },
    { tag: 'button', text: 'Ver Servicios', onclick: 'javascript:void(0)', hasEventListener: false, disabled: false },
    { tag: 'a',      text: 'Contactar',     href: '#', disabled: false },
  ],
  expectedGate:'CONTROLS',
  expectedFail: true,
  isReal:      false,
});

export const HORIZONTAL_SCROLL_BREAKAGE = Object.freeze({
  type:    BREAKAGE_TYPE.HORIZONTAL_SCROLL,
  viewportSnapshot: {
    desktopNavVisible: false,
    mobileNavPresent:  true,
    menuReachable:     true,
    menuClosable:      false,
  },
  responsiveSnapshot: {
    horizontalScroll: true,
    contentOverflow:  false,
    navBroken:        false,
  },
  expectedGate:'RESPONSIVE',
  expectedFail: true,
  isReal:       false,
});

export const HEALTHY_SNAPSHOT = Object.freeze({
  type:   'HEALTHY',
  domSnapshot: { hasBody: true, hasRoot: true, rootHasChildren: true, jsErrors: [], bundleLoaded: true, mimeCorrect: true },
  consoleMessages: [],
  requests: [],
  elements: [
    { tag: 'button', text: 'Reservar Cita',  onclick: 'handleBooking', hasEventListener: true, disabled: false },
    { tag: 'a',      text: 'Ver Servicios',  href: '/#servicios',      disabled: false },
  ],
  expectedFail: false,
  isReal:       false,
});

export const ALL_BREAKAGE_FIXTURES = Object.freeze([
  BLANK_PAGE_BREAKAGE,
  JS_ERROR_BREAKAGE,
  NETWORK_404_BREAKAGE,
  DEAD_BUTTON_BREAKAGE,
  HORIZONTAL_SCROLL_BREAKAGE,
]);

export const BREAKAGE_FIXTURES_VERSION = '1.0.0';
