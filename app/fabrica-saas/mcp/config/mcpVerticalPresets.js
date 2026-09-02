// MCP Vertical Presets — ADV-12

export const MCP_VERTICAL = Object.freeze({
  PADEL_CLUB:     'PADEL_CLUB',
  DENTAL_CLINIC:  'DENTAL_CLINIC',
  GYM:            'GYM',
  PHYSIOTHERAPY:  'PHYSIOTHERAPY',
  LEGAL:          'LEGAL',
  REAL_ESTATE:    'REAL_ESTATE',
  EDUCATION:      'EDUCATION',
});

export const MCP_VERTICAL_PRESETS = Object.freeze({
  [MCP_VERTICAL.PADEL_CLUB]: Object.freeze({
    vertical:       MCP_VERTICAL.PADEL_CLUB,
    allowedServers: ['mcp_crm', 'mcp_calendar', 'mcp_business_data'],
    maxRisk:        'MEDIUM',
    maxCostClass:   'LOW',
    capabilities:   Object.freeze(['READ_CRM', 'READ_CALENDAR', 'WRITE_CALENDAR', 'READ_DATABASE']),
    isReal: false,
  }),
  [MCP_VERTICAL.DENTAL_CLINIC]: Object.freeze({
    vertical:       MCP_VERTICAL.DENTAL_CLINIC,
    allowedServers: ['mcp_crm', 'mcp_calendar', 'mcp_business_data', 'mcp_files'],
    maxRisk:        'MEDIUM',
    maxCostClass:   'LOW',
    capabilities:   Object.freeze(['READ_CRM', 'WRITE_CRM', 'READ_CALENDAR', 'WRITE_CALENDAR', 'READ_FILES', 'READ_DATABASE']),
    isReal: false,
  }),
  [MCP_VERTICAL.GYM]: Object.freeze({
    vertical:       MCP_VERTICAL.GYM,
    allowedServers: ['mcp_crm', 'mcp_calendar', 'mcp_business_data'],
    maxRisk:        'MEDIUM',
    maxCostClass:   'LOW',
    capabilities:   Object.freeze(['READ_CRM', 'READ_CALENDAR', 'WRITE_CALENDAR', 'READ_DATABASE']),
    isReal: false,
  }),
  [MCP_VERTICAL.PHYSIOTHERAPY]: Object.freeze({
    vertical:       MCP_VERTICAL.PHYSIOTHERAPY,
    allowedServers: ['mcp_crm', 'mcp_calendar', 'mcp_business_data', 'mcp_files'],
    maxRisk:        'MEDIUM',
    maxCostClass:   'LOW',
    capabilities:   Object.freeze(['READ_CRM', 'WRITE_CRM', 'READ_CALENDAR', 'WRITE_CALENDAR', 'READ_FILES', 'READ_DATABASE']),
    isReal: false,
  }),
  [MCP_VERTICAL.LEGAL]: Object.freeze({
    vertical:       MCP_VERTICAL.LEGAL,
    allowedServers: ['mcp_crm', 'mcp_files', 'mcp_business_data'],
    maxRisk:        'LOW',
    maxCostClass:   'FREE',
    capabilities:   Object.freeze(['READ_CRM', 'READ_FILES', 'READ_DATABASE']),
    isReal: false,
  }),
  [MCP_VERTICAL.REAL_ESTATE]: Object.freeze({
    vertical:       MCP_VERTICAL.REAL_ESTATE,
    allowedServers: ['mcp_crm', 'mcp_calendar', 'mcp_business_data', 'mcp_search'],
    maxRisk:        'MEDIUM',
    maxCostClass:   'LOW',
    capabilities:   Object.freeze(['READ_CRM', 'WRITE_CRM', 'READ_CALENDAR', 'WEB_SEARCH', 'READ_DATABASE']),
    isReal: false,
  }),
  [MCP_VERTICAL.EDUCATION]: Object.freeze({
    vertical:       MCP_VERTICAL.EDUCATION,
    allowedServers: ['mcp_crm', 'mcp_calendar', 'mcp_files', 'mcp_business_data'],
    maxRisk:        'LOW',
    maxCostClass:   'FREE',
    capabilities:   Object.freeze(['READ_CRM', 'READ_CALENDAR', 'READ_FILES', 'READ_DATABASE']),
    isReal: false,
  }),
});

export function getVerticalPreset(vertical) {
  return MCP_VERTICAL_PRESETS[vertical] ?? null;
}

export const MCP_VERTICAL_PRESETS_VERSION = '1.0.0';
