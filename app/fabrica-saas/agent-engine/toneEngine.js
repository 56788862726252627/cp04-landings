// Tone Engine — ADV-03
// resolveAgentTone(): adapta el tono al agente, vertical y contexto.

export const TONE = Object.freeze({
  WARM_PROFESSIONAL: 'WARM_PROFESSIONAL',
  FRIENDLY:          'FRIENDLY',
  CONSULTATIVE:      'CONSULTATIVE',
  CALM:              'CALM',
  PREMIUM:           'PREMIUM',
  DIRECT:            'DIRECT',
  EMPATHETIC:        'EMPATHETIC',
  ENERGETIC:         'ENERGETIC',
  TRUSTWORTHY:       'TRUSTWORTHY',
});

const VERTICAL_TONE_MAP = Object.freeze({
  dental:          [TONE.WARM_PROFESSIONAL, TONE.TRUSTWORTHY],
  physio:          [TONE.CALM, TONE.EMPATHETIC, TONE.WARM_PROFESSIONAL],
  psychology:      [TONE.CALM, TONE.EMPATHETIC],
  speech_therapy:  [TONE.CALM, TONE.WARM_PROFESSIONAL],
  sports:          [TONE.FRIENDLY, TONE.ENERGETIC, TONE.DIRECT],
  padel:           [TONE.FRIENDLY, TONE.ENERGETIC, TONE.DIRECT],
  veterinary:      [TONE.WARM_PROFESSIONAL, TONE.EMPATHETIC],
  hairdresser:     [TONE.FRIENDLY, TONE.WARM_PROFESSIONAL],
  beauty:          [TONE.PREMIUM, TONE.WARM_PROFESSIONAL],
  legal:           [TONE.TRUSTWORTHY, TONE.DIRECT],
  fertility:       [TONE.CALM, TONE.EMPATHETIC, TONE.TRUSTWORTHY],
  education:       [TONE.FRIENDLY, TONE.WARM_PROFESSIONAL],
  default:         [TONE.WARM_PROFESSIONAL, TONE.CONSULTATIVE],
});

const AGENT_TYPE_TONE_MAP = Object.freeze({
  CHAT:    TONE.FRIENDLY,
  SALES:   TONE.CONSULTATIVE,
  SUPPORT: TONE.CALM,
  BOOKING: TONE.WARM_PROFESSIONAL,
  LEAD:    TONE.CONSULTATIVE,
  VOICE:   TONE.DIRECT,
});

/**
 * Resolve the tone blend for an agent.
 * Returns primary tone + contextual adjustments.
 */
export function resolveAgentTone(params = {}) {
  const {
    agentType   = 'CHAT',
    vertical    = 'default',
    context     = {},
  } = params;

  const verticalKey = (vertical ?? 'default').toLowerCase().replace(/-/g, '_');
  const verticalTones = VERTICAL_TONE_MAP[verticalKey] ?? VERTICAL_TONE_MAP.default;
  const agentTypeTone  = AGENT_TYPE_TONE_MAP[agentType] ?? TONE.WARM_PROFESSIONAL;

  // Merge without duplicates — vertical primary + agent type flavor
  const blendSet = new Set([...verticalTones, agentTypeTone]);
  const blend    = Object.freeze([...blendSet]);

  const primary    = verticalTones[0] ?? TONE.WARM_PROFESSIONAL;
  const secondary  = blend.find(t => t !== primary) ?? null;

  // Context adjustments
  const adjustments = [];
  if (context.negativeEmotion) adjustments.push(TONE.EMPATHETIC);
  if (context.highRisk)        adjustments.push(TONE.CALM);
  if (context.isPremiumClient) adjustments.push(TONE.PREMIUM);

  return Object.freeze({
    valid:           true,
    primary,
    secondary,
    blend,
    adjustments:     Object.freeze(adjustments),
    descriptor:      buildDescriptor(primary, secondary),
    disclaimer:      'Tone is a directive to the LLM, not a hard constraint.',
  });
}

function buildDescriptor(primary, secondary) {
  const desc = {
    [TONE.WARM_PROFESSIONAL]: 'Cercano pero profesional. Sin exceso de informalidad.',
    [TONE.FRIENDLY]:          'Natural y amistoso. Como un conocido que sabe del tema.',
    [TONE.CONSULTATIVE]:      'Hace preguntas inteligentes. Entiende antes de proponer.',
    [TONE.CALM]:              'Pausado. Sin urgencias artificiales. Transmite seguridad.',
    [TONE.PREMIUM]:           'Elegante. Preciso. Sin ser pedante.',
    [TONE.DIRECT]:            'Va al grano. Sin rodeos innecesarios.',
    [TONE.EMPATHETIC]:        'Reconoce la situación del cliente antes de responder.',
    [TONE.ENERGETIC]:         'Dinámico. Motivador. Sin ser agresivo.',
    [TONE.TRUSTWORTHY]:       'Honesto y claro. Sin afirmaciones que no puede sostener.',
  };
  return secondary
    ? `${desc[primary] ?? primary} Con toque de: ${desc[secondary] ?? secondary}`
    : (desc[primary] ?? primary);
}

export const TONE_ENGINE_VERSION = '1.0.0';
