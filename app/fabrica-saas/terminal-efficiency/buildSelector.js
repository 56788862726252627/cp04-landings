// Build Selector — ADV-05
// Decides whether a full build is required or can be skipped.

export const BUILD_DECISION = Object.freeze({
  REQUIRED:     'REQUIRED',
  NOT_REQUIRED: 'NOT_REQUIRED',
});

const ALWAYS_BUILD = [
  /\.(jsx|tsx?|css|html)$/,
  /vite\.config/,
  /package\.json$/,
  /src\//,
  /deploy|worker/,
];

const NEVER_BUILD = [
  /\.md$/,
  /\.test\.mjs$/,
  /fixtures?\//,
  /docs\//,
  /\.gitignore$/,
];

export function isBuildRequired(changedFiles = []) {
  if (!Array.isArray(changedFiles)) return { valid: false, error: 'changedFiles must be array' };
  if (changedFiles.length === 0) return { valid: true, decision: BUILD_DECISION.NOT_REQUIRED, reason: 'no changes', isReal: false };

  const alwaysBuild = changedFiles.filter(f => ALWAYS_BUILD.some(p => p.test(f)));
  const allNoBuild  = changedFiles.every(f => NEVER_BUILD.some(p => p.test(f)));

  if (alwaysBuild.length > 0) {
    return { valid: true, decision: BUILD_DECISION.REQUIRED, triggerFiles: alwaysBuild, isReal: false };
  }
  if (allNoBuild) {
    return { valid: true, decision: BUILD_DECISION.NOT_REQUIRED, reason: 'docs/tests only', isReal: false };
  }

  // .js modules in factory scope — no build needed (not bundled)
  const jsOnly = changedFiles.every(f => /\.(m?js)$/.test(f));
  if (jsOnly) {
    return { valid: true, decision: BUILD_DECISION.NOT_REQUIRED, reason: 'pure JS modules — not bundled', isReal: false };
  }

  return { valid: true, decision: BUILD_DECISION.REQUIRED, reason: 'mixed/unknown file types', isReal: false };
}

export const BUILD_SELECTOR_VERSION = '1.0.0';
