// Triage Engine — PASO F

import { TICKET_TYPES, TICKET_PRIORITIES, TICKET_STATES, updateTicketState } from './supportTicket.js';

const PRIORITY_RULES = [
  {
    condition: (t) => t.type === TICKET_TYPES.SECURITY_CONCERN,
    priority: TICKET_PRIORITIES.P1_CRITICAL,
    reason: 'Security concerns are always P1',
    assignTo: 'AGENCY_OWNER',
  },
  {
    condition: (t) =>
      t.type === TICKET_TYPES.BUG_REPORT &&
      (t.description ?? '').toLowerCase().match(/production|down|data loss|all users/),
    priority: TICKET_PRIORITIES.P1_CRITICAL,
    reason: 'Production-impacting bug',
    assignTo: 'PROJECT_MANAGER',
  },
  {
    condition: (t) => t.type === TICKET_TYPES.INTEGRATION_ISSUE,
    priority: TICKET_PRIORITIES.P2_HIGH,
    reason: 'Integration issues affect business operations',
    assignTo: 'DEVELOPER',
  },
  {
    condition: (t) => t.type === TICKET_TYPES.DATA_ISSUE,
    priority: TICKET_PRIORITIES.P2_HIGH,
    reason: 'Data integrity issues require prompt attention',
    assignTo: 'DEVELOPER',
  },
  {
    condition: (t) => t.type === TICKET_TYPES.PERFORMANCE_ISSUE,
    priority: TICKET_PRIORITIES.P2_HIGH,
    reason: 'Performance issues impact user experience',
    assignTo: 'DEVELOPER',
  },
  {
    condition: (t) =>
      t.type === TICKET_TYPES.BUG_REPORT &&
      !(t.description ?? '').toLowerCase().match(/production|down|data loss|all users/),
    priority: TICKET_PRIORITIES.P3_NORMAL,
    reason: 'Standard bug report',
    assignTo: 'SUPPORT',
  },
  {
    condition: (t) => t.type === TICKET_TYPES.CHANGE_REQUEST,
    priority: TICKET_PRIORITIES.P3_NORMAL,
    reason: 'Change request requires scope evaluation',
    assignTo: 'PROJECT_MANAGER',
  },
  {
    condition: (t) =>
      t.type === TICKET_TYPES.FEATURE_REQUEST ||
      t.type === TICKET_TYPES.TRAINING_REQUEST,
    priority: TICKET_PRIORITIES.P4_LOW,
    reason: 'Enhancement or training — low urgency',
    assignTo: 'SUPPORT',
  },
];

/**
 * Triage a support ticket: assign priority, assignee, and advance state to TRIAGED.
 */
export function triageSupportTicket(ticket, options = {}) {
  if (!ticket) return { valid: false, error: 'ticket required' };

  let matchedRule = null;
  for (const rule of PRIORITY_RULES) {
    if (rule.condition(ticket)) {
      matchedRule = rule;
      break;
    }
  }

  const priority   = options.overridePriority ?? matchedRule?.priority ?? TICKET_PRIORITIES.P3_NORMAL;
  const assignTo   = options.overrideAssignTo  ?? matchedRule?.assignTo  ?? 'SUPPORT';
  const reason     = matchedRule?.reason ?? 'Default triage — no specific rule matched';
  const triageNote = `Triaged: ${reason}. Assigned to ${assignTo}.`;

  const stateResult = updateTicketState(ticket, TICKET_STATES.TRIAGED, 'SYSTEM', triageNote);
  if (!stateResult.valid) return stateResult;

  const triaged = {
    ...stateResult.ticket,
    priority,
    assignedTo: assignTo,
  };

  return {
    valid: true,
    ticket: triaged,
    priority,
    assignedTo: assignTo,
    reason,
    ruleMatched: !!matchedRule,
  };
}

/**
 * Batch triage a list of tickets.
 */
export function batchTriage(tickets = []) {
  return tickets.map(t => triageSupportTicket(t));
}

export const TRIAGE_ENGINE_VERSION = '1.0.0';
