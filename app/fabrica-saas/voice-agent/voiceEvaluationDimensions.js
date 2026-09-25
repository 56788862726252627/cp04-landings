// Voice Evaluation Dimensions — ADV-11
// Extends ADV-10 evaluation dimensions with voice-specific metrics

export const VOICE_EVAL_DIMENSION = Object.freeze({
  VOICE_NATURALNESS:        'VOICE_NATURALNESS',
  TURN_TAKING:              'TURN_TAKING',
  INTERRUPTION_HANDLING:    'INTERRUPTION_HANDLING',
  ORAL_BREVITY:             'ORAL_BREVITY',
  VOICE_BUSINESS_FIT:       'VOICE_BUSINESS_FIT',
  CALL_RESOLUTION:          'CALL_RESOLUTION',
});

export const DEFAULT_VOICE_DIMENSION_WEIGHTS = Object.freeze({
  [VOICE_EVAL_DIMENSION.VOICE_NATURALNESS]:     20,
  [VOICE_EVAL_DIMENSION.TURN_TAKING]:           15,
  [VOICE_EVAL_DIMENSION.INTERRUPTION_HANDLING]: 15,
  [VOICE_EVAL_DIMENSION.ORAL_BREVITY]:          15,
  [VOICE_EVAL_DIMENSION.VOICE_BUSINESS_FIT]:    15,
  [VOICE_EVAL_DIMENSION.CALL_RESOLUTION]:       20,
});

export function createVoiceEvaluationProfile(config = {}) {
  return Object.freeze({
    dimensions:          VOICE_EVAL_DIMENSION,
    weights:             Object.freeze({ ...DEFAULT_VOICE_DIMENSION_WEIGHTS, ...(config.weights ?? {}) }),
    isReal: false,
  });
}

export const VOICE_EVALUATION_DIMENSIONS_VERSION = '1.0.0';
