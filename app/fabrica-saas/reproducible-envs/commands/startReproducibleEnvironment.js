// Start Reproducible Environment — ADV-15
// One-command start with Docker/native fallback

import { createDockerCapabilityDetector, DOCKER_STATUS } from '../deploy/dockerCapabilityDetector.js';
import { createEnvironmentFallbackPolicy }               from '../deploy/environmentFallbackPolicy.js';
import { createReproducibleEnvironmentCommands }         from './reproducibleEnvironmentCommands.js';

export const START_RESULT = Object.freeze({
  CONTAINER: 'CONTAINER',
  FALLBACK:  'FALLBACK',
  ERROR:     'ERROR',
});

export function startReproducibleEnvironment(config = {}) {
  const { cliAvailable = false, daemonAvailable = false, hasLockfile = true, nodeVersionOk = true, port = 5180 } = config;

  const detector  = createDockerCapabilityDetector({ cliAvailable, daemonAvailable });
  const dockerOk  = detector.status === DOCKER_STATUS.AVAILABLE;
  const fallback  = createEnvironmentFallbackPolicy({ dockerAvailable: dockerOk, hasLockfile, nodeVersionOk });
  const runtimeMode = dockerOk ? 'CONTAINER' : 'NATIVE';
  const commands  = createReproducibleEnvironmentCommands({ runtimeMode, port });

  return Object.freeze({
    result:       dockerOk ? START_RESULT.CONTAINER : START_RESULT.FALLBACK,
    dockerStatus: detector.status,
    runtimeMode,
    fallback:     fallback.fallbackRequired ? fallback : null,
    startCommand: commands.commands.start,
    validateCmd:  commands.commands.validate,
    port,
    noRealStart:  true,
    isReal:       false,
  });
}

export const START_REPRODUCIBLE_ENVIRONMENT_VERSION = '1.0.0';
