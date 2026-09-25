// Media Accessibility Policy — ADV-13

export const ACCESSIBILITY_REQUIREMENT = Object.freeze({
  CAPTIONS:         'CAPTIONS',
  READABLE_TEXT:    'READABLE_TEXT',
  CONTRAST:         'CONTRAST',
  AUDIO_INDEPENDENT:'AUDIO_INDEPENDENT',
  SPEECH_CLARITY:   'SPEECH_CLARITY',
  REDUCED_FLASHING: 'REDUCED_FLASHING',
});

const REQUIREMENT_META = Object.freeze({
  [ACCESSIBILITY_REQUIREMENT.CAPTIONS]:          { required: true,  wcagLevel: 'AA' },
  [ACCESSIBILITY_REQUIREMENT.READABLE_TEXT]:     { required: true,  wcagLevel: 'AA', minFontSize: 16 },
  [ACCESSIBILITY_REQUIREMENT.CONTRAST]:          { required: true,  wcagLevel: 'AA', minRatio: 4.5 },
  [ACCESSIBILITY_REQUIREMENT.AUDIO_INDEPENDENT]: { required: true,  wcagLevel: 'AA' },
  [ACCESSIBILITY_REQUIREMENT.SPEECH_CLARITY]:    { required: true,  wcagLevel: 'AA' },
  [ACCESSIBILITY_REQUIREMENT.REDUCED_FLASHING]:  { required: true,  wcagLevel: 'AAA', maxFlashPerSec: 3 },
});

export function evaluateAccessibility(mediaAssets = {}) {
  const violations = [];
  if (!mediaAssets.hasCaptions)         violations.push(ACCESSIBILITY_REQUIREMENT.CAPTIONS);
  if (!mediaAssets.hasReducedFlashing)  violations.push(ACCESSIBILITY_REQUIREMENT.REDUCED_FLASHING);
  return Object.freeze({
    passed:       violations.length === 0,
    violations:   Object.freeze(violations),
    requirements: REQUIREMENT_META,
    isReal:       false,
  });
}

export const MEDIA_ACCESSIBILITY_POLICY_VERSION = '1.0.0';
