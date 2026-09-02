// Social Brand Consistency Evaluator — checks post matches business brand guidelines

export function evaluateSocialBrandConsistency(post = {}, brandProfile = {}) {
  if (!post.businessId)    throw new Error('evaluateSocialBrandConsistency requires businessId');
  if (!brandProfile.businessId) throw new Error('evaluateSocialBrandConsistency requires brandProfile.businessId');

  if (post.businessId !== brandProfile.businessId) {
    return Object.freeze({
      consistent: false,
      score:      0,
      issues:     Object.freeze([{ issue: 'WRONG_BRAND', detail: 'Post businessId does not match brandProfile' }]),
      isReal:     false,
    });
  }

  const issues = [];

  if (brandProfile.forbiddenWords) {
    const text = (post.fullText ?? '').toLowerCase();
    for (const word of brandProfile.forbiddenWords) {
      if (text.includes(word.toLowerCase())) {
        issues.push({ issue: 'FORBIDDEN_WORD', detail: `Word "${word}" is not allowed` });
      }
    }
  }

  if (brandProfile.requiredHashtag && !(post.hashtags ?? []).includes(brandProfile.requiredHashtag)) {
    issues.push({ issue: 'MISSING_BRAND_HASHTAG', detail: `Required hashtag ${brandProfile.requiredHashtag} not found` });
  }

  const score = Math.max(0, 100 - issues.length * 20);

  return Object.freeze({
    consistent: issues.length === 0,
    score,
    issues:     Object.freeze(issues),
    isReal:     false,
  });
}
