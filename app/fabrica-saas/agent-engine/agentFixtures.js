// Agent Fixtures — ADV-03
// Clientes de prueba ficticios. isReal: false siempre.

export const FIXTURE_CLIENT = Object.freeze({
  NEXO_VET:      'NEXO_VET',
  FISIONOVA:     'FISIONOVA',
  PADEL_GENERICO:'PADEL_GENERICO',
  DESPACHO_LEGAL:'DESPACHO_LEGAL',
  PELUQUERIA:    'PELUQUERIA',
});

const FIXTURES = Object.freeze({

  [FIXTURE_CLIENT.NEXO_VET]: Object.freeze({
    clientId:    'fixture-nexo-vet-001',
    isReal:      false,
    dataType:    'FIXTURE',
    businessProfile: Object.freeze({
      name:        'Clínica Veterinaria Nexo',
      vertical:    'veterinary',
      description: 'Clínica veterinaria de referencia con urgencias 24h.',
      services:    Object.freeze(['Consulta general', 'Urgencias', 'Cirugía', 'Peluquería canina']),
      openingHours: '08:00–21:00 / Urgencias 24h',
      location:    'Calle Ficticia 12, Madrid (FICTICIO)',
      pricingNote: 'Consulta desde 35€. Urgencias con recargo.',
    }),
    agentType:   'BOOKING',
    channel:     'WEB_CHAT',
    overrides:   Object.freeze({}),
  }),

  [FIXTURE_CLIENT.FISIONOVA]: Object.freeze({
    clientId:    'fixture-fisionova-001',
    isReal:      false,
    dataType:    'FIXTURE',
    businessProfile: Object.freeze({
      name:        'FisioNova',
      vertical:    'physio',
      description: 'Centro de fisioterapia avanzada para deportistas y recuperación post-operatoria.',
      services:    Object.freeze(['Fisioterapia deportiva', 'Rehabilitación', 'Pilates terapéutico', 'Osteopatía']),
      openingHours: '09:00–20:00 L-V',
      location:    'Polígono Industrial Ficción, Málaga (FICTICIO)',
      pricingNote: 'Primera visita 50€. Bono 10 sesiones 380€.',
    }),
    agentType:   'SALES',
    channel:     'WEB_CHAT',
    overrides:   Object.freeze({}),
  }),

  [FIXTURE_CLIENT.PADEL_GENERICO]: Object.freeze({
    clientId:    'fixture-padel-001',
    isReal:      false,
    dataType:    'FIXTURE',
    businessProfile: Object.freeze({
      name:        'Club Pádel Ejemplo',
      vertical:    'padel',
      description: 'Club de pádel con 8 pistas cubiertas y clases para todos los niveles.',
      services:    Object.freeze(['Reserva de pistas', 'Clases particulares', 'Torneos', 'Tienda']),
      openingHours: '07:00–23:00',
      location:    'Avenida Inventada 44, Sevilla (FICTICIO)',
      pricingNote: 'Pista 1h desde 12€. Socio: 30€/mes.',
    }),
    agentType:   'BOOKING',
    channel:     'WHATSAPP',
    overrides:   Object.freeze({ BRAND_TONE: 'FRIENDLY' }),
  }),

  [FIXTURE_CLIENT.DESPACHO_LEGAL]: Object.freeze({
    clientId:    'fixture-legal-001',
    isReal:      false,
    dataType:    'FIXTURE',
    businessProfile: Object.freeze({
      name:        'Despacho Jurídico Ejemplo',
      vertical:    'legal',
      description: 'Despacho de abogados ficticio especializado en derecho laboral y civil.',
      services:    Object.freeze(['Consulta inicial gratuita', 'Derecho laboral', 'Divorcios', 'Herencias']),
      openingHours: '09:30–18:00 L-V',
      location:    'Plaza de las Letras 3, Barcelona (FICTICIO)',
      pricingNote: 'Consulta inicial gratuita 30 min. Honorarios según caso.',
    }),
    agentType:   'SUPPORT',
    channel:     'WEB_CHAT',
    overrides:   Object.freeze({}),
  }),

  [FIXTURE_CLIENT.PELUQUERIA]: Object.freeze({
    clientId:    'fixture-pelo-001',
    isReal:      false,
    dataType:    'FIXTURE',
    businessProfile: Object.freeze({
      name:        'Peluquería Ficticia Estilo',
      vertical:    'hairdresser',
      description: 'Peluquería unisex con especialidad en color y tratamientos capilares.',
      services:    Object.freeze(['Corte', 'Color', 'Mechas', 'Tratamientos', 'Peinados']),
      openingHours: '09:00–20:00 L-S',
      location:    'Calle de Pruebas 7, Valencia (FICTICIO)',
      pricingNote: 'Corte desde 18€. Color desde 45€.',
    }),
    agentType:   'BOOKING',
    channel:     'WEB_CHAT',
    overrides:   Object.freeze({}),
  }),
});

/**
 * Get a fixture client by ID.
 */
export function getFixture(clientId) {
  const fixture = FIXTURES[clientId];
  if (!fixture) return { valid: false, error: `Unknown fixture: ${clientId}` };
  return { valid: true, fixture };
}

/**
 * List all fixture client IDs.
 */
export function listFixtures() {
  return Object.freeze(Object.keys(FIXTURES));
}

export const AGENT_FIXTURES_VERSION = '1.0.0';
