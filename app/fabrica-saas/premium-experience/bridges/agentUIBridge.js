// Agent UI Bridge — ADV-07 → ADV-03

export const AGENT_UI_SURFACE = Object.freeze({
  CHAT:           'CHAT',
  AGENT_STATUS:   'AGENT_STATUS',
  HANDOFF:        'HANDOFF',
  CONVERSATION:   'CONVERSATION',
});

export function resolveAgentUISurface(profile = {}) {
  const { visualDensity = 'BALANCED', motionLevel = 'STANDARD', surfaceProfile = 'LAYERED' } = profile;
  return Object.freeze({
    chatBubbleStyle:    visualDensity === 'SPACIOUS' ? 'ROUNDED_GENEROUS' : 'ROUNDED_STANDARD',
    agentStatusDisplay: 'INLINE',
    handoffStyle:       'MODAL',
    usesTypingIndicator: motionLevel !== 'NONE',
    surfaceInherit:     surfaceProfile,
    inheritsFromProfile: true,
    isReal:             false,
  });
}

export function buildAgentUIConfig(profile = {}, agentConfig = {}) {
  const surface = resolveAgentUISurface(profile);
  return Object.freeze({
    surfaces:    Object.values(AGENT_UI_SURFACE).map(s => ({ surface: s, ...surface })),
    agentConfig: { ...agentConfig, isReal: false },
    bridge:      'ADV-03',
    isReal:      false,
  });
}

export const AGENT_UI_BRIDGE_VERSION = '1.0.0';
