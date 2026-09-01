// Repo Context Snapshot — ADV-05
// Captures non-sensitive repo state to avoid re-discovery each phase.

export const SNAPSHOT_STATUS = Object.freeze({
  FRESH:   'FRESH',
  STALE:   'STALE',
  INVALID: 'INVALID',
});

const NEVER_CAPTURE = ['SECRET', 'PASSWORD', 'TOKEN', 'KEY', 'CREDENTIAL', 'PRIVATE', 'ACCESS', 'REFRESH'];

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) =>
      !NEVER_CAPTURE.some(s => k.toUpperCase().includes(s))
    )
  );
}

export function createRepoContextSnapshot(params = {}) {
  const { branch, headSha, changedFiles = [], relevantModules = [], registryVersion, activeImprovement } = params;
  if (!branch) return { valid: false, error: 'branch required' };

  return Object.freeze({
    valid: true,
    snapshotId: `SNAP-${Date.now()}`,
    capturedAt: new Date().toISOString(),
    status: SNAPSHOT_STATUS.FRESH,
    branch,
    headSha,
    changedFiles,
    relevantModules,
    registryVersion,
    activeImprovement,
    testBaseline: sanitize(params.testBaseline ?? {}),
    isReal: false,
    NEVER_INCLUDES_SECRETS: true,
  });
}

export function isSnapshotStale(snapshot, currentHeadSha) {
  if (!snapshot || !snapshot.valid) return true;
  return snapshot.headSha !== currentHeadSha;
}

export const REPO_CONTEXT_SNAPSHOT_VERSION = '1.0.0';
