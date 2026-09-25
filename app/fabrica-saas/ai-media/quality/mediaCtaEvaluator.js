// Media CTA Evaluator — ADV-13

export const CTA_DIMENSION = Object.freeze({
  CLARITY:      'CLARITY',
  RELEVANCE:    'RELEVANCE',
  FRICTION:     'FRICTION',
  TRUTHFULNESS: 'TRUTHFULNESS',
  BUSINESS_FIT: 'BUSINESS_FIT',
});

const UNSAFE_CTA_PATTERNS = [
  /oferta\s+por\s+tiempo\s+limitado\s+solo\s+hoy/i,
  /gratis\s+para\s+siempre/i,
  /garantizado\s+o\s+te\s+devolvemos\s+el\s+dinero/i,
];

export function evaluateCta(ctaText = '') {
  const isUnsafe = UNSAFE_CTA_PATTERNS.some(p => p.test(ctaText));
  const wordCount = ctaText.split(/\s+/).length;
  const dimensions = {
    [CTA_DIMENSION.CLARITY]:      wordCount <= 5 ? 90 : 65,
    [CTA_DIMENSION.RELEVANCE]:    80,
    [CTA_DIMENSION.FRICTION]:     wordCount <= 4 ? 90 : 70,
    [CTA_DIMENSION.TRUTHFULNESS]: isUnsafe ? 0 : 90,
    [CTA_DIMENSION.BUSINESS_FIT]: 80,
  };
  const score = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length);
  return Object.freeze({ score, dimensions: Object.freeze(dimensions), isUnsafe, isReal: false });
}

export const MEDIA_CTA_EVALUATOR_VERSION = '1.0.0';
