// Facebook Adapter

export const FACEBOOK_LIMITS = Object.freeze({
  POST_MAX_CHARS: 63206,
  RECOMMENDED_CHARS: 480,
  HASHTAG_RECOMMENDED: 5,
  ASPECT_RATIO_VIDEO: '16:9',
  ASPECT_RATIO_IMAGE: '1.91:1',
});

export function adaptForFacebook(post = {}) {
  if (!post.fullText) throw new Error('adaptForFacebook requires fullText');
  return Object.freeze({
    platform:    'FACEBOOK',
    text:        post.fullText.slice(0, FACEBOOK_LIMITS.RECOMMENDED_CHARS),
    hashtags:    Object.freeze((post.hashtags ?? []).slice(0, FACEBOOK_LIMITS.HASHTAG_RECOMMENDED)),
    aspectRatio: FACEBOOK_LIMITS.ASPECT_RATIO_IMAGE,
    noRealPublish: true,
    isReal:      false,
  });
}
