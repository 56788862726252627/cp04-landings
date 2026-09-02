// Resolve Social Media Type — maps channel + content brief to best format

export const SOCIAL_MEDIA_TYPE = Object.freeze({
  TEXT:        'TEXT',
  IMAGE:       'IMAGE',
  CAROUSEL:    'CAROUSEL',
  SHORT_VIDEO: 'SHORT_VIDEO',
  LONG_VIDEO:  'LONG_VIDEO',
  STORY:       'STORY',
  THREAD:      'THREAD',
});

const CHANNEL_DEFAULT_FORMAT = Object.freeze({
  INSTAGRAM_REEL:  SOCIAL_MEDIA_TYPE.SHORT_VIDEO,
  INSTAGRAM_STORY: SOCIAL_MEDIA_TYPE.STORY,
  FACEBOOK:        SOCIAL_MEDIA_TYPE.IMAGE,
  TIKTOK:          SOCIAL_MEDIA_TYPE.SHORT_VIDEO,
  YOUTUBE_SHORT:   SOCIAL_MEDIA_TYPE.SHORT_VIDEO,
  YOUTUBE:         SOCIAL_MEDIA_TYPE.LONG_VIDEO,
  LINKEDIN:        SOCIAL_MEDIA_TYPE.TEXT,
  X:               SOCIAL_MEDIA_TYPE.TEXT,
  THREADS:         SOCIAL_MEDIA_TYPE.THREAD,
  LANDING:         SOCIAL_MEDIA_TYPE.IMAGE,
  EMAIL_EMBED:     SOCIAL_MEDIA_TYPE.IMAGE,
  INTERNAL:        SOCIAL_MEDIA_TYPE.TEXT,
});

const PILLAR_FORMAT_HINTS = Object.freeze({
  EDUCATIONAL:       SOCIAL_MEDIA_TYPE.CAROUSEL,
  TIPS_AND_TRICKS:   SOCIAL_MEDIA_TYPE.CAROUSEL,
  SOCIAL_PROOF:      SOCIAL_MEDIA_TYPE.IMAGE,
  BEHIND_THE_SCENES: SOCIAL_MEDIA_TYPE.SHORT_VIDEO,
  INTERACTIVE:       SOCIAL_MEDIA_TYPE.STORY,
  TRANSFORMATIONS:   SOCIAL_MEDIA_TYPE.CAROUSEL,
});

export function resolveSocialMediaType(params = {}) {
  if (!params.channel) throw new Error('resolveSocialMediaType requires channel');

  const channelDefault = CHANNEL_DEFAULT_FORMAT[params.channel];
  if (!channelDefault) throw new Error(`Unknown channel: ${params.channel}`);

  const pillarHint = params.pillar ? PILLAR_FORMAT_HINTS[params.pillar] : null;
  const resolved   = params.forceType ?? pillarHint ?? channelDefault;

  return Object.freeze({
    channel:        params.channel,
    resolvedType:   resolved,
    channelDefault,
    pillarHint:     pillarHint ?? null,
    isReal:         false,
  });
}
