// Support Queue — PASO F
// 8 queue management functions

import {
  createSupportTicket,
  updateTicketState,
  TICKET_STATES,
  TICKET_PRIORITIES,
} from './supportTicket.js';
import { triageSupportTicket } from './triageEngine.js';
import { evaluateEscalation } from './escalationEngine.js';

/**
 * In-memory queue (per-instance). Replace with persistent store in production.
 */
let _queue = [];

export function resetQueue() {
  _queue = [];
}

// 1. Create and enqueue a ticket
export function createTicket(params = {}) {
  const result = createSupportTicket(params);
  if (!result.valid) return result;

  const triaged = triageSupportTicket(result.ticket);
  const finalTicket = triaged.valid ? triaged.ticket : result.ticket;

  _queue.push(finalTicket);
  return { valid: true, ticket: finalTicket, queueSize: _queue.length };
}

// 2. Assign a ticket to an agent
export function assignTicket(ticketId, assignTo, assignedBy) {
  const idx = _queue.findIndex(t => t.id === ticketId);
  if (idx === -1) return { valid: false, error: `ticket ${ticketId} not found` };

  const updated = {
    ..._queue[idx],
    assignedTo: assignTo,
    updatedAt:  new Date().toISOString(),
    timeline:   [..._queue[idx].timeline, {
      timestamp: new Date().toISOString(),
      action:    'TICKET_ASSIGNED',
      by:        assignedBy,
      note:      `Assigned to ${assignTo}`,
    }],
  };
  _queue[idx] = updated;
  return { valid: true, ticket: updated };
}

// 3. Update ticket state
export function updateTicket(ticketId, newState, updatedBy, note = '') {
  const idx = _queue.findIndex(t => t.id === ticketId);
  if (idx === -1) return { valid: false, error: `ticket ${ticketId} not found` };

  const result = updateTicketState(_queue[idx], newState, updatedBy, note);
  if (!result.valid) return result;

  _queue[idx] = result.ticket;
  return { valid: true, ticket: result.ticket };
}

// 4. Escalate a ticket
export function escalateTicket(ticketId, escalatedBy, reason = '') {
  const idx = _queue.findIndex(t => t.id === ticketId);
  if (idx === -1) return { valid: false, error: `ticket ${ticketId} not found` };

  const ticket = _queue[idx];
  const escalation = evaluateEscalation(ticket);

  const stateResult = updateTicketState(ticket, TICKET_STATES.ESCALATED, escalatedBy, reason);
  if (!stateResult.valid) return stateResult;

  _queue[idx] = stateResult.ticket;
  return { valid: true, ticket: stateResult.ticket, escalation };
}

// 5. Resolve a ticket
export function resolveTicket(ticketId, resolvedBy, resolution = '') {
  const idx = _queue.findIndex(t => t.id === ticketId);
  if (idx === -1) return { valid: false, error: `ticket ${ticketId} not found` };

  const result = updateTicketState(_queue[idx], TICKET_STATES.RESOLVED, resolvedBy, resolution);
  if (!result.valid) return result;

  _queue[idx] = result.ticket;
  return { valid: true, ticket: result.ticket };
}

// 6. Close a ticket
export function closeTicket(ticketId, closedBy, note = '') {
  const idx = _queue.findIndex(t => t.id === ticketId);
  if (idx === -1) return { valid: false, error: `ticket ${ticketId} not found` };

  const result = updateTicketState(_queue[idx], TICKET_STATES.CLOSED, closedBy, note);
  if (!result.valid) return result;

  _queue[idx] = result.ticket;
  return { valid: true, ticket: result.ticket };
}

// 7. List tickets with optional filters
export function listTickets(filters = {}) {
  let results = [..._queue];

  if (filters.clientId)  results = results.filter(t => t.clientId === filters.clientId);
  if (filters.state)     results = results.filter(t => t.state === filters.state);
  if (filters.priority)  results = results.filter(t => t.priority === filters.priority);
  if (filters.assignedTo)results = results.filter(t => t.assignedTo === filters.assignedTo);
  if (filters.type)      results = results.filter(t => t.type === filters.type);

  // Sort: P1 first, then by createdAt
  const priorityOrder = {
    [TICKET_PRIORITIES.P1_CRITICAL]: 0,
    [TICKET_PRIORITIES.P2_HIGH]:     1,
    [TICKET_PRIORITIES.P3_NORMAL]:   2,
    [TICKET_PRIORITIES.P4_LOW]:      3,
  };
  results.sort((a, b) =>
    (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9) ||
    a.createdAt.localeCompare(b.createdAt)
  );

  return { valid: true, tickets: results, total: results.length };
}

// 8. Queue summary
export function getQueueSummary(clientId = null) {
  const all = clientId ? _queue.filter(t => t.clientId === clientId) : [..._queue];

  const byState    = {};
  const byPriority = {};

  for (const t of all) {
    byState[t.state]       = (byState[t.state] ?? 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
  }

  const open = all.filter(t =>
    t.state !== TICKET_STATES.CLOSED && t.state !== TICKET_STATES.REJECTED
  ).length;

  return {
    valid:       true,
    clientId,
    total:       all.length,
    open,
    byState,
    byPriority,
    criticalOpen: (byState[TICKET_STATES.OPEN] ?? 0) +
                  (byState[TICKET_STATES.TRIAGED] ?? 0) +
                  (byState[TICKET_STATES.ESCALATED] ?? 0),
  };
}

export const SUPPORT_QUEUE_VERSION = '1.0.0';
