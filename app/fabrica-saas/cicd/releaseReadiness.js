// Release Readiness — ADV-02 CI/CD Automatizado
// REUSE: patrón de deploy/releaseGates.js — adaptado para CI pipeline.
// evaluateReleaseReadiness(): determina si un commit es apto para release.

export const RELEASE_STATUS = Object.freeze({
  READY:        'READY',
  BLOCKED:      'BLOCKED',
  HUMAN_REVIEW: 'HUMAN_REVIEW',
});

export const READINESS_CHECK = Object.freeze({
  TESTS:                  'TESTS',
  LINT:                   'LINT',
  BUILD:                  'BUILD',
  SECURITY:               'SECURITY',
  SECRETS:                'SECRETS',
  DEPENDENCIES:           'DEPENDENCIES',
  VERSION:                'VERSION',
  COMMIT_SHA:             'COMMIT_SHA',
  BRANCH:                 'BRANCH',
  ARTIFACTS:              'ARTIFACTS',
  ROLLBACK_AVAILABLE:     'ROLLBACK_AVAILABLE',
  OBSERVABILITY:          'OBSERVABILITY',
  HEALTH_CHECKS:          'HEALTH_CHECKS',
  HUMAN_APPROVAL:         'HUMAN_APPROVAL',
});

function check(id, pass, detail = {}) {
  return Object.freeze({ checkId: id, pass, ...detail });
}

/**
 * Evaluate release readiness from a complete CI context.
 * context: {
 *   testsPassed, lintPassed, buildPassed, securityPassed,
 *   secretsClean, dependenciesOk,
 *   version, commitSha, branch,
 *   artifactValid, rollbackAvailable,
 *   observabilityAvailable, healthChecksAvailable,
 *   humanApprovalRequired
 * }
 */
export function evaluateReleaseReadiness(context = {}) {
  const {
    testsPassed             = false,
    lintPassed              = false,
    buildPassed             = false,
    securityPassed          = false,
    secretsClean            = false,
    dependenciesOk          = true,
    version                 = null,
    commitSha               = null,
    branch                  = null,
    artifactValid           = false,
    rollbackAvailable       = false,
    observabilityAvailable  = false,
    healthChecksAvailable   = false,
    humanApprovalRequired   = true,
  } = context;

  const checks = [
    check(READINESS_CHECK.TESTS,               testsPassed,            { message: testsPassed ? 'Tests passed' : 'Tests failed or not run' }),
    check(READINESS_CHECK.LINT,                lintPassed,             { message: lintPassed ? 'Lint clean' : 'Lint errors present' }),
    check(READINESS_CHECK.BUILD,               buildPassed,            { message: buildPassed ? 'Build succeeded' : 'Build failed or not run' }),
    check(READINESS_CHECK.SECURITY,            securityPassed,         { message: securityPassed ? 'Security checks passed' : 'Security issues detected' }),
    check(READINESS_CHECK.SECRETS,             secretsClean,           { message: secretsClean ? 'No secrets detected' : 'Secrets detected in code' }),
    check(READINESS_CHECK.DEPENDENCIES,        dependenciesOk,         { message: dependenciesOk ? 'Dependencies OK' : 'Critical CVEs detected' }),
    check(READINESS_CHECK.VERSION,             version !== null,       { version, message: version ? `Version: ${version}` : 'No version defined' }),
    check(READINESS_CHECK.COMMIT_SHA,          commitSha !== null,     { commitSha, message: commitSha ? `SHA: ${String(commitSha).slice(0, 7)}` : 'No commit SHA' }),
    check(READINESS_CHECK.BRANCH,              branch !== null,        { branch, message: branch ? `Branch: ${branch}` : 'No branch context' }),
    check(READINESS_CHECK.ARTIFACTS,           artifactValid,          { message: artifactValid ? 'Artifacts valid' : 'Artifact validation failed' }),
    check(READINESS_CHECK.ROLLBACK_AVAILABLE,  rollbackAvailable,      { message: rollbackAvailable ? 'Rollback plan available' : 'No rollback plan' }),
    check(READINESS_CHECK.OBSERVABILITY,       observabilityAvailable, { message: observabilityAvailable ? 'Observability active' : 'Observability not configured' }),
    check(READINESS_CHECK.HEALTH_CHECKS,       healthChecksAvailable,  { message: healthChecksAvailable ? 'Health checks available' : 'No health checks' }),
    check(READINESS_CHECK.HUMAN_APPROVAL,      !humanApprovalRequired, { message: humanApprovalRequired ? 'Human approval required before deploy' : 'No approval gate' }),
  ];

  const P0_CHECKS = new Set([
    READINESS_CHECK.TESTS,
    READINESS_CHECK.LINT,
    READINESS_CHECK.BUILD,
    READINESS_CHECK.SECURITY,
    READINESS_CHECK.SECRETS,
    READINESS_CHECK.ARTIFACTS,
  ]);

  const blockers = checks.filter(c => P0_CHECKS.has(c.checkId) && !c.pass);
  const warnings = checks.filter(c => !P0_CHECKS.has(c.checkId) && !c.pass);

  const status = blockers.length > 0         ? RELEASE_STATUS.BLOCKED
    : humanApprovalRequired                   ? RELEASE_STATUS.HUMAN_REVIEW
    : RELEASE_STATUS.READY;

  return {
    valid:          true,
    status,
    ready:          status === RELEASE_STATUS.READY,
    checks,
    blockers:       blockers.map(c => c.checkId),
    warnings:       warnings.map(c => c.checkId),
    passCount:      checks.filter(c => c.pass).length,
    totalChecks:    checks.length,
    message:        status === RELEASE_STATUS.READY    ? 'Release ready'
      : status === RELEASE_STATUS.HUMAN_REVIEW        ? 'Human review required before release'
      : `Release blocked: ${blockers.map(c => c.checkId).join(', ')}`,
    disclaimer:     'NO_AUTO_RELEASE. Human gate required for all production releases.',
  };
}

export const RELEASE_READINESS_VERSION = '1.0.0';
