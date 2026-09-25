// Container Network Policy — ADV-15

export const NETWORK_MODE = Object.freeze({
  BRIDGE:  'bridge',
  HOST:    'host',
  NONE:    'none',
  CUSTOM:  'custom',
});

export function createContainerNetworkPolicy(config = {}) {
  const mode = config.networkMode ?? NETWORK_MODE.BRIDGE;

  if (mode === NETWORK_MODE.HOST) {
    throw new Error('ContainerNetworkPolicy: host network mode is not allowed — use bridge or custom');
  }

  return Object.freeze({
    mode,
    allowExternalAccess: config.allowExternalAccess ?? false,
    internalOnly:        config.internalOnly        ?? true,
    dnsPolicy:           config.dnsPolicy           ?? 'internal',
    minimalAccess:       true,
    noOpenExternal:      !config.allowExternalAccess,
    isReal:              false,
  });
}

export function evaluateNetworkSafety(spec = {}) {
  const violations = [];

  if (spec.networkMode === NETWORK_MODE.HOST) {
    violations.push({ code: 'HOST_NETWORK', severity: 'HIGH' });
  }
  if (spec.openPorts?.some(p => p === 22 || p === 2375 || p === 2376)) {
    violations.push({ code: 'DANGEROUS_PORT_EXPOSED', severity: 'CRITICAL' });
  }

  return Object.freeze({
    safe:       violations.length === 0,
    violations: Object.freeze(violations),
    isReal:     false,
  });
}

export const CONTAINER_NETWORK_POLICY_VERSION = '1.0.0';
