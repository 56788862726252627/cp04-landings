// Vertical Adapters — ADV-03
// Configuración por vertical. Sin duplicar lógica del arquetipo base.

export const VERTICAL = Object.freeze({
  DENTAL:         'DENTAL',
  PHYSIO:         'PHYSIO',
  PSYCHOLOGY:     'PSYCHOLOGY',
  SPEECH_THERAPY: 'SPEECH_THERAPY',
  SPORTS:         'SPORTS',
  PADEL:          'PADEL',
  VETERINARY:     'VETERINARY',
  HAIRDRESSER:    'HAIRDRESSER',
  BEAUTY:         'BEAUTY',
  LEGAL:          'LEGAL',
  FERTILITY:      'FERTILITY',
  EDUCATION:      'EDUCATION',
  DEFAULT:        'DEFAULT',
});

const VERTICAL_CONFIGS = Object.freeze({
  [VERTICAL.DENTAL]: Object.freeze({
    tone:              'WARM_PROFESSIONAL',
    riskLevel:         'MEDIUM',
    restrictedTopics:  Object.freeze(['medical diagnosis', 'drug recommendations', 'post-op complications without professional']),
    commonIntents:     Object.freeze(['BOOKING', 'PRICE', 'INFORMATION', 'URGENCY']),
    commonObjections:  Object.freeze(['PRICE', 'TIMING', 'FEAR']),
    nextActions:       Object.freeze(['BOOK', 'SHOW_PRICING', 'TRANSFER_HUMAN']),
    humanEscalation:   Object.freeze(['dental emergency', 'severe pain', 'medical history query']),
    safetyDisclaimer:  'El agente no realiza diagnósticos. Consulta siempre con tu dentista.',
  }),
  [VERTICAL.PHYSIO]: Object.freeze({
    tone:              'CALM',
    riskLevel:         'MEDIUM',
    restrictedTopics:  Object.freeze(['diagnosis', 'prescription', 'post-surgical advice without professional']),
    commonIntents:     Object.freeze(['BOOKING', 'INFORMATION', 'PRICE', 'RECOVERY_ADVICE']),
    commonObjections:  Object.freeze(['PRICE', 'TIMING', 'TRUST']),
    nextActions:       Object.freeze(['BOOK', 'SHOW_SERVICE', 'TRANSFER_HUMAN']),
    humanEscalation:   Object.freeze(['acute injury', 'severe pain', 'post-op complications']),
    safetyDisclaimer:  'El agente no prescribe tratamiento. Consulta con tu fisioterapeuta.',
  }),
  [VERTICAL.PSYCHOLOGY]: Object.freeze({
    tone:              'CALM',
    riskLevel:         'HIGH',
    restrictedTopics:  Object.freeze(['diagnosis', 'medication', 'crisis intervention', 'suicide risk']),
    commonIntents:     Object.freeze(['INFORMATION', 'BOOKING', 'SUPPORT']),
    commonObjections:  Object.freeze(['TRUST', 'TIMING', 'NEED']),
    nextActions:       Object.freeze(['BOOK', 'TRANSFER_HUMAN', 'SHOW_SERVICE']),
    humanEscalation:   Object.freeze(['crisis', 'safety risk', 'emergency', 'medication query']),
    safetyDisclaimer:  'El agente no realiza psicoterapia ni diagnóstico. Consulta con un profesional habilitado.',
  }),
  [VERTICAL.SPORTS]: Object.freeze({
    tone:              'FRIENDLY',
    riskLevel:         'LOW',
    restrictedTopics:  Object.freeze(['injury diagnosis', 'medical advice']),
    commonIntents:     Object.freeze(['BOOKING', 'INFORMATION', 'PRICE', 'AVAILABILITY']),
    commonObjections:  Object.freeze(['PRICE', 'TIMING', 'NO_DECISION']),
    nextActions:       Object.freeze(['BOOK', 'SHOW_PRICING', 'FOLLOW_UP']),
    humanEscalation:   Object.freeze(['injury', 'emergency during session']),
    safetyDisclaimer:  null,
  }),
  [VERTICAL.PADEL]: Object.freeze({
    tone:              'FRIENDLY',
    riskLevel:         'LOW',
    restrictedTopics:  Object.freeze(['injury diagnosis']),
    commonIntents:     Object.freeze(['BOOKING', 'AVAILABILITY', 'PRICE', 'INFORMATION']),
    commonObjections:  Object.freeze(['PRICE', 'TIMING']),
    nextActions:       Object.freeze(['BOOK', 'CHECK_AVAILABILITY', 'SHOW_PRICING']),
    humanEscalation:   Object.freeze(['facility emergency']),
    safetyDisclaimer:  null,
  }),
  [VERTICAL.VETERINARY]: Object.freeze({
    tone:              'WARM_PROFESSIONAL',
    riskLevel:         'MEDIUM',
    restrictedTopics:  Object.freeze(['drug dosages', 'diagnosis', 'home surgery']),
    commonIntents:     Object.freeze(['BOOKING', 'INFORMATION', 'URGENCY', 'PRICE']),
    commonObjections:  Object.freeze(['PRICE', 'TIMING', 'URGENCY']),
    nextActions:       Object.freeze(['BOOK', 'TRANSFER_HUMAN', 'SHOW_SERVICE']),
    humanEscalation:   Object.freeze(['emergency', 'animal in distress', 'medication query']),
    safetyDisclaimer:  'El agente no realiza diagnósticos veterinarios. Consulta con el veterinario.',
  }),
  [VERTICAL.LEGAL]: Object.freeze({
    tone:              'TRUSTWORTHY',
    riskLevel:         'HIGH',
    restrictedTopics:  Object.freeze(['legal advice', 'definitive legal opinion', 'court procedure']),
    commonIntents:     Object.freeze(['INFORMATION', 'BOOKING', 'PRICE']),
    commonObjections:  Object.freeze(['TRUST', 'PRICE', 'COMPLEXITY']),
    nextActions:       Object.freeze(['BOOK', 'TRANSFER_HUMAN', 'SHOW_SERVICE']),
    humanEscalation:   Object.freeze(['urgent legal matter', 'criminal matter', 'court date']),
    safetyDisclaimer:  'El agente no emite asesoramiento jurídico. Consulta con un abogado habilitado.',
  }),
  [VERTICAL.FERTILITY]: Object.freeze({
    tone:              'CALM',
    riskLevel:         'HIGH',
    restrictedTopics:  Object.freeze(['diagnosis', 'prognosis', 'medical treatment plan', 'emotional counseling']),
    commonIntents:     Object.freeze(['INFORMATION', 'BOOKING', 'PRICE', 'SUPPORT']),
    commonObjections:  Object.freeze(['PRICE', 'TRUST', 'TIMING']),
    nextActions:       Object.freeze(['BOOK', 'TRANSFER_HUMAN', 'SHOW_SERVICE']),
    humanEscalation:   Object.freeze(['treatment failure', 'emotional crisis', 'medical complication']),
    safetyDisclaimer:  'El agente no realiza diagnósticos médicos ni pronósticos. Consulta con tu especialista.',
  }),
  [VERTICAL.EDUCATION]: Object.freeze({
    tone:              'FRIENDLY',
    riskLevel:         'LOW',
    restrictedTopics:  Object.freeze(['grades issued', 'official certifications', 'legal academic records']),
    commonIntents:     Object.freeze(['INFORMATION', 'BOOKING', 'PRICE', 'AVAILABILITY']),
    commonObjections:  Object.freeze(['PRICE', 'TIMING', 'NEED']),
    nextActions:       Object.freeze(['BOOK', 'SHOW_SERVICE', 'SHOW_PRICING']),
    humanEscalation:   Object.freeze(['complaints', 'academic dispute']),
    safetyDisclaimer:  null,
  }),
  [VERTICAL.DEFAULT]: Object.freeze({
    tone:              'WARM_PROFESSIONAL',
    riskLevel:         'LOW',
    restrictedTopics:  Object.freeze([]),
    commonIntents:     Object.freeze(['INFORMATION', 'BOOKING', 'PRICE']),
    commonObjections:  Object.freeze(['PRICE', 'TIMING', 'TRUST']),
    nextActions:       Object.freeze(['ANSWER_ONLY', 'BOOK', 'TRANSFER_HUMAN']),
    humanEscalation:   Object.freeze(['complaint', 'high risk']),
    safetyDisclaimer:  null,
  }),
});

/**
 * Get the vertical adapter config.
 */
export function getVerticalAdapter(vertical = 'DEFAULT') {
  const key = vertical?.toUpperCase().replace(/-/g, '_') ?? 'DEFAULT';
  const adapter = VERTICAL_CONFIGS[key] ?? VERTICAL_CONFIGS[VERTICAL.DEFAULT];
  return { valid: true, vertical: key, adapter };
}

export const VERTICAL_ADAPTERS_VERSION = '1.0.0';
