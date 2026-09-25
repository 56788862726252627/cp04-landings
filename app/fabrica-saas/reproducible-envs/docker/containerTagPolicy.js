// Container Tag Policy — ADV-15
// Avoid latest-only deployments

export const TAG_STRATEGY = Object.freeze({
  GIT_SHA:          'GIT_SHA',
  VERSION:          'VERSION',
  ENVIRONMENT:      'ENVIRONMENT',
  VERSION_AND_SHA:  'VERSION_AND_SHA',
});

export const TAG_WARNING = Object.freeze({
  LATEST_ONLY: 'LATEST_ONLY',
  NO_SHA:      'NO_SHA',
  NO_VERSION:  'NO_VERSION',
});

export function createContainerTagPolicy(config = {}) {
  return Object.freeze({
    strategy:        config.strategy ?? TAG_STRATEGY.VERSION_AND_SHA,
    allowLatest:     false,
    requireImmutable: config.requireImmutable ?? true,
    environmentAlias: Object.freeze({
      STAGING:    'staging',
      PRODUCTION: 'stable',
      CI:         'ci',
    }),
    isReal: false,
  });
}

export function generateImageTag(config = {}) {
  const { app, version, gitSha, environment } = config;

  if (!app) throw new Error('generateImageTag requires app');

  const warnings = [];
  const tags = [];

  if (gitSha) tags.push(`${app}:${gitSha.slice(0, 8)}`);
  else warnings.push(TAG_WARNING.NO_SHA);

  if (version) tags.push(`${app}:${version}`);
  else warnings.push(TAG_WARNING.NO_VERSION);

  if (environment) tags.push(`${app}:${environment.toLowerCase()}`);

  if (tags.length === 0) {
    warnings.push(TAG_WARNING.LATEST_ONLY);
    tags.push(`${app}:latest`);
  }

  return Object.freeze({
    tags:            Object.freeze(tags),
    primaryTag:      tags[0],
    warnings:        Object.freeze(warnings),
    latestOnly:      tags.every(t => t.endsWith(':latest')),
    immutable:       gitSha !== undefined,
    isReal:          false,
  });
}

export const CONTAINER_TAG_POLICY_VERSION = '1.0.0';
