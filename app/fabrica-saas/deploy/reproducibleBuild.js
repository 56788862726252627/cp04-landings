// Reproducible Build Validation — PASO G

export const BUILD_REPRODUCIBILITY_STATUS = Object.freeze({
  REPRODUCIBLE:       'REPRODUCIBLE',
  LIKELY_REPRODUCIBLE:'LIKELY_REPRODUCIBLE',
  NON_DETERMINISTIC:  'NON_DETERMINISTIC',
  UNKNOWN:            'UNKNOWN',
});

const BUILD_CHECKS = [
  { id: 'RB-01', name: 'Lockfile present',                 critical: true,  description: 'package-lock.json or yarn.lock committed' },
  { id: 'RB-02', name: 'Package manager pinned',           critical: false, description: 'packageManager field in package.json' },
  { id: 'RB-03', name: 'Node version specified',           critical: true,  description: '.nvmrc or engines.node in package.json' },
  { id: 'RB-04', name: 'Build command documented',         critical: true,  description: 'Build command consistent across CI and local' },
  { id: 'RB-05', name: 'Output path consistent',           critical: true,  description: 'Output directory does not change between runs' },
  { id: 'RB-06', name: 'No environment assumptions in build', critical: false, description: 'Build does not depend on unset env vars' },
  { id: 'RB-07', name: 'Generated assets deterministic',   critical: false, description: 'No timestamp-stamped or random filenames' },
  { id: 'RB-08', name: 'No dynamically injected secrets',  critical: true,  description: 'Build output contains no secret values' },
];

/**
 * Validate reproducibility of a build configuration.
 * @param {object} checks — { 'RB-01': true|false }
 * @param {object} metadata — { buildCommand, outputDir, nodeVersion, packageManager }
 */
export function validateReproducibleBuild(checks = {}, metadata = {}) {
  const results = BUILD_CHECKS.map(check => {
    const passed = checks[check.id] === true;
    return { ...check, passed };
  });

  const criticalFailed = results.filter(r => r.critical && !r.passed);
  const totalPassed    = results.filter(r => r.passed).length;
  const score          = Math.round((totalPassed / BUILD_CHECKS.length) * 100);

  const status = criticalFailed.length > 0       ? BUILD_REPRODUCIBILITY_STATUS.NON_DETERMINISTIC
    : score >= 90                                 ? BUILD_REPRODUCIBILITY_STATUS.REPRODUCIBLE
    : score >= 70                                 ? BUILD_REPRODUCIBILITY_STATUS.LIKELY_REPRODUCIBLE
    : BUILD_REPRODUCIBILITY_STATUS.UNKNOWN;

  return {
    valid:          true,
    status,
    score,
    totalChecks:    BUILD_CHECKS.length,
    passed:         totalPassed,
    criticalFailed: criticalFailed.length,
    criticalFailedIds: criticalFailed.map(r => r.id),
    results,
    buildMetadata: {
      buildCommand:   metadata.buildCommand   ?? 'not specified',
      outputDir:      metadata.outputDir      ?? 'not specified',
      nodeVersion:    metadata.nodeVersion    ?? 'not specified',
      packageManager: metadata.packageManager ?? 'not specified',
    },
    disclaimer: 'Reproducibility status reflects configuration audit only. Not a hermetic build proof.',
  };
}

export const REPRODUCIBLE_BUILD_VERSION = '1.0.0';
