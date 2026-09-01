// Vertical Safety — ADV-03
// Reglas de seguridad por vertical. Nunca diagnosticar.

export const SAFETY_RULE = Object.freeze({
  NO_DIAGNOSIS:          'NO_DIAGNOSIS',
  NO_MEDICATION:         'NO_MEDICATION',
  NO_LEGAL_ADVICE:       'NO_LEGAL_ADVICE',
  NO_PROGNOSIS:          'NO_PROGNOSIS',
  NO_COUNSELING:         'NO_COUNSELING',
  ESCALATE_ON_CRISIS:    'ESCALATE_ON_CRISIS',
  ESCALATE_ON_EMERGENCY: 'ESCALATE_ON_EMERGENCY',
  DISCLAIMER_REQUIRED:   'DISCLAIMER_REQUIRED',
});

const VERTICAL_SAFETY_CONFIG = Object.freeze({
  psychology: Object.freeze({
    rules: Object.freeze([
      SAFETY_RULE.NO_DIAGNOSIS,
      SAFETY_RULE.NO_MEDICATION,
      SAFETY_RULE.NO_COUNSELING,
      SAFETY_RULE.ESCALATE_ON_CRISIS,
      SAFETY_RULE.DISCLAIMER_REQUIRED,
    ]),
    crisisTriggers: Object.freeze(['suicidio', 'hacerme daño', 'no quiero vivir', 'crisis', 'autolesión']),
    disclaimer: 'El agente no realiza psicoterapia ni diagnóstico. Ante una crisis, llama al 024.',
    emergencyPhrase: 'Esto es una situación importante. Te paso ahora con el equipo. Si estás en crisis, llama al 024.',
  }),
  fertility: Object.freeze({
    rules: Object.freeze([
      SAFETY_RULE.NO_DIAGNOSIS,
      SAFETY_RULE.NO_PROGNOSIS,
      SAFETY_RULE.NO_MEDICATION,
      SAFETY_RULE.ESCALATE_ON_EMERGENCY,
      SAFETY_RULE.DISCLAIMER_REQUIRED,
    ]),
    crisisTriggers: Object.freeze(['complicación', 'sangrado', 'dolor intenso', 'pérdida']),
    disclaimer: 'El agente no realiza diagnósticos médicos. Consulta siempre con tu especialista.',
    emergencyPhrase: 'Esto requiere atención médica. Te pongo en contacto con el equipo ahora.',
  }),
  legal: Object.freeze({
    rules: Object.freeze([
      SAFETY_RULE.NO_LEGAL_ADVICE,
      SAFETY_RULE.ESCALATE_ON_EMERGENCY,
      SAFETY_RULE.DISCLAIMER_REQUIRED,
    ]),
    crisisTriggers: Object.freeze(['detenido', 'juicio mañana', 'embargo', 'urgente hoy']),
    disclaimer: 'El agente no emite asesoramiento jurídico. Consulta con un abogado habilitado.',
    emergencyPhrase: 'Para una situación urgente legal, te paso con el equipo de abogados.',
  }),
  dental: Object.freeze({
    rules: Object.freeze([
      SAFETY_RULE.NO_DIAGNOSIS,
      SAFETY_RULE.NO_MEDICATION,
      SAFETY_RULE.ESCALATE_ON_EMERGENCY,
      SAFETY_RULE.DISCLAIMER_REQUIRED,
    ]),
    crisisTriggers: Object.freeze(['dolor intenso', 'infección', 'urgencia', 'fractura dental']),
    disclaimer: 'El agente no realiza diagnósticos. Consulta con tu dentista.',
    emergencyPhrase: 'Si tienes una urgencia dental, llama al clínica directamente o acude a urgencias.',
  }),
  physio: Object.freeze({
    rules: Object.freeze([
      SAFETY_RULE.NO_DIAGNOSIS,
      SAFETY_RULE.NO_MEDICATION,
      SAFETY_RULE.ESCALATE_ON_EMERGENCY,
      SAFETY_RULE.DISCLAIMER_REQUIRED,
    ]),
    crisisTriggers: Object.freeze(['lesión grave', 'no puedo mover', 'accidente', 'fractura']),
    disclaimer: 'El agente no prescribe tratamiento. Consulta con tu fisioterapeuta.',
    emergencyPhrase: 'Si es una lesión grave, acude a urgencias o llama al 112.',
  }),
  veterinary: Object.freeze({
    rules: Object.freeze([
      SAFETY_RULE.NO_DIAGNOSIS,
      SAFETY_RULE.NO_MEDICATION,
      SAFETY_RULE.ESCALATE_ON_EMERGENCY,
      SAFETY_RULE.DISCLAIMER_REQUIRED,
    ]),
    crisisTriggers: Object.freeze(['envenenamiento', 'convulsión', 'no respira', 'atropello']),
    disclaimer: 'El agente no realiza diagnósticos veterinarios. Consulta con el veterinario.',
    emergencyPhrase: 'Es una emergencia veterinaria. Acude al centro urgente más cercano.',
  }),
  DEFAULT: Object.freeze({
    rules: Object.freeze([]),
    crisisTriggers: Object.freeze([]),
    disclaimer: null,
    emergencyPhrase: 'Te pongo en contacto con el equipo.',
  }),
});

/**
 * Get the safety config for a vertical.
 */
export function getVerticalSafetyConfig(vertical = 'DEFAULT') {
  const key = vertical?.toLowerCase() ?? 'DEFAULT';
  return VERTICAL_SAFETY_CONFIG[key] ?? VERTICAL_SAFETY_CONFIG.DEFAULT;
}

/**
 * Check if a user message triggers a safety escalation.
 */
export function checkSafety(message = '', vertical = 'DEFAULT') {
  const config     = getVerticalSafetyConfig(vertical);
  const normalized = message.toLowerCase();

  const triggered = config.crisisTriggers.filter(t => normalized.includes(t));
  const isCrisis  = triggered.length > 0;

  return Object.freeze({
    isCrisis,
    triggeredBy:     Object.freeze(triggered),
    mustEscalate:    isCrisis,
    emergencyPhrase: isCrisis ? config.emergencyPhrase : null,
    disclaimer:      config.disclaimer,
    rules:           config.rules,
  });
}

/**
 * Audit a response for safety violations.
 */
export function auditResponseSafety(response = '', vertical = 'DEFAULT') {
  const violations = [];
  const normalized = response.toLowerCase();

  const diagnosisTerms = ['tienes', 'padeces', 'tu diagnóstico es', 'sufres de', 'es definitivamente'];
  const medicationTerms = ['toma', 'dosis de', 'medicamento', 'pastilla'];
  const legalOpinionTerms = ['legalmente tienes derecho', 'el juicio lo ganarás', 'el juez decidirá'];

  const config = getVerticalSafetyConfig(vertical);

  if (config.rules.includes(SAFETY_RULE.NO_DIAGNOSIS)) {
    const found = diagnosisTerms.filter(t => normalized.includes(t));
    if (found.length > 0) violations.push(`NO_DIAGNOSIS: "${found[0]}"`);
  }

  if (config.rules.includes(SAFETY_RULE.NO_MEDICATION)) {
    const found = medicationTerms.filter(t => normalized.includes(t));
    if (found.length > 0) violations.push(`NO_MEDICATION: "${found[0]}"`);
  }

  if (config.rules.includes(SAFETY_RULE.NO_LEGAL_ADVICE)) {
    const found = legalOpinionTerms.filter(t => normalized.includes(t));
    if (found.length > 0) violations.push(`NO_LEGAL_ADVICE: "${found[0]}"`);
  }

  return Object.freeze({
    safe:       violations.length === 0,
    violations: Object.freeze(violations),
    vertical,
  });
}

export const VERTICAL_SAFETY_VERSION = '1.0.0';
