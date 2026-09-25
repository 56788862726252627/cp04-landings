// Container Reproducibility Evaluator — ADV-15

export const REPRODUCIBILITY_STATUS = Object.freeze({
  REPRODUCIBLE:     'REPRODUCIBLE',
  MOSTLY:           'MOSTLY',
  NON_REPRODUCIBLE: 'NON_REPRODUCIBLE',
});

export function evaluateContainerReproducibility(config = {}) {
  const {
    hasNodeVersionLock   = false,
    hasLockfile          = false,
    hasExplicitBuildArgs = false,
    hasImmutableTag      = false,
    hasBaseImagePin      = false,
    buildTimestamp       = null,
  } = config;

  const factors = [
    { name: 'nodeVersionLock',   pass: hasNodeVersionLock,   weight: 20 },
    { name: 'lockfile',          pass: hasLockfile,          weight: 25 },
    { name: 'explicitBuildArgs', pass: hasExplicitBuildArgs, weight: 15 },
    { name: 'immutableTag',      pass: hasImmutableTag,      weight: 20 },
    { name: 'baseImagePin',      pass: hasBaseImagePin,      weight: 20 },
  ];

  const score = factors.reduce((sum, f) => sum + (f.pass ? f.weight : 0), 0);
  const failed = factors.filter(f => !f.pass).map(f => f.name);

  const status = score >= 80
    ? REPRODUCIBILITY_STATUS.REPRODUCIBLE
    : score >= 50
      ? REPRODUCIBILITY_STATUS.MOSTLY
      : REPRODUCIBILITY_STATUS.NON_REPRODUCIBLE;

  return Object.freeze({
    status,
    score,
    factors:      Object.freeze(factors),
    failedFactors: Object.freeze(failed),
    buildTimestamp,
    isReal:       false,
  });
}

export const CONTAINER_REPRODUCIBILITY_EVALUATOR_VERSION = '1.0.0';
