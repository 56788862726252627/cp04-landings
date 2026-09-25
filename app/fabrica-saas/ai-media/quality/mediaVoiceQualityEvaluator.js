// Media Voice Quality Evaluator — ADV-13

export const VOICE_QUALITY_DIMENSION = Object.freeze({
  CLARITY:         'CLARITY',
  NATURALNESS:     'NATURALNESS',
  PACE:            'PACE',
  BUSINESS_FIT:    'BUSINESS_FIT',
  PRONUNCIATION:   'PRONUNCIATION',
  EXPRESSIVENESS:  'EXPRESSIVENESS',
});

export function evaluateVoiceQuality(voiceProfile, context = {}) {
  if (!voiceProfile) throw new Error('evaluateVoiceQuality requires voiceProfile');
  const dimensions = {
    [VOICE_QUALITY_DIMENSION.CLARITY]:        voiceProfile.clarity === 'VERY_HIGH' ? 95 : 80,
    [VOICE_QUALITY_DIMENSION.NATURALNESS]:    voiceProfile.source === 'SYNTHETIC' ? 75 : 90,
    [VOICE_QUALITY_DIMENSION.PACE]:           voiceProfile.pace === 'NORMAL' ? 90 : 75,
    [VOICE_QUALITY_DIMENSION.BUSINESS_FIT]:   context.businessFit ?? 80,
    [VOICE_QUALITY_DIMENSION.PRONUNCIATION]:  voiceProfile.locale === 'es-ES' ? 90 : 75,
    [VOICE_QUALITY_DIMENSION.EXPRESSIVENESS]: voiceProfile.expressiveness === 'HIGH' || voiceProfile.expressiveness === 'VERY_HIGH' ? 88 : 70,
  };
  const score = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length);
  return Object.freeze({ score, dimensions: Object.freeze(dimensions), isReal: false });
}

export const MEDIA_VOICE_QUALITY_EVALUATOR_VERSION = '1.0.0';
