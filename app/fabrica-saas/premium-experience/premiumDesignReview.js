// Premium Design Review — ADV-07

export function createPremiumDesignReview(options = {}) {
  const {
    vertical         = 'default',
    businessName     = 'Demo Business',
    visualScore      = 0,
    uxScore          = 0,
    businessFitScore = 0,
    responsiveScore  = 0,
    accessibilityScore = 0,
    performanceScore = 0,
    trustScore       = 0,
    differentiationScore = 0,
    issues           = [],
    warnings         = [],
    blockingIssues   = [],
  } = options;

  const overallScore = Math.round(
    (visualScore * 0.20 + uxScore * 0.20 + businessFitScore * 0.20 +
     responsiveScore * 0.15 + accessibilityScore * 0.10 + performanceScore * 0.08 +
     trustScore * 0.05 + differentiationScore * 0.02) / 1.0
  );

  const grade = overallScore >= 95 ? 'A+'
    : overallScore >= 90 ? 'A'
    : overallScore >= 80 ? 'B'
    : overallScore >= 70 ? 'C'
    : overallScore >= 60 ? 'D' : 'F';

  return Object.freeze({
    vertical,
    businessName,
    scores: {
      visual:          visualScore,
      ux:              uxScore,
      businessFit:     businessFitScore,
      responsive:      responsiveScore,
      accessibility:   accessibilityScore,
      performance:     performanceScore,
      trust:           trustScore,
      differentiation: differentiationScore,
      overall:         overallScore,
    },
    grade,
    issues,
    warnings,
    blockingIssues,
    blocked: blockingIssues.length > 0,
    isReal:  false,
  });
}

export function formatReviewMarkdown(review = {}) {
  const { scores = {}, grade, vertical, businessName, blockingIssues = [] } = review;
  return [
    `# Premium Design Review — ${businessName}`,
    `**Vertical**: ${vertical}  **Grade**: ${grade}  **Overall**: ${scores.overall ?? 0}/100`,
    '',
    '## Scores',
    `- Visual: ${scores.visual ?? 0}/100`,
    `- UX: ${scores.ux ?? 0}/100`,
    `- Business Fit: ${scores.businessFit ?? 0}/100`,
    `- Responsive: ${scores.responsive ?? 0}/100`,
    `- Accessibility: ${scores.accessibility ?? 0}/100`,
    `- Performance: ${scores.performance ?? 0}/100`,
    '',
    blockingIssues.length > 0 ? `## Blocking Issues\n${blockingIssues.map(i => `- ${i}`).join('\n')}` : '## Status: PASS',
    '',
    `*isReal: false — fixture review*`,
  ].join('\n');
}

export const PREMIUM_DESIGN_REVIEW_VERSION = '1.0.0';
