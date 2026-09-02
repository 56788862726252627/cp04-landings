// LinkedIn Adapter

export const LINKEDIN_LIMITS = Object.freeze({
  POST_MAX_CHARS: 3000,
  RECOMMENDED_CHARS: 1300,
  HASHTAG_RECOMMENDED: 5,
  ARTICLE_MAX_CHARS: 125000,
});

export function adaptForLinkedIn(post = {}) {
  if (!post.fullText) throw new Error('adaptForLinkedIn requires fullText');
  return Object.freeze({
    platform:    'LINKEDIN',
    text:        post.fullText.slice(0, LINKEDIN_LIMITS.RECOMMENDED_CHARS),
    hashtags:    Object.freeze((post.hashtags ?? []).slice(0, LINKEDIN_LIMITS.HASHTAG_RECOMMENDED)),
    tone:        'PROFESSIONAL',
    noRealPublish: true,
    isReal:      false,
  });
}
