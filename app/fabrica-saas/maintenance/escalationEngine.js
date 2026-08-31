// Escalation Engine — PASO F

import { TICKET_PRIORITIES, TICKET_STATES } from './supportTicket.js';

export const ESCALATION_LEVELS = Object.freeze({
  NONE:     'NONE',
  LEVEL_1:  'LEVEL_1',   // to Project Manager
  LEVEL_2:  'LEVEL_2',   // to Agency Owner
  LEVEL_3:  'LEVEL_3',   // to Emergency Protocol
  CRITICAL: 'CRITICAL',  // all hands
});

const LEVEL_DEFINITIONS = {
  [ESCALATION_LEVELS.NONE]: {
    label:       'No Escalation',
    escalateTo:  null,
    action:      'Continue standard handling',
  },
  [ESCALATION_LEVELS.LEVEL_1]: {
    label:       'Escalate to Project Manager',
    escalateTo:  'PROJECT_MANAGER',
    action:      'Project Manager takes ownership, updates client within 2h',
  },
  [ESCALATION_LEVELS.LEVEL_2]: {
    label:       'Escalate to Agency Owner',
    escalateTo:  'AGENCY_OWNER',
    action:      'Agency Owner reviews, may involve specialist resources',
  },
  [ESCALATION_LEVELS.LEVEL_3]: {
    label:       'Emergency Protocol',
    escalateTo:  'AGENCY_OWNER',
    action:      'All available resources engaged; client communication every 30 min',
  },
  [ESCALATION_LEVELS.CRITICAL]: {
    label:       'Critical — All Hands',
    escalateTo:  'AGENCY_OWNER',
    action:      'Emergency response team assembled; war room protocol',
  },
};

/**
 * Evaluate whether a ticket needs escalation and to what level.
 */
export function evaluateEscalation(ticket, context = {}) {
  if (!ticket) return { valid: false, error: 'ticket required' };

  const level = determineLevel(ticket, context);
  const def   = LEVEL_DEFINITIONS[level];

  return {
    valid:          true,
    ticketId:       ticket.id,
    escalationLevel: level,
    escalateTo:     def.escalateTo,
    action:         def.action,
    label:          def.label,
    reasons:        getReasons(ticket, context, level),
    disclaimer:     'Escalation evaluation is an operational recommendation, not an automatic action.',
  };
}

function determineLevel(ticket, context) {
  const { priority, state, type } = ticket;
  const hoursOpen = context.hoursOpen ?? 0;

  // Security + P1 → CRITICAL
  if (type === 'SECURITY_CONCERN' && priority === TICKET_PRIORITIES.P1_CRITICAL) {
    return ESCALATION_LEVELS.CRITICAL;
  }

  // All-hands if already escalated and still unresolved past SLA
  if (state === TICKET_STATES.ESCALATED && priority === TICKET_PRIORITIES.P1_CRITICAL && hoursOpen > 24) {
    return ESCALATION_LEVELS.LEVEL_3;
  }

  // P1 open > response target
  if (priority === TICKET_PRIORITIES.P1_CRITICAL && hoursOpen > 4) {
    return ESCALATION_LEVELS.LEVEL_2;
  }

  // P1 just created → L1
  if (priority === TICKET_PRIORITIES.P1_CRITICAL) {
    return ESCALATION_LEVELS.LEVEL_1;
  }

  // P2 breached SLA (48h)
  if (priority === TICKET_PRIORITIES.P2_HIGH && hoursOpen > 48) {
    return ESCALATION_LEVELS.LEVEL_2;
  }

  // P2 > 24h
  if (priority === TICKET_PRIORITIES.P2_HIGH && hoursOpen > 24) {
    return ESCALATION_LEVELS.LEVEL_1;
  }

  // P3/P4 breached SLA
  if (priority === TICKET_PRIORITIES.P3_NORMAL && hoursOpen > 120) {
    return ESCALATION_LEVELS.LEVEL_1;
  }

  return ESCALATION_LEVELS.NONE;
}

function getReasons(ticket, context, level) {
  const reasons = [];
  if (level === ESCALATION_LEVELS.NONE) return ['No escalation criteria met'];

  if (ticket.type === 'SECURITY_CONCERN') reasons.push('Security concern ticket');
  if (ticket.priority === TICKET_PRIORITIES.P1_CRITICAL) reasons.push('P1 Critical priority');
  if (context.hoursOpen > 4)  reasons.push(`Open ${context.hoursOpen}h — exceeds response target`);
  if (ticket.state === TICKET_STATES.ESCALATED) reasons.push('Already in escalated state');

  return reasons.length > 0 ? reasons : ['Escalation threshold reached'];
}

/**
 * Get the definition for a given escalation level.
 */
export function getEscalationDefinition(level) {
  return LEVEL_DEFINITIONS[level] ?? null;
}

export const ESCALATION_ENGINE_VERSION = '1.0.0';
