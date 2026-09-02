// X (Twitter) Adapter

export const X_LIMITS = Object.freeze({
  POST_MAX_CHARS: 280,
  HASHTAG_RECOMMENDED: 2,
  IMAGE_ASPECT: '16:9',
});

export function adaptForX(post = {}) {
  if (!post.fullText) throw new Error('adaptForX requires fullText');
  const base = post.hook ?? post.fullText;
  const text = base.slice(0, X_LIMITS.POST_MAX_CHARS - 25);
  const hashtags = (post.hashtags ?? []).slice(0, X_LIMITS.HASHTAG_RECOMMENDED);
  const full = [text, hashtags.join(' ')].filter(Boolean).join(' ');
  return Object.freeze({
    platform:     'X',
    text:         full.slice(0, X_LIMITS.POST_MAX_CHARS),
    charCount:    full.length,
    hashtags:     Object.freeze(hashtags),
    noRealPublish: true,
    isReal:       false,
  });
}
