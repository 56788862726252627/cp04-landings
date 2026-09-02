// Social Content Quality Score — 11-factor scoring system

export function computeSocialContentQualityScore(post = {}, context = {}) {
  if (!post.businessId) throw new Error('computeSocialContentQualityScore requires businessId');

  // 11 factors, each 0–10
  const hookStrength      = post.hook && post.hook.length > 10 ? 9 : 4;
  const ctaPresence       = post.cta && post.cta.length > 5 ? 9 : 3;
  const copyClarity       = post.wordCount && post.wordCount < 200 ? 9 : 6;
  const pillarAlignment   = context.pillarMatch ? 10 : 4;
  const objectiveMatch    = context.objectiveMatch ? 10 : 4;
  const brandConsistency  = context.brandConsistencyScore ?? 7;
  const claimSafety       = context.hasViolation ? 0 : 10;
  const hashtagQuality    = post.hashtags && post.hashtags.length > 0 ? 8 : 3;
  const channelFit        = context.channelFit ? 9 : 5;
  const novelty           = context.noveltyScore ? Math.round(context.noveltyScore / 10) : 5;
  const humanness         = context.humannessScore ?? 7;

  const factors = Object.freeze([
    hookStrength, ctaPresence, copyClarity, pillarAlignment, objectiveMatch,
    brandConsistency, claimSafety, hashtagQuality, channelFit, novelty, humanness,
  ]);
  const overall = Math.round(factors.reduce((sum, f) => sum + f, 0) / factors.length * 10);

  return Object.freeze({
    overall,
    breakdown: Object.freeze({
      hookStrength, ctaPresence, copyClarity, pillarAlignment, objectiveMatch,
      brandConsistency, claimSafety, hashtagQuality, channelFit, novelty, humanness,
    }),
    isReal: false,
  });
}
