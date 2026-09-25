// Social Content Quality Gate — 12 BLOCKED reasons, gate evaluation

export const SOCIAL_GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARN:    'WARN',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export const SOCIAL_CRITICAL_FAILURE = Object.freeze({
  INVENTED_PRICE:           'INVENTED_PRICE',
  INVENTED_HOURS:           'INVENTED_HOURS',
  FAKE_TESTIMONIAL:         'FAKE_TESTIMONIAL',
  INVENTED_RESULTS:         'INVENTED_RESULTS',
  MISSING_APPROVAL_SOCIAL:  'MISSING_APPROVAL_SOCIAL',
  FALSE_HUMAN_REPR:         'FALSE_HUMAN_REPR',
  REAL_PUBLISH_ATTEMPTED:   'REAL_PUBLISH_ATTEMPTED',
  CLIENT_ISOLATION_BREACH:  'CLIENT_ISOLATION_BREACH',
  REAL_AD_SPEND:            'REAL_AD_SPEND',
  GDPR_VIOLATION:           'GDPR_VIOLATION',
  MISLEADING_GUARANTEE:     'MISLEADING_GUARANTEE',
  UNLICENSED_ASSET:         'UNLICENSED_ASSET',
});

export function evaluateSocialContentQualityGate(qualityScore = {}, criticalFailures = [], warnings = []) {
  if (criticalFailures.length > 0) {
    return Object.freeze({
      status:           SOCIAL_GATE_STATUS.BLOCKED,
      criticalFailures: Object.freeze(criticalFailures),
      warnings:         Object.freeze(warnings),
      score:            qualityScore.overall ?? 0,
      isReal:           false,
    });
  }
  const overall = qualityScore.overall ?? 0;
  let status;
  if (overall < 50) status = SOCIAL_GATE_STATUS.FAIL;
  else if (overall < 70 || warnings.length > 0) status = SOCIAL_GATE_STATUS.WARN;
  else status = SOCIAL_GATE_STATUS.PASS;

  return Object.freeze({
    status,
    criticalFailures: Object.freeze([]),
    warnings:         Object.freeze(warnings),
    score:            overall,
    isReal:           false,
  });
}
