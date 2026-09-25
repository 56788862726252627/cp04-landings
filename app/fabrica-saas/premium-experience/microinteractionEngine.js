// Microinteraction Engine — ADV-07

export const MICROINTERACTION_TYPE = Object.freeze({
  HOVER:              'HOVER',
  PRESS:              'PRESS',
  SUCCESS:            'SUCCESS',
  ERROR:              'ERROR',
  NAVIGATION:         'NAVIGATION',
  EXPAND_COLLAPSE:    'EXPAND_COLLAPSE',
  SAVE:               'SAVE',
  DELETE_CONFIRM:     'DELETE_CONFIRM',
  DRAG:               'DRAG',
  SELECTION:          'SELECTION',
});

const INTERACTION_SPECS = Object.freeze({
  HOVER:           { duration: 150, subtle: true,  reducedMotionSafe: true,  accessibleAlternative: 'focus-visible' },
  PRESS:           { duration: 100, subtle: true,  reducedMotionSafe: true,  accessibleAlternative: 'active-state' },
  SUCCESS:         { duration: 300, subtle: false, reducedMotionSafe: false, accessibleAlternative: 'aria-live-polite' },
  ERROR:           { duration: 200, subtle: false, reducedMotionSafe: true,  accessibleAlternative: 'aria-live-assertive' },
  NAVIGATION:      { duration: 200, subtle: true,  reducedMotionSafe: false, accessibleAlternative: 'instant' },
  EXPAND_COLLAPSE: { duration: 200, subtle: true,  reducedMotionSafe: false, accessibleAlternative: 'instant' },
  SAVE:            { duration: 400, subtle: false, reducedMotionSafe: false, accessibleAlternative: 'text-change' },
  DELETE_CONFIRM:  { duration: 250, subtle: false, reducedMotionSafe: true,  accessibleAlternative: 'confirm-dialog' },
  DRAG:            { duration: 0,   subtle: true,  reducedMotionSafe: false, accessibleAlternative: 'keyboard-reorder' },
  SELECTION:       { duration: 100, subtle: true,  reducedMotionSafe: true,  accessibleAlternative: 'aria-selected' },
});

export function createMicrointeraction(type = MICROINTERACTION_TYPE.HOVER, motionLevel = 'STANDARD') {
  const spec = INTERACTION_SPECS[type] ?? INTERACTION_SPECS.HOVER;
  const useAnimation = motionLevel !== 'NONE' && !(motionLevel === 'LOW' && !spec.subtle);
  return Object.freeze({
    type,
    ...spec,
    useAnimation,
    reducedMotionFallback: spec.accessibleAlternative,
    isReal: false,
  });
}

export function buildInteractionSuite(motionLevel = 'STANDARD') {
  const interactions = Object.values(MICROINTERACTION_TYPE).map(t =>
    createMicrointeraction(t, motionLevel)
  );
  return Object.freeze({
    motionLevel,
    interactions,
    totalEnabled: interactions.filter(i => i.useAnimation).length,
    isReal: false,
  });
}

export const MICROINTERACTION_ENGINE_VERSION = '1.0.0';
