// Social Hook Engine — 9 hook types for opening lines of social posts

export const HOOK_TYPE = Object.freeze({
  QUESTION:   'QUESTION',
  PROBLEM:    'PROBLEM',
  BENEFIT:    'BENEFIT',
  CURIOSITY:  'CURIOSITY',
  MYTH:       'MYTH',
  LOCAL:      'LOCAL',
  HOW_TO:     'HOW_TO',
  CONTRAST:   'CONTRAST',
  STORY:      'STORY',
});

const HOOK_TEMPLATES = Object.freeze({
  QUESTION:  '¿Sabías que {{topic}}?',
  PROBLEM:   '¿Te pasa que {{topic}}? Tienes solución.',
  BENEFIT:   'Consigue {{topic}} más rápido de lo que crees.',
  CURIOSITY: 'Lo que nadie te cuenta sobre {{topic}}.',
  MYTH:      'Mito o realidad: "{{topic}}".',
  LOCAL:     'En {{locality}}, {{topic}} es posible.',
  HOW_TO:    'Cómo {{topic}} en 3 pasos.',
  CONTRAST:  'Antes: {{problem}}. Ahora: {{solution}}.',
  STORY:     'Hoy quiero contarte cómo {{topic}} cambió todo.',
});

export function generateHook(params = {}) {
  if (!params.type) throw new Error('generateHook requires type');
  if (!Object.values(HOOK_TYPE).includes(params.type)) throw new Error(`Unknown hook type: ${params.type}`);

  const template = HOOK_TEMPLATES[params.type];
  let text = template
    .replace('{{topic}}',    params.topic    ?? 'tu objetivo')
    .replace('{{locality}}', params.locality ?? 'tu ciudad')
    .replace('{{problem}}',  params.problem  ?? 'sin resultados')
    .replace('{{solution}}', params.solution ?? 'todo cambia');

  return Object.freeze({ type: params.type, text, isReal: false });
}

export function getBestHookForObjective(objective) {
  const map = Object.freeze({
    BOOKING_CONVERSION: HOOK_TYPE.BENEFIT,
    EDUCATION:          HOOK_TYPE.HOW_TO,
    SOCIAL_PROOF:       HOOK_TYPE.STORY,
    COMMUNITY_BUILDING: HOOK_TYPE.LOCAL,
    BRAND_AWARENESS:    HOOK_TYPE.CURIOSITY,
    LEAD_GENERATION:    HOOK_TYPE.PROBLEM,
  });
  return map[objective] ?? HOOK_TYPE.QUESTION;
}
