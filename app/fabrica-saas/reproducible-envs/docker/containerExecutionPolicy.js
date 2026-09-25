// Container Execution Policy — ADV-15

export const EXECUTION_BLOCK_REASON = Object.freeze({
  PRIVILEGED:          'PRIVILEGED',
  HOST_NETWORK:        'HOST_NETWORK',
  DOCKER_SOCKET_MOUNT: 'DOCKER_SOCKET_MOUNT',
  SYSTEM_DIR_MOUNT:    'SYSTEM_DIR_MOUNT',
  ARBITRARY_HOST_PATH: 'ARBITRARY_HOST_PATH',
  UNAUTHORIZED_SECRET: 'UNAUTHORIZED_SECRET',
});

const BLOCKED_SYSTEM_DIRS = Object.freeze(['/proc', '/sys', '/dev', '/etc', '/boot']);

export function createContainerExecutionPolicy() {
  return Object.freeze({
    blockPrivileged:      true,
    blockHostNetwork:     true,
    blockDockerSocket:    true,
    blockSystemDirs:      true,
    blockArbitraryPaths:  true,
    blockUnauthorizedSecrets: true,
    isReal:               false,
  });
}

export function evaluateContainerExecution(spec = {}) {
  const blocks = [];

  if (spec.privileged === true) {
    blocks.push({ code: EXECUTION_BLOCK_REASON.PRIVILEGED, severity: 'CRITICAL' });
  }
  if (spec.networkMode === 'host') {
    blocks.push({ code: EXECUTION_BLOCK_REASON.HOST_NETWORK, severity: 'HIGH' });
  }
  if ((spec.volumes ?? []).some(v => String(v).includes('/var/run/docker.sock'))) {
    blocks.push({ code: EXECUTION_BLOCK_REASON.DOCKER_SOCKET_MOUNT, severity: 'CRITICAL' });
  }
  for (const dir of BLOCKED_SYSTEM_DIRS) {
    if ((spec.volumes ?? []).some(v => String(v).startsWith(dir))) {
      blocks.push({ code: EXECUTION_BLOCK_REASON.SYSTEM_DIR_MOUNT, severity: 'CRITICAL', dir });
    }
  }

  return Object.freeze({
    allowed:  blocks.length === 0,
    blocks:   Object.freeze(blocks),
    blocked:  blocks.length > 0,
    isReal:   false,
  });
}

export const CONTAINER_EXECUTION_POLICY_VERSION = '1.0.0';
