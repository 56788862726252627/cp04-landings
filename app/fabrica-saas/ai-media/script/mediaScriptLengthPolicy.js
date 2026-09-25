// Media Script Length Policy — ADV-13

export const SCRIPT_DURATION = Object.freeze({
  SEC_15:    '15_SEC',
  SEC_30:    '30_SEC',
  SEC_45:    '45_SEC',
  SEC_60:    '60_SEC',
  SEC_90:    '90_SEC',
  LONG_FORM: 'LONG_FORM',
});

export const DURATION_META = Object.freeze({
  [SCRIPT_DURATION.SEC_15]:    { seconds: 15,  maxWords: 38,   maxSections: 2 },
  [SCRIPT_DURATION.SEC_30]:    { seconds: 30,  maxWords: 75,   maxSections: 4 },
  [SCRIPT_DURATION.SEC_45]:    { seconds: 45,  maxWords: 112,  maxSections: 4 },
  [SCRIPT_DURATION.SEC_60]:    { seconds: 60,  maxWords: 150,  maxSections: 4 },
  [SCRIPT_DURATION.SEC_90]:    { seconds: 90,  maxWords: 225,  maxSections: 4 },
  [SCRIPT_DURATION.LONG_FORM]: { seconds: 300, maxWords: 750,  maxSections: 6 },
});

export function validateScriptLength(script, duration) {
  const meta = DURATION_META[duration];
  if (!meta) return Object.freeze({ valid: false, reason: 'UNKNOWN_DURATION', isReal: false });
  if (script.wordCount > meta.maxWords) {
    return Object.freeze({ valid: false, reason: 'TOO_LONG', wordCount: script.wordCount, maxWords: meta.maxWords, isReal: false });
  }
  if (script.sections.length > meta.maxSections) {
    return Object.freeze({ valid: false, reason: 'TOO_MANY_SECTIONS', isReal: false });
  }
  return Object.freeze({ valid: true, isReal: false });
}

export const MEDIA_SCRIPT_LENGTH_POLICY_VERSION = '1.0.0';
