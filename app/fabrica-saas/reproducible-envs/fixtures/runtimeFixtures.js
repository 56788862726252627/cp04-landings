// Runtime Fixtures — ADV-15

export const FIXTURE_STATIC_SAAS = Object.freeze({
  id:           'fixture-static-saas',
  name:         'StaticSaaS Example',
  deployTarget: 'CLOUDFLARE',
  runtimeMode:  'SERVERLESS',
  buildCommand: 'npm run build',
  distDir:      'dist',
  nodeVersion:  '22',
  dockerValue:  'NONE',
  serverlessBypass: true,
  noRealDeploy: true,
  isReal:       false,
});

export const FIXTURE_NODE_SAAS = Object.freeze({
  id:           'fixture-node-saas',
  name:         'NodeSaaS Example',
  deployTarget: 'VPS',
  runtimeMode:  'NATIVE',
  buildCommand: 'npm run build',
  startCommand: 'node server.js',
  port:         5180,
  nodeVersion:  '22',
  dockerValue:  'HIGH',
  hasLockfile:  true,
  noRealDeploy: true,
  isReal:       false,
});

export const FIXTURE_SERVERLESS_SAAS = Object.freeze({
  id:           'fixture-serverless-saas',
  name:         'ServerlessSaaS Example',
  deployTarget: 'STATIC_HOST',
  runtimeMode:  'SERVERLESS',
  buildCommand: 'npm run build',
  distDir:      'dist',
  nodeVersion:  '22',
  dockerValue:  'NONE',
  serverlessBypass: true,
  noRealDeploy: true,
  isReal:       false,
});

export const FIXTURE_CONTAINER_SAAS = Object.freeze({
  id:           'fixture-container-saas',
  name:         'ContainerSaaS Example',
  deployTarget: 'CONTAINER_PLATFORM',
  runtimeMode:  'CONTAINER',
  buildCommand: 'npm run build',
  startCommand: 'node server.js',
  port:         5180,
  nodeVersion:  '22',
  dockerValue:  'REQUIRED',
  hasLockfile:  true,
  nonRootUser:  true,
  hasHealthCheck: true,
  noRealDeploy: true,
  isReal:       false,
});

export const ALL_RUNTIME_FIXTURES = Object.freeze([
  FIXTURE_STATIC_SAAS,
  FIXTURE_NODE_SAAS,
  FIXTURE_SERVERLESS_SAAS,
  FIXTURE_CONTAINER_SAAS,
]);
