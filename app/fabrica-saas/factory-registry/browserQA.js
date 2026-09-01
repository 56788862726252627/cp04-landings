// Factory Registry — Browser QA (ADV-06)

export const BROWSER_QA_REGISTRY = Object.freeze({
  id:          'browser-qa',
  name:        'Browser QA Engine',
  version:     '1.0.0',
  improvement: 'ADV-06',
  description: 'Playwright-based real browser QA infrastructure for Factory SaaS apps',

  modules: [
    'browserQaPlan', 'e2eTestDefinition', 'runtimeRenderEvaluator',
    'consoleErrorGate', 'networkFailureGate', 'pageLoadAsserter',
    'routeCrawler', 'deadControlDetector', 'formQA',
    'responsiveQA', 'mobileNavigationQA', 'accessibilityBaseline',
    'keyboardQA', 'visualSanityEvaluator', 'screenshotSystem',
    'visualBaselines', 'criticalUserFlow', 'roleSurfaceQA',
    'authSurfaceQA', 'loadingStateQA', 'errorStateQA',
    'emptyStateQA', 'performanceSanity', 'bundleRuntimeCheck',
    'postDeployQABridge', 'cicdBridge', 'smartE2ESelector',
    'flakyTestDetector', 'browserQAScore', 'browserQAReport',
    'browserReleasePolicy', 'observabilityBridge', 'playwrightRunner',
  ],

  moduleCount: 33,

  phases: [
    'RENDER', 'CONSOLE', 'NETWORK', 'ROUTES', 'CONTROLS',
    'FORMS', 'RESPONSIVE', 'MOBILE_NAV', 'ACCESSIBILITY',
    'KEYBOARD', 'VISUAL', 'SCREENSHOTS', 'CRITICAL_FLOWS',
    'ROLE_SURFACE', 'AUTH_SURFACE', 'LOADING_STATES',
    'ERROR_STATES', 'EMPTY_STATES', 'PERFORMANCE', 'BUNDLE',
  ],

  playwright: {
    version:    '1.62.1',
    browser:    'chromium',
    port:       5180,
    configPath: 'fabrica-saas/browser-qa/playwright.config.mjs',
    specDir:    'fabrica-saas/browser-qa/e2e/',
    runCommand: 'npx playwright test --config=fabrica-saas/browser-qa/playwright.config.mjs',
  },

  fixture: {
    name:    'Clínica Veterinaria Nexo',
    id:      'nexo-vet',
    htmlPath:'fabrica-saas/browser-qa/fixtures/nexoVet.html',
    isReal:  false,
  },

  integrations: {
    adv01: 'observabilityBridge — emits browser QA events',
    adv02: 'cicdBridge — CI job selection and YAML spec',
    adv04: 'postDeployQABridge — post-deploy QA gate',
    adv05: 'smartE2ESelector — impact-driven test selection',
  },

  guardrails: {
    NO_PRODUCTION_DEPLOY:     true,
    NO_EXTERNAL_SPEND:        true,
    NO_REAL_CREDENTIALS:      true,
    NO_REAL_OAUTH:            true,
    FIXTURE_MODE_ONLY:        true,
    LOCALHOST_5175_NO_TOUCH:  true,
    NO_REAL_CLIENT_DATA:      true,
  },

  scoreWeights: {
    RENDER:        20,
    CONSOLE:       15,
    NETWORK:       10,
    CONTROLS:      10,
    FORMS:          8,
    RESPONSIVE:     8,
    ACCESSIBILITY:  8,
    KEYBOARD:       5,
    VISUAL:         5,
    CRITICAL_FLOWS: 6,
    PERFORMANCE:    5,
  },

  releaseChannels: {
    INTERNAL:   0,
    STAGING:    50,
    BETA:       70,
    PRODUCTION: 85,
  },

  isReal: false,
});
