// Voice Lead Qualification Flow — ADV-11 (connects ADV-08)

export const LEAD_QUAL_STEP = Object.freeze({
  IDENTIFY_NEED:   'IDENTIFY_NEED',
  BUDGET_CHECK:    'BUDGET_CHECK',
  TIMELINE_CHECK:  'TIMELINE_CHECK',
  AUTHORITY_CHECK: 'AUTHORITY_CHECK',
  QUALIFY_RESULT:  'QUALIFY_RESULT',
});

export const LEAD_QUALITY = Object.freeze({
  HOT:         'HOT',
  WARM:        'WARM',
  COLD:        'COLD',
  DISQUALIFIED:'DISQUALIFIED',
});

export function createVoiceLeadQualificationFlow() {
  const answers = {};
  let step      = LEAD_QUAL_STEP.IDENTIFY_NEED;

  const stepOrder = [
    LEAD_QUAL_STEP.IDENTIFY_NEED,
    LEAD_QUAL_STEP.BUDGET_CHECK,
    LEAD_QUAL_STEP.TIMELINE_CHECK,
    LEAD_QUAL_STEP.AUTHORITY_CHECK,
    LEAD_QUAL_STEP.QUALIFY_RESULT,
  ];

  const prompts = Object.freeze({
    [LEAD_QUAL_STEP.IDENTIFY_NEED]:   '¿Cuál es el principal desafío que quieres resolver?',
    [LEAD_QUAL_STEP.BUDGET_CHECK]:    '¿Tienes presupuesto definido para esto?',
    [LEAD_QUAL_STEP.TIMELINE_CHECK]:  '¿En qué plazo necesitas la solución?',
    [LEAD_QUAL_STEP.AUTHORITY_CHECK]: '¿Eres tú quien toma la decisión final?',
    [LEAD_QUAL_STEP.QUALIFY_RESULT]:  '¡Gracias! Te mando la información por WhatsApp.',
  });

  function advance(answer = null) {
    answers[step] = answer;
    const idx = stepOrder.indexOf(step);
    step = stepOrder[idx + 1] ?? LEAD_QUAL_STEP.QUALIFY_RESULT;
    return Object.freeze({ step, prompt: prompts[step] ?? '', isReal: false });
  }

  function qualify() {
    const hasBudget   = /sí|claro|tenemos|tengo/i.test(answers[LEAD_QUAL_STEP.BUDGET_CHECK]   ?? '');
    const hasTimeline = /pronto|urgente|mes|semana/i.test(answers[LEAD_QUAL_STEP.TIMELINE_CHECK] ?? '');
    const quality     = hasBudget && hasTimeline ? LEAD_QUALITY.HOT : hasBudget ? LEAD_QUALITY.WARM : LEAD_QUALITY.COLD;
    return Object.freeze({ quality, answers: Object.freeze({ ...answers }), isReal: false });
  }

  return Object.freeze({ currentStep: () => step, advance, qualify, isReal: false });
}

export const VOICE_LEAD_QUALIFICATION_FLOW_VERSION = '1.0.0';
