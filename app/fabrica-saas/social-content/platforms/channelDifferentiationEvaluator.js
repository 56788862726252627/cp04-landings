// Channel Differentiation Evaluator — checks if repurposed posts are differentiated enough

export function evaluateChannelDifferentiation(adaptations = []) {
  if (!Array.isArray(adaptations) || adaptations.length === 0) {
    throw new Error('evaluateChannelDifferentiation requires at least one adaptation');
  }

  const issues = [];
  const platforms = adaptations.map(a => a.platform);
  const uniquePlatforms = new Set(platforms);

  if (uniquePlatforms.size !== platforms.length) {
    issues.push({ issue: 'DUPLICATE_PLATFORM', detail: 'Same platform appears more than once' });
  }

  const texts = adaptations.map(a => (a.text ?? a.caption ?? '').slice(0, 80));
  const identical = texts.filter((t, i) => texts.indexOf(t) !== i && t.length > 20);
  if (identical.length > 0) {
    issues.push({ issue: 'IDENTICAL_COPY', detail: 'Multiple platforms have identical copy text' });
  }

  return Object.freeze({
    platforms:   Object.freeze([...uniquePlatforms]),
    differentiated: issues.length === 0,
    issues:      Object.freeze(issues),
    score:       issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 30),
    isReal:      false,
  });
}
