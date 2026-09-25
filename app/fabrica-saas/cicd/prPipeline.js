// PR Pipeline — ADV-02 CI/CD Automatizado
// Pipeline estándar para pull requests. No merge automático.

import { createPipeline, CI_TRIGGER, PIPELINE_STATUS, evaluatePipelineStatus } from './pipelineModel.js';
import { buildStandardJobSequence } from './jobModel.js';

export const PR_PIPELINE_ID = 'factory-pr-pipeline';

/**
 * Build the standard PR pipeline definition.
 */
export function createPRPipeline(options = {}) {
  const jobs = buildStandardJobSequence(options);

  return createPipeline({
    id:      PR_PIPELINE_ID,
    name:    options.name ?? 'Factory PR Pipeline',
    trigger: CI_TRIGGER.PULL_REQUEST,
    jobs,
    branchPolicy: options.branchPolicy ?? null,
    requiredChecks: ['secret-quick-scan', 'test', 'lint', 'build', 'quality-gate'],
    blockingChecks: ['secret-quick-scan', 'test', 'lint', 'build'],
    optionalChecks: ['dependency-scan', 'release-readiness'],
    timeout:        options.timeout ?? 1800,
    securityPolicy: { blockOnSecretFound: true, blockOnCriticalCVE: true },
    releasePolicy:  { humanApprovalRequired: true, autoMerge: false },
    deployPolicy:   { allowDeploy: false, environment: null },
    workingDirectory: options.workingDirectory ?? '.',
    nodeVersion:    options.nodeVersion ?? '20',
    environment:    'CI',
  });
}

/**
 * Simulate a PR pipeline run from a job results array.
 * jobResults: [{ jobId, name, status, blocking, reason?, durationMs? }]
 */
export function runPRPipelineSimulation(jobResults = []) {
  const evaluation = evaluatePipelineStatus(jobResults);

  const report = {
    pipelineId:  PR_PIPELINE_ID,
    trigger:     CI_TRIGGER.PULL_REQUEST,
    ...evaluation,
    mergeAllowed: evaluation.status === PIPELINE_STATUS.PASSED,
    blockers:    evaluation.blockers ?? [],
    disclaimer:  'NO_AUTO_MERGE. Human review required.',
  };

  return report;
}

/**
 * Standard PR pipeline job sequence (ordered by execution).
 */
export const PR_PIPELINE_STAGES = Object.freeze([
  { stage: 1, jobId: 'secret-quick-scan', name: 'Secret Quick Scan',  failFast: true  },
  { stage: 2, jobId: 'install',           name: 'Install',             failFast: true  },
  { stage: 3, jobId: 'test',              name: 'Test Suite',          failFast: true  },
  { stage: 3, jobId: 'lint',              name: 'Lint',                failFast: true  },
  { stage: 3, jobId: 'security',          name: 'Security Gate',       failFast: true  },
  { stage: 3, jobId: 'dependency-scan',   name: 'Dependency Scan',     failFast: false },
  { stage: 4, jobId: 'build',             name: 'Build',               failFast: true  },
  { stage: 5, jobId: 'artifact',          name: 'Artifact Validation', failFast: true  },
  { stage: 6, jobId: 'quality-gate',      name: 'Quality Gate',        failFast: true  },
  { stage: 7, jobId: 'release-readiness', name: 'Release Readiness',   failFast: false },
]);

export const PR_PIPELINE_VERSION = '1.0.0';
