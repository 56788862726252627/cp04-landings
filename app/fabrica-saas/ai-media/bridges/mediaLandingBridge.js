// Media Landing Bridge — ADV-13 (bridges ADV-07 Premium Experience)

export function buildLandingVideoEmbed(project, qualityScore) {
  if (!project) throw new Error('buildLandingVideoEmbed requires project');
  return Object.freeze({
    projectId:      project.id,
    channel:        'LANDING',
    assetRef:       `fixture://media/${project.id}/landing.mp4`,
    posterRef:      `fixture://media/${project.id}/poster.jpg`,
    subtitleRef:    `fixture://media/${project.id}/captions.vtt`,
    autoplay:       false,
    muted:          true,
    qualityGrade:   qualityScore?.grade ?? 'B',
    adv07Bridge:    'PREMIUM_EXPERIENCE_CONNECTED',
    isReal: false,
  });
}

export const MEDIA_LANDING_BRIDGE_VERSION = '1.0.0';
