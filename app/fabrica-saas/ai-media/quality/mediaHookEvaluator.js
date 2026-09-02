// Media Hook Evaluator — ADV-13

export const HOOK_DIMENSION = Object.freeze({
  CLARITY:       'CLARITY',
  RELEVANCE:     'RELEVANCE',
  SPEED:         'SPEED',
  SPECIFICITY:   'SPECIFICITY',
  NON_CLICKBAIT: 'NON_CLICKBAIT',
});

const CLICKBAIT_PATTERNS = [
  /no\s+vas\s+a\s+creer/i, /secreto\s+que/i, /te\s+cambiará\s+la\s+vida/i,
  /método\s+revolucionario/i, /lo\s+que\s+nadie\s+te\s+cuenta/i,
];

export function evaluateHook(hookText = '') {
  const wordCount = hookText.split(/\s+/).length;
  const isClickbait = CLICKBAIT_PATTERNS.some(p => p.test(hookText));
  const dimensions = {
    [HOOK_DIMENSION.CLARITY]:       wordCount <= 15 ? 90 : 60,
    [HOOK_DIMENSION.RELEVANCE]:     80,
    [HOOK_DIMENSION.SPEED]:         wordCount <= 10 ? 90 : wordCount <= 15 ? 75 : 50,
    [HOOK_DIMENSION.SPECIFICITY]:   hookText.match(/\d/) ? 85 : 65,
    [HOOK_DIMENSION.NON_CLICKBAIT]: isClickbait ? 0 : 90,
  };
  const score = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length);
  return Object.freeze({ score, dimensions: Object.freeze(dimensions), isClickbait, isReal: false });
}

export const MEDIA_HOOK_EVALUATOR_VERSION = '1.0.0';
