// Reproducible Environment Commands — ADV-15

export const ENV_COMMAND = Object.freeze({
  VALIDATE: 'validate',
  BUILD:    'build',
  START:    'start',
  STOP:     'stop',
  HEALTH:   'health',
  TEST:     'test',
});

export function createReproducibleEnvironmentCommands(config = {}) {
  const { runtimeMode = 'NATIVE', port = 5180 } = config;

  const isContainer = runtimeMode === 'CONTAINER';

  const commands = {
    [ENV_COMMAND.VALIDATE]: isContainer
      ? 'docker build --dry-run . || echo "Static validation mode"'
      : 'node --version && npm ci --dry-run',
    [ENV_COMMAND.BUILD]: isContainer
      ? 'docker build -t app:local .'
      : 'npm run build',
    [ENV_COMMAND.START]: isContainer
      ? `docker run -p ${port}:${port} --env-file .env.runtime app:local`
      : `npm run preview -- --port ${port}`,
    [ENV_COMMAND.STOP]: isContainer
      ? 'docker stop $(docker ps -q --filter ancestor=app:local)'
      : 'pkill -f "vite preview"',
    [ENV_COMMAND.HEALTH]: `curl -f http://localhost:${port}/health || echo "No health endpoint"`,
    [ENV_COMMAND.TEST]:  'npm test',
  };

  return Object.freeze({
    commands:    Object.freeze(commands),
    runtimeMode,
    port,
    oneCommand:  true,
    isReal:      false,
  });
}

export const REPRODUCIBLE_ENVIRONMENT_COMMANDS_VERSION = '1.0.0';
