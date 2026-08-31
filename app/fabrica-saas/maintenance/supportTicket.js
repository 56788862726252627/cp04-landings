// Support Ticket Model — PASO F

export const TICKET_TYPES = Object.freeze({
  BUG_REPORT:          'BUG_REPORT',
  FEATURE_REQUEST:     'FEATURE_REQUEST',
  QUESTION:            'QUESTION',
  ACCESS_REQUEST:      'ACCESS_REQUEST',
  PERFORMANCE_ISSUE:   'PERFORMANCE_ISSUE',
  INTEGRATION_ISSUE:   'INTEGRATION_ISSUE',
  SECURITY_CONCERN:    'SECURITY_CONCERN',
  DATA_ISSUE:          'DATA_ISSUE',
  BILLING_INQUIRY:     'BILLING_INQUIRY',
  CHANGE_REQUEST:      'CHANGE_REQUEST',
  TRAINING_REQUEST:    'TRAINING_REQUEST',
  OFFBOARDING_REQUEST: 'OFFBOARDING_REQUEST',
});

export const TICKET_STATES = Object.freeze({
  OPEN:        'OPEN',
  TRIAGED:     'TRIAGED',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING:     'WAITING',
  ESCALATED:   'ESCALATED',
  ON_HOLD:     'ON_HOLD',
  RESOLVED:    'RESOLVED',
  CLOSED:      'CLOSED',
  REJECTED:    'REJECTED',
});

export const TICKET_PRIORITIES = Object.freeze({
  P1_CRITICAL: 'P1_CRITICAL',
  P2_HIGH:     'P2_HIGH',
  P3_NORMAL:   'P3_NORMAL',
  P4_LOW:      'P4_LOW',
});

export function createSupportTicket(params = {}) {
  const errors = [];

  if (!params.clientId)   errors.push('clientId required');
  if (!params.title)      errors.push('title required');
  if (!params.type || !Object.values(TICKET_TYPES).includes(params.type)) {
    errors.push(`type must be one of: ${Object.values(TICKET_TYPES).join(', ')}`);
  }
  if (!params.reportedBy) errors.push('reportedBy required');

  if (errors.length > 0) return { valid: false, errors, ticket: null };

  const now = new Date().toISOString();

  const ticket = {
    id:            params.id ?? `TKT-${params.clientId}-${Date.now()}`,
    clientId:      params.clientId,
    title:         params.title,
    description:   params.description ?? '',
    type:          params.type,
    priority:      params.priority ?? TICKET_PRIORITIES.P3_NORMAL,
    state:         TICKET_STATES.OPEN,
    reportedBy:    params.reportedBy,
    assignedTo:    params.assignedTo ?? null,
    tags:          params.tags ?? [],
    attachments:   params.attachments ?? [],
    maintenanceTier: params.maintenanceTier ?? null,
    createdAt:     now,
    updatedAt:     now,
    resolvedAt:    null,
    closedAt:      null,
    timeline: [{
      timestamp: now,
      action:    'TICKET_CREATED',
      by:        params.reportedBy,
      note:      `Ticket creado: ${params.title}`,
    }],
    disclaimer: 'This ticket is an operational record, not a binding SLA commitment.',
  };

  return { valid: true, errors: [], ticket };
}

export function updateTicketState(ticket, newState, updatedBy, note = '') {
  if (!ticket) return { valid: false, error: 'ticket required' };
  if (!Object.values(TICKET_STATES).includes(newState)) {
    return { valid: false, error: `invalid state: ${newState}` };
  }

  const now = new Date().toISOString();
  const updated = {
    ...ticket,
    state:     newState,
    updatedAt: now,
    resolvedAt: newState === TICKET_STATES.RESOLVED ? now : ticket.resolvedAt,
    closedAt:   newState === TICKET_STATES.CLOSED   ? now : ticket.closedAt,
    timeline: [...ticket.timeline, {
      timestamp: now,
      action:    `STATE_CHANGED_TO_${newState}`,
      by:        updatedBy,
      note,
    }],
  };

  return { valid: true, ticket: updated };
}

export const SUPPORT_TICKET_VERSION = '1.0.0';
