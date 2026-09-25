// Media Output Package — ADV-13

export function createMediaOutputPackage(config = {}) {
  if (!config.projectId) throw new Error('MediaOutputPackage requires projectId');
  return Object.freeze({
    projectId:      config.projectId,
    videoManifest:  config.videoManifest  ?? null,
    audioManifest:  config.audioManifest  ?? null,
    script:         config.script         ?? null,
    storyboard:     config.storyboard     ?? null,
    captions:       config.captions       ?? null,
    subtitles:      config.subtitles      ?? null,
    thumbnailPlan:  config.thumbnailPlan  ?? null,
    socialCopy:     config.socialCopy     ?? null,
    rightsReport:   config.rightsReport   ?? null,
    qaReport:       config.qaReport       ?? null,
    approvalStatus: config.approvalStatus ?? 'PENDING',
    provenance:     config.provenance     ?? null,
    disclosurePlan: config.disclosurePlan ?? null,
    isReal: false,
  });
}

export const MEDIA_OUTPUT_PACKAGE_VERSION = '1.0.0';
