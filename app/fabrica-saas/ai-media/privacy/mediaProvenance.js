// Media Provenance — ADV-13

export function createMediaProvenance(config = {}) {
  if (!config.projectId) throw new Error('MediaProvenance requires projectId');
  return Object.freeze({
    projectId:       config.projectId,
    generationType:  config.generationType  ?? 'SYNTHETIC',
    provider:        config.provider        ?? 'fixture',
    avatarSource:    config.avatarSource    ?? 'SYNTHETIC_LIBRARY',
    voiceSource:     config.voiceSource     ?? 'SYNTHETIC_TTS',
    scriptSource:    config.scriptSource    ?? 'AI_GENERATED',
    businessFacts:   Object.freeze(config.businessFacts  ?? []),
    rightsStatus:    config.rightsStatus    ?? 'SYNTHETIC_FREE',
    generatedAt:     config.generatedAt     ?? Date.now(),
    isReal: false,
  });
}

export const MEDIA_PROVENANCE_VERSION = '1.0.0';
