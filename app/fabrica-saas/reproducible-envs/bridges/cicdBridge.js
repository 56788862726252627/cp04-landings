// CI/CD Bridge — ADV-15 → ADV-02

export const CICD_PIPELINE_STEP = Object.freeze({
  SECRET_SCAN:           'secret-scan',
  INSTALL:               'install',
  TEST:                  'test',
  LINT:                  'lint',
  BUILD:                 'build',
  CONTAINER_VALIDATION:  'container-static-validation',
  IMAGE_BUILD:           'optional-image-build',
  QUALITY_GATE:          'quality-gate',
});

export function createCICDBridge(config = {}) {
  const { dockerAvailable = false } = config;

  const steps = [
    CICD_PIPELINE_STEP.SECRET_SCAN,
    CICD_PIPELINE_STEP.INSTALL,
    CICD_PIPELINE_STEP.TEST,
    CICD_PIPELINE_STEP.LINT,
    CICD_PIPELINE_STEP.BUILD,
    CICD_PIPELINE_STEP.CONTAINER_VALIDATION,
    ...(dockerAvailable ? [CICD_PIPELINE_STEP.IMAGE_BUILD] : []),
    CICD_PIPELINE_STEP.QUALITY_GATE,
  ];

  return Object.freeze({
    adv02Bridge:    'CICD_LAYER_CONNECTED',
    steps:          Object.freeze(steps),
    dockerAvailable,
    staticFallback: !dockerAvailable,
    noRealDeploy:   true,
    isReal:         false,
  });
}

export const CICD_BRIDGE_VERSION = '1.0.0';
