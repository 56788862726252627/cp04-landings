/**
 * Support Window
 * Defines included post-delivery support by package tier.
 * Bug fixes ≠ new development. Support window is NOT a retainer.
 */

export const SUPPORT_WINDOW_VERSION = '1.0.0';

export const SUPPORT_DURATION_DAYS = Object.freeze({
  ESSENTIAL: 7,
  PRO:       14,
  PREMIUM:   30,
});

export const SUPPORT_TICKET_TYPES = Object.freeze({
  BUG:              'BUG',
  CONFIGURATION:    'CONFIGURATION',
  TRAINING_QUESTION:'TRAINING_QUESTION',
  SCOPE_CHANGE:     'SCOPE_CHANGE',
  NEW_FEATURE:      'NEW_FEATURE',
});

const TICKET_COVERAGE = Object.freeze({
  [SUPPORT_TICKET_TYPES.BUG]:              { covered: true,  sla: '48h', note: 'Incluido en todos los planes' },
  [SUPPORT_TICKET_TYPES.CONFIGURATION]:    { covered: true,  sla: '72h', note: 'Ajustes de configuración incluidos' },
  [SUPPORT_TICKET_TYPES.TRAINING_QUESTION]:{ covered: true,  sla: '48h', note: 'Hasta 3 sesiones de orientación' },
  [SUPPORT_TICKET_TYPES.SCOPE_CHANGE]:     { covered: false, sla: null,  note: 'Requiere Change Request y nueva estimación' },
  [SUPPORT_TICKET_TYPES.NEW_FEATURE]:      { covered: false, sla: null,  note: 'No incluido en soporte — es nuevo desarrollo' },
});

/**
 * @param {string} tier — ESSENTIAL | PRO | PREMIUM
 * @param {Date}   [deliveryDate] — defaults to now
 * @returns {Object} SupportWindow
 */
export function createSupportWindow(tier, deliveryDate) {
  const normalizedTier = (tier ?? 'PRO').toUpperCase();
  const days   = SUPPORT_DURATION_DAYS[normalizedTier] ?? SUPPORT_DURATION_DAYS.PRO;
  const start  = deliveryDate ?? new Date();
  const end    = new Date(start);
  end.setDate(end.getDate() + days);

  return {
    supportWindowType: 'SUPPORT_WINDOW',
    version:           SUPPORT_WINDOW_VERSION,
    tier:              normalizedTier,
    durationDays:      days,
    startDate:         start.toISOString().split('T')[0],
    endDate:           end.toISOString().split('T')[0],
    active:            true,
    coverage:          TICKET_COVERAGE,
    disclaimer:        'El soporte incluido cubre bugs, configuración básica y preguntas de formación. NO incluye nuevas funcionalidades ni cambios de alcance. Una vez finalizada la ventana de soporte, cualquier asistencia requiere un plan de mantenimiento activo.',
    channel:           'email',
    responseTimeBusiness: normalizedTier === 'PREMIUM' ? '24h' : normalizedTier === 'PRO' ? '48h' : '72h',
  };
}

/**
 * Classifies a ticket and determines if it is covered in the support window.
 * @param {string} ticketType — SUPPORT_TICKET_TYPES
 * @param {Object} supportWindow
 * @returns {Object} TicketClassification
 */
export function classifyTicket(ticketType, supportWindow = {}) {
  const coverage = TICKET_COVERAGE[ticketType];
  if (!coverage) {
    return { covered: false, escalate: true, note: `Unknown ticket type: ${ticketType}` };
  }

  const now    = new Date().toISOString().split('T')[0];
  const active = supportWindow.active && now <= (supportWindow.endDate ?? '');

  return {
    ticketType,
    covered:      coverage.covered && active,
    withinWindow: active,
    sla:          coverage.sla,
    note:         coverage.note,
    escalate:     !coverage.covered,
    requiresCR:   ticketType === SUPPORT_TICKET_TYPES.SCOPE_CHANGE || ticketType === SUPPORT_TICKET_TYPES.NEW_FEATURE,
  };
}
