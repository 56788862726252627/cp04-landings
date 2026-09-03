// Agent Role Definition — ADV-17

export const AGENT_ROLE = Object.freeze({
  SUPERVISOR:  'SUPERVISOR',
  CHAT:        'CHAT',
  SALES:       'SALES',
  SUPPORT:     'SUPPORT',
  BOOKING:     'BOOKING',
  LEAD:        'LEAD',
  CRM:         'CRM',
  RESEARCH:    'RESEARCH',
  CONTENT:     'CONTENT',
  MEDIA:       'MEDIA',
  SOCIAL:      'SOCIAL',
  VOICE:       'VOICE',
  QA:          'QA',
  OPERATIONS:  'OPERATIONS',
  CUSTOM:      'CUSTOM',
});

export const ROLE_RISK_LEVEL = Object.freeze({
  [AGENT_ROLE.SUPERVISOR]:  'HIGH',
  [AGENT_ROLE.CHAT]:        'LOW',
  [AGENT_ROLE.SALES]:       'MEDIUM',
  [AGENT_ROLE.SUPPORT]:     'MEDIUM',
  [AGENT_ROLE.BOOKING]:     'MEDIUM',
  [AGENT_ROLE.LEAD]:        'MEDIUM',
  [AGENT_ROLE.CRM]:         'HIGH',
  [AGENT_ROLE.RESEARCH]:    'LOW',
  [AGENT_ROLE.CONTENT]:     'LOW',
  [AGENT_ROLE.MEDIA]:       'LOW',
  [AGENT_ROLE.SOCIAL]:      'MEDIUM',
  [AGENT_ROLE.VOICE]:       'MEDIUM',
  [AGENT_ROLE.QA]:          'LOW',
  [AGENT_ROLE.OPERATIONS]:  'HIGH',
  [AGENT_ROLE.CUSTOM]:      'HIGH',
});

export function createAgentRoleDefinition(config = {}) {
  const {
    role         = AGENT_ROLE.CHAT,
    displayName  = role,
    capabilities = [],
    riskLevel    = ROLE_RISK_LEVEL[role] ?? 'MEDIUM',
    writeEnabled = false,
    externalEnabled = false,
  } = config;

  return Object.freeze({
    role,
    displayName,
    capabilities:    Object.freeze([...capabilities]),
    riskLevel,
    writeEnabled,
    externalEnabled,
    isSupervisor:    role === AGENT_ROLE.SUPERVISOR,
    isReal:          false,
  });
}

export const AGENT_ROLE_DEFINITION_VERSION = '1.0.0';
