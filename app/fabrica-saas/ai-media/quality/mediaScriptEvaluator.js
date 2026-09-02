// Media Script Evaluator — ADV-13

export const SCRIPT_EVAL_DIMENSION = Object.freeze({
  STRUCTURE:       'STRUCTURE',
  CLAIM_ACCURACY:  'CLAIM_ACCURACY',
  BRAND_ALIGNMENT: 'BRAND_ALIGNMENT',
  AUDIENCE_FIT:    'AUDIENCE_FIT',
  READABILITY:     'READABILITY',
  CTA_STRENGTH:    'CTA_STRENGTH',
  FACT_GROUNDING:  'FACT_GROUNDING',
  LANGUAGE_QUALITY:'LANGUAGE_QUALITY',
});

export function evaluateScript(script, context = {}) {
  if (!script || !script.sections) throw new Error('evaluateScript requires script');
  const hasHook   = script.sections.some(s => s.section === 'HOOK');
  const hasCta    = script.sections.some(s => s.section === 'CTA');
  const hasProof  = script.sections.some(s => s.section === 'PROOF');
  const dimensions = {
    [SCRIPT_EVAL_DIMENSION.STRUCTURE]:       hasHook && hasCta ? 90 : 50,
    [SCRIPT_EVAL_DIMENSION.CLAIM_ACCURACY]:  context.claimsValidated ? 90 : 70,
    [SCRIPT_EVAL_DIMENSION.BRAND_ALIGNMENT]: context.brandAligned ? 90 : 65,
    [SCRIPT_EVAL_DIMENSION.AUDIENCE_FIT]:    80,
    [SCRIPT_EVAL_DIMENSION.READABILITY]:     85,
    [SCRIPT_EVAL_DIMENSION.CTA_STRENGTH]:    hasCta ? 85 : 30,
    [SCRIPT_EVAL_DIMENSION.FACT_GROUNDING]:  hasProof ? 85 : 65,
    [SCRIPT_EVAL_DIMENSION.LANGUAGE_QUALITY]: 80,
  };
  const score = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length);
  return Object.freeze({ score, dimensions: Object.freeze(dimensions), isReal: false });
}

export const MEDIA_SCRIPT_EVALUATOR_VERSION = '1.0.0';
