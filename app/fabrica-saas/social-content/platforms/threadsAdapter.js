// Threads Adapter

export const THREADS_LIMITS = Object.freeze({
  POST_MAX_CHARS: 500,
  HASHTAG_RECOMMENDED: 5,
});

export function adaptForThreads(post = {}) {
  if (!post.fullText) throw new Error('adaptForThreads requires fullText');
  return Object.freeze({
    platform:    'THREADS',
    text:        post.fullText.slice(0, THREADS_LIMITS.POST_MAX_CHARS),
    hashtags:    Object.freeze((post.hashtags ?? []).slice(0, THREADS_LIMITS.HASHTAG_RECOMMENDED)),
    noRealPublish: true,
    isReal:      false,
  });
}
