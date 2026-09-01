// Prompt Contract — ADV-03
// Contrato estructurado de prompt. Sin depender de un prompt gigante desordenado.

export const CONTRACT_SECTION = Object.freeze({
  IDENTITY:           'IDENTITY',
  PURPOSE:            'PURPOSE',
  BUSINESS_CONTEXT:   'BUSINESS_CONTEXT',
  COMMUNICATION:      'COMMUNICATION',
  SALES_POLICY:       'SALES_POLICY',
  KNOWLEDGE_BOUNDARY: 'KNOWLEDGE_BOUNDARY',
  TOOLS:              'TOOLS',
  MEMORY:             'MEMORY',
  ESCALATION:         'ESCALATION',
  SAFETY:             'SAFETY',
  NEXT_ACTION:        'NEXT_ACTION',
  RESPONSE_LENGTH:    'RESPONSE_LENGTH',
});

/**
 * Build a structured prompt contract from agent components.
 * Returns a frozen, section-keyed contract (not a raw prompt string).
 */
export function buildPromptContract(params = {}) {
  const {
    agentType        = 'CHAT',
    vertical         = 'DEFAULT',
    purpose          = 'Help users',
    tone             = 'Warm and professional',
    businessProfile  = {},
    salesPolicy      = {},
    trustPolicy      = {},
    memoryPolicy     = {},
    toolPolicy       = {},
    knowledge        = {},
    channel          = 'WEB_CHAT',
    safetyDisclaimer = null,
  } = params;

  const sections = Object.freeze({
    [CONTRACT_SECTION.IDENTITY]: Object.freeze({
      agentType,
      vertical,
      businessName: businessProfile.name ?? 'Negocio',
      description:  businessProfile.description ?? '',
      channel,
      note:         'Eres un asistente de IA. Si te preguntan, lo dices claramente.',
    }),

    [CONTRACT_SECTION.PURPOSE]: Object.freeze({
      primaryGoal:   purpose,
      mustNotDrift:  true,
      stayGoalOriented: true,
    }),

    [CONTRACT_SECTION.BUSINESS_CONTEXT]: Object.freeze({
      services:      businessProfile.services      ?? [],
      openingHours:  businessProfile.openingHours  ?? null,
      location:      businessProfile.location      ?? null,
      pricing:       businessProfile.pricingNote   ?? 'Consultar con el equipo.',
    }),

    [CONTRACT_SECTION.COMMUNICATION]: Object.freeze({
      tone,
      language:           'es',
      naturalPhrasing:    true,
      avoidRoboticPhrases: true,
      adaptLength:        true,
      noFakeEnthusiasm:   true,
    }),

    [CONTRACT_SECTION.SALES_POLICY]: Object.freeze({
      principle:    salesPolicy.principle  ?? 'CONSULTATIVE_SELLING',
      prohibited:   salesPolicy.prohibitions ?? ['NO_PRESSURE', 'NO_MANIPULATION'],
      closingStyle: salesPolicy.closingStyle ?? 'SOFT_INVITATION',
    }),

    [CONTRACT_SECTION.KNOWLEDGE_BOUNDARY]: Object.freeze({
      allowedSources:   knowledge.activeSources ?? [],
      ragEnabled:       knowledge.ragEnabled    ?? false,
      admitUncertainty: trustPolicy.admitUncertainty?.phrases ?? [],
      noInvention:      true,
    }),

    [CONTRACT_SECTION.TOOLS]: Object.freeze({
      allowed:              toolPolicy.allowedTools ?? [],
      denied:               toolPolicy.deniedTools  ?? [],
      requiresConfirmation: toolPolicy.requiresConfirmation ?? [],
      principle:            'LEAST_PRIVILEGE',
    }),

    [CONTRACT_SECTION.MEMORY]: Object.freeze({
      type:      memoryPolicy.memoryType ?? 'SESSION',
      maxTurns:  memoryPolicy.maxTurns   ?? 20,
      neverStore: memoryPolicy.neverStore ?? [],
    }),

    [CONTRACT_SECTION.ESCALATION]: Object.freeze({
      alwaysAvailable: true,
      handoffPhrase:   'Te pongo en contacto con una persona del equipo.',
      triggers:        ['USER_REQUESTS', 'HIGH_RISK', 'REPEATED_FAILURE'],
    }),

    [CONTRACT_SECTION.SAFETY]: Object.freeze({
      safetyDisclaimer,
      noMedicalDiagnosis: ['psychology', 'fertility', 'physio', 'dental'].includes(vertical?.toLowerCase()),
      noLegalAdvice:       vertical?.toLowerCase() === 'legal',
      noInvention:         true,
    }),

    [CONTRACT_SECTION.NEXT_ACTION]: Object.freeze({
      alwaysPropose:  true,
      softCTAOnly:    true,
      noAggressive:   true,
      maxOneActionPerTurn: true,
    }),

    [CONTRACT_SECTION.RESPONSE_LENGTH]: Object.freeze({
      default:         'SHORT',
      expandWhenAsked: true,
      hardLimitWords:  channel === 'VOICE' ? 30 : channel === 'WHATSAPP' ? 60 : 300,
      biasTowardBrief: true,
    }),
  });

  const contract = Object.freeze({
    sections,
    sectionCount:   Object.keys(sections).length,
    agentType,
    vertical,
    channel,
    contractVersion: '1.0.0',
    disclaimer:      'This contract is a structured directive, not a raw LLM prompt.',
  });

  return { valid: true, contract };
}

/**
 * Render a contract section as a human-readable directive block.
 */
export function renderSection(section = {}, sectionId = '') {
  return Object.freeze({
    id:      sectionId,
    content: JSON.stringify(section, null, 2),
    type:    'DIRECTIVE',
  });
}

export const PROMPT_CONTRACT_VERSION = '1.0.0';
