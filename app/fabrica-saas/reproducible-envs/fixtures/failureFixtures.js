// Failure Fixtures — ADV-15
// 13 failure scenarios for detection testing

export const FAILURE_SECRET_COPIED = Object.freeze({
  id:       'failure-secret-copied',
  scenario: 'COPY .env included in Dockerfile — real secret in image',
  trigger:  'SECRET_IN_IMAGE',
  severity: 'CRITICAL',
  isReal:   false,
});

export const FAILURE_LATEST_ONLY = Object.freeze({
  id:       'failure-latest-only',
  scenario: 'Image tagged only as :latest — non-deterministic deployment',
  trigger:  'LATEST_ONLY',
  severity: 'HIGH',
  isReal:   false,
});

export const FAILURE_PRIVILEGED = Object.freeze({
  id:       'failure-privileged',
  scenario: 'Container running in privileged mode',
  trigger:  'PRIVILEGED_MODE',
  severity: 'CRITICAL',
  isReal:   false,
});

export const FAILURE_DOCKER_SOCKET = Object.freeze({
  id:       'failure-docker-socket',
  scenario: '/var/run/docker.sock mounted — full host Docker access',
  trigger:  'DOCKER_SOCKET_MOUNT',
  severity: 'CRITICAL',
  isReal:   false,
});

export const FAILURE_HOST_ROOT_MOUNT = Object.freeze({
  id:       'failure-host-root-mount',
  scenario: 'Host root / mounted inside container',
  trigger:  'HOST_ROOT_MOUNT',
  severity: 'CRITICAL',
  isReal:   false,
});

export const FAILURE_WRONG_PORT = Object.freeze({
  id:       'failure-wrong-port',
  scenario: 'Reserved port 5175 used in container',
  trigger:  'RESERVED_PORT',
  severity: 'HIGH',
  isReal:   false,
});

export const FAILURE_MISSING_LOCKFILE = Object.freeze({
  id:       'failure-missing-lockfile',
  scenario: 'No lockfile — non-deterministic install',
  trigger:  'MISSING_LOCKFILE',
  severity: 'HIGH',
  isReal:   false,
});

export const FAILURE_WRONG_NODE_RUNTIME = Object.freeze({
  id:       'failure-wrong-node-runtime',
  scenario: 'Node 14 used — EOL and incompatible',
  trigger:  'WRONG_NODE_VERSION',
  severity: 'HIGH',
  isReal:   false,
});

export const FAILURE_MISSING_HEALTH = Object.freeze({
  id:       'failure-missing-health',
  scenario: 'No HEALTHCHECK defined in Dockerfile',
  trigger:  'MISSING_HEALTH',
  severity: 'MEDIUM',
  isReal:   false,
});

export const FAILURE_BUILD_CONTEXT_LEAK = Object.freeze({
  id:       'failure-build-context-leak',
  scenario: '.env file in build context without .dockerignore exclusion',
  trigger:  'SECRET_FILE_IN_CONTEXT',
  severity: 'CRITICAL',
  isReal:   false,
});

export const FAILURE_STALE_DEPS = Object.freeze({
  id:       'failure-stale-deps',
  scenario: 'Lockfile outdated — dependency drift detected',
  trigger:  'DEPENDENCY_DRIFT',
  severity: 'MEDIUM',
  isReal:   false,
});

export const FAILURE_CONTAINER_ON_SERVERLESS = Object.freeze({
  id:       'failure-container-on-serverless',
  scenario: 'Docker forced on Cloudflare Pages — wrong runtime for target',
  trigger:  'WRONG_DEPLOYMENT_RUNTIME',
  severity: 'HIGH',
  isReal:   false,
});

export const FAILURE_HOST_NETWORK = Object.freeze({
  id:       'failure-host-network',
  scenario: 'Container using host network mode — breaks isolation',
  trigger:  'HOST_NETWORK',
  severity: 'HIGH',
  isReal:   false,
});

export const ALL_FAILURE_FIXTURES = Object.freeze([
  FAILURE_SECRET_COPIED,
  FAILURE_LATEST_ONLY,
  FAILURE_PRIVILEGED,
  FAILURE_DOCKER_SOCKET,
  FAILURE_HOST_ROOT_MOUNT,
  FAILURE_WRONG_PORT,
  FAILURE_MISSING_LOCKFILE,
  FAILURE_WRONG_NODE_RUNTIME,
  FAILURE_MISSING_HEALTH,
  FAILURE_BUILD_CONTEXT_LEAK,
  FAILURE_STALE_DEPS,
  FAILURE_CONTAINER_ON_SERVERLESS,
  FAILURE_HOST_NETWORK,
]);
