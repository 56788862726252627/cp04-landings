// Container Volume Policy — ADV-15

export const VOLUME_TYPE = Object.freeze({
  SOURCE_DEV_MOUNT:  'SOURCE_DEV_MOUNT',
  PERSISTENT_DATA:   'PERSISTENT_DATA',
  TEMP_CACHE:        'TEMP_CACHE',
});

export const VOLUME_SAFETY = Object.freeze({
  SAFE:    'SAFE',
  RISKY:   'RISKY',
  BLOCKED: 'BLOCKED',
});

const BLOCKED_PATHS = Object.freeze([
  '/var/run/docker.sock',
  '/etc',
  '/root',
  '/proc',
  '/sys',
  '/dev',
]);

const BLOCKED_HOST_PATHS = Object.freeze(['/', '/:/host', '/:/root']);

export function createContainerVolumePolicy(volumes = []) {
  const evaluated = volumes.map(v => {
    const hostPath = typeof v === 'string' ? v.split(':')[0] : v.hostPath;
    const blocked = BLOCKED_PATHS.some(b => hostPath === b || hostPath?.startsWith(b + '/'))
      || BLOCKED_HOST_PATHS.some(b => hostPath === b || hostPath === '/');
    const hasSecret = /secret|\.env$|\.key$|\.pem$|credentials/i.test(hostPath ?? '');

    let safety = VOLUME_SAFETY.SAFE;
    if (blocked || hasSecret) safety = VOLUME_SAFETY.BLOCKED;

    return Object.freeze({ volume: v, hostPath, safety, blocked, hasSecret });
  });

  const unsafe = evaluated.filter(e => e.safety !== VOLUME_SAFETY.SAFE);

  return Object.freeze({
    volumes:         Object.freeze(evaluated),
    unsafeVolumes:   Object.freeze(unsafe),
    blocked:         unsafe.some(u => u.safety === VOLUME_SAFETY.BLOCKED),
    noInsecureMount: true,
    isReal:          false,
  });
}

export const CONTAINER_VOLUME_POLICY_VERSION = '1.0.0';
