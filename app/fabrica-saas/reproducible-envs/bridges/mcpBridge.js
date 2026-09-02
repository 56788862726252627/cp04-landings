// MCP Bridge — ADV-15 → ADV-12

export const MCP_EXECUTION_ENV = Object.freeze({
  NATIVE:       'native',
  CONTAINERIZED: 'containerized',
  EXTERNAL:     'external',
});

export function createMCPEnvironmentBridge(config = {}) {
  const { executionEnv = MCP_EXECUTION_ENV.NATIVE } = config;

  if (!Object.values(MCP_EXECUTION_ENV).includes(executionEnv)) {
    throw new Error(`createMCPEnvironmentBridge: unknown executionEnv '${executionEnv}'`);
  }

  return Object.freeze({
    adv12Bridge:     'MCP_LAYER_CONNECTED',
    executionEnv,
    noArbitraryContainers: true,
    noDockerFromAgent:     true,
    safeExecution:         true,
    declaration: Object.freeze({
      environment: executionEnv,
      isolated:    executionEnv === MCP_EXECUTION_ENV.CONTAINERIZED,
    }),
    isReal: false,
  });
}

export const MCP_BRIDGE_VERSION = '1.0.0';
