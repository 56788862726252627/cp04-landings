// Container Port Policy — ADV-15
// Default: 5180, never 5175

export const RESERVED_PORTS = Object.freeze([5175]);
export const DEFAULT_CONTAINER_PORT = 5180;

const WELL_KNOWN = Object.freeze({ 80: 'http', 443: 'https', 3000: 'node-dev', 8080: 'http-alt' });

export function createContainerPortPolicy(config = {}) {
  const port = config.port ?? DEFAULT_CONTAINER_PORT;

  if (RESERVED_PORTS.includes(port)) {
    throw new Error(`ContainerPortPolicy: port ${port} is reserved and must not be used in containers`);
  }

  return Object.freeze({
    containerPort: port,
    hostPort:      config.hostPort ?? port,
    protocol:      config.protocol ?? 'tcp',
    wellKnown:     WELL_KNOWN[port] ?? null,
    reserved:      RESERVED_PORTS,
    isReal:        false,
  });
}

export function validatePort(port) {
  if (RESERVED_PORTS.includes(port)) {
    return Object.freeze({ valid: false, reason: `Port ${port} is reserved`, isReal: false });
  }
  if (port < 1 || port > 65535) {
    return Object.freeze({ valid: false, reason: `Port ${port} is out of valid range`, isReal: false });
  }
  return Object.freeze({ valid: true, reason: null, isReal: false });
}

export const CONTAINER_PORT_POLICY_VERSION = '1.0.0';
