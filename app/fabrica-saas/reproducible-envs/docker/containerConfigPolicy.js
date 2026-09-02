// Container Config vs Secrets Policy — ADV-15

export const CONFIG_CLASS = Object.freeze({
  PUBLIC:  'PUBLIC',
  RUNTIME: 'RUNTIME',
  SECRET:  'SECRET',
});

const SECRET_PATTERNS = /secret|password|passwd|token|key|api_key|private|credentials|auth/i;
const PUBLIC_PATTERNS  = /port|host|mode|env|node_env|app_name|version|log_level|public|debug/i;

export function classifyEnvVar(name = '') {
  if (SECRET_PATTERNS.test(name)) return CONFIG_CLASS.SECRET;
  if (PUBLIC_PATTERNS.test(name))  return CONFIG_CLASS.PUBLIC;
  return CONFIG_CLASS.RUNTIME;
}

export function createContainerConfigPolicy(envVars = []) {
  const classified = envVars.map(name => ({
    name,
    class: classifyEnvVar(name),
  }));

  const secrets = classified.filter(c => c.class === CONFIG_CLASS.SECRET);
  const public_ = classified.filter(c => c.class === CONFIG_CLASS.PUBLIC);
  const runtime = classified.filter(c => c.class === CONFIG_CLASS.RUNTIME);

  return Object.freeze({
    classified:    Object.freeze(classified),
    secretVars:    Object.freeze(secrets.map(s => s.name)),
    publicVars:    Object.freeze(public_.map(p => p.name)),
    runtimeVars:   Object.freeze(runtime.map(r => r.name)),
    policy: Object.freeze({
      noHardcodedSecrets:  true,
      noCopyEnvFile:       true,
      secretsFromRuntime:  true,
      useEnvExample:       true,
    }),
    isReal: false,
  });
}

export function validateNoSecretsHardcoded(envMap = {}) {
  const leaked = Object.keys(envMap).filter(k =>
    SECRET_PATTERNS.test(k) && envMap[k] && !/\$\{|placeholder|example|your_|<.*>/i.test(String(envMap[k])),
  );
  return Object.freeze({
    safe:   leaked.length === 0,
    leaked: Object.freeze(leaked),
    isReal: false,
  });
}

export const CONTAINER_CONFIG_POLICY_VERSION = '1.0.0';
