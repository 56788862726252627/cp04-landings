// Media Quality Score — ADV-13

export const MEDIA_QUALITY_FACTOR = Object.freeze({
  HOOK:         'HOOK',
  CTA:          'CTA',
  SCRIPT:       'SCRIPT',
  VOICE:        'VOICE',
  LIPSYNC:      'LIPSYNC',
  AVATAR:       'AVATAR',
  BRAND:        'BRAND',
  CAPTIONS:     'CAPTIONS',
  RIGHTS:       'RIGHTS',
  SAFE_AREA:    'SAFE_AREA',
  ACCESSIBILITY:'ACCESSIBILITY',
});

const DEFAULT_WEIGHTS = Object.freeze({
  [MEDIA_QUALITY_FACTOR.HOOK]:          10,
  [MEDIA_QUALITY_FACTOR.CTA]:           10,
  [MEDIA_QUALITY_FACTOR.SCRIPT]:        15,
  [MEDIA_QUALITY_FACTOR.VOICE]:         12,
  [MEDIA_QUALITY_FACTOR.LIPSYNC]:       12,
  [MEDIA_QUALITY_FACTOR.AVATAR]:        12,
  [MEDIA_QUALITY_FACTOR.BRAND]:         10,
  [MEDIA_QUALITY_FACTOR.CAPTIONS]:      8,
  [MEDIA_QUALITY_FACTOR.RIGHTS]:        8,
  [MEDIA_QUALITY_FACTOR.SAFE_AREA]:     3,
});

export function computeMediaQualityScore(scores = {}, weights = DEFAULT_WEIGHTS) {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const [factor, weight] of Object.entries(weights)) {
    if (scores[factor] !== undefined) {
      weightedSum += scores[factor] * weight;
      totalWeight += weight;
    }
  }
  const overall = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const grade = overall >= 90 ? 'A' : overall >= 75 ? 'B' : overall >= 60 ? 'C' : 'F';
  return Object.freeze({ overall, grade, factorScores: Object.freeze({ ...scores }), isReal: false });
}

export const MEDIA_QUALITY_SCORE_VERSION = '1.0.0';
