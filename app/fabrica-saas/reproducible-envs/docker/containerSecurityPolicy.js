// Container Security Policy — ADV-15

export const SECURITY_VIOLATION = Object.freeze({
  PRIVILEGED_MODE:       'PRIVILEGED_MODE',
  ROOT_USER:             'ROOT_USER',
  DOCKER_SOCKET_MOUNT:   'DOCKER_SOCKET_MOUNT',
  HOST_ROOT_MOUNT:       'HOST_ROOT_MOUNT',
  SECRET_IN_IMAGE:       'SECRET_IN_IMAGE',
  ARBITRARY_HOST_PATH:   'ARBITRARY_HOST_PATH',
  HOST_NETWORK:          'HOST_NETWORK',
  MISSING_HEALTH:        'MISSING_HEALTH',
});

export function createContainerSecurityPolicy(config = {}) {
  return Object.freeze({
    nonRootUser:          config.nonRootUser          ?? true,
    readOnlyCompatible:   config.readOnlyCompatible   ?? false,
    minimalRuntime:       config.minimalRuntime        ?? true,
    noSecretsInImage:     true,
    noPrivilegedMode:     true,
    noDockerSocket:       true,
    noHostNetwork:        config.noHostNetwork         ?? true,
    explicitPort:         config.explicitPort          ?? true,
    gracefulShutdown:     config.gracefulShutdown      ?? true,
    depProvenance:        config.depProvenance         ?? false,
    isReal: false,
  });
}

export function evaluateContainerSecurity(containerSpec = {}) {
  const violations = [];

  if (containerSpec.privileged === true) {
    violations.push({ code: SECURITY_VIOLATION.PRIVILEGED_MODE, severity: 'CRITICAL' });
  }
  if (containerSpec.user === 'root' || containerSpec.user === '0') {
    violations.push({ code: SECURITY_VIOLATION.ROOT_USER, severity: 'HIGH' });
  }
  if ((containerSpec.volumes ?? []).some(v => v.includes('/var/run/docker.sock'))) {
    violations.push({ code: SECURITY_VIOLATION.DOCKER_SOCKET_MOUNT, severity: 'CRITICAL' });
  }
  if ((containerSpec.volumes ?? []).some(v => v.startsWith('/:/') || v === '/:/host')) {
    violations.push({ code: SECURITY_VIOLATION.HOST_ROOT_MOUNT, severity: 'CRITICAL' });
  }
  if (containerSpec.networkMode === 'host') {
    violations.push({ code: SECURITY_VIOLATION.HOST_NETWORK, severity: 'HIGH' });
  }
  if ((containerSpec.envVars ?? []).some(e => /secret|password|token|key/i.test(e) && !/ref|placeholder|example/i.test(e))) {
    violations.push({ code: SECURITY_VIOLATION.SECRET_IN_IMAGE, severity: 'CRITICAL' });
  }
  if (!containerSpec.healthCheck) {
    violations.push({ code: SECURITY_VIOLATION.MISSING_HEALTH, severity: 'MEDIUM' });
  }

  const criticals = violations.filter(v => v.severity === 'CRITICAL');

  return Object.freeze({
    safe:       violations.length === 0,
    blocked:    criticals.length > 0,
    violations: Object.freeze(violations),
    criticals:  Object.freeze(criticals),
    isReal:     false,
  });
}

export const CONTAINER_SECURITY_POLICY_VERSION = '1.0.0';
