// Docker Good Fixtures — ADV-15

export const FIXTURE_VALID_DOCKERFILE = Object.freeze({
  id:          'fixture-valid-dockerfile',
  nodeVersion: '22',
  multiStage:  true,
  nonRoot:     true,
  hasHealthCheck: true,
  port:        5180,
  noSecrets:   true,
  lockedDeps:  true,
  isReal:      false,
});

export const FIXTURE_VALID_DOCKERIGNORE = Object.freeze({
  id:          'fixture-valid-dockerignore',
  excludes:    Object.freeze(['.env', '.secrets', 'node_modules', '.git', '*.key', '*.pem']),
  noSecretsInContext: true,
  isReal:      false,
});

export const FIXTURE_VALID_SECURITY = Object.freeze({
  id:          'fixture-valid-security',
  nonRootUser: true,
  noPrivileged: true,
  noDockerSocket: true,
  noHostNetwork: true,
  hasHealthCheck: true,
  isReal:      false,
});

export const FIXTURE_VALID_TAGS = Object.freeze({
  id:          'fixture-valid-tags',
  app:         'factory-app',
  version:     '1.0.0',
  gitSha:      'abc12345',
  environment: 'staging',
  immutable:   true,
  isReal:      false,
});

export const FIXTURE_VALID_NO_SECRETS = Object.freeze({
  id:          'fixture-valid-no-secrets',
  envVars:     Object.freeze({ NODE_ENV: 'production', PORT: '5180' }),
  secretRefs:  Object.freeze(['SUPABASE_URL', 'AIRTABLE_KEY']),
  noCopyEnv:   true,
  isReal:      false,
});

export const FIXTURE_VALID_HEALTH = Object.freeze({
  id:          'fixture-valid-health',
  endpoint:    '/health',
  intervalMs:  30000,
  timeoutMs:   10000,
  retries:     3,
  isReal:      false,
});

export const FIXTURE_SERVERLESS_BYPASS = Object.freeze({
  id:             'fixture-serverless-bypass',
  deployTarget:   'CLOUDFLARE',
  dockerUsed:     false,
  reason:         'Cloudflare Pages is serverless — Docker not applicable',
  serverlessBypass: true,
  isReal:         false,
});

export const FIXTURE_SAFE_BUILD_CONTEXT = Object.freeze({
  id:      'fixture-safe-build-context',
  files:   Object.freeze(['src/index.js', 'package.json', 'package-lock.json', 'public/']),
  hasDockerignore: true,
  noSecrets: true,
  isReal:  false,
});

export const ALL_DOCKER_FIXTURES = Object.freeze([
  FIXTURE_VALID_DOCKERFILE,
  FIXTURE_VALID_DOCKERIGNORE,
  FIXTURE_VALID_SECURITY,
  FIXTURE_VALID_TAGS,
  FIXTURE_VALID_NO_SECRETS,
  FIXTURE_VALID_HEALTH,
  FIXTURE_SERVERLESS_BYPASS,
  FIXTURE_SAFE_BUILD_CONTEXT,
]);
