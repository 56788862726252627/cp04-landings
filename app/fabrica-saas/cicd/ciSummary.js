// CI Summary — ADV-02 CI/CD Automatizado
// generateCISummary(): salida estructurada del estado completo del pipeline.

import { PIPELINE_STATUS } from './pipelineModel.js';

export const SUMMARY_SECTION = Object.freeze({
  TESTS:            'tests',
  LINT:             'lint',
  BUILD:            'build',
  SECURITY:         'security',
  DEPENDENCIES:     'dependencies',
  ARTIFACT:         'artifact',
  RELEASE_READINESS: 'releaseReadiness',
});

/**
 * Generate a complete CI pipeline summary.
 * context: {
 *   pipelineStatus, testResult, lintResult, buildResult,
 *   secretResult, securityResult, dependencyResult,
 *   artifactResult, releaseReadiness,
 *   durationMs, commitSha, branch, pipelineId,
 *   jobResults, warnings
 * }
 */
export function generateCISummary(context = {}) {
  const {
    pipelineStatus   = PIPELINE_STATUS.PENDING,
    testResult       = null,
    lintResult       = null,
    buildResult      = null,
    secretResult     = null,
    securityResult   = null,
    dependencyResult = null,
    artifactResult   = null,
    releaseReadiness = null,
    durationMs       = null,
    commitSha        = null,
    branch           = null,
    pipelineId       = null,
    jobResults       = [],
    warnings         = [],
  } = context;

  const sections = {};

  sections[SUMMARY_SECTION.TESTS] = testResult ? {
    status:  (testResult.failed ?? 0) === 0 ? 'PASS' : 'FAIL',
    passed:  testResult.passed ?? 0,
    failed:  testResult.failed ?? 0,
    total:   testResult.total  ?? 0,
  } : { status: 'NOT_RUN' };

  sections[SUMMARY_SECTION.LINT] = lintResult ? {
    status:     (lintResult.errorCount ?? 0) === 0 ? 'PASS' : 'FAIL',
    errorCount: lintResult.errorCount ?? 0,
  } : { status: 'NOT_RUN' };

  sections[SUMMARY_SECTION.BUILD] = buildResult ? {
    status:    buildResult.success ? 'PASS' : 'FAIL',
    durationMs: buildResult.durationMs ?? null,
  } : { status: 'NOT_RUN' };

  sections[SUMMARY_SECTION.SECURITY] = {
    secrets: secretResult ? {
      status: secretResult.critical ? 'FAIL' : 'PASS',
      found:  secretResult.secretsFound ?? 0,
    } : { status: 'NOT_RUN' },
    security: securityResult ? {
      status: securityResult.hasCritical ? 'FAIL' : securityResult.hasHigh ? 'WARN' : 'PASS',
    } : { status: 'NOT_RUN' },
  };

  sections[SUMMARY_SECTION.DEPENDENCIES] = dependencyResult ? {
    status:      dependencyResult.status ?? 'UNKNOWN',
    criticalCVEs: dependencyResult.criticalCVEs ?? 0,
    highCVEs:    dependencyResult.highCVEs ?? 0,
  } : { status: 'NOT_RUN' };

  sections[SUMMARY_SECTION.ARTIFACT] = artifactResult ? {
    status:  artifactResult.valid ? 'PASS' : 'FAIL',
    errors:  artifactResult.errors ?? [],
  } : { status: 'NOT_RUN' };

  sections[SUMMARY_SECTION.RELEASE_READINESS] = releaseReadiness ? {
    status:   releaseReadiness.status ?? 'UNKNOWN',
    ready:    releaseReadiness.ready  ?? false,
    blockers: releaseReadiness.blockers ?? [],
  } : { status: 'NOT_RUN' };

  const blockers = jobResults.filter(j => j.blocking && j.status === 'FAILED').map(j => j.name ?? j.jobId);
  const allWarnings = [...warnings];

  return Object.freeze({
    valid:          true,
    pipelineId,
    pipelineStatus,
    passed:         pipelineStatus === PIPELINE_STATUS.PASSED,
    commitSha:      commitSha ? String(commitSha).slice(0, 7) : null,
    branch,
    durationMs,
    sections,
    blockers,
    warnings:       allWarnings,
    jobCount:       jobResults.length,
    generatedAt:    new Date().toISOString(),
    message:        pipelineStatus === PIPELINE_STATUS.PASSED
      ? `Pipeline PASSED in ${durationMs ?? '?'}ms`
      : `Pipeline ${pipelineStatus} — ${blockers.length} blocker(s)`,
  });
}

export const CI_SUMMARY_VERSION = '1.0.0';
