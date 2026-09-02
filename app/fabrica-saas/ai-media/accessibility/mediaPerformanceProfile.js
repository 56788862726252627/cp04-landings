// Media Performance Profile — ADV-13

export function createMediaPerformanceProfile(config = {}) {
  return Object.freeze({
    hasPoster:           config.hasPoster           ?? true,
    lazyLoad:            config.lazyLoad            ?? true,
    isCompressed:        config.isCompressed        ?? true,
    hasMobileAlternative:config.hasMobileAlternative ?? false,
    hasFallbackImage:    config.hasFallbackImage    ?? true,
    maxFileSizeMb:       config.maxFileSizeMb        ?? 50,
    targetBitrateKbps:   config.targetBitrateKbps   ?? 2500,
    isReal: false,
  });
}

export const MEDIA_PERFORMANCE_PROFILE_VERSION = '1.0.0';
