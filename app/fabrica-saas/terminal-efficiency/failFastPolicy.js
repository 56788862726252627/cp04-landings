// Fail Fast Execution Policy — ADV-05
// Stops pipeline early when blocking failures are detected.

export const FAIL_FAST_STAGE = Object.freeze({
  SYNTAX_CHECK:   'SYNTAX_CHECK',
  IMPORT_CHECK:   'IMPORT_CHECK',
  SECRET_SCAN:    'SECRET_SCAN',
  TARGETED_TESTS: 'TARGETED_TESTS',
  LINT:           'LINT',
  FULL_TESTS:     'FULL_TESTS',
  BUILD:          'BUILD',
  DEPLOY_READY:   'DEPLOY_READY',
});

const STAGE_BLOCKS = Object.freeze({
  SYNTAX_CHECK:   ['IMPORT_CHECK', 'TARGETED_TESTS', 'LINT', 'FULL_TESTS', 'BUILD', 'DEPLOY_READY'],
  IMPORT_CHECK:   ['TARGETED_TESTS', 'FULL_TESTS', 'BUILD', 'DEPLOY_READY'],
  SECRET_SCAN:    ['DEPLOY_READY'],
  TARGETED_TESTS: ['FULL_TESTS', 'BUILD', 'DEPLOY_READY'],
  LINT:           [],
  FULL_TESTS:     ['BUILD', 'DEPLOY_READY'],
  BUILD:          ['DEPLOY_READY'],
  DEPLOY_READY:   [],
});

export function evaluateFailFast(stageResults = []) {
  if (!Array.isArray(stageResults)) return { valid: false, error: 'stageResults must be array' };

  const failed = stageResults.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
  if (failed.length === 0) {
    return { valid: true, shouldStop: false, reason: null, blockedStages: [], isReal: false };
  }

  const firstFail = failed[0];
  const blocked = STAGE_BLOCKS[firstFail.stage] ?? [];

  return {
    valid:         true,
    shouldStop:    true,
    failedStage:   firstFail.stage,
    reason:        firstFail.reason ?? `${firstFail.stage} failed`,
    blockedStages: blocked,
    savedCommands: blocked.length,
    isReal:        false,
  };
}

export function shouldSkipStage(stage, stageResults = []) {
  for (const result of stageResults) {
    if (result.status === 'FAIL' || result.status === 'ERROR') {
      const blocked = STAGE_BLOCKS[result.stage] ?? [];
      if (blocked.includes(stage)) return { skip: true, reason: `${result.stage} failed` };
    }
  }
  return { skip: false, reason: null };
}

export const FAIL_FAST_POLICY_VERSION = '1.0.0';
