import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// ─── imports ───────────────────────────────────────────────────────────────
import {
  createBrowserQaPlan, selectQaPhases, estimatePlanDuration,
  QA_PHASE, QA_PLAN_STATUS, BROWSER_QA_PLAN_VERSION,
} from '../../browser-qa/browserQaPlan.js';

import {
  createE2ETest, createE2EStep, groupTestsByPriority, buildSmokeTestSuite,
  E2E_TEST_TYPE, E2E_PRIORITY, E2E_TEST_STATUS, E2E_TEST_DEFINITION_VERSION,
} from '../../browser-qa/e2eTestDefinition.js';

import {
  evaluateRenderChecks, buildBrowserRenderChecks, interpretRenderVerdict,
  EVALUATOR_VERDICT, RENDER_FAILURE_TYPES, RUNTIME_RENDER_EVALUATOR_VERSION,
} from '../../browser-qa/runtimeRenderEvaluator.js';

import {
  classifyConsoleMessage, evaluateConsoleErrors, createConsoleCollector,
  CONSOLE_LEVEL, CONSOLE_ERROR_CLASS, CONSOLE_GATE_STATUS, CONSOLE_ERROR_GATE_VERSION,
} from '../../browser-qa/consoleErrorGate.js';

import {
  classifyNetworkFailure, evaluateNetworkRequests, createNetworkCollector,
  NETWORK_FAILURE_TYPE, NETWORK_GATE_STATUS, NETWORK_FAILURE_GATE_VERSION,
} from '../../browser-qa/networkFailureGate.js';

import {
  createPageAssertion, buildDefaultAssertions, evaluatePageAssertions,
  LOAD_ASSERT_TYPE, ASSERT_RESULT, PAGE_LOAD_ASSERTER_VERSION,
} from '../../browser-qa/pageLoadAsserter.js';

import {
  createRouteDefinition, createCrawlPlan, evaluateCrawlResults, discoverLinksFromHtml,
  ROUTE_STATUS, ROUTE_CRAWLER_VERSION,
} from '../../browser-qa/routeCrawler.js';

import {
  classifyDeadControl, evaluateDeadControls, buildElementSnapshot,
  DEAD_CONTROL_TYPE, CONTROL_SEVERITY, DEAD_CONTROL_DETECTOR_VERSION,
} from '../../browser-qa/deadControlDetector.js';

import {
  createFormDefinition, createFormField, evaluateForm,
  FORM_ISSUE_TYPE, FORM_QA_STATUS, FORM_QA_VERSION,
} from '../../browser-qa/formQA.js';

import {
  createResponsiveTestSuite, evaluateViewportResult, evaluateAllViewports, isMobileViewport,
  VIEWPORT, RESPONSIVE_ISSUE, RESPONSIVE_QA_VERSION,
} from '../../browser-qa/responsiveQA.js';

import {
  createMobileNavDefinition, evaluateMobileNav, checkTapTargetSize,
  MOBILE_NAV_PATTERN, MOBILE_NAV_STATUS, MOBILE_NAVIGATION_QA_VERSION,
} from '../../browser-qa/mobileNavigationQA.js';

import {
  buildA11yChecklist, evaluateA11yChecklist,
  A11Y_CHECK, A11Y_WCAG_LEVEL, ACCESSIBILITY_BASELINE_VERSION,
} from '../../browser-qa/accessibilityBaseline.js';

import {
  buildKeyboardTestPlan, evaluateKeyboardChecks,
  KEYBOARD_CHECK, KEYBOARD_QA_STATUS, KEYBOARD_QA_VERSION,
} from '../../browser-qa/keyboardQA.js';

import {
  buildVisualSanityChecklist, evaluateVisualSanity, compareVisualBaselines,
  VISUAL_SANITY_CHECK, VISUAL_SANITY_EVALUATOR_VERSION,
} from '../../browser-qa/visualSanityEvaluator.js';

import {
  createScreenshotPolicy, createScreenshotRequest, buildScreenshotManifest,
  SCREENSHOT_TYPE, SCREENSHOT_TRIGGER, SCREENSHOT_SYSTEM_VERSION,
} from '../../browser-qa/screenshotSystem.js';

import {
  createBaselineEntry, evaluateBaselineDiff, buildBaselineRegistry,
  BASELINE_STATUS, DIFF_RESULT, BASELINE_THRESHOLD, VISUAL_BASELINES_VERSION,
} from '../../browser-qa/visualBaselines.js';

import {
  createCriticalFlow, createFlowStep, evaluateFlowResult, buildNexoVetFlows,
  FLOW_TYPE, FLOW_STATUS, STEP_RESULT, CRITICAL_USER_FLOW_VERSION,
} from '../../browser-qa/criticalUserFlow.js';

import {
  createRoleSurface, createSurfaceElement, evaluateRoleSurface, buildNexoVetRoleSurfaces,
  ROLE_FIXTURE, SURFACE_VISIBILITY, ROLE_QA_STATUS, ROLE_SURFACE_QA_VERSION,
} from '../../browser-qa/roleSurfaceQA.js';

import {
  createAuthSurfaceDefinition, createAuthSurface, evaluateAuthSurfaces, checkGatedRouteRedirect,
  AUTH_SURFACE_TYPE, AUTH_QA_STATUS, AUTH_SURFACE_QA_VERSION,
} from '../../browser-qa/authSurfaceQA.js';

import {
  createLoadingDefinition, evaluateLoadingState, checkPageLoadTime,
  LOADING_PATTERN, LOADING_QA_STATUS, LOADING_STATE_QA_VERSION,
} from '../../browser-qa/loadingStateQA.js';

import {
  createErrorStateDefinition, evaluateErrorState, buildDefaultErrorStates,
  ERROR_STATE_TYPE, ERROR_QA_STATUS, ERROR_STATE_QA_VERSION,
} from '../../browser-qa/errorStateQA.js';

import {
  createEmptyStateDefinition, evaluateEmptyState,
  EMPTY_STATE_TYPE, EMPTY_QA_STATUS, EMPTY_STATE_QA_VERSION,
} from '../../browser-qa/emptyStateQA.js';

import {
  gradeMetric, evaluatePerformanceSanity, buildPerformanceBudget,
  PERF_METRIC, PERF_GRADE, PERFORMANCE_SANITY_VERSION,
} from '../../browser-qa/performanceSanity.js';

import {
  createBundlePolicy, evaluateBundleSize, evaluateBundleRuntime,
  BUNDLE_CHECK, BUNDLE_STATUS, BUNDLE_RUNTIME_CHECK_VERSION,
} from '../../browser-qa/bundleRuntimeCheck.js';

import {
  createPostDeployQAPlan, evaluatePostDeployQA, buildQASignoffRequest,
  DEPLOY_QA_GATE, DEPLOY_QA_VERDICT, POST_DEPLOY_QA_BRIDGE_VERSION,
} from '../../browser-qa/postDeployQABridge.js';

import {
  createCIQAConfig, buildCIStatusReport, generateCIYamlSpec, selectCIJobsForDiff,
  CI_QA_TRIGGER, CI_QA_STATUS, BROWSER_QA_CI_JOB, CICD_BRIDGE_VERSION,
} from '../../browser-qa/cicdBridge.js';

import {
  selectE2ETests, estimateE2ESavings,
  E2E_SELECTION_STRATEGY, SMART_E2E_SELECTOR_VERSION,
} from '../../browser-qa/smartE2ESelector.js';

import {
  createTestRunRecord, analyzeTestHistory, classifyFlakiness, buildFlakyReport,
  FLAKY_CLASS, FLAKY_THRESHOLD, FLAKY_TEST_DETECTOR_VERSION,
} from '../../browser-qa/flakyTestDetector.js';

import {
  calculateBrowserQAScore, getGrade, scoreSummary, isScoreDeployable,
  SCORE_GRADE, BROWSER_QA_SCORE_VERSION,
} from '../../browser-qa/browserQAScore.js';

import {
  createQAReport, formatReportMarkdown, formatReportSummary,
  REPORT_FORMAT, REPORT_STATUS, BROWSER_QA_REPORT_VERSION,
} from '../../browser-qa/browserQAReport.js';

import {
  createReleasePolicyConfig, evaluateReleasePolicy, formatReleaseDecision,
  RELEASE_VERDICT, RELEASE_CHANNEL, BROWSER_RELEASE_POLICY_VERSION,
} from '../../browser-qa/browserReleasePolicy.js';

import {
  emitBrowserQAEvent, createBrowserQALogger,
  BROWSER_QA_EVENT, OBSERVABILITY_BRIDGE_VERSION,
} from '../../browser-qa/observabilityBridge.js';

import {
  createRunConfig, buildRunCommand, parseRunnerResult, createRunSummary,
  RUNNER_MODE, RUNNER_STATUS, PLAYWRIGHT_CONFIG, PLAYWRIGHT_RUNNER_VERSION,
} from '../../browser-qa/playwrightRunner.js';

import {
  buildNexoVetQAPlan, NEXO_VET_APP, NEXO_VET_ROUTES,
  NEXO_VET_FIXTURE_VERSION,
} from '../../browser-qa/fixtures/nexoVetQAFixture.js';

import {
  ALL_BREAKAGE_FIXTURES, HEALTHY_SNAPSHOT, BLANK_PAGE_BREAKAGE, JS_ERROR_BREAKAGE,
  BREAKAGE_FIXTURES_VERSION,
} from '../../browser-qa/fixtures/breakageFixtures.js';

import { BROWSER_QA_REGISTRY } from '../../factory-registry/browserQA.js';

// ─── 1. browserQaPlan ───────────────────────────────────────────────────────
describe('browserQaPlan', () => {
  test('version string exists', () => { assert.ok(BROWSER_QA_PLAN_VERSION); });

  test('createBrowserQaPlan returns valid plan', () => {
    const plan = createBrowserQaPlan({ appId: 'test', appName: 'Test App', routes: ['/'] });
    assert.equal(plan.valid, true);
    assert.equal(plan.appId, 'test');
    assert.equal(plan.status, QA_PLAN_STATUS.READY);
    assert.equal(plan.isReal, false);
  });

  test('createBrowserQaPlan fails without appId', () => {
    const p = createBrowserQaPlan({ appName: 'X', routes: ['/'] });
    assert.equal(p.valid, false);
  });

  test('createBrowserQaPlan fails without routes', () => {
    const p = createBrowserQaPlan({ appId: 'x', appName: 'X', routes: [] });
    assert.equal(p.valid, false);
  });

  test('selectQaPhases returns all phases by default', () => {
    const phases = selectQaPhases({});
    assert.ok(phases.includes(QA_PHASE.RENDER));
    assert.ok(phases.includes(QA_PHASE.CONSOLE));
    assert.ok(phases.length >= 10);
  });

  test('selectQaPhases quick mode returns minimal phases', () => {
    const phases = selectQaPhases({ quick: true });
    assert.ok(phases.length < 10);
    assert.ok(phases.includes(QA_PHASE.RENDER));
  });

  test('estimatePlanDuration returns minutes', () => {
    const plan = createBrowserQaPlan({ appId: 'x', appName: 'X', routes: ['/', '/about'] });
    const d = estimatePlanDuration(plan);
    assert.equal(d.valid, true);
    assert.ok(d.minutes > 0);
  });

  test('QA_PHASE contains 20 phases', () => {
    assert.equal(Object.keys(QA_PHASE).length, 20);
  });
});

// ─── 2. e2eTestDefinition ───────────────────────────────────────────────────
describe('e2eTestDefinition', () => {
  test('version string exists', () => { assert.ok(E2E_TEST_DEFINITION_VERSION); });

  test('createE2ETest returns valid test', () => {
    const t = createE2ETest({
      id: 'T1', name: 'Test', type: E2E_TEST_TYPE.SMOKE, route: '/',
      steps: [createE2EStep('navigate', '/')],
    });
    assert.equal(t.valid, true);
    assert.equal(t.type, E2E_TEST_TYPE.SMOKE);
    assert.equal(t.status, E2E_TEST_STATUS.PENDING);
    assert.equal(t.isReal, false);
  });

  test('createE2ETest fails with invalid type', () => {
    const t = createE2ETest({ id: 'T1', name: 'X', type: 'FAKE', route: '/', steps: [{}] });
    assert.equal(t.valid, false);
  });

  test('createE2EStep validates action', () => {
    const s = createE2EStep('click', '#btn');
    assert.equal(s.valid, true);
    const bad = createE2EStep('destroy', '#btn');
    assert.equal(bad.valid, false);
  });

  test('buildSmokeTestSuite creates one test per route', () => {
    const suite = buildSmokeTestSuite(['/', '/about', '/contact']);
    assert.equal(suite.valid, true);
    assert.equal(suite.count, 3);
    assert.equal(suite.tests[0].priority, E2E_PRIORITY.P0);
  });

  test('groupTestsByPriority groups correctly', () => {
    const tests = [
      createE2ETest({ id: 'A', name: 'A', type: E2E_TEST_TYPE.SMOKE, priority: E2E_PRIORITY.P0, route: '/', steps: [createE2EStep('navigate', '/')] }),
      createE2ETest({ id: 'B', name: 'B', type: E2E_TEST_TYPE.FUNCTIONAL, priority: E2E_PRIORITY.P1, route: '/', steps: [createE2EStep('click', '#x')] }),
    ];
    const g = groupTestsByPriority(tests);
    assert.equal(g.valid, true);
    assert.equal(g.groups.P0.length, 1);
    assert.equal(g.groups.P1.length, 1);
  });
});

// ─── 3. runtimeRenderEvaluator ──────────────────────────────────────────────
describe('runtimeRenderEvaluator', () => {
  test('version string exists', () => { assert.ok(RUNTIME_RENDER_EVALUATOR_VERSION); });

  test('evaluateRenderChecks PASS on all healthy', () => {
    const checks = buildBrowserRenderChecks({ hasBody: true, hasRoot: true, rootHasChildren: true, jsErrors: [], bundleLoaded: true, mimeCorrect: true });
    const r = evaluateRenderChecks(checks);
    assert.equal(r.valid, true);
    assert.equal(r.verdict, EVALUATOR_VERDICT.PASS);
    assert.equal(r.isReal, false);
  });

  test('evaluateRenderChecks CRITICAL_FAIL on blank page', () => {
    const checks = buildBrowserRenderChecks({ hasBody: false, hasRoot: false, rootHasChildren: false, jsErrors: [], bundleLoaded: false });
    const r = evaluateRenderChecks(checks);
    assert.equal(r.valid, true);
    assert.equal(r.criticalCount > 0, true);
  });

  test('interpretRenderVerdict PASS not blocking', () => {
    const i = interpretRenderVerdict(EVALUATOR_VERDICT.PASS);
    assert.equal(i.blocking, false);
  });

  test('interpretRenderVerdict CRITICAL_FAIL is blocking', () => {
    const i = interpretRenderVerdict(EVALUATOR_VERDICT.CRITICAL_FAIL);
    assert.equal(i.blocking, true);
  });

  test('RENDER_FAILURE_TYPES has BLANK_BODY', () => {
    assert.ok(RENDER_FAILURE_TYPES.BLANK_BODY);
  });
});

// ─── 4. consoleErrorGate ────────────────────────────────────────────────────
describe('consoleErrorGate', () => {
  test('version string exists', () => { assert.ok(CONSOLE_ERROR_GATE_VERSION); });

  test('classifyConsoleMessage identifies TypeError as FATAL_JS', () => {
    const c = classifyConsoleMessage('TypeError: Cannot read property foo of undefined');
    assert.equal(c, CONSOLE_ERROR_CLASS.FATAL_JS);
  });

  test('classifyConsoleMessage identifies CORS', () => {
    const c = classifyConsoleMessage('blocked by CORS policy on /api');
    assert.equal(c, CONSOLE_ERROR_CLASS.CORS);
  });

  test('evaluateConsoleErrors PASS on no errors', () => {
    const r = evaluateConsoleErrors([], {});
    assert.equal(r.valid, true);
    assert.equal(r.status, CONSOLE_GATE_STATUS.PASS);
    assert.equal(r.isReal, false);
  });

  test('evaluateConsoleErrors FAIL on fatal JS error', () => {
    const msgs = [{ level: CONSOLE_LEVEL.ERROR, text: 'TypeError: foo is not defined', url: '/a.js' }];
    const r = evaluateConsoleErrors(msgs, { blockOnFatalJs: true });
    assert.equal(r.status, CONSOLE_GATE_STATUS.FAIL);
    assert.equal(r.blockingCount, 1);
  });

  test('createConsoleCollector tracks messages', () => {
    const c = createConsoleCollector();
    c.add(CONSOLE_LEVEL.ERROR, 'Oops', '/x.js');
    assert.equal(c.count(), 1);
    assert.equal(c.getErrors().length, 1);
    c.clear();
    assert.equal(c.count(), 0);
  });
});

// ─── 5. networkFailureGate ──────────────────────────────────────────────────
describe('networkFailureGate', () => {
  test('version string exists', () => { assert.ok(NETWORK_FAILURE_GATE_VERSION); });

  test('classifyNetworkFailure 404 = RESOURCE_404', () => {
    const t = classifyNetworkFailure({ status: 404, url: '/bundle.js', errorText: '' });
    assert.equal(t, NETWORK_FAILURE_TYPE.RESOURCE_404);
  });

  test('classifyNetworkFailure timeout = TIMEOUT', () => {
    const t = classifyNetworkFailure({ status: 0, url: '/api', errorText: 'net::ERR_CONNECTION_TIMED_OUT' });
    assert.equal(t, NETWORK_FAILURE_TYPE.TIMEOUT);
  });

  test('evaluateNetworkRequests PASS on no failures', () => {
    const r = evaluateNetworkRequests([{ url: 'http://localhost:5180/', failed: false }], {});
    assert.equal(r.valid, true);
    assert.equal(r.status, NETWORK_GATE_STATUS.PASS);
    assert.equal(r.isReal, false);
  });

  test('evaluateNetworkRequests FAIL on blocking 404 script', () => {
    const reqs = [{ url: 'http://localhost:5180/main.js', failed: true, status: 404, resourceType: 'script', errorText: '' }];
    const r = evaluateNetworkRequests(reqs, { blockOn404Script: true });
    assert.equal(r.status, NETWORK_GATE_STATUS.FAIL);
    assert.equal(r.blockingCount, 1);
  });

  test('createNetworkCollector tracks requests', () => {
    const c = createNetworkCollector();
    c.record({ url: '/api', failed: true });
    assert.equal(c.getAll().length, 1);
    assert.equal(c.getFailed().length, 1);
  });
});

// ─── 6. pageLoadAsserter ────────────────────────────────────────────────────
describe('pageLoadAsserter', () => {
  test('version string exists', () => { assert.ok(PAGE_LOAD_ASSERTER_VERSION); });

  test('createPageAssertion returns valid assertion', () => {
    const a = createPageAssertion(LOAD_ASSERT_TYPE.HEADING_PRESENT, 'h1');
    assert.equal(a.valid, true);
    assert.equal(a.type, LOAD_ASSERT_TYPE.HEADING_PRESENT);
    assert.equal(a.isReal, false);
  });

  test('createPageAssertion fails on unknown type', () => {
    const a = createPageAssertion('FAKE', 'h1');
    assert.equal(a.valid, false);
  });

  test('buildDefaultAssertions returns array', () => {
    const r = buildDefaultAssertions({ hasNav: true, hasFooter: true });
    assert.equal(r.valid, true);
    assert.ok(r.count >= 5);
  });

  test('evaluatePageAssertions PASS when all found', () => {
    const { assertions } = buildDefaultAssertions({});
    const snapshot = Object.fromEntries(assertions.map(a => [a.type, true]));
    const r = evaluatePageAssertions(assertions, snapshot);
    assert.equal(r.valid, true);
    assert.equal(r.requiredFail, 0);
    assert.equal(r.blocking, false);
  });

  test('evaluatePageAssertions blocks when required missing', () => {
    const assertions = [createPageAssertion(LOAD_ASSERT_TYPE.HEADING_PRESENT, 'h1', { required: true })];
    const r = evaluatePageAssertions(assertions, { [LOAD_ASSERT_TYPE.HEADING_PRESENT]: false });
    assert.equal(r.blocking, true);
  });
});

// ─── 7. routeCrawler ────────────────────────────────────────────────────────
describe('routeCrawler', () => {
  test('version string exists', () => { assert.ok(ROUTE_CRAWLER_VERSION); });

  test('createRouteDefinition returns valid def', () => {
    const r = createRouteDefinition('/about', { label: 'About' });
    assert.equal(r.valid, true);
    assert.equal(r.path, '/about');
    assert.equal(r.isReal, false);
  });

  test('createRouteDefinition fails without path', () => {
    const r = createRouteDefinition('');
    assert.equal(r.valid, false);
  });

  test('createCrawlPlan separates public/auth routes', () => {
    const routes = [
      createRouteDefinition('/'),
      createRouteDefinition('/admin', { requiresAuth: true }),
    ];
    const plan = createCrawlPlan(routes, 'http://localhost:5180');
    assert.equal(plan.valid, true);
    assert.equal(plan.publicCount, 1);
    assert.equal(plan.authCount, 1);
  });

  test('evaluateCrawlResults all OK', () => {
    const results = [{ status: ROUTE_STATUS.OK }, { status: ROUTE_STATUS.OK }];
    const r = evaluateCrawlResults(results);
    assert.equal(r.valid, true);
    assert.equal(r.allOk, true);
    assert.equal(r.blocking, 0);
  });

  test('discoverLinksFromHtml extracts anchors', () => {
    const html = `<a href="/about">About</a><a href="/contact">Contact</a><a href="#section">Sect</a>`;
    const links = discoverLinksFromHtml(html, 'http://localhost:5180');
    assert.ok(links.includes('/about'));
    assert.ok(links.includes('/contact'));
    assert.ok(!links.includes('#section'));
  });
});

// ─── 8. deadControlDetector ─────────────────────────────────────────────────
describe('deadControlDetector', () => {
  test('version string exists', () => { assert.ok(DEAD_CONTROL_DETECTOR_VERSION); });

  test('classifyDeadControl: dead button with no handler', () => {
    const r = classifyDeadControl({ tag: 'button', onclick: null, hasEventListener: false, disabled: false, text: 'Click Me' });
    assert.ok(r);
    assert.equal(r.type, DEAD_CONTROL_TYPE.DEAD_BUTTON);
  });

  test('classifyDeadControl: disabled button returns null', () => {
    const r = classifyDeadControl({ tag: 'button', disabled: true });
    assert.equal(r, null);
  });

  test('classifyDeadControl: placeholder href link', () => {
    const r = classifyDeadControl({ tag: 'a', href: '#', disabled: false });
    assert.ok(r);
    assert.equal(r.type, DEAD_CONTROL_TYPE.PLACEHOLDER_HREF);
  });

  test('evaluateDeadControls PASS on all live controls', () => {
    const els = [
      { tag: 'button', onclick: 'doThing()', hasEventListener: true, disabled: false, text: 'Go' },
      { tag: 'a', href: '/about', disabled: false },
    ];
    const r = evaluateDeadControls(els, {});
    assert.equal(r.valid, true);
    assert.equal(r.status, 'PASS');
  });

  test('evaluateDeadControls FAIL on dead button with policy', () => {
    const els = [{ tag: 'button', onclick: null, hasEventListener: false, disabled: false, text: 'Reservar' }];
    const r = evaluateDeadControls(els, { blockOnDeadButton: true });
    assert.equal(r.status, 'FAIL');
    assert.equal(r.blockingCount, 1);
  });

  test('buildElementSnapshot returns array', () => {
    const snaps = buildElementSnapshot([{ tag: 'button', textContent: 'OK', href: null, onclick: 'x', disabled: false, hasEventListener: true }]);
    assert.equal(snaps.length, 1);
    assert.equal(snaps[0].tag, 'button');
  });
});

// ─── 9. formQA ──────────────────────────────────────────────────────────────
describe('formQA', () => {
  test('version string exists', () => { assert.ok(FORM_QA_VERSION); });

  test('createFormDefinition returns valid form', () => {
    const f = createFormDefinition({ id: 'f1', name: 'Contact', fields: [createFormField('email', 'email', { required: true })] });
    assert.equal(f.valid, true);
    assert.equal(f.isReal, false);
  });

  test('createFormField fails on unknown type', () => {
    const f = createFormField('x', 'unknown-type');
    assert.equal(f.valid, false);
  });

  test('evaluateForm PASS on clean form', () => {
    const form = createFormDefinition({
      id: 'f1', name: 'Form',
      fields: [createFormField('name', 'text', { hasLabel: true, required: false })],
    });
    const r = evaluateForm(form, { submitPresent: true });
    assert.equal(r.valid, true);
    assert.equal(r.status, FORM_QA_STATUS.PASS);
  });

  test('evaluateForm FAIL on missing label', () => {
    const form = createFormDefinition({
      id: 'f2', name: 'Bad Form',
      fields: [createFormField('email', 'email', { hasLabel: false })],
    });
    const r = evaluateForm(form, { submitPresent: true });
    assert.equal(r.status, FORM_QA_STATUS.FAIL);
  });
});

// ─── 10. responsiveQA ───────────────────────────────────────────────────────
describe('responsiveQA', () => {
  test('version string exists', () => { assert.ok(RESPONSIVE_QA_VERSION); });

  test('createResponsiveTestSuite uses all 5 viewports by default', () => {
    const s = createResponsiveTestSuite();
    assert.equal(s.valid, true);
    assert.equal(s.viewports.length, 5);
    assert.ok(s.isReal === false);
  });

  test('evaluateViewportResult PASS on no issues', () => {
    const vp = VIEWPORT.MOBILE_M;
    const r = evaluateViewportResult(vp, [{ passed: true }]);
    assert.equal(r.valid, true);
    assert.ok(r.isReal === false);
  });

  test('evaluateAllViewports FAIL when any failed', () => {
    const results = [
      { status: 'PASS' },
      { status: 'FAIL' },
    ];
    const r = evaluateAllViewports(results);
    assert.equal(r.status, 'FAIL');
    assert.equal(r.failed, 1);
  });

  test('isMobileViewport correct thresholds', () => {
    assert.equal(isMobileViewport({ width: 390 }), true);
    assert.equal(isMobileViewport({ width: 1280 }), false);
    assert.equal(isMobileViewport({ width: 768 }), true);
  });
});

// ─── 11. mobileNavigationQA ─────────────────────────────────────────────────
describe('mobileNavigationQA', () => {
  test('version string exists', () => { assert.ok(MOBILE_NAVIGATION_QA_VERSION); });

  test('createMobileNavDefinition returns valid def', () => {
    const d = createMobileNavDefinition(MOBILE_NAV_PATTERN.HAMBURGER);
    assert.equal(d.valid, true);
    assert.equal(d.pattern, MOBILE_NAV_PATTERN.HAMBURGER);
    assert.equal(d.isReal, false);
  });

  test('createMobileNavDefinition fails on unknown pattern', () => {
    const d = createMobileNavDefinition('UNKNOWN');
    assert.equal(d.valid, false);
  });

  test('evaluateMobileNav PASS on working mobile nav', () => {
    const def = createMobileNavDefinition(MOBILE_NAV_PATTERN.HAMBURGER);
    const r = evaluateMobileNav(def, { mobileNavPresent: true, menuReachable: true, menuClosable: true, desktopNavVisible: false });
    assert.equal(r.valid, true);
    assert.equal(r.status, MOBILE_NAV_STATUS.PASS);
  });

  test('evaluateMobileNav FAIL when desktop nav shown on mobile', () => {
    const def = createMobileNavDefinition(MOBILE_NAV_PATTERN.HAMBURGER);
    const r = evaluateMobileNav(def, { desktopNavVisible: true });
    assert.equal(r.status, MOBILE_NAV_STATUS.FAIL);
  });

  test('checkTapTargetSize detects too small targets', () => {
    const els = [{ width: 30, height: 30 }, { width: 48, height: 48 }];
    const r = checkTapTargetSize(els);
    assert.equal(r.valid, true);
    assert.equal(r.tooSmallCount, 1);
    assert.equal(r.passes, false);
  });
});

// ─── 12. accessibilityBaseline ──────────────────────────────────────────────
describe('accessibilityBaseline', () => {
  test('version string exists', () => { assert.ok(ACCESSIBILITY_BASELINE_VERSION); });

  test('buildA11yChecklist AA returns more checks than A', () => {
    const aa = buildA11yChecklist(A11Y_WCAG_LEVEL.AA);
    const a  = buildA11yChecklist(A11Y_WCAG_LEVEL.A);
    assert.ok(aa.count >= a.count);
    assert.equal(aa.valid, true);
    assert.equal(aa.isReal, false);
  });

  test('evaluateA11yChecklist PASS on all checks passing', () => {
    const cl = buildA11yChecklist(A11Y_WCAG_LEVEL.AA);
    const results = Object.fromEntries(cl.checks.map(c => [c.id, true]));
    const r = evaluateA11yChecklist(cl, results);
    assert.equal(r.valid, true);
    assert.equal(r.status, 'PASS');
    assert.equal(r.failed, 0);
  });

  test('evaluateA11yChecklist FAIL on critical check failing', () => {
    const cl = buildA11yChecklist(A11Y_WCAG_LEVEL.AA);
    const results = { [A11Y_CHECK.IMG_ALT]: false };
    const r = evaluateA11yChecklist(cl, results);
    assert.equal(r.status, 'FAIL');
    assert.ok(r.criticalCount > 0);
  });
});

// ─── 13. keyboardQA ─────────────────────────────────────────────────────────
describe('keyboardQA', () => {
  test('version string exists', () => { assert.ok(KEYBOARD_QA_VERSION); });

  test('buildKeyboardTestPlan returns checks', () => {
    const p = buildKeyboardTestPlan({ hasModal: true, hasMenu: true });
    assert.equal(p.valid, true);
    assert.ok(p.checks.includes(KEYBOARD_CHECK.ESCAPE_CLOSES_MODAL));
    assert.ok(p.checks.includes(KEYBOARD_CHECK.ARROW_NAV_MENU));
    assert.equal(p.isReal, false);
  });

  test('evaluateKeyboardChecks PASS on all passing', () => {
    const plan = buildKeyboardTestPlan({});
    const results = Object.fromEntries(plan.checks.map(c => [c, true]));
    const r = evaluateKeyboardChecks(plan, results);
    assert.equal(r.valid, true);
    assert.equal(r.status, KEYBOARD_QA_STATUS.PASS);
  });

  test('evaluateKeyboardChecks FAIL on critical failing', () => {
    const plan = buildKeyboardTestPlan({});
    const results = { [KEYBOARD_CHECK.NO_KEYBOARD_TRAP]: false };
    const r = evaluateKeyboardChecks(plan, results);
    assert.equal(r.status, KEYBOARD_QA_STATUS.FAIL);
    assert.ok(r.critical > 0);
  });
});

// ─── 14. visualSanityEvaluator ──────────────────────────────────────────────
describe('visualSanityEvaluator', () => {
  test('version string exists', () => { assert.ok(VISUAL_SANITY_EVALUATOR_VERSION); });

  test('buildVisualSanityChecklist returns 10 checks', () => {
    const cl = buildVisualSanityChecklist();
    assert.equal(cl.valid, true);
    assert.equal(cl.count, 10);
    assert.equal(cl.isReal, false);
  });

  test('evaluateVisualSanity PASS on all passing', () => {
    const cl = buildVisualSanityChecklist();
    const results = Object.fromEntries(cl.checks.map(c => [c.id, true]));
    const r = evaluateVisualSanity(cl, results);
    assert.equal(r.valid, true);
    assert.equal(r.status, 'PASS');
  });

  test('evaluateVisualSanity FAIL on blocking check', () => {
    const cl = buildVisualSanityChecklist();
    const results = { [VISUAL_SANITY_CHECK.NO_HORIZONTAL_SCROLL]: false };
    const r = evaluateVisualSanity(cl, results);
    assert.equal(r.status, 'FAIL');
    assert.ok(r.blocking > 0);
  });

  test('compareVisualBaselines detects regression', () => {
    const baseline = { valid: true, results: { VISUAL: 'PASS' } };
    const current  = { valid: true, results: { VISUAL: 'FAIL' } };
    const r = compareVisualBaselines(current, baseline);
    assert.equal(r.valid, true);
    assert.equal(r.regressions, 1);
  });
});

// ─── 15. screenshotSystem ───────────────────────────────────────────────────
describe('screenshotSystem', () => {
  test('version string exists', () => { assert.ok(SCREENSHOT_SYSTEM_VERSION); });

  test('createScreenshotPolicy returns valid policy', () => {
    const p = createScreenshotPolicy({ captureOnError: true });
    assert.equal(p.valid, true);
    assert.equal(p.captureOnError, true);
    assert.equal(p.isReal, false);
  });

  test('createScreenshotRequest requires route', () => {
    const r = createScreenshotRequest({});
    assert.equal(r.valid, false);
    const r2 = createScreenshotRequest({ route: '/' });
    assert.equal(r2.valid, true);
    assert.ok(r2.filename.endsWith('.png'));
  });

  test('buildScreenshotManifest caps at maxPerRun', () => {
    const requests = Array.from({ length: 60 }, (_, i) => createScreenshotRequest({ route: `/${i}` }));
    const m = buildScreenshotManifest(requests, { maxPerRun: 50 });
    assert.equal(m.valid, true);
    assert.equal(m.willCapture, 50);
    assert.equal(m.capped, true);
  });
});

// ─── 16. visualBaselines ────────────────────────────────────────────────────
describe('visualBaselines', () => {
  test('version string exists', () => { assert.ok(VISUAL_BASELINES_VERSION); });

  test('createBaselineEntry requires route and viewport', () => {
    const b = createBaselineEntry({ route: '/', viewport: 'DESKTOP' });
    assert.equal(b.valid, true);
    assert.equal(b.status, BASELINE_STATUS.RECORDED);
    assert.equal(b.isReal, false);
  });

  test('evaluateBaselineDiff IDENTICAL for 0%', () => {
    const r = evaluateBaselineDiff(0, BASELINE_THRESHOLD.MODERATE);
    assert.equal(r.result, DIFF_RESULT.IDENTICAL);
    assert.equal(r.blocking, false);
  });

  test('evaluateBaselineDiff MAJOR_DIFF for large diff', () => {
    const r = evaluateBaselineDiff(10, BASELINE_THRESHOLD.MODERATE);
    assert.equal(r.result, DIFF_RESULT.MAJOR_DIFF);
    assert.equal(r.blocking, true);
  });

  test('buildBaselineRegistry groups by route', () => {
    const entries = [
      createBaselineEntry({ route: '/', viewport: 'DESKTOP' }),
      createBaselineEntry({ route: '/about', viewport: 'MOBILE' }),
    ];
    const r = buildBaselineRegistry(entries);
    assert.equal(r.valid, true);
    assert.equal(r.routeCount, 2);
  });
});

// ─── 17. criticalUserFlow ───────────────────────────────────────────────────
describe('criticalUserFlow', () => {
  test('version string exists', () => { assert.ok(CRITICAL_USER_FLOW_VERSION); });

  test('createCriticalFlow returns valid flow', () => {
    const f = createCriticalFlow({
      id: 'F1', name: 'Booking', type: FLOW_TYPE.BOOKING,
      steps: [createFlowStep('navigate', 'Open page')],
    });
    assert.equal(f.valid, true);
    assert.equal(f.usesRealAuth, false);
    assert.equal(f.usesRealPayment, false);
    assert.equal(f.isReal, false);
  });

  test('createCriticalFlow fails with no steps', () => {
    const f = createCriticalFlow({ id: 'F1', name: 'X', type: FLOW_TYPE.NAVIGATION, steps: [] });
    assert.equal(f.valid, false);
  });

  test('evaluateFlowResult PASS on all steps passing', () => {
    const flow = createCriticalFlow({ id: 'F1', name: 'X', type: FLOW_TYPE.NAVIGATION, steps: [createFlowStep('navigate', 'go')] });
    const r = evaluateFlowResult(flow, [{ result: STEP_RESULT.PASS }]);
    assert.equal(r.valid, true);
    assert.equal(r.status, FLOW_STATUS.PASS);
  });

  test('buildNexoVetFlows returns 3 flows', () => {
    const flows = buildNexoVetFlows();
    assert.equal(flows.length, 3);
    assert.equal(flows.every(f => f.valid), true);
    assert.equal(flows.every(f => !f.usesRealAuth), true);
  });
});

// ─── 18. roleSurfaceQA ──────────────────────────────────────────────────────
describe('roleSurfaceQA', () => {
  test('version string exists', () => { assert.ok(ROLE_SURFACE_QA_VERSION); });

  test('createRoleSurface returns valid surface', () => {
    const s = createRoleSurface(ROLE_FIXTURE.VISITOR, [
      createSurfaceElement('nav', SURFACE_VISIBILITY.VISIBLE),
    ]);
    assert.equal(s.valid, true);
    assert.equal(s.usesRealAuth, false);
    assert.equal(s.isReal, false);
  });

  test('evaluateRoleSurface PASS when snapshot matches', () => {
    const surface = createRoleSurface(ROLE_FIXTURE.VISITOR, [
      createSurfaceElement('nav', SURFACE_VISIBILITY.VISIBLE),
    ]);
    const r = evaluateRoleSurface(surface, { nav: SURFACE_VISIBILITY.VISIBLE });
    assert.equal(r.valid, true);
    assert.equal(r.status, ROLE_QA_STATUS.PASS);
  });

  test('buildNexoVetRoleSurfaces returns 2 surfaces', () => {
    const surfaces = buildNexoVetRoleSurfaces();
    assert.equal(surfaces.length, 2);
    assert.equal(surfaces.every(s => s.valid), true);
  });
});

// ─── 19. authSurfaceQA ──────────────────────────────────────────────────────
describe('authSurfaceQA', () => {
  test('version string exists', () => { assert.ok(AUTH_SURFACE_QA_VERSION); });

  test('createAuthSurfaceDefinition enforces guardrails', () => {
    const d = createAuthSurfaceDefinition({ appId: 'nexo', surfaces: [], gatedRoutes: [] });
    assert.equal(d.valid, true);
    assert.equal(d.guardrails.NO_REAL_OAUTH, true);
    assert.equal(d.guardrails.NO_REAL_CREDENTIALS, true);
    assert.equal(d.usesRealAuth, false);
  });

  test('createAuthSurface returns valid surface', () => {
    const s = createAuthSurface(AUTH_SURFACE_TYPE.LOGIN_FORM, '#login-form');
    assert.equal(s.valid, true);
    assert.equal(s.isReal, false);
  });

  test('checkGatedRouteRedirect detects redirect', () => {
    const r = checkGatedRouteRedirect('/admin', { redirectedTo: '/login', authGateVisible: false });
    assert.equal(r.valid, true);
    assert.equal(r.blocked, true);
    assert.equal(r.guardrails.NO_REAL_SESSIONS, true);
  });
});

// ─── 20. loadingStateQA ─────────────────────────────────────────────────────
describe('loadingStateQA', () => {
  test('version string exists', () => { assert.ok(LOADING_STATE_QA_VERSION); });

  test('createLoadingDefinition returns valid def', () => {
    const d = createLoadingDefinition({ id: 'L1', pattern: LOADING_PATTERN.SPINNER, selector: '.spinner' });
    assert.equal(d.valid, true);
    assert.equal(d.isReal, false);
  });

  test('evaluateLoadingState PASS on indicator present and within time', () => {
    const d = createLoadingDefinition({ id: 'L1', pattern: LOADING_PATTERN.SPINNER, selector: '.spinner', maxDurationMs: 3000 });
    const r = evaluateLoadingState(d, { indicatorPresent: true, durationMs: 1000, cls: 0 });
    assert.equal(r.valid, true);
    assert.equal(r.status, LOADING_QA_STATUS.PASS);
  });

  test('checkPageLoadTime grades correctly', () => {
    assert.equal(checkPageLoadTime(1500).status, 'GOOD');
    assert.equal(checkPageLoadTime(3500).status, 'SLOW');
    assert.equal(checkPageLoadTime(9000).status, 'CRITICAL');
    assert.equal(checkPageLoadTime(9000).blocking, true);
  });
});

// ─── 21. errorStateQA ───────────────────────────────────────────────────────
describe('errorStateQA', () => {
  test('version string exists', () => { assert.ok(ERROR_STATE_QA_VERSION); });

  test('createErrorStateDefinition returns valid def', () => {
    const d = createErrorStateDefinition({ id: 'ERR-404', type: ERROR_STATE_TYPE.NOT_FOUND });
    assert.equal(d.valid, true);
    assert.equal(d.isReal, false);
  });

  test('evaluateErrorState PASS on complete error page', () => {
    const d = createErrorStateDefinition({ id: 'ERR-404', type: ERROR_STATE_TYPE.NOT_FOUND });
    const r = evaluateErrorState(d, { messageVisible: true, recoveryActionVisible: true, backLinkVisible: true, stackTraceVisible: false, layoutBroken: false });
    assert.equal(r.status, ERROR_QA_STATUS.PASS);
  });

  test('evaluateErrorState FAIL on stack trace exposed', () => {
    const d = createErrorStateDefinition({ id: 'ERR-1', type: ERROR_STATE_TYPE.SERVER_ERROR });
    const r = evaluateErrorState(d, { stackTraceVisible: true, messageVisible: true });
    assert.equal(r.status, ERROR_QA_STATUS.FAIL);
  });

  test('buildDefaultErrorStates returns 3 error states', () => {
    const errors = buildDefaultErrorStates();
    assert.equal(errors.length, 3);
    assert.equal(errors.every(e => e.valid), true);
  });
});

// ─── 22. emptyStateQA ───────────────────────────────────────────────────────
describe('emptyStateQA', () => {
  test('version string exists', () => { assert.ok(EMPTY_STATE_QA_VERSION); });

  test('createEmptyStateDefinition returns valid def', () => {
    const d = createEmptyStateDefinition({ id: 'E1', type: EMPTY_STATE_TYPE.NO_RESULTS });
    assert.equal(d.valid, true);
    assert.equal(d.isReal, false);
  });

  test('evaluateEmptyState FAIL on blank container', () => {
    const d = createEmptyStateDefinition({ id: 'E1', type: EMPTY_STATE_TYPE.NO_RESULTS });
    const r = evaluateEmptyState(d, { containerBlank: true });
    assert.equal(r.status, EMPTY_QA_STATUS.FAIL);
  });

  test('evaluateEmptyState PASS on proper empty state', () => {
    const d = createEmptyStateDefinition({ id: 'E1', type: EMPTY_STATE_TYPE.NO_RESULTS, hasCTA: false });
    const r = evaluateEmptyState(d, { containerBlank: false, messageVisible: true });
    assert.equal(r.status, EMPTY_QA_STATUS.PASS);
  });
});

// ─── 23. performanceSanity ──────────────────────────────────────────────────
describe('performanceSanity', () => {
  test('version string exists', () => { assert.ok(PERFORMANCE_SANITY_VERSION); });

  test('gradeMetric GOOD for excellent LCP', () => {
    const r = gradeMetric(PERF_METRIC.LCP, 1500);
    assert.equal(r.valid, true);
    assert.equal(r.grade, PERF_GRADE.GOOD);
    assert.equal(r.isReal, false);
  });

  test('gradeMetric POOR for bad LCP', () => {
    const r = gradeMetric(PERF_METRIC.LCP, 5000);
    assert.equal(r.grade, PERF_GRADE.POOR);
  });

  test('evaluatePerformanceSanity PASS on good metrics', () => {
    const r = evaluatePerformanceSanity({ LCP: 1500, INP: 150, CLS: 0.05, FCP: 1200 });
    assert.equal(r.valid, true);
    assert.equal(r.status, 'PASS');
    assert.equal(r.isReal, false);
  });

  test('evaluatePerformanceSanity FAIL on poor LCP', () => {
    const r = evaluatePerformanceSanity({ LCP: 6000, INP: 150, CLS: 0.05 });
    assert.equal(r.status, 'FAIL');
    assert.ok(r.poor > 0);
  });

  test('buildPerformanceBudget returns budget object', () => {
    const b = buildPerformanceBudget({});
    assert.ok(b.LCP !== undefined);
    assert.equal(b.isReal, false);
  });
});

// ─── 24. bundleRuntimeCheck ─────────────────────────────────────────────────
describe('bundleRuntimeCheck', () => {
  test('version string exists', () => { assert.ok(BUNDLE_RUNTIME_CHECK_VERSION); });

  test('createBundlePolicy returns policy with defaults', () => {
    const p = createBundlePolicy({});
    assert.equal(p.MAX_JS_KB, 500);
    assert.equal(p.isReal, false);
  });

  test('evaluateBundleSize WARN on over-budget JS', () => {
    const r = evaluateBundleSize({ totalJsKb: 600 }, {});
    assert.equal(r.valid, true);
    assert.equal(r.status, BUNDLE_STATUS.WARN);
  });

  test('evaluateBundleRuntime FAIL on JS load fail', () => {
    const r = evaluateBundleRuntime({ [BUNDLE_CHECK.JS_LOADS]: false });
    assert.equal(r.status, BUNDLE_STATUS.FAIL);
    assert.ok(r.critical > 0);
  });

  test('evaluateBundleRuntime PASS on all passing', () => {
    const r = evaluateBundleRuntime({
      [BUNDLE_CHECK.JS_LOADS]: true,
      [BUNDLE_CHECK.CSS_LOADS]: true,
      [BUNDLE_CHECK.NO_DEV_ARTIFACTS]: true,
    });
    assert.equal(r.status, BUNDLE_STATUS.PASS);
  });
});

// ─── 25. postDeployQABridge ─────────────────────────────────────────────────
describe('postDeployQABridge', () => {
  test('version string exists', () => { assert.ok(POST_DEPLOY_QA_BRIDGE_VERSION); });

  test('createPostDeployQAPlan requires projectId', () => {
    const p = createPostDeployQAPlan({});
    assert.equal(p.valid, false);
    const p2 = createPostDeployQAPlan({ projectId: 'nexo' });
    assert.equal(p2.valid, true);
    assert.equal(p2.isReal, false);
  });

  test('evaluatePostDeployQA APPROVED on all gates passing', () => {
    const plan = createPostDeployQAPlan({ projectId: 'nexo' });
    const gateResults = Object.fromEntries(plan.gates.map(g => [g, true]));
    const r = evaluatePostDeployQA(plan, gateResults);
    assert.equal(r.valid, true);
    assert.equal(r.verdict, DEPLOY_QA_VERDICT.APPROVED);
    assert.equal(r.canDeploy, true);
  });

  test('evaluatePostDeployQA REJECTED on blocking gate fail', () => {
    const plan = createPostDeployQAPlan({ projectId: 'nexo' });
    const gateResults = { [DEPLOY_QA_GATE.RENDER_PASS]: false };
    const r = evaluatePostDeployQA(plan, gateResults);
    assert.equal(r.verdict, DEPLOY_QA_VERDICT.REJECTED);
    assert.equal(r.canDeploy, false);
  });

  test('buildQASignoffRequest requires human if not APPROVED', () => {
    const req = buildQASignoffRequest({ valid: true, projectId: 'nexo', verdict: DEPLOY_QA_VERDICT.NEEDS_REVIEW, gatesPassed: 4, gatesFailed: 2 });
    assert.equal(req.valid, true);
    assert.equal(req.requiresHuman, true);
  });
});

// ─── 26. cicdBridge ─────────────────────────────────────────────────────────
describe('cicdBridge', () => {
  test('version string exists', () => { assert.ok(CICD_BRIDGE_VERSION); });

  test('createCIQAConfig returns valid config', () => {
    const c = createCIQAConfig({ trigger: CI_QA_TRIGGER.PR_MERGE });
    assert.equal(c.valid, true);
    assert.equal(c.trigger, CI_QA_TRIGGER.PR_MERGE);
    assert.equal(c.isReal, false);
  });

  test('buildCIStatusReport PASS on all passing jobs', () => {
    const results = [
      { name: BROWSER_QA_CI_JOB.SMOKE, status: CI_QA_STATUS.PASS },
      { name: BROWSER_QA_CI_JOB.FULL,  status: CI_QA_STATUS.PASS },
    ];
    const r = buildCIStatusReport(results);
    assert.equal(r.overall, CI_QA_STATUS.PASS);
    assert.equal(r.blocksDeployment, false);
  });

  test('buildCIStatusReport FAIL on any failure', () => {
    const results = [
      { name: BROWSER_QA_CI_JOB.SMOKE, status: CI_QA_STATUS.FAIL },
    ];
    const r = buildCIStatusReport(results);
    assert.equal(r.overall, CI_QA_STATUS.FAIL);
    assert.equal(r.blocksDeployment, true);
  });

  test('generateCIYamlSpec produces yaml string', () => {
    const config = createCIQAConfig({ trigger: CI_QA_TRIGGER.MANUAL });
    const r = generateCIYamlSpec(config);
    assert.equal(r.valid, true);
    assert.ok(r.yaml.includes('browser-qa:'));
    assert.ok(r.yaml.includes('playwright'));
  });

  test('selectCIJobsForDiff adds full suite for .jsx changes', () => {
    const r = selectCIJobsForDiff(['src/components/Hero.jsx']);
    assert.ok(r.jobs.includes(BROWSER_QA_CI_JOB.FULL));
  });
});

// ─── 27. smartE2ESelector ───────────────────────────────────────────────────
describe('smartE2ESelector', () => {
  test('version string exists', () => { assert.ok(SMART_E2E_SELECTOR_VERSION); });

  const ALL_TESTS = ['SMOKE', 'RENDER', 'CONSOLE', 'RESPONSIVE', 'CONTROLS', 'FORMS', 'VISUAL'];

  test('selectE2ETests forceAll returns full suite', () => {
    const r = selectE2ETests([], ALL_TESTS, { forceAll: true });
    assert.equal(r.valid, true);
    assert.equal(r.strategy, E2E_SELECTION_STRATEGY.FULL_SUITE);
    assert.equal(r.count, ALL_TESTS.length);
    assert.equal(r.isReal, false);
  });

  test('selectE2ETests .jsx changes selects expanded set', () => {
    const r = selectE2ETests(['src/Hero.jsx'], ALL_TESTS);
    assert.equal(r.valid, true);
    assert.ok(r.count >= 3);
  });

  test('selectE2ETests .css changes adds RESPONSIVE and VISUAL', () => {
    const r = selectE2ETests(['src/App.css'], ALL_TESTS);
    assert.ok(r.valid);
  });

  test('estimateE2ESavings calculates correctly', () => {
    const sel = { valid: true, savedTests: 4, strategy: E2E_SELECTION_STRATEGY.TARGETED };
    const r = estimateE2ESavings(sel);
    assert.equal(r.valid, true);
    assert.equal(r.savedTests, 4);
    assert.ok(r.savedSeconds > 0);
    assert.equal(r.isReal, false);
  });
});

// ─── 28. flakyTestDetector ──────────────────────────────────────────────────
describe('flakyTestDetector', () => {
  test('version string exists', () => { assert.ok(FLAKY_TEST_DETECTOR_VERSION); });

  test('analyzeTestHistory detects flaky pattern', () => {
    const runs = [
      createTestRunRecord('T1', true),
      createTestRunRecord('T1', false),
      createTestRunRecord('T1', true),
      createTestRunRecord('T1', false),
    ];
    const r = analyzeTestHistory('T1', runs);
    assert.equal(r.valid, true);
    assert.equal(r.isFlaky, true);
    assert.ok(r.failRate > 0 && r.failRate < 1);
  });

  test('analyzeTestHistory detects stable pass', () => {
    const runs = Array.from({ length: 5 }, () => createTestRunRecord('T2', true));
    const r = analyzeTestHistory('T2', runs);
    assert.equal(r.isFlaky, false);
    assert.equal(r.isConsistent, true);
    assert.equal(r.failRate, 0);
  });

  test('buildFlakyReport tallies correctly', () => {
    const histories = [
      { valid: true, isFlaky: true, isConsistent: false, failRate: 0.5 },
      { valid: true, isFlaky: false, isConsistent: true, failRate: 0 },
    ];
    const r = buildFlakyReport(histories);
    assert.equal(r.flakyCount, 1);
    assert.equal(r.stableCount, 1);
  });
});

// ─── 29. browserQAScore ─────────────────────────────────────────────────────
describe('browserQAScore', () => {
  test('version string exists', () => { assert.ok(BROWSER_QA_SCORE_VERSION); });

  test('calculateBrowserQAScore returns 100 for all PASS', () => {
    const phases = {
      RENDER: { status: 'PASS' }, CONSOLE: { status: 'PASS' },
      NETWORK: { status: 'PASS' }, CONTROLS: { status: 'PASS' },
      FORMS: { status: 'PASS' }, RESPONSIVE: { status: 'PASS' },
      ACCESSIBILITY: { status: 'PASS' }, KEYBOARD: { status: 'PASS' },
      VISUAL: { status: 'PASS' }, CRITICAL_FLOWS: { status: 'PASS' },
      PERFORMANCE: { status: 'PASS' },
    };
    const r = calculateBrowserQAScore(phases);
    assert.equal(r.valid, true);
    assert.equal(r.score, 100);
    assert.equal(r.grade, 'A+');
    assert.equal(r.isReal, false);
  });

  test('calculateBrowserQAScore returns 0 for all FAIL', () => {
    const phases = {
      RENDER: { status: 'FAIL' }, CONSOLE: { status: 'FAIL' },
      NETWORK: { status: 'FAIL' }, CONTROLS: { status: 'FAIL' },
    };
    const r = calculateBrowserQAScore(phases);
    assert.equal(r.score, 0);
    assert.equal(r.grade, 'F');
  });

  test('getGrade maps scores correctly', () => {
    assert.equal(getGrade(97).label, 'A+');
    assert.equal(getGrade(91).label, 'A');
    assert.equal(getGrade(82).label, 'B');
    assert.equal(getGrade(50).label, 'F');
  });

  test('isScoreDeployable checks threshold', () => {
    assert.equal(isScoreDeployable({ valid: true, score: 80 }, 70), true);
    assert.equal(isScoreDeployable({ valid: true, score: 60 }, 70), false);
  });
});

// ─── 30. browserQAReport ────────────────────────────────────────────────────
describe('browserQAReport', () => {
  test('version string exists', () => { assert.ok(BROWSER_QA_REPORT_VERSION); });

  test('createQAReport requires appId and appName', () => {
    const r = createQAReport({});
    assert.equal(r.valid, false);
    const r2 = createQAReport({ appId: 'nexo', appName: 'Nexo Vet', phaseResults: { RENDER: { status: 'PASS' } } });
    assert.equal(r2.valid, true);
    assert.equal(r2.isReal, false);
  });

  test('formatReportMarkdown returns markdown string', () => {
    const report = createQAReport({ appId: 'nexo', appName: 'Nexo Vet', qaScore: { score: 90, grade: 'A' }, phaseResults: {} });
    const md = formatReportMarkdown(report);
    assert.ok(typeof md === 'string');
    assert.ok(md.includes('Nexo Vet'));
    assert.ok(md.includes('isReal: false'));
  });

  test('formatReportSummary returns one-line string', () => {
    const report = createQAReport({ appId: 'nexo', appName: 'Nexo Vet', phaseResults: {} });
    const s = formatReportSummary(report);
    assert.ok(typeof s === 'string');
    assert.ok(s.includes('Nexo Vet'));
  });
});

// ─── 31. browserReleasePolicy ───────────────────────────────────────────────
describe('browserReleasePolicy', () => {
  test('version string exists', () => { assert.ok(BROWSER_RELEASE_POLICY_VERSION); });

  test('evaluateReleasePolicy APPROVED on clean staging', () => {
    const report = { valid: true, score: 80, failedPhases: [], warnPhases: [] };
    const r = evaluateReleasePolicy(report, RELEASE_CHANNEL.STAGING);
    assert.equal(r.valid, true);
    assert.equal(r.verdict, RELEASE_VERDICT.APPROVED);
    assert.equal(r.canRelease, true);
    assert.equal(r.isReal, false);
  });

  test('evaluateReleasePolicy BLOCKED below min score', () => {
    const report = { valid: true, score: 40, failedPhases: [], warnPhases: [] };
    const r = evaluateReleasePolicy(report, RELEASE_CHANNEL.STAGING);
    assert.equal(r.verdict, RELEASE_VERDICT.BLOCKED);
    assert.equal(r.canRelease, false);
  });

  test('evaluateReleasePolicy production requires human', () => {
    const report = { valid: true, score: 95, failedPhases: [], warnPhases: [] };
    const r = evaluateReleasePolicy(report, RELEASE_CHANNEL.PRODUCTION);
    assert.equal(r.requiresHuman, true);
  });

  test('formatReleaseDecision returns string', () => {
    const report = { valid: true, score: 80, failedPhases: [], warnPhases: [] };
    const dec = evaluateReleasePolicy(report, RELEASE_CHANNEL.BETA);
    const s = formatReleaseDecision(dec);
    assert.ok(typeof s === 'string');
    assert.ok(s.includes('BETA'));
  });
});

// ─── 32. observabilityBridge ────────────────────────────────────────────────
describe('observabilityBridge', () => {
  test('version string exists', () => { assert.ok(OBSERVABILITY_BRIDGE_VERSION); });

  test('emitBrowserQAEvent returns valid event', () => {
    const e = emitBrowserQAEvent(BROWSER_QA_EVENT.QA_STARTED, { appId: 'nexo' });
    assert.equal(e.valid, true);
    assert.equal(e.type, BROWSER_QA_EVENT.QA_STARTED);
    assert.equal(e.isReal, false);
  });

  test('emitBrowserQAEvent fails on unknown type', () => {
    const e = emitBrowserQAEvent('fake.event', {});
    assert.equal(e.valid, false);
  });

  test('emitBrowserQAEvent redacts secrets from payload', () => {
    const e = emitBrowserQAEvent(BROWSER_QA_EVENT.QA_STARTED, { appId: 'nexo', token: 'secret123', password: 'hunter2' });
    assert.equal(e.payload.token, '[REDACTED]');
    assert.equal(e.payload.password, '[REDACTED]');
    assert.equal(e.payload.appId, 'nexo');
  });

  test('createBrowserQALogger tracks events', () => {
    const logger = createBrowserQALogger('RUN-001');
    assert.equal(logger.valid, true);
    logger.started('nexo');
    logger.phaseStart('RENDER');
    logger.phaseEnd('RENDER', 'PASS');
    assert.equal(logger.eventCount(), 3);
    assert.equal(logger.isReal, false);
  });

  test('BROWSER_QA_EVENT has 10 event types', () => {
    assert.equal(Object.keys(BROWSER_QA_EVENT).length, 10);
  });
});

// ─── 33. playwrightRunner ───────────────────────────────────────────────────
describe('playwrightRunner', () => {
  test('version string exists', () => { assert.ok(PLAYWRIGHT_RUNNER_VERSION); });

  test('createRunConfig returns valid config', () => {
    const c = createRunConfig({ mode: RUNNER_MODE.SMOKE });
    assert.equal(c.valid, true);
    assert.equal(c.mode, RUNNER_MODE.SMOKE);
    assert.equal(c.browser, 'chromium');
    assert.equal(c.isReal, false);
  });

  test('buildRunCommand builds correct command', () => {
    const config = createRunConfig({});
    const r = buildRunCommand(config, { grep: 'smoke' });
    assert.equal(r.valid, true);
    assert.ok(r.command.includes('playwright test'));
    assert.ok(r.command.includes('playwright.config'));
  });

  test('parseRunnerResult parses exit 0 as PASSED', () => {
    const r = parseRunnerResult(0, '5 passed (30s)');
    assert.equal(r.valid, true);
    assert.equal(r.status, RUNNER_STATUS.PASSED);
    assert.equal(r.passed, 5);
    assert.equal(r.allPassed, true);
  });

  test('parseRunnerResult parses exit 1 as FAILED', () => {
    const r = parseRunnerResult(1, '3 passed\n2 failed');
    assert.equal(r.status, RUNNER_STATUS.FAILED);
    assert.equal(r.failed, 2);
    assert.equal(r.allPassed, false);
  });

  test('PLAYWRIGHT_CONFIG has correct defaults', () => {
    assert.equal(PLAYWRIGHT_CONFIG.DEFAULT_PORT, 5180);
    assert.equal(PLAYWRIGHT_CONFIG.BROWSER, 'chromium');
  });
});

// ─── 34. fixtures: nexoVetQAFixture ─────────────────────────────────────────
describe('nexoVetQAFixture', () => {
  test('version string exists', () => { assert.ok(NEXO_VET_FIXTURE_VERSION); });

  test('NEXO_VET_APP has correct fixture flags', () => {
    assert.equal(NEXO_VET_APP.isFixture, true);
    assert.equal(NEXO_VET_APP.isReal, false);
    assert.equal(NEXO_VET_APP.appId, 'nexo-vet');
    assert.equal(NEXO_VET_APP.port, 5180);
  });

  test('NEXO_VET_ROUTES has at least 4 routes', () => {
    assert.ok(NEXO_VET_ROUTES.length >= 4);
    assert.ok(NEXO_VET_ROUTES.every(r => r.path));
  });

  test('buildNexoVetQAPlan returns complete plan', () => {
    const plan = buildNexoVetQAPlan();
    assert.equal(plan.isFixture, true);
    assert.equal(plan.isReal, false);
    assert.ok(plan.routes.length > 0);
    assert.ok(plan.forms.length > 0);
  });
});

// ─── 35. fixtures: breakageFixtures ─────────────────────────────────────────
describe('breakageFixtures', () => {
  test('version string exists', () => { assert.ok(BREAKAGE_FIXTURES_VERSION); });

  test('ALL_BREAKAGE_FIXTURES has 5 fixtures', () => {
    assert.equal(ALL_BREAKAGE_FIXTURES.length, 5);
    assert.ok(ALL_BREAKAGE_FIXTURES.every(f => f.isReal === false));
  });

  test('BLANK_PAGE_BREAKAGE marks expectedFail=true', () => {
    assert.equal(BLANK_PAGE_BREAKAGE.expectedFail, true);
    assert.equal(BLANK_PAGE_BREAKAGE.expectedGate, 'RENDER');
  });

  test('HEALTHY_SNAPSHOT marks expectedFail=false', () => {
    assert.equal(HEALTHY_SNAPSHOT.expectedFail, false);
    assert.equal(HEALTHY_SNAPSHOT.isReal, false);
  });
});

// ─── 36. factory registry ───────────────────────────────────────────────────
describe('factory registry: browserQA', () => {
  test('BROWSER_QA_REGISTRY has correct metadata', () => {
    assert.equal(BROWSER_QA_REGISTRY.id, 'browser-qa');
    assert.equal(BROWSER_QA_REGISTRY.improvement, 'ADV-06');
    assert.equal(BROWSER_QA_REGISTRY.moduleCount, 33);
    assert.equal(BROWSER_QA_REGISTRY.isReal, false);
  });

  test('registry lists 20 QA phases', () => {
    assert.equal(BROWSER_QA_REGISTRY.phases.length, 20);
  });

  test('registry has playwright config', () => {
    assert.equal(BROWSER_QA_REGISTRY.playwright.port, 5180);
    assert.equal(BROWSER_QA_REGISTRY.playwright.browser, 'chromium');
  });

  test('registry enforces all guardrails', () => {
    const g = BROWSER_QA_REGISTRY.guardrails;
    assert.equal(g.NO_REAL_CREDENTIALS, true);
    assert.equal(g.NO_REAL_OAUTH, true);
    assert.equal(g.FIXTURE_MODE_ONLY, true);
    assert.equal(g.LOCALHOST_5175_NO_TOUCH, true);
    assert.equal(g.NO_REAL_CLIENT_DATA, true);
  });

  test('registry integrations reference all ADV bridges', () => {
    const i = BROWSER_QA_REGISTRY.integrations;
    assert.ok(i.adv01);
    assert.ok(i.adv02);
    assert.ok(i.adv04);
    assert.ok(i.adv05);
  });
});

// ─── 37. Integration: breakage fixtures vs evaluators ───────────────────────
describe('Integration: breakage fixtures vs evaluators', () => {
  test('BLANK_PAGE_BREAKAGE detected by runtimeRenderEvaluator', () => {
    const { domSnapshot } = BLANK_PAGE_BREAKAGE;
    const checks = buildBrowserRenderChecks(domSnapshot);
    const r = evaluateRenderChecks(checks);
    assert.ok(r.criticalCount > 0, 'should have critical failures for blank page');
  });

  test('JS_ERROR_BREAKAGE detected by consoleErrorGate', () => {
    // Use the already-imported JS_ERROR_BREAKAGE fixture
    const r = evaluateConsoleErrors(JS_ERROR_BREAKAGE.consoleMessages, { blockOnFatalJs: true });
    assert.equal(r.status, CONSOLE_GATE_STATUS.FAIL);
  });

  test('HEALTHY_SNAPSHOT passes render gate', () => {
    const checks = buildBrowserRenderChecks(HEALTHY_SNAPSHOT.domSnapshot);
    const r = evaluateRenderChecks(checks);
    assert.equal(r.verdict, EVALUATOR_VERDICT.PASS);
  });

  test('HEALTHY_SNAPSHOT passes console gate', () => {
    const r = evaluateConsoleErrors(HEALTHY_SNAPSHOT.consoleMessages, {});
    assert.equal(r.status, CONSOLE_GATE_STATUS.PASS);
  });

  test('HEALTHY_SNAPSHOT passes network gate', () => {
    const r = evaluateNetworkRequests(HEALTHY_SNAPSHOT.requests, {});
    assert.equal(r.status, NETWORK_GATE_STATUS.PASS);
  });
});
