// Container Resource Policy — ADV-15

export const RESOURCE_PROFILE = Object.freeze({
  MINIMAL:  Object.freeze({ cpu: '0.25', memory: '256m', pids: 50,  storage: '1g' }),
  STANDARD: Object.freeze({ cpu: '0.5',  memory: '512m', pids: 100, storage: '5g' }),
  LARGE:    Object.freeze({ cpu: '1.0',  memory: '1g',   pids: 200, storage: '10g' }),
  CUSTOM:   null,
});

export function createContainerResourcePolicy(config = {}) {
  const profileName = config.profile ?? 'STANDARD';
  const preset = RESOURCE_PROFILE[profileName];

  if (!preset && profileName !== 'CUSTOM') {
    throw new Error(`createContainerResourcePolicy: unknown profile '${profileName}'`);
  }

  const limits = preset ?? {
    cpu:     config.cpu     ?? '0.5',
    memory:  config.memory  ?? '512m',
    pids:    config.pids    ?? 100,
    storage: config.storage ?? '5g',
  };

  return Object.freeze({
    profile: profileName,
    limits:  Object.freeze(limits),
    noUnlimitedResources: true,
    isReal:  false,
  });
}

export const CONTAINER_RESOURCE_POLICY_VERSION = '1.0.0';
