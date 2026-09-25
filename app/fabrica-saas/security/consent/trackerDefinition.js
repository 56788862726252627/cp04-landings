// Tracker Definition — ADV-19

export const TRACKER_STATUS = Object.freeze({
  CLASSIFIED:   'CLASSIFIED',
  UNCLASSIFIED: 'UNCLASSIFIED',
  BLOCKED:      'BLOCKED',
  ALLOWED:      'ALLOWED',
});

export function createTrackerDefinition(config = {}) {
  const {
    id = `tracker-${Date.now()}`,
    provider = 'UNKNOWN',
    purpose = '',
    category = 'UNKNOWN',
    essential = false,
    requiresConsent = true,
    clientId = null,
  } = config;

  const status = category === 'UNKNOWN'
    ? TRACKER_STATUS.BLOCKED
    : essential
      ? TRACKER_STATUS.ALLOWED
      : TRACKER_STATUS.CLASSIFIED;

  return Object.freeze({
    id,
    clientId,
    provider,
    purpose,
    category,
    essential,
    requiresConsent: !essential && requiresConsent,
    status,
    activeBeforeConsent: essential,
    isReal: false,
  });
}

export const TRACKER_DEFINITION_VERSION = '1.0.0';
