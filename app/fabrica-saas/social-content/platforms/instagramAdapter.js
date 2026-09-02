// Instagram Adapter — adapts a post brief for Instagram Reels + Stories

export const INSTAGRAM_LIMITS = Object.freeze({
  REEL_MAX_DURATION_SEC: 90,
  STORY_MAX_DURATION_SEC: 15,
  CAPTION_MAX_CHARS: 2200,
  HASHTAG_MAX: 30,
  HASHTAG_RECOMMENDED: 10,
  ASPECT_RATIO_REEL: '9:16',
  ASPECT_RATIO_FEED: '1:1',
});

export function adaptForInstagramReel(post = {}) {
  if (!post.fullText) throw new Error('adaptForInstagramReel requires fullText');
  const caption = post.fullText.slice(0, INSTAGRAM_LIMITS.CAPTION_MAX_CHARS);
  return Object.freeze({
    platform:       'INSTAGRAM_REEL',
    caption,
    hashtags:       Object.freeze((post.hashtags ?? []).slice(0, INSTAGRAM_LIMITS.HASHTAG_MAX)),
    aspectRatio:    INSTAGRAM_LIMITS.ASPECT_RATIO_REEL,
    maxDurationSec: INSTAGRAM_LIMITS.REEL_MAX_DURATION_SEC,
    noRealPublish:  true,
    isReal:         false,
  });
}

export function adaptForInstagramStory(post = {}) {
  const caption = (post.hook ?? post.fullText ?? '').slice(0, 150);
  return Object.freeze({
    platform:       'INSTAGRAM_STORY',
    caption,
    hashtags:       Object.freeze((post.hashtags ?? []).slice(0, 5)),
    aspectRatio:    INSTAGRAM_LIMITS.ASPECT_RATIO_REEL,
    maxDurationSec: INSTAGRAM_LIMITS.STORY_MAX_DURATION_SEC,
    stickers:       Object.freeze(['POLL', 'QUESTION'].slice(0, post.interactive ? 2 : 0)),
    noRealPublish:  true,
    isReal:         false,
  });
}
