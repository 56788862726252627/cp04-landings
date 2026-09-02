// Social Content Objective — 12 types

export const SOCIAL_OBJECTIVE = Object.freeze({
  BRAND_AWARENESS:      'BRAND_AWARENESS',
  LEAD_GENERATION:      'LEAD_GENERATION',
  COMMUNITY_BUILDING:   'COMMUNITY_BUILDING',
  BOOKING_CONVERSION:   'BOOKING_CONVERSION',
  RETENTION:            'RETENTION',
  EDUCATION:            'EDUCATION',
  SOCIAL_PROOF:         'SOCIAL_PROOF',
  LOCAL_PRESENCE:       'LOCAL_PRESENCE',
  SEASONAL_PROMOTION:   'SEASONAL_PROMOTION',
  LAUNCH:               'LAUNCH',
  REFERRAL:             'REFERRAL',
  THOUGHT_LEADERSHIP:   'THOUGHT_LEADERSHIP',
});

const OBJECTIVE_LABELS = Object.freeze({
  BRAND_AWARENESS:    'Conciencia de marca',
  LEAD_GENERATION:    'Captación de leads',
  COMMUNITY_BUILDING: 'Construcción de comunidad',
  BOOKING_CONVERSION: 'Conversión a reserva',
  RETENTION:          'Fidelización de clientes',
  EDUCATION:          'Educación y valor',
  SOCIAL_PROOF:       'Prueba social',
  LOCAL_PRESENCE:     'Presencia local',
  SEASONAL_PROMOTION: 'Promoción estacional',
  LAUNCH:             'Lanzamiento de producto/servicio',
  REFERRAL:           'Programa de referidos',
  THOUGHT_LEADERSHIP: 'Liderazgo de opinión',
});

export function getObjectiveLabel(objective) {
  if (!OBJECTIVE_LABELS[objective]) throw new Error(`Unknown objective: ${objective}`);
  return OBJECTIVE_LABELS[objective];
}

export function listObjectives() {
  return Object.values(SOCIAL_OBJECTIVE).map(obj => Object.freeze({
    id: obj,
    label: OBJECTIVE_LABELS[obj],
    isReal: false,
  }));
}
