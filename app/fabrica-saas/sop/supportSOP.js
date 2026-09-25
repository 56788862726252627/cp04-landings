// Support SOP — FASE 14: proceso de soporte y operaciones

import { createSOP, SOP_STEP_TYPES } from './sopEngine.js';
import { SUPPORT_TICKET_TYPES } from '../lifecycle/supportWindow.js';

export const TICKET_PRIORITY = Object.freeze({
  P1_CRITICAL: 'P1_CRITICAL',  // system down, data loss
  P2_HIGH:     'P2_HIGH',      // major feature broken
  P3_MEDIUM:   'P3_MEDIUM',    // minor issue, workaround exists
  P4_LOW:      'P4_LOW',       // cosmetic, question
});

export const RESPONSE_TIME_HOURS = Object.freeze({
  [TICKET_PRIORITY.P1_CRITICAL]: 1,
  [TICKET_PRIORITY.P2_HIGH]:     4,
  [TICKET_PRIORITY.P3_MEDIUM]:  24,
  [TICKET_PRIORITY.P4_LOW]:     72,
});

/**
 * Classify incoming ticket.
 */
export function classifyTicket(ticket = {}) {
  const type = ticket.type ?? SUPPORT_TICKET_TYPES.BUG;
  const description = (ticket.description ?? '').toLowerCase();

  let priority = TICKET_PRIORITY.P3_MEDIUM;
  let covered = false;
  let requiresCR = false;

  if ([SUPPORT_TICKET_TYPES.BUG, SUPPORT_TICKET_TYPES.CONFIGURATION, SUPPORT_TICKET_TYPES.TRAINING_QUESTION].includes(type)) {
    covered = true;
  }
  if ([SUPPORT_TICKET_TYPES.SCOPE_CHANGE, SUPPORT_TICKET_TYPES.NEW_FEATURE].includes(type)) {
    requiresCR = true;
  }

  if (description.includes('system down') || description.includes('data loss') || description.includes('critical')) {
    priority = TICKET_PRIORITY.P1_CRITICAL;
  } else if (description.includes('major') || description.includes('broken') || type === SUPPORT_TICKET_TYPES.BUG) {
    priority = TICKET_PRIORITY.P2_HIGH;
  } else if (type === SUPPORT_TICKET_TYPES.CONFIGURATION || type === SUPPORT_TICKET_TYPES.TRAINING_QUESTION) {
    priority = TICKET_PRIORITY.P4_LOW;
  }

  return {
    ticketType:         type,
    priority,
    responseTimeHours:  RESPONSE_TIME_HOURS[priority],
    covered,
    requiresCR,
    escalateTo:         priority === TICKET_PRIORITY.P1_CRITICAL ? 'PROJECT_MANAGER' : 'SUPPORT',
  };
}

export const sopSupport = createSOP({
  id:      'SUPPORT_OPERATIONS',
  title:   'Support Operations',
  purpose: 'Handle client tickets consistently during and after support window',
  scope:   'All client support requests',
  owner:   'SUPPORT',
  participants: ['SUPPORT', 'PROJECT_MANAGER', 'DEVELOPER', 'CLIENT_OWNER'],
  trigger: 'Client submits ticket or incident detected',
  requiredInputs: ['ticketDescription', 'clientId', 'reportedBy'],
  steps: [
    { label: 'Intake ticket', type: SOP_STEP_TYPES.ACTION, owner: 'SUPPORT' },
    { label: 'Classify ticket type and priority', type: SOP_STEP_TYPES.ACTION, owner: 'SUPPORT' },
    { label: 'Check if covered in support window', type: SOP_STEP_TYPES.DECISION, decision: 'ticket_covered', owner: 'SUPPORT' },
    { label: 'Escalate P1/P2 to PROJECT_MANAGER', type: SOP_STEP_TYPES.ACTION, owner: 'SUPPORT', optional: true },
    { label: 'Escalate SCOPE_CHANGE/NEW_FEATURE to CR process', type: SOP_STEP_TYPES.ACTION, owner: 'PROJECT_MANAGER', optional: true },
    { label: 'Investigate and diagnose', type: SOP_STEP_TYPES.ACTION, owner: 'SUPPORT' },
    { label: 'Implement fix (BUG) or configure (CONFIGURATION)', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER', optional: true },
    { label: 'QA the resolution', type: SOP_STEP_TYPES.GATE, gate: 'resolution_qa', owner: 'QA', optional: true },
    { label: 'Communicate resolution to client', type: SOP_STEP_TYPES.NOTIFICATION, owner: 'SUPPORT' },
    { label: 'Close ticket', type: SOP_STEP_TYPES.ACTION, owner: 'SUPPORT' },
  ],
  decisionRules: [
    `P1_CRITICAL: respond in ${RESPONSE_TIME_HOURS[TICKET_PRIORITY.P1_CRITICAL]}h`,
    `P2_HIGH: respond in ${RESPONSE_TIME_HOURS[TICKET_PRIORITY.P2_HIGH]}h`,
    'SCOPE_CHANGE/NEW_FEATURE → open CR, not covered in support',
    'Not covered + in support window → explain + offer CR',
  ],
  qualityChecks: ['Resolution documented', 'Client notified'],
  securityChecks: ['No real credentials requested from client via ticket'],
  handoff: 'Resolved ticket → ticket log',
  escalation: 'PROJECT_MANAGER for P1, AGENCY_OWNER for repeated P1',
  completionCriteria: ['Ticket closed', 'Client acknowledges resolution'],
  artifacts: ['Ticket record', 'Resolution note'],
  metrics: ['first_response_time', 'resolution_time', 'client_satisfaction'],
  bpmnRef: 'BPMN_AGENCY.support',
}).sop;

export const SUPPORT_SOP_VERSION = '1.0.0';
