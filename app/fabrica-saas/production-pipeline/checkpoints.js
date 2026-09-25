// Checkpoints — ADV-04
// Safe pipeline checkpoints. Track progress. Support resume.

export const CHECKPOINT = Object.freeze({
  BRIEF_VALIDATED:      'BRIEF_VALIDATED',
  PROJECT_GENERATED:    'PROJECT_GENERATED',
  QA_PASSED:            'QA_PASSED',
  SECURITY_PASSED:      'SECURITY_PASSED',
  RELEASE_READY:        'RELEASE_READY',
  STAGING_VERIFIED:     'STAGING_VERIFIED',
  PRODUCTION_VERIFIED:  'PRODUCTION_VERIFIED',
  HANDOFF_READY:        'HANDOFF_READY',
});

const CHECKPOINT_ORDER = Object.freeze([
  CHECKPOINT.BRIEF_VALIDATED,
  CHECKPOINT.PROJECT_GENERATED,
  CHECKPOINT.QA_PASSED,
  CHECKPOINT.SECURITY_PASSED,
  CHECKPOINT.RELEASE_READY,
  CHECKPOINT.STAGING_VERIFIED,
  CHECKPOINT.PRODUCTION_VERIFIED,
  CHECKPOINT.HANDOFF_READY,
]);

export function createCheckpointTracker(projectId) {
  if (!projectId) return { valid: false, error: 'projectId required' };

  const reached = new Set();

  return {
    valid: true,
    projectId,

    reach(checkpoint) {
      if (!Object.values(CHECKPOINT).includes(checkpoint)) {
        return { ok: false, error: `Unknown checkpoint: ${checkpoint}` };
      }
      reached.add(checkpoint);
      return { ok: true, checkpoint, reachedAt: new Date().toISOString() };
    },

    hasReached(checkpoint) {
      return reached.has(checkpoint);
    },

    getReached() {
      return CHECKPOINT_ORDER.filter(c => reached.has(c));
    },

    getNextCheckpoint() {
      return CHECKPOINT_ORDER.find(c => !reached.has(c)) ?? null;
    },

    resumeFrom() {
      const last = [...CHECKPOINT_ORDER].reverse().find(c => reached.has(c));
      return last ?? null;
    },

    isComplete() {
      return CHECKPOINT_ORDER.every(c => reached.has(c));
    },

    summary() {
      return Object.freeze({
        projectId,
        reached: this.getReached(),
        next:    this.getNextCheckpoint(),
        complete: this.isComplete(),
        progress: `${reached.size}/${CHECKPOINT_ORDER.length}`,
      });
    },
  };
}

export function validateCheckpointSequence(checkpoints = []) {
  const validIds = Object.values(CHECKPOINT);
  const invalid  = checkpoints.filter(c => !validIds.includes(c));
  if (invalid.length > 0) {
    return { valid: false, error: `Unknown checkpoints: ${invalid.join(', ')}` };
  }

  // Verify order is respected
  const indices    = checkpoints.map(c => CHECKPOINT_ORDER.indexOf(c));
  const isOrdered  = indices.every((v, i) => i === 0 || v >= indices[i - 1]);

  return { valid: isOrdered, outOfOrder: !isOrdered };
}

export const CHECKPOINTS_VERSION = '1.0.0';
