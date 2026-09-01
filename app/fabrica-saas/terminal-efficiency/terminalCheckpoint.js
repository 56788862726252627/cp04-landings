// Terminal Checkpoint — ADV-05
// Tracks improvement progress to enable efficient resume.

export const TERMINAL_CHECKPOINT = Object.freeze({
  AUDIT_DONE:          'AUDIT_DONE',
  IMPLEMENTATION_DONE: 'IMPLEMENTATION_DONE',
  TARGETED_TESTS_PASS: 'TARGETED_TESTS_PASS',
  FULL_TESTS_PASS:     'FULL_TESTS_PASS',
  LINT_PASS:           'LINT_PASS',
  BUILD_PASS:          'BUILD_PASS',
  PR_CREATED:          'PR_CREATED',
  CI_PASS:             'CI_PASS',
  MERGED:              'MERGED',
});

const CHECKPOINT_ORDER = [
  'AUDIT_DONE', 'IMPLEMENTATION_DONE', 'TARGETED_TESTS_PASS',
  'FULL_TESTS_PASS', 'LINT_PASS', 'BUILD_PASS', 'PR_CREATED', 'CI_PASS', 'MERGED',
];

export function createTerminalCheckpoint(improvementId = '') {
  if (!improvementId) return { valid: false, error: 'improvementId required' };
  const reached = new Map();
  let commitSha = null;

  function reach(checkpoint, meta = {}) {
    if (!CHECKPOINT_ORDER.includes(checkpoint)) return { ok: false, error: `Unknown checkpoint: ${checkpoint}` };
    reached.set(checkpoint, { ...meta, reachedAt: new Date().toISOString() });
    return { ok: true, checkpoint };
  }

  function hasReached(checkpoint) { return reached.has(checkpoint); }

  function getLastCheckpoint() {
    for (let i = CHECKPOINT_ORDER.length - 1; i >= 0; i--) {
      if (reached.has(CHECKPOINT_ORDER[i])) return CHECKPOINT_ORDER[i];
    }
    return null;
  }

  function getNextCheckpoint() {
    const last = getLastCheckpoint();
    if (!last) return CHECKPOINT_ORDER[0];
    const idx = CHECKPOINT_ORDER.indexOf(last);
    return idx < CHECKPOINT_ORDER.length - 1 ? CHECKPOINT_ORDER[idx + 1] : null;
  }

  function resumeFrom(checkpoint) {
    if (!CHECKPOINT_ORDER.includes(checkpoint)) return { ok: false, error: 'Unknown checkpoint' };
    const meta = reached.get(checkpoint);
    if (!meta) return { ok: false, error: `Checkpoint ${checkpoint} not reached yet` };
    return { ok: true, checkpoint, meta, nextCheckpoint: getNextCheckpoint(), isReal: false };
  }

  function setCommitSha(sha) { commitSha = sha; }

  function summary() {
    return {
      improvementId,
      reachedCount: reached.size,
      total: CHECKPOINT_ORDER.length,
      lastCheckpoint: getLastCheckpoint(),
      nextCheckpoint: getNextCheckpoint(),
      isComplete: reached.size === CHECKPOINT_ORDER.length,
      commitSha,
      isReal: false,
    };
  }

  return Object.freeze({ valid: true, reach, hasReached, getLastCheckpoint, getNextCheckpoint, resumeFrom, setCommitSha, summary });
}

export const TERMINAL_CHECKPOINT_VERSION = '1.0.0';
