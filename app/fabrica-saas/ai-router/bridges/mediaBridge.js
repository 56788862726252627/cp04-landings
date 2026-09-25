// AI Media Bridge — ADV-16 ↔ ADV-13
// Media scripts: CONTENT alias, PREMIUM when needed.

export function createMediaBridge(config = {}) {
  const {
    defaultAlias = 'BALANCED',
    premiumTasks = ['MEDIA_SCRIPT', 'AVATAR_SCRIPT'],
  } = config;

  return Object.freeze({
    defaultAlias,
    premiumTasks: Object.freeze([...premiumTasks]),

    buildMediaRequestProfile(taskType = 'MEDIA_SCRIPT', overrides = {}) {
      const isPremium = premiumTasks.includes(taskType);
      return Object.freeze({
        taskType,
        modelAlias:    isPremium ? 'PREMIUM' : defaultAlias,
        qualityTarget: isPremium ? 'HIGH'    : 'STANDARD',
        ...overrides,
        isReal: false,
      });
    },
    isReal: false,
  });
}

export const MEDIA_BRIDGE_VERSION = '1.0.0';
