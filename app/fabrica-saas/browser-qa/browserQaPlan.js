// Browser QA Plan — ADV-06
// Creates a structured QA plan for a given SaaS app fixture.

export const QA_PHASE = Object.freeze({
  RENDER:       'RENDER',
  CONSOLE:      'CONSOLE',
  NETWORK:      'NETWORK',
  ROUTES:       'ROUTES',
  CONTROLS:     'CONTROLS',
  FORMS:        'FORMS',
  RESPONSIVE:   'RESPONSIVE',
  MOBILE_NAV:   'MOBILE_NAV',
  ACCESSIBILITY:'ACCESSIBILITY',
  KEYBOARD:     'KEYBOARD',
  VISUAL:       'VISUAL',
  SCREENSHOTS:  'SCREENSHOTS',
  CRITICAL_FLOWS:'CRITICAL_FLOWS',
  ROLE_SURFACE: 'ROLE_SURFACE',
  AUTH_SURFACE: 'AUTH_SURFACE',
  LOADING_STATES:'LOADING_STATES',
  ERROR_STATES: 'ERROR_STATES',
  EMPTY_STATES: 'EMPTY_STATES',
  PERFORMANCE:  'PERFORMANCE',
  BUNDLE:       'BUNDLE',
});

export const QA_PLAN_STATUS = Object.freeze({
  DRAFT:    'DRAFT',
  READY:    'READY',
  RUNNING:  'RUNNING',
  COMPLETE: 'COMPLETE',
  BLOCKED:  'BLOCKED',
});

const ALL_PHASES = Object.values(QA_PHASE);

export function createBrowserQaPlan(params = {}) {
  const { appId, appName, routes = [], phases = ALL_PHASES, port = 5180 } = params;
  if (!appId)   return { valid: false, error: 'appId required' };
  if (!appName) return { valid: false, error: 'appName required' };
  if (routes.length === 0) return { valid: false, error: 'at least one route required' };

  const invalidPhases = phases.filter(p => !QA_PHASE[p]);
  if (invalidPhases.length > 0) {
    return { valid: false, error: `unknown phases: ${invalidPhases.join(', ')}` };
  }

  return Object.freeze({
    valid:       true,
    planId:      `QA-PLAN-${appId}-${Date.now()}`,
    appId,
    appName,
    routes,
    phases,
    port,
    baseUrl:     `http://localhost:${port}`,
    status:      QA_PLAN_STATUS.READY,
    phaseCount:  phases.length,
    routeCount:  routes.length,
    estimatedMinutes: Math.ceil(phases.length * 0.5 + routes.length * 0.3),
    isReal:      false,
  });
}

export function selectQaPhases(options = {}) {
  const { quick = false, includeVisual = true, includeA11y = true, includePerf = true } = options;
  if (quick) {
    return [QA_PHASE.RENDER, QA_PHASE.CONSOLE, QA_PHASE.NETWORK, QA_PHASE.CONTROLS];
  }
  const phases = [...ALL_PHASES];
  if (!includeVisual)  return phases.filter(p => p !== QA_PHASE.VISUAL && p !== QA_PHASE.SCREENSHOTS);
  if (!includeA11y)    return phases.filter(p => p !== QA_PHASE.ACCESSIBILITY && p !== QA_PHASE.KEYBOARD);
  if (!includePerf)    return phases.filter(p => p !== QA_PHASE.PERFORMANCE && p !== QA_PHASE.BUNDLE);
  return phases;
}

export function estimatePlanDuration(plan) {
  if (!plan?.valid) return { valid: false, error: 'invalid plan' };
  const PHASE_SECONDS = {
    [QA_PHASE.RENDER]: 5, [QA_PHASE.CONSOLE]: 3, [QA_PHASE.NETWORK]: 4,
    [QA_PHASE.ROUTES]: 8, [QA_PHASE.CONTROLS]: 10, [QA_PHASE.FORMS]: 15,
    [QA_PHASE.RESPONSIVE]: 20, [QA_PHASE.MOBILE_NAV]: 12, [QA_PHASE.ACCESSIBILITY]: 18,
    [QA_PHASE.KEYBOARD]: 12, [QA_PHASE.VISUAL]: 10, [QA_PHASE.SCREENSHOTS]: 8,
    [QA_PHASE.CRITICAL_FLOWS]: 30, [QA_PHASE.ROLE_SURFACE]: 15, [QA_PHASE.AUTH_SURFACE]: 10,
    [QA_PHASE.LOADING_STATES]: 10, [QA_PHASE.ERROR_STATES]: 10, [QA_PHASE.EMPTY_STATES]: 8,
    [QA_PHASE.PERFORMANCE]: 12, [QA_PHASE.BUNDLE]: 6,
  };
  const totalSeconds = plan.phases.reduce((s, p) => s + (PHASE_SECONDS[p] ?? 5), 0)
    + plan.routes.length * 3;
  return { valid: true, seconds: totalSeconds, minutes: Math.ceil(totalSeconds / 60), isReal: false };
}

export const BROWSER_QA_PLAN_VERSION = '1.0.0';
