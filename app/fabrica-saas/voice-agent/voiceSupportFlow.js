// Voice Support Flow — ADV-11

export const SUPPORT_STEP = Object.freeze({
  UNDERSTAND:  'UNDERSTAND',
  CLARIFY:     'CLARIFY',
  SOLVE:       'SOLVE',
  VERIFY:      'VERIFY',
  ESCALATE:    'ESCALATE',
  CLOSE:       'CLOSE',
});

export const SUPPORT_STEP_PROMPTS = Object.freeze({
  [SUPPORT_STEP.UNDERSTAND]: '¿Puedes contarme qué ha pasado?',
  [SUPPORT_STEP.CLARIFY]:    '¿Cuándo ocurrió exactamente?',
  [SUPPORT_STEP.SOLVE]:      'Déjame buscarte una solución…',
  [SUPPORT_STEP.VERIFY]:     '¿Eso ha resuelto el problema?',
  [SUPPORT_STEP.ESCALATE]:   'Voy a pasarte con alguien del equipo que puede ayudarte mejor.',
  [SUPPORT_STEP.CLOSE]:      '¡Me alegra que esté resuelto! ¿Algo más en lo que pueda ayudarte?',
});

export function createVoiceSupportFlow() {
  let step     = SUPPORT_STEP.UNDERSTAND;
  let attempts = 0;

  function currentStep() { return step; }
  function getCurrentPrompt() { return SUPPORT_STEP_PROMPTS[step] ?? ''; }

  function advance(resolved = false) {
    const flow = [
      SUPPORT_STEP.UNDERSTAND,
      SUPPORT_STEP.CLARIFY,
      SUPPORT_STEP.SOLVE,
      SUPPORT_STEP.VERIFY,
    ];
    if (resolved) { step = SUPPORT_STEP.CLOSE; }
    else {
      attempts++;
      const idx = flow.indexOf(step);
      step = attempts >= 2 ? SUPPORT_STEP.ESCALATE : (flow[idx + 1] ?? SUPPORT_STEP.ESCALATE);
    }
    return Object.freeze({ step, prompt: getCurrentPrompt(), isReal: false });
  }

  return Object.freeze({ currentStep, getCurrentPrompt, advance, isReal: false });
}

export const VOICE_SUPPORT_FLOW_VERSION = '1.0.0';
