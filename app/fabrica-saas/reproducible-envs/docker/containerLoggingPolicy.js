// Container Logging Policy — ADV-15

export const LOG_DRIVER = Object.freeze({
  JSON_FILE: 'json-file',
  STDOUT:    'stdout',
  JOURNALD:  'journald',
  NONE:      'none',
});

export function createContainerLoggingPolicy(config = {}) {
  return Object.freeze({
    driver:          config.driver       ?? LOG_DRIVER.JSON_FILE,
    maxFileSizeMb:   config.maxSizeMb    ?? 10,
    maxFiles:        config.maxFiles     ?? 3,
    noSecretLogging: true,
    stdoutCompatible: true,
    structuredOutput: config.structured ?? true,
    isReal:          false,
  });
}

export function validateLogOutput(lines = []) {
  const secretPatterns = /password=|token=|api_key=|secret=/i;
  const leaked = lines.filter(l => secretPatterns.test(l));

  return Object.freeze({
    safe:   leaked.length === 0,
    leaked: Object.freeze(leaked),
    isReal: false,
  });
}

export const CONTAINER_LOGGING_POLICY_VERSION = '1.0.0';
