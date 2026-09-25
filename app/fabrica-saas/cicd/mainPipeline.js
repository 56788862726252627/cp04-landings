// Main Pipeline — ADV-02 CI/CD Automatizado
// Pipeline para push a main. No deploy real.

import { createPipeline, CI_TRIGGER, PIPELINE_STATUS, evaluatePipelineStatus } from './pipelineModel.js';
import { buildStandardJobSequence } from './jobModel.js';

export const MAIN_PIPELINE_ID = 'factory-main-pipeline';

/**
 * Build the main branch pipeline definition.
 * Identical validation to PR + release-readiness is blocking on main.
 */
export function createMainPipeline(options = {}) {
  const jobs = buildStandardJobSequence(options);

  return createPipeline({
    id:      MAIN_PIPELINE_ID,
    name:    options.name ?? 'Factory Main Pipeline',
    trigger: CI_TRIGGER.PUSH_MAIN,
    jobs,
    branchPolicy: options.branchPolicy ?? null,
    requiredChecks: ['secret-quick-scan', 'test', 'lint', 'build', 'quality-gate', 'artifact', 'release-readiness'],
    blockingChecks: ['secret-quick-scan', 'test', 'lint', 'build', 'artifact', 'quality-gate'],
    optionalChecks: ['dependency-scan'],
    timeout:        options.timeout ?? 2400,
    securityPolicy: { blockOnSecretFound: true, blockOnCriticalCVE: true },
    releasePolicy:  { humanApprovalRequired: true, autoMerge: false },
    deployPolicy:   { allowDeploy: false, environment: null },
    workingDirectory: options.workingDirectory ?? '.',
    nodeVersion:    options.nodeVersion ?? '20',
    environment:    'CI',
  });
}

/**
 * Simulate a main pipeline run from job results.
 */
export function runMainPipelineSimulation(jobResults = []) {
  const evaluation = evaluatePipelineStatus(jobResults);

  return {
    pipelineId:      MAIN_PIPELINE_ID,
    trigger:         CI_TRIGGER.PUSH_MAIN,
    ...evaluation,
    deployAllowed:   false,
    releaseAllowed:  evaluation.status === PIPELINE_STATUS.PASSED,
    blockers:        evaluation.blockers ?? [],
    disclaimer:      'NO_AUTO_DEPLOY. Release requires human approval.',
  };
}

/**
 * Validate commit eligibility for main (extra checks vs PR).
 */
export function validateMainCommit(context = {}) {
  const issues = [];

  if (!context.commitSha)      issues.push('No commit SHA provided');
  if (!context.author)         issues.push('No commit author');
  if (context.directPush)      issues.push('Direct push to main — branch policy violation');
  if (!context.prMerged)       issues.push('Commit not from a merged PR');
  if (!context.testsVerified)  issues.push('Tests not verified for this commit');

  return {
    valid:      issues.length === 0,
    eligible:   issues.length === 0,
    issues,
    commitSha:  context.commitSha,
    message:    issues.length === 0 ? 'Commit eligible for main pipeline' : `Commit ineligible: ${issues.join('; ')}`,
  };
}

export const MAIN_PIPELINE_VERSION = '1.0.0';
