// Team Presets — ADV-17
// Predefined minimal teams for common objectives.

export const TEAM_PRESET = Object.freeze({
  SALES:              'SALES',
  BOOKING:            'BOOKING',
  SUPPORT:            'SUPPORT',
  CONTENT:            'CONTENT',
  LEAD:               'LEAD',
  OPERATIONS:         'OPERATIONS',
  GENERAL_ASSISTANT:  'GENERAL_ASSISTANT',
});

const TEAM_DEFINITIONS = Object.freeze({
  [TEAM_PRESET.SALES]: Object.freeze({
    preset: TEAM_PRESET.SALES,
    roles:  Object.freeze(['CHAT', 'SALES', 'CRM']),
    supervisorRole: 'SALES',
    description: 'Lead qualification → consultative selling → CRM update',
  }),
  [TEAM_PRESET.BOOKING]: Object.freeze({
    preset: TEAM_PRESET.BOOKING,
    roles:  Object.freeze(['CHAT', 'BOOKING']),
    supervisorRole: 'CHAT',
    description: 'Conversation + booking creation',
  }),
  [TEAM_PRESET.SUPPORT]: Object.freeze({
    preset: TEAM_PRESET.SUPPORT,
    roles:  Object.freeze(['SUPPORT', 'RESEARCH']),
    supervisorRole: 'SUPPORT',
    description: 'Issue classification + knowledge lookup + optional human handoff',
  }),
  [TEAM_PRESET.CONTENT]: Object.freeze({
    preset: TEAM_PRESET.CONTENT,
    roles:  Object.freeze(['CONTENT', 'SOCIAL', 'MEDIA', 'QA']),
    supervisorRole: 'CONTENT',
    description: 'Strategy → copy → media → QA review',
  }),
  [TEAM_PRESET.LEAD]: Object.freeze({
    preset: TEAM_PRESET.LEAD,
    roles:  Object.freeze(['LEAD', 'RESEARCH', 'CRM']),
    supervisorRole: 'LEAD',
    description: 'Research → qualification → CRM preparation',
  }),
  [TEAM_PRESET.OPERATIONS]: Object.freeze({
    preset: TEAM_PRESET.OPERATIONS,
    roles:  Object.freeze(['OPERATIONS', 'QA']),
    supervisorRole: 'OPERATIONS',
    description: 'Operational tasks with QA validation. High risk.',
  }),
  [TEAM_PRESET.GENERAL_ASSISTANT]: Object.freeze({
    preset: TEAM_PRESET.GENERAL_ASSISTANT,
    roles:  Object.freeze(['CHAT']),
    supervisorRole: 'CHAT',
    description: 'Single-agent fallback for simple requests',
  }),
});

export function getTeamPreset(preset) {
  return TEAM_DEFINITIONS[preset] ?? TEAM_DEFINITIONS[TEAM_PRESET.GENERAL_ASSISTANT];
}

export function buildTeamFromPreset(preset, registry) {
  const definition = getTeamPreset(preset);
  const agents     = definition.roles.flatMap(role => {
    const found = registry.findByRole(role);
    return found.length ? [found[0]] : [];
  });
  return Object.freeze({
    preset,
    definition,
    agents:  Object.freeze(agents),
    count:   agents.length,
    isReal:  false,
  });
}

export const TEAM_PRESETS_VERSION = '1.0.0';
