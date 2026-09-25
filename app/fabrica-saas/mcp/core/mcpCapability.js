// MCP Capability — ADV-12

export const CAPABILITY_TYPE = Object.freeze({
  // Data access
  READ_CRM:           'READ_CRM',
  WRITE_CRM:          'WRITE_CRM',
  READ_CALENDAR:      'READ_CALENDAR',
  WRITE_CALENDAR:     'WRITE_CALENDAR',
  READ_FILES:         'READ_FILES',
  WRITE_FILES:        'WRITE_FILES',
  READ_DATABASE:      'READ_DATABASE',
  WRITE_DATABASE:     'WRITE_DATABASE',
  // Automation
  TRIGGER_WEBHOOK:    'TRIGGER_WEBHOOK',
  EXECUTE_WORKFLOW:   'EXECUTE_WORKFLOW',
  // Communication
  SEND_EMAIL:         'SEND_EMAIL',
  SEND_SMS:           'SEND_SMS',
  SEND_WHATSAPP:      'SEND_WHATSAPP',
  // Search / AI
  WEB_SEARCH:         'WEB_SEARCH',
  SEMANTIC_SEARCH:    'SEMANTIC_SEARCH',
  // Payments / billing
  READ_BILLING:       'READ_BILLING',
  WRITE_BILLING:      'WRITE_BILLING',
  // Admin
  ADMIN_USERS:        'ADMIN_USERS',
  ADMIN_CONFIG:       'ADMIN_CONFIG',
  // Observability
  READ_METRICS:       'READ_METRICS',
});

export function createMCPCapability(config = {}) {
  if (!config.type) throw new Error('MCPCapability requires type');
  return Object.freeze({
    type:         config.type,
    label:        config.label        ?? config.type,
    description:  config.description  ?? '',
    readOnly:     config.readOnly     ?? true,
    requiresAuth: config.requiresAuth ?? false,
    isReal: false,
  });
}

export const MCP_CAPABILITY_VERSION = '1.0.0';
