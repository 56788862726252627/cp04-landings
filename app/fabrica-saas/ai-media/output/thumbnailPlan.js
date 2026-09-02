// Thumbnail Plan — ADV-13

export const THUMBNAIL_STYLE = Object.freeze({
  AVATAR_FACE:    'AVATAR_FACE',
  KEY_FRAME:      'KEY_FRAME',
  TEXT_OVERLAY:   'TEXT_OVERLAY',
  BRANDED:        'BRANDED',
});

export function createThumbnailPlan(config = {}) {
  if (!config.projectId) throw new Error('ThumbnailPlan requires projectId');
  const channelThumbnails = (config.channels ?? ['LANDING']).map(channel =>
    Object.freeze({
      channel,
      style:         config.style     ?? THUMBNAIL_STYLE.BRANDED,
      noClickbait:   true,
      hasTextOverlay: channel !== 'INSTAGRAM_STORY',
      assetRef:      `fixture://media/${config.projectId}/thumb_${channel}.jpg`,
    })
  );
  return Object.freeze({
    projectId:   config.projectId,
    thumbnails:  Object.freeze(channelThumbnails),
    isReal: false,
  });
}

export const THUMBNAIL_PLAN_VERSION = '1.0.0';
