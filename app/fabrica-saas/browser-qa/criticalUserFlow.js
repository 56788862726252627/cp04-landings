// Critical User Flow — ADV-06
// Defines and evaluates critical user flows for factory SaaS apps.

export const FLOW_TYPE = Object.freeze({
  ONBOARDING:  'ONBOARDING',
  BOOKING:     'BOOKING',
  CONTACT:     'CONTACT',
  NAVIGATION:  'NAVIGATION',
  SEARCH:      'SEARCH',
  PROFILE:     'PROFILE',
  CHECKOUT:    'CHECKOUT',
  SUPPORT:     'SUPPORT',
});

export const FLOW_STATUS = Object.freeze({
  PASS:    'PASS',
  FAIL:    'FAIL',
  PARTIAL: 'PARTIAL',
  SKIPPED: 'SKIPPED',
});

export const STEP_RESULT = Object.freeze({
  PASS:    'PASS',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export function createCriticalFlow(params = {}) {
  const { id, name, type, steps = [], priority = 'P1', isFixture = true } = params;
  if (!id)    return { valid: false, error: 'id required' };
  if (!name)  return { valid: false, error: 'name required' };
  if (!type || !FLOW_TYPE[type]) return { valid: false, error: `invalid type: ${type}` };
  if (steps.length === 0)         return { valid: false, error: 'steps required' };

  return Object.freeze({
    valid:     true,
    id,
    name,
    type,
    priority,
    steps,
    stepCount: steps.length,
    isFixture,
    usesRealAuth:    false,
    usesRealPayment: false,
    isReal:          false,
  });
}

export function createFlowStep(action, description, options = {}) {
  return Object.freeze({
    action,
    description,
    selector:   options.selector   ?? null,
    value:      options.value      ?? null,
    assertion:  options.assertion  ?? null,
    optional:   options.optional   ?? false,
    isReal:     false,
  });
}

export function evaluateFlowResult(flow = {}, stepResults = []) {
  if (!flow.valid) return { valid: false, error: 'invalid flow' };

  const failed   = stepResults.filter(s => s.result === STEP_RESULT.FAIL);
  const blocked  = stepResults.filter(s => s.result === STEP_RESULT.BLOCKED);
  const passed   = stepResults.filter(s => s.result === STEP_RESULT.PASS);

  let status;
  if (blocked.length > 0)          status = FLOW_STATUS.FAIL;
  else if (failed.length > 0)      status = FLOW_STATUS.PARTIAL;
  else if (passed.length === stepResults.length) status = FLOW_STATUS.PASS;
  else                              status = FLOW_STATUS.PARTIAL;

  return Object.freeze({
    valid:       true,
    flowId:      flow.id,
    flowType:    flow.type,
    status,
    totalSteps:  flow.stepCount,
    passedSteps: passed.length,
    failedSteps: failed.length,
    blockedSteps:blocked.length,
    isReal:      false,
  });
}

export function buildNexoVetFlows() {
  return [
    createCriticalFlow({
      id: 'NEXO-FLOW-1', name: 'Homepage load & hero CTA', type: FLOW_TYPE.NAVIGATION,
      priority: 'P0', steps: [
        createFlowStep('navigate', 'Open homepage', { assertion: 'title contains Nexo' }),
        createFlowStep('assert',   'Hero heading visible', { selector: 'h1' }),
        createFlowStep('click',    'Click primary CTA', { selector: '.btn-primary, [data-cta]' }),
      ],
    }),
    createCriticalFlow({
      id: 'NEXO-FLOW-2', name: 'Contact form submission', type: FLOW_TYPE.CONTACT,
      priority: 'P1', steps: [
        createFlowStep('navigate', 'Open contact section', { selector: '#contacto, #contact' }),
        createFlowStep('fill',     'Fill name field',  { selector: 'input[name="nombre"], input[name="name"]', value: 'Test Usuario' }),
        createFlowStep('fill',     'Fill email field', { selector: 'input[type="email"]', value: 'test@nexo.vet' }),
        createFlowStep('assert',   'Submit button present', { selector: 'button[type="submit"]' }),
      ],
    }),
    createCriticalFlow({
      id: 'NEXO-FLOW-3', name: 'Service listing visible', type: FLOW_TYPE.NAVIGATION,
      priority: 'P1', steps: [
        createFlowStep('navigate', 'Open services section', { selector: '#servicios, #services' }),
        createFlowStep('assert',   'Service cards visible', { selector: '.service-card, .card' }),
      ],
    }),
  ];
}

export const CRITICAL_USER_FLOW_VERSION = '1.0.0';
