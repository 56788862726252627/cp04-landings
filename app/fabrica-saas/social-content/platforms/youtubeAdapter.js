// YouTube Adapter — Shorts + Long form

export const YOUTUBE_LIMITS = Object.freeze({
  SHORT_MAX_DURATION_SEC: 60,
  TITLE_MAX_CHARS: 100,
  DESCRIPTION_MAX_CHARS: 5000,
  HASHTAG_TITLE_MAX: 3,
  HASHTAG_DESCRIPTION_MAX: 15,
  ASPECT_RATIO_SHORT: '9:16',
  ASPECT_RATIO_LONG:  '16:9',
});

export function adaptForYouTubeShort(post = {}) {
  if (!post.fullText) throw new Error('adaptForYouTubeShort requires fullText');
  return Object.freeze({
    platform:       'YOUTUBE_SHORT',
    title:          (post.hook ?? post.topic ?? 'Short').slice(0, YOUTUBE_LIMITS.TITLE_MAX_CHARS),
    description:    post.fullText.slice(0, YOUTUBE_LIMITS.DESCRIPTION_MAX_CHARS),
    hashtags:       Object.freeze((post.hashtags ?? []).slice(0, YOUTUBE_LIMITS.HASHTAG_DESCRIPTION_MAX)),
    aspectRatio:    YOUTUBE_LIMITS.ASPECT_RATIO_SHORT,
    maxDurationSec: YOUTUBE_LIMITS.SHORT_MAX_DURATION_SEC,
    noRealPublish:  true,
    isReal:         false,
  });
}

export function adaptForYouTubeLong(post = {}) {
  if (!post.fullText) throw new Error('adaptForYouTubeLong requires fullText');
  return Object.freeze({
    platform:    'YOUTUBE',
    title:       (post.hook ?? post.topic ?? 'Video').slice(0, YOUTUBE_LIMITS.TITLE_MAX_CHARS),
    description: post.fullText.slice(0, YOUTUBE_LIMITS.DESCRIPTION_MAX_CHARS),
    hashtags:    Object.freeze((post.hashtags ?? []).slice(0, YOUTUBE_LIMITS.HASHTAG_DESCRIPTION_MAX)),
    aspectRatio: YOUTUBE_LIMITS.ASPECT_RATIO_LONG,
    noRealPublish: true,
    isReal:      false,
  });
}
