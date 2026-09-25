// Docker Capability Detector — ADV-15
// Never installs Docker; only probes what's present

export const DOCKER_STATUS = Object.freeze({
  AVAILABLE:        'AVAILABLE',
  CLI_ONLY:         'CLI_ONLY',
  DAEMON_UNAVAILABLE: 'DAEMON_UNAVAILABLE',
  UNSUPPORTED:      'UNSUPPORTED',
  UNKNOWN:          'UNKNOWN',
});

export const VALIDATION_MODE = Object.freeze({
  FULL_DOCKER:      'FULL_DOCKER',
  STATIC_VALIDATION: 'STATIC_VALIDATION',
  FIXTURE_SIMULATION: 'FIXTURE_SIMULATION',
});

export function createDockerCapabilityDetector(config = {}) {
  const { cliAvailable = false, daemonAvailable = false, platform = 'linux' } = config;

  let status;
  if (cliAvailable && daemonAvailable) {
    status = DOCKER_STATUS.AVAILABLE;
  } else if (cliAvailable && !daemonAvailable) {
    status = DOCKER_STATUS.CLI_ONLY;
  } else if (!cliAvailable && platform === 'android') {
    status = DOCKER_STATUS.UNSUPPORTED;
  } else if (!cliAvailable) {
    status = DOCKER_STATUS.DAEMON_UNAVAILABLE;
  } else {
    status = DOCKER_STATUS.UNKNOWN;
  }

  const validationMode = status === DOCKER_STATUS.AVAILABLE
    ? VALIDATION_MODE.FULL_DOCKER
    : VALIDATION_MODE.STATIC_VALIDATION;

  return Object.freeze({
    status,
    cliAvailable,
    daemonAvailable,
    platform,
    validationMode,
    runtimeAvailable: status === DOCKER_STATUS.AVAILABLE,
    staticFallbackOk: status !== DOCKER_STATUS.AVAILABLE,
    isReal:           false,
  });
}

export const DOCKER_CAPABILITY_DETECTOR_VERSION = '1.0.0';
