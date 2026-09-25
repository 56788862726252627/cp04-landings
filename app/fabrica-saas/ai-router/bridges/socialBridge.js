// Social Content Bridge — ADV-16 ↔ ADV-14
// Social copy: cost-aware batch routing foundation.

export function createSocialBridge(config = {}) {
  const {
    batchMode       = false,
    costSensitivity = 'HIGH',   // social copy is high cost sensitivity
    defaultAlias    = 'BALANCED',
  } = config;

  return Object.freeze({
    batchMode,
    costSensitivity,
    defaultAlias,

    buildSocialRequestProfile(overrides = {}) {
      return Object.freeze({
        taskType:        'SOCIAL_COPY',
        costSensitivity,
        modelAlias:      batchMode ? 'CHEAP' : defaultAlias,
        qualityTarget:   'STANDARD',
        ...overrides,
        isReal: false,
      });
    },
    isReal: false,
  });
}

export const SOCIAL_BRIDGE_VERSION = '1.0.0';
