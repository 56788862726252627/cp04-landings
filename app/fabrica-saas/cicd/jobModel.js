// CI Job Model — ADV-02 CI/CD Automatizado
// CIJob: modelo canónico de un job dentro de un pipeline.

export const JOB_TYPE = Object.freeze({
  INSTALL:           'INSTALL',
  TEST:              'TEST',
  LINT:              'LINT',
  BUILD:             'BUILD',
  SECURITY:          'SECURITY',
  SECRET_SCAN:       'SECRET_SCAN',
  DEPENDENCY_SCAN:   'DEPENDENCY_SCAN',
  QUALITY_GATE:      'QUALITY_GATE',
  ARTIFACT:          'ARTIFACT',
  RELEASE_READINESS: 'RELEASE_READINESS',
  DEPLOY_READINESS:  'DEPLOY_READINESS',
});

export const JOB_STATUS = Object.freeze({
  PENDING:   'PENDING',
  RUNNING:   'RUNNING',
  PASSED:    'PASSED',
  FAILED:    'FAILED',
  SKIPPED:   'SKIPPED',
  CANCELLED: 'CANCELLED',
});

const BLOCKING_BY_DEFAULT = new Set([
  JOB_TYPE.TEST,
  JOB_TYPE.LINT,
  JOB_TYPE.BUILD,
  JOB_TYPE.SECRET_SCAN,
  JOB_TYPE.QUALITY_GATE,
]);

/**
 * Create a CI job definition.
 */
export function createJob(params = {}) {
  const errors = [];
  if (!params.id)      errors.push('id required');
  if (!params.name)    errors.push('name required');
  if (!params.type)    errors.push('type required');
  if (!JOB_TYPE[params.type]) errors.push(`type must be one of: ${Object.keys(JOB_TYPE).join(', ')}`);
  if (errors.length) return { valid: false, errors };

  const job = Object.freeze({
    id:             params.id,
    name:           params.name,
    type:           params.type,
    command:        params.command ?? null,
    dependsOn:      Object.freeze(params.dependsOn ?? []),
    blocking:       params.blocking ?? BLOCKING_BY_DEFAULT.has(params.type),
    timeout:        params.timeout ?? 300,
    retry:          params.retry ?? 0,
    allowFailure:   params.allowFailure ?? false,
    artifactOutput: params.artifactOutput ?? null,
    status:         JOB_STATUS.PENDING,
    priority:       params.priority ?? 50,
    runCondition:   params.runCondition ?? 'always',
  });

  return { valid: true, job };
}

/**
 * Build the standard job sequence for a Factory CI pipeline.
 */
export function buildStandardJobSequence(options = {}) {
  const wd   = options.workingDirectory ?? '.';
  const node = options.nodeVersion ?? '20';

  const jobs = [
    { id: 'secret-quick-scan', name: 'Secret Quick Scan',  type: JOB_TYPE.SECRET_SCAN,       command: null, dependsOn: [], blocking: true,  priority: 10 },
    { id: 'install',           name: 'Install',             type: JOB_TYPE.INSTALL,           command: `cd ${wd} && node --version && npm ci --prefer-offline`, dependsOn: ['secret-quick-scan'], blocking: true, priority: 20 },
    { id: 'test',              name: 'Test Suite',          type: JOB_TYPE.TEST,              command: `cd ${wd} && node --test fabrica-saas/generator/tests/*.test.mjs`, dependsOn: ['install'], blocking: true, priority: 30 },
    { id: 'lint',              name: 'Lint',                type: JOB_TYPE.LINT,              command: `cd ${wd} && npm run lint -- --quiet`, dependsOn: ['install'], blocking: true, priority: 30 },
    { id: 'security',          name: 'Security Gate',       type: JOB_TYPE.SECURITY,          command: null, dependsOn: ['install'], blocking: true, priority: 35 },
    { id: 'dependency-scan',   name: 'Dependency Scan',     type: JOB_TYPE.DEPENDENCY_SCAN,   command: `cd ${wd} && npm audit --json --audit-level=high 2>/dev/null || true`, dependsOn: ['install'], blocking: false, priority: 35 },
    { id: 'build',             name: 'Build',               type: JOB_TYPE.BUILD,             command: `cd ${wd} && npm run build`, dependsOn: ['test', 'lint'], blocking: true, priority: 40 },
    { id: 'artifact',          name: 'Artifact Validation', type: JOB_TYPE.ARTIFACT,          command: null, dependsOn: ['build'], blocking: true, priority: 50 },
    { id: 'quality-gate',      name: 'Quality Gate',        type: JOB_TYPE.QUALITY_GATE,      command: null, dependsOn: ['artifact', 'dependency-scan'], blocking: true, priority: 60 },
    { id: 'release-readiness', name: 'Release Readiness',   type: JOB_TYPE.RELEASE_READINESS, command: null, dependsOn: ['quality-gate'], blocking: false, priority: 70 },
  ];

  return jobs.map(j => createJob({ ...j, nodeVersion: node })).filter(r => r.valid).map(r => r.job);
}

export const JOB_MODEL_VERSION = '1.0.0';
