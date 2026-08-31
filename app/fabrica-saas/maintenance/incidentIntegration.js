// Incident Integration — PASO F
// Bridges support tickets into the incident management system (sop/incidentManagement.js)

import { createIncident, INCIDENT_SEVERITY, classifySeverity } from '../sop/incidentManagement.js';
import { TICKET_TYPES, TICKET_PRIORITIES } from './supportTicket.js';

const PRIORITY_TO_SEVERITY = {
  [TICKET_PRIORITIES.P1_CRITICAL]: INCIDENT_SEVERITY.SEV1,
  [TICKET_PRIORITIES.P2_HIGH]:     INCIDENT_SEVERITY.SEV2,
  [TICKET_PRIORITIES.P3_NORMAL]:   INCIDENT_SEVERITY.SEV3,
  [TICKET_PRIORITIES.P4_LOW]:      INCIDENT_SEVERITY.SEV4,
};

const INCIDENT_ELIGIBLE_TYPES = new Set([
  TICKET_TYPES.BUG_REPORT,
  TICKET_TYPES.PERFORMANCE_ISSUE,
  TICKET_TYPES.INTEGRATION_ISSUE,
  TICKET_TYPES.SECURITY_CONCERN,
  TICKET_TYPES.DATA_ISSUE,
]);

/**
 * Determine if a support ticket qualifies for incident escalation.
 */
export function isIncidentEligible(ticket) {
  if (!ticket) return false;
  if (ticket.priority === TICKET_PRIORITIES.P1_CRITICAL) return true;
  if (ticket.type === TICKET_TYPES.SECURITY_CONCERN) return true;
  return INCIDENT_ELIGIBLE_TYPES.has(ticket.type) &&
    ticket.priority === TICKET_PRIORITIES.P2_HIGH;
}

/**
 * Convert a support ticket into an incident record.
 * Does NOT trigger real incident actions (NO_REAL_INCIDENT_ACTIONS=SI).
 */
export function supportTicketToIncident(ticket, options = {}) {
  if (!ticket) return { valid: false, error: 'ticket required' };

  if (!isIncidentEligible(ticket) && !options.force) {
    return {
      valid: false,
      error: 'ticket does not meet incident escalation criteria',
      eligible: false,
    };
  }

  const detectedSeverity = ticket.priority
    ? (PRIORITY_TO_SEVERITY[ticket.priority] ?? INCIDENT_SEVERITY.SEV3)
    : classifySeverity(ticket.description ?? ticket.title ?? '');

  const severity = options.overrideSeverity ?? detectedSeverity;

  const incidentResult = createIncident({
    title:       `[TICKET ${ticket.id}] ${ticket.title}`,
    severity,
    reportedBy:  ticket.reportedBy,
    description: ticket.description ?? ticket.title,
    clientId:    ticket.clientId,
    sourceTicketId: ticket.id,
  });

  if (!incidentResult.valid) {
    return { valid: false, error: incidentResult.errors?.join(', '), incident: null };
  }

  return {
    valid:         true,
    incident:      incidentResult.incident,
    sourceTicketId: ticket.id,
    severity,
    disclaimer:    'Incident created from support ticket. No real incident actions triggered.',
  };
}

/**
 * Audit a list of tickets to identify candidates for incident escalation.
 */
export function auditTicketsForEscalation(tickets = []) {
  const candidates = tickets.filter(isIncidentEligible);
  const nonCandidates = tickets.filter(t => !isIncidentEligible(t));

  return {
    total:         tickets.length,
    candidates:    candidates.length,
    nonCandidates: nonCandidates.length,
    candidateIds:  candidates.map(t => t.id),
  };
}

export const INCIDENT_INTEGRATION_VERSION = '1.0.0';
