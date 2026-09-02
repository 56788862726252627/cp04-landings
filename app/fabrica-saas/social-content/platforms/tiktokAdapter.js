// TikTok Adapter

export const TIKTOK_LIMITS = Object.freeze({
  MAX_DURATION_SEC: 600,
  RECOMMENDED_DURATION_SEC: 30,
  CAPTION_MAX_CHARS: 2200,
  HASHTAG_RECOMMENDED: 6,
  ASPECT_RATIO: '9:16',
});

export function adaptForTikTok(post = {}) {
  if (!post.fullText) throw new Error('adaptForTikTok requires fullText');
  return Object.freeze({
    platform:       'TIKTOK',
    caption:        post.fullText.slice(0, TIKTOK_LIMITS.CAPTION_MAX_CHARS),
    hashtags:       Object.freeze((post.hashtags ?? []).slice(0, TIKTOK_LIMITS.HASHTAG_RECOMMENDED)),
    aspectRatio:    TIKTOK_LIMITS.ASPECT_RATIO,
    maxDurationSec: TIKTOK_LIMITS.RECOMMENDED_DURATION_SEC,
    noRealPublish:  true,
    isReal:         false,
  });
}
