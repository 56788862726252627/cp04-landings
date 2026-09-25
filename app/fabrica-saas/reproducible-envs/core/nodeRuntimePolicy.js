// Node Runtime Policy — ADV-15

export const NODE_VERSION_STATUS = Object.freeze({
  EXACT_MATCH:   'EXACT_MATCH',
  COMPATIBLE:    'COMPATIBLE',
  NEWER_MINOR:   'NEWER_MINOR',
  NEWER_MAJOR:   'NEWER_MAJOR',
  OLDER:         'OLDER',
  UNKNOWN:       'UNKNOWN',
});

const KNOWN_LTS = Object.freeze(['18', '20', '22']);
const RECOMMENDED_MAJOR = '22';

function parseMajor(v) {
  const m = String(v || '').replace(/^v/, '').split('.')[0];
  return m ? parseInt(m, 10) : null;
}

export function resolveNodeVersion(config = {}) {
  const { enginesNode, lockfileNode, currentRuntime } = config;

  let resolved = enginesNode ?? lockfileNode ?? `${RECOMMENDED_MAJOR}.x`;
  const resolvedMajor = parseMajor(resolved);
  const currentMajor  = parseMajor(currentRuntime);

  let status = NODE_VERSION_STATUS.UNKNOWN;
  if (currentMajor && resolvedMajor) {
    if (currentMajor === resolvedMajor) status = NODE_VERSION_STATUS.EXACT_MATCH;
    else if (currentMajor > resolvedMajor) status = NODE_VERSION_STATUS.NEWER_MAJOR;
    else status = NODE_VERSION_STATUS.OLDER;
  } else if (currentMajor) {
    status = NODE_VERSION_STATUS.COMPATIBLE;
  }

  const isLTS = KNOWN_LTS.includes(String(resolvedMajor));

  return Object.freeze({
    resolved,
    resolvedMajor,
    currentRuntime:    currentRuntime ?? null,
    currentMajor,
    status,
    isLTS,
    recommendedMajor:  RECOMMENDED_MAJOR,
    warnings: Object.freeze(
      currentMajor && currentMajor > parseInt(RECOMMENDED_MAJOR, 10)
        ? [`Current Node ${currentMajor} is newer than recommended ${RECOMMENDED_MAJOR} — image may differ`]
        : []
    ),
    isReal: false,
  });
}

export function createNodeRuntimePolicy(config = {}) {
  const resolved = resolveNodeVersion(config);

  return Object.freeze({
    ...resolved,
    dockerBaseImage:    `node:${resolved.resolvedMajor ?? RECOMMENDED_MAJOR}-alpine`,
    ciNodeVersion:      String(resolved.resolvedMajor ?? RECOMMENDED_MAJOR),
    enforceVersionLock: config.enforceVersionLock ?? true,
    isReal: false,
  });
}

export const NODE_RUNTIME_POLICY_VERSION = '1.0.0';
