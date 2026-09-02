// Media Quality Gate — ADV-13

export const MEDIA_GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARN:    'WARN',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export const MEDIA_CRITICAL_FAILURE = Object.freeze({
  UNVERIFIED_CLAIM:    'UNVERIFIED_CLAIM',
  MISSING_RIGHTS:      'MISSING_RIGHTS',
  MISSING_CONSENT:     'MISSING_CONSENT',
  BAD_LIPSYNC:         'BAD_LIPSYNC',
  WRONG_BRAND:         'WRONG_BRAND',
  WRONG_FACTS:         'WRONG_FACTS',
  UNSAFE_CTA:          'UNSAFE_CTA',
  MISSING_APPROVAL:    'MISSING_APPROVAL',
  COST_WITHOUT_APPROVAL:'COST_WITHOUT_APPROVAL',
  FAKE_TESTIMONIAL:    'FAKE_TESTIMONIAL',
  FALSE_HUMAN_REPR:    'FALSE_HUMAN_REPR',
  UNLICENSED_ASSET:    'UNLICENSED_ASSET',
});

export function evaluateMediaQualityGate(qualityScore, criticalFailures = [], warnings = []) {
  if (criticalFailures.length > 0) {
    return Object.freeze({ status: MEDIA_GATE_STATUS.BLOCKED, criticalFailures: Object.freeze(criticalFailures), warnings: Object.freeze(warnings), score: qualityScore.overall, isReal: false });
  }
  if (qualityScore.overall < 60) {
    return Object.freeze({ status: MEDIA_GATE_STATUS.FAIL, criticalFailures: Object.freeze([]), warnings: Object.freeze(warnings), score: qualityScore.overall, isReal: false });
  }
  if (qualityScore.overall < 75 || warnings.length > 0) {
    return Object.freeze({ status: MEDIA_GATE_STATUS.WARN, criticalFailures: Object.freeze([]), warnings: Object.freeze(warnings), score: qualityScore.overall, isReal: false });
  }
  return Object.freeze({ status: MEDIA_GATE_STATUS.PASS, criticalFailures: Object.freeze([]), warnings: Object.freeze([]), score: qualityScore.overall, isReal: false });
}

export const MEDIA_QUALITY_GATE_VERSION = '1.0.0';
