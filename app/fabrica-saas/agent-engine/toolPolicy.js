// Agent Tool Policy — ADV-03
// Least privilege. Preparado para MCP avanzado posterior.

export const TOOL_ID = Object.freeze({
  READ_CALENDAR:    'READ_CALENDAR',
  WRITE_CALENDAR:   'WRITE_CALENDAR',
  READ_CRM:         'READ_CRM',
  WRITE_CRM:        'WRITE_CRM',
  SEND_EMAIL:       'SEND_EMAIL',
  SEND_WHATSAPP:    'SEND_WHATSAPP',
  SEARCH_FAQ:       'SEARCH_FAQ',
  READ_PRICING:     'READ_PRICING',
  CONFIRM_BOOKING:  'CONFIRM_BOOKING',
  CANCEL_BOOKING:   'CANCEL_BOOKING',
  CHECK_AVAILABILITY:'CHECK_AVAILABILITY',
  TRANSFER_HUMAN:   'TRANSFER_HUMAN',
  LOG_EVENT:        'LOG_EVENT',
  RAG_SEARCH:       'RAG_SEARCH',
});

export const TOOL_RISK = Object.freeze({
  READ:      'READ',
  LOW:       'LOW',
  MEDIUM:    'MEDIUM',
  HIGH:      'HIGH',
  CRITICAL:  'CRITICAL',
});

const TOOL_RISK_MAP = Object.freeze({
  [TOOL_ID.READ_CALENDAR]:     TOOL_RISK.READ,
  [TOOL_ID.WRITE_CALENDAR]:    TOOL_RISK.MEDIUM,
  [TOOL_ID.READ_CRM]:          TOOL_RISK.READ,
  [TOOL_ID.WRITE_CRM]:         TOOL_RISK.MEDIUM,
  [TOOL_ID.SEND_EMAIL]:        TOOL_RISK.HIGH,
  [TOOL_ID.SEND_WHATSAPP]:     TOOL_RISK.HIGH,
  [TOOL_ID.SEARCH_FAQ]:        TOOL_RISK.READ,
  [TOOL_ID.READ_PRICING]:      TOOL_RISK.READ,
  [TOOL_ID.CONFIRM_BOOKING]:   TOOL_RISK.HIGH,
  [TOOL_ID.CANCEL_BOOKING]:    TOOL_RISK.HIGH,
  [TOOL_ID.CHECK_AVAILABILITY]:TOOL_RISK.READ,
  [TOOL_ID.TRANSFER_HUMAN]:    TOOL_RISK.MEDIUM,
  [TOOL_ID.LOG_EVENT]:         TOOL_RISK.LOW,
  [TOOL_ID.RAG_SEARCH]:        TOOL_RISK.READ,
});

const AGENT_DEFAULT_TOOLS = Object.freeze({
  CHAT:    Object.freeze([TOOL_ID.SEARCH_FAQ, TOOL_ID.READ_PRICING, TOOL_ID.TRANSFER_HUMAN]),
  SALES:   Object.freeze([TOOL_ID.READ_CRM, TOOL_ID.READ_PRICING, TOOL_ID.TRANSFER_HUMAN, TOOL_ID.LOG_EVENT]),
  SUPPORT: Object.freeze([TOOL_ID.READ_CRM, TOOL_ID.SEARCH_FAQ, TOOL_ID.TRANSFER_HUMAN, TOOL_ID.LOG_EVENT]),
  BOOKING: Object.freeze([TOOL_ID.CHECK_AVAILABILITY, TOOL_ID.CONFIRM_BOOKING, TOOL_ID.CANCEL_BOOKING, TOOL_ID.TRANSFER_HUMAN]),
  LEAD:    Object.freeze([TOOL_ID.WRITE_CRM, TOOL_ID.READ_PRICING, TOOL_ID.TRANSFER_HUMAN, TOOL_ID.LOG_EVENT]),
  VOICE:   Object.freeze([TOOL_ID.CHECK_AVAILABILITY, TOOL_ID.TRANSFER_HUMAN, TOOL_ID.SEARCH_FAQ]),
});

/**
 * Create an AgentToolPolicy.
 */
export function createToolPolicy(params = {}) {
  const {
    agentType    = 'CHAT',
    extraTools   = [],
    deniedTools  = [],
    requireConfirmation = [],
  } = params;

  const baseTools     = AGENT_DEFAULT_TOOLS[agentType] ?? AGENT_DEFAULT_TOOLS.CHAT;
  const allowedTools  = Object.freeze([...new Set([...baseTools, ...extraTools])].filter(t => !deniedTools.includes(t)));
  const readOnlyTools = Object.freeze(allowedTools.filter(t => TOOL_RISK_MAP[t] === TOOL_RISK.READ));
  const writeTools    = Object.freeze(allowedTools.filter(t => [TOOL_RISK.MEDIUM, TOOL_RISK.HIGH].includes(TOOL_RISK_MAP[t])));
  const highRiskTools = Object.freeze(allowedTools.filter(t => TOOL_RISK_MAP[t] === TOOL_RISK.HIGH));

  const policy = Object.freeze({
    agentType,
    allowedTools,
    deniedTools:        Object.freeze(deniedTools),
    readOnlyTools,
    writeTools,
    highRiskTools,
    requiresConfirmation: Object.freeze(requireConfirmation),
    humanApprovalTools:  Object.freeze([TOOL_ID.SEND_EMAIL, TOOL_ID.SEND_WHATSAPP, TOOL_ID.CANCEL_BOOKING]),
    principle:           'LEAST_PRIVILEGE',
    mcpNote:             'MCP advanced integration pending ADV-05+.',
    version:             '1.0.0',
  });

  return { valid: true, policy };
}

export const TOOL_POLICY_VERSION = '1.0.0';
