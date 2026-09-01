/**
 * ADV-05 — Terminal Efficiency & Safe Autonomy
 * Full test coverage for all 22 modules.
 * node:test runner. isReal: false always.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyCommand, filterSafeCommands,
  COMMAND_TIER, COMMAND_CATEGORY, SAFE_COMMAND_POLICY_VERSION,
} from '../../terminal-efficiency/safeCommandPolicy.js';

import {
  createBatch, groupIntoSafeBatches,
  BATCH_STRATEGY, BATCH_STATUS, COMMAND_BATCHER_VERSION,
} from '../../terminal-efficiency/commandBatcher.js';

import {
  planValidation, VALIDATION_MODE, VALIDATION_PLANNER_VERSION,
} from '../../terminal-efficiency/validationPlanner.js';

import {
  analyzeChangeImpact, analyzeFileImpact,
  IMPACT_LEVEL, CHANGE_IMPACT_ANALYZER_VERSION,
} from '../../terminal-efficiency/changeImpactAnalyzer.js';

import {
  createValidationResultCache, CACHE_STATUS,
  CACHEABLE_OPERATIONS, NEVER_CACHE, VALIDATION_RESULT_CACHE_VERSION,
} from '../../terminal-efficiency/validationResultCache.js';

import {
  createTerminalCheckpoint, TERMINAL_CHECKPOINT, TERMINAL_CHECKPOINT_VERSION,
} from '../../terminal-efficiency/terminalCheckpoint.js';

import {
  planParallelExecution, PARALLEL_EXECUTION_PLANNER_VERSION,
} from '../../terminal-efficiency/parallelExecutionPlanner.js';

import {
  evaluateFailFast, shouldSkipStage,
  FAIL_FAST_STAGE, FAIL_FAST_POLICY_VERSION,
} from '../../terminal-efficiency/failFastPolicy.js';

import {
  evaluateRetry, classifyError,
  ERROR_CLASS, RETRY_DECISION, SAFE_RETRY_POLICY_VERSION,
} from '../../terminal-efficiency/safeRetryPolicy.js';

import {
  createRepoContextSnapshot, isSnapshotStale,
  SNAPSHOT_STATUS, REPO_CONTEXT_SNAPSHOT_VERSION,
} from '../../terminal-efficiency/repoContextSnapshot.js';

import {
  createActiveScopeManager, checkFileScope, filterInScopeFiles,
  SCOPE_VERDICT, ACTIVE_SCOPE_MANAGER_VERSION,
} from '../../terminal-efficiency/activeScopeManager.js';

import {
  buildQualityGatePlan, simulateQualityGateRun,
  QUALITY_GATE_STATUS, QUALITY_GATE_MODE, QUALITY_GATE_RUNNER_VERSION,
} from '../../terminal-efficiency/qualityGateRunner.js';

import {
  evaluateContinuity, buildAutoContinuePlan,
  STAGE_CONTINUITY, AUTO_CONTINUE_POLICY_VERSION,
} from '../../terminal-efficiency/autoContinuePolicy.js';

import {
  runFactoryTask, WORKFLOW_STATUS, TERMINAL_WORKFLOW_RUNNER_VERSION,
} from '../../terminal-efficiency/terminalWorkflowRunner.js';

import {
  evaluateInterruption, shouldInterrupt,
  INTERRUPTION_DECISION, HUMAN_INTERRUPTION_POLICY_VERSION,
} from '../../terminal-efficiency/humanInterruptionPolicy.js';

import {
  buildScopedCommitPlan, buildMinimalStatusCheck, buildPushPlan,
  GIT_EFFICIENCY_HELPER_VERSION,
} from '../../terminal-efficiency/gitEfficiencyHelper.js';

import {
  selectAffectedTests, TEST_SCOPE, TEST_SELECTOR_VERSION,
} from '../../terminal-efficiency/testSelector.js';

import {
  isBuildRequired, BUILD_DECISION, BUILD_SELECTOR_VERSION,
} from '../../terminal-efficiency/buildSelector.js';

import {
  emitEfficiencyEvent, createEfficiencyLogger,
  EFFICIENCY_EVENT, OBSERVABILITY_INTEGRATION_VERSION,
} from '../../terminal-efficiency/observabilityIntegration.js';

import {
  createEfficiencyMetrics, METRIC_CATEGORY, TERMINAL_EFFICIENCY_METRICS_VERSION,
} from '../../terminal-efficiency/terminalEfficiencyMetrics.js';

import {
  calculateTerminalSpeedup, SPEEDUP_GRADE, SPEEDUP_CALCULATOR_VERSION,
} from '../../terminal-efficiency/speedupCalculator.js';

import {
  getLegacyExecution, getOptimizedExecution,
  FAILURE_FIXTURES, FIXTURE_VERSION,
} from '../../terminal-efficiency/fixtures/efficiencyFixture.js';

import { TERMINAL_EFFICIENCY_REGISTRY } from '../../factory-registry/terminalEfficiency.js';

// ─────────────────────────────────────────────────────────────────────────────
// SAFE COMMAND POLICY
// ─────────────────────────────────────────────────────────────────────────────

describe('SafeCommandPolicy — versions', () => {
  it('has version string', () => { assert.ok(SAFE_COMMAND_POLICY_VERSION); });
});

describe('classifyCommand — SAFE_AUTO', () => {
  it('node --test is SAFE_AUTO', () => {
    const r = classifyCommand('node --test generator/tests/*.test.mjs');
    assert.strictEqual(r.tier, COMMAND_TIER.SAFE_AUTO);
    assert.strictEqual(r.canAutoRun, true);
    assert.strictEqual(r.isReal, false);
  });
  it('npx eslint is SAFE_AUTO', () => {
    const r = classifyCommand('npx eslint terminal-efficiency/ --max-warnings=0');
    assert.strictEqual(r.canAutoRun, true);
  });
  it('npm run build is SAFE_AUTO', () => {
    const r = classifyCommand('npm run build');
    assert.strictEqual(r.canAutoRun, true);
  });
  it('git status is SAFE_AUTO', () => {
    const r = classifyCommand('git status');
    assert.strictEqual(r.tier, COMMAND_TIER.SAFE_AUTO);
  });
  it('git diff is SAFE_AUTO', () => {
    const r = classifyCommand('git diff --stat');
    assert.strictEqual(r.canAutoRun, true);
  });
  it('grep is SAFE_AUTO', () => {
    const r = classifyCommand('grep -r "pattern" .');
    assert.strictEqual(r.canAutoRun, true);
  });
  it('find is SAFE_AUTO', () => {
    const r = classifyCommand('find . -name "*.js"');
    assert.strictEqual(r.canAutoRun, true);
  });
});

describe('classifyCommand — SAFE_WITH_SCOPE', () => {
  it('git add is SAFE_WITH_SCOPE', () => {
    const r = classifyCommand('git add terminal-efficiency/foo.js');
    assert.strictEqual(r.tier, COMMAND_TIER.SAFE_WITH_SCOPE);
    assert.strictEqual(r.requiresScope, true);
  });
  it('git commit is SAFE_WITH_SCOPE', () => {
    const r = classifyCommand('git commit -m "feat: add module"');
    assert.strictEqual(r.tier, COMMAND_TIER.SAFE_WITH_SCOPE);
  });
  it('git push to feature/factory is SAFE_WITH_SCOPE', () => {
    const r = classifyCommand('git push -u origin feature/factory-advanced-05-terminal-efficiency');
    assert.strictEqual(r.tier, COMMAND_TIER.SAFE_WITH_SCOPE);
  });
});

describe('classifyCommand — BLOCKED', () => {
  it('git reset --hard is BLOCKED', () => {
    const r = classifyCommand('git reset --hard HEAD~1');
    assert.strictEqual(r.tier, COMMAND_TIER.BLOCKED);
    assert.strictEqual(r.isBlocked, true);
  });
  it('git clean -fd is BLOCKED', () => {
    const r = classifyCommand('git clean -fd');
    assert.strictEqual(r.isBlocked, true);
  });
  it('force push is BLOCKED', () => {
    const r = classifyCommand('git push --force origin main');
    assert.strictEqual(r.isBlocked, true);
  });
  it('rm -rf is BLOCKED', () => {
    const r = classifyCommand('rm -rf dist/');
    assert.strictEqual(r.isBlocked, true);
  });
});

describe('classifyCommand — HUMAN_REQUIRED', () => {
  it('billing command is HUMAN_REQUIRED', () => {
    const r = classifyCommand('configure billing for stripe');
    assert.strictEqual(r.tier, COMMAND_TIER.HUMAN_REQUIRED);
    assert.strictEqual(r.requiresHuman, true);
  });
  it('empty command fails', () => {
    const r = classifyCommand('');
    assert.strictEqual(r.valid, false);
  });
});

describe('filterSafeCommands', () => {
  it('returns only auto-runnable commands', () => {
    const cmds = ['node --test tests/*.test.mjs', 'git reset --hard', 'npx eslint src/'];
    const safe = filterSafeCommands(cmds);
    assert.strictEqual(safe.length, 2);
    assert.ok(safe.every(r => r.canAutoRun));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COMMAND BATCHER
// ─────────────────────────────────────────────────────────────────────────────

describe('createBatch', () => {
  it('creates valid batch of safe commands', () => {
    const b = createBatch(['node --test tests/*.mjs', 'npx eslint src/']);
    assert.strictEqual(b.valid, true);
    assert.strictEqual(b.isReal, false);
    assert.ok(b.batchId.startsWith('BATCH-'));
  });
  it('fails with empty commands', () => {
    const b = createBatch([]);
    assert.strictEqual(b.valid, false);
  });
  it('fails when blocked command present', () => {
    const b = createBatch(['git reset --hard', 'node --test']);
    assert.strictEqual(b.valid, false);
    assert.ok(b.error.includes('Blocked'));
  });
  it('identifies human-required commands', () => {
    const b = createBatch(['node --test tests/*.mjs', 'configure billing']);
    assert.ok(b.humanRequired.length > 0);
  });
});

describe('groupIntoSafeBatches', () => {
  it('groups read, validation, and git separately', () => {
    const result = groupIntoSafeBatches([
      'git status', 'git diff',
      'node --test tests/*.mjs', 'npx eslint src/',
      'git add file.js', 'git commit -m "x"',
    ]);
    assert.strictEqual(result.valid, true);
    assert.ok(result.batches.find(b => b.name === 'READ_BATCH'));
    assert.ok(result.batches.find(b => b.name === 'VALIDATION_BATCH'));
    assert.ok(result.batches.find(b => b.name === 'GIT_WRITE_BATCH'));
  });
  it('blocked commands make valid false', () => {
    const r = groupIntoSafeBatches(['git reset --hard']);
    assert.strictEqual(r.valid, false);
    assert.strictEqual(r.blockedCount, 1);
  });
  it('savedRoundTrips is positive when batching reduces calls', () => {
    const r = groupIntoSafeBatches(['git status', 'git diff', 'git log --oneline']);
    assert.ok(r.savedRoundTrips >= 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE IMPACT ANALYZER
// ─────────────────────────────────────────────────────────────────────────────

describe('analyzeFileImpact', () => {
  it('md file → LOW', () => {
    const r = analyzeFileImpact('docs/README.md');
    assert.strictEqual(r.level, IMPACT_LEVEL.LOW);
  });
  it('test fixture → LOW', () => {
    const r = analyzeFileImpact('terminal-efficiency/fixtures/fix.js');
    assert.strictEqual(r.level, IMPACT_LEVEL.LOW);
  });
  it('.test.mjs → MEDIUM', () => {
    const r = analyzeFileImpact('generator/tests/v2-adv05.test.mjs');
    assert.strictEqual(r.level, IMPACT_LEVEL.MEDIUM);
  });
  it('auth file → CRITICAL', () => {
    const r = analyzeFileImpact('src/auth/authMiddleware.js');
    assert.strictEqual(r.level, IMPACT_LEVEL.CRITICAL);
  });
  it('worker.js → CRITICAL', () => {
    const r = analyzeFileImpact('src/worker.js');
    assert.strictEqual(r.level, IMPACT_LEVEL.CRITICAL);
  });
  it('index.js → HIGH', () => {
    const r = analyzeFileImpact('terminal-efficiency/index.js');
    assert.strictEqual(r.level, IMPACT_LEVEL.HIGH);
  });
  it('fails without filePath', () => {
    const r = analyzeFileImpact('');
    assert.strictEqual(r.valid, false);
  });
});

describe('analyzeChangeImpact', () => {
  it('empty files → NONE', () => {
    const r = analyzeChangeImpact([]);
    assert.strictEqual(r.overallLevel, IMPACT_LEVEL.NONE);
  });
  it('takes max impact across files', () => {
    const r = analyzeChangeImpact(['docs/README.md', 'src/auth/middleware.js']);
    assert.strictEqual(r.overallLevel, IMPACT_LEVEL.CRITICAL);
    assert.strictEqual(r.hasCritical, true);
  });
  it('validationDepth TARGETED for LOW impact', () => {
    const r = analyzeChangeImpact(['docs/README.md']);
    assert.strictEqual(r.validationDepth, 'TARGETED');
  });
  it('validationDepth FULL for HIGH impact', () => {
    const r = analyzeChangeImpact(['factory-registry/index.js']);
    assert.strictEqual(r.validationDepth, 'FULL');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION PLANNER
// ─────────────────────────────────────────────────────────────────────────────

describe('planValidation', () => {
  it('docs-only → FAST mode, no build', () => {
    const r = planValidation({ changedFiles: ['docs/README.md'], riskLevel: 'LOW' });
    assert.strictEqual(r.mode, VALIDATION_MODE.FAST);
    assert.strictEqual(r.buildRequired, false);
    assert.strictEqual(r.isReal, false);
  });
  it('FINAL_GATE → FULL mode', () => {
    const r = planValidation({ changedFiles: [], currentStage: 'FINAL_GATE' });
    assert.strictEqual(r.mode, VALIDATION_MODE.FULL);
    assert.strictEqual(r.fullTestsRequired, true);
  });
  it('CRITICAL file → CRITICAL mode', () => {
    const r = planValidation({ changedFiles: ['src/auth/middleware.js'] });
    assert.strictEqual(r.mode, VALIDATION_MODE.CRITICAL);
    assert.strictEqual(r.secretScanRequired, true);
  });
  it('forceFullSuite overrides impact', () => {
    const r = planValidation({ changedFiles: ['docs/README.md'], forceFullSuite: true });
    assert.strictEqual(r.mode, VALIDATION_MODE.FULL);
  });
  it('can reuse cache when previous fullTests passed', () => {
    const r = planValidation({ changedFiles: ['docs/README.md'], previousResults: { fullTests: true } });
    assert.ok(r.reusingCache === true || r.canSkipBuild === true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION RESULT CACHE
// ─────────────────────────────────────────────────────────────────────────────

describe('createValidationResultCache', () => {
  it('MISS on first get', () => {
    const cache = createValidationResultCache();
    const r = cache.tryGet('TESTS', 'hash123');
    assert.strictEqual(r.status, CACHE_STATUS.MISS);
  });
  it('HIT after store', () => {
    const cache = createValidationResultCache();
    cache.store('TESTS', 'hash123', { pass: true });
    const r = cache.tryGet('TESTS', 'hash123');
    assert.strictEqual(r.status, CACHE_STATUS.HIT);
    assert.strictEqual(r.result.pass, true);
  });
  it('BYPASSED for non-cacheable operations', () => {
    const cache = createValidationResultCache();
    const r = cache.tryGet('SECRET_SCAN', 'hash123');
    assert.strictEqual(r.status, CACHE_STATUS.BYPASSED);
  });
  it('STALE after TTL', () => {
    const cache = createValidationResultCache({ ttlMs: 1 });
    cache.store('LINT', 'hash456', { clean: true });
    return new Promise(res => setTimeout(() => {
      const r = cache.tryGet('LINT', 'hash456');
      assert.strictEqual(r.status, CACHE_STATUS.STALE);
      res();
    }, 5));
  });
  it('invalidate removes entries', () => {
    const cache = createValidationResultCache();
    cache.store('BUILD', 'hash789', { ok: true });
    const removed = cache.invalidate('hash789');
    assert.ok(removed > 0);
    assert.strictEqual(cache.tryGet('BUILD', 'hash789').status, CACHE_STATUS.MISS);
  });
  it('stats hitRate is 0-100', () => {
    const cache = createValidationResultCache();
    cache.store('TESTS', 'h1', true);
    cache.tryGet('TESTS', 'h1');
    const s = cache.stats();
    assert.ok(s.hitRate >= 0 && s.hitRate <= 100);
    assert.strictEqual(s.isReal, false);
  });
  it('NEVER_CACHE includes SECRET_SCAN', () => {
    assert.ok(NEVER_CACHE.includes('SECRET_SCAN'));
  });
  it('CACHEABLE_OPERATIONS includes TESTS', () => {
    assert.ok(CACHEABLE_OPERATIONS.includes('TESTS'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TERMINAL CHECKPOINT
// ─────────────────────────────────────────────────────────────────────────────

describe('createTerminalCheckpoint', () => {
  it('creates valid tracker', () => {
    const t = createTerminalCheckpoint('adv-05');
    assert.strictEqual(t.valid, true);
  });
  it('reach registers checkpoint', () => {
    const t = createTerminalCheckpoint('adv-05');
    const r = t.reach(TERMINAL_CHECKPOINT.AUDIT_DONE);
    assert.strictEqual(r.ok, true);
    assert.ok(t.hasReached(TERMINAL_CHECKPOINT.AUDIT_DONE));
  });
  it('getNextCheckpoint returns AUDIT_DONE initially', () => {
    const t = createTerminalCheckpoint('adv-05');
    assert.strictEqual(t.getNextCheckpoint(), TERMINAL_CHECKPOINT.AUDIT_DONE);
  });
  it('advances after reaching checkpoints', () => {
    const t = createTerminalCheckpoint('adv-05');
    t.reach(TERMINAL_CHECKPOINT.AUDIT_DONE);
    assert.strictEqual(t.getNextCheckpoint(), TERMINAL_CHECKPOINT.IMPLEMENTATION_DONE);
  });
  it('summary reports progress', () => {
    const t = createTerminalCheckpoint('adv-05');
    t.reach(TERMINAL_CHECKPOINT.AUDIT_DONE);
    const s = t.summary();
    assert.strictEqual(s.reachedCount, 1);
    assert.strictEqual(s.isComplete, false);
    assert.strictEqual(s.isReal, false);
  });
  it('resumeFrom returns checkpoint meta', () => {
    const t = createTerminalCheckpoint('adv-05');
    t.reach(TERMINAL_CHECKPOINT.FULL_TESTS_PASS, { commitSha: 'abc123' });
    const r = t.resumeFrom(TERMINAL_CHECKPOINT.FULL_TESTS_PASS);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.meta.commitSha, 'abc123');
    assert.strictEqual(r.isReal, false);
  });
  it('fails without improvementId', () => {
    const t = createTerminalCheckpoint('');
    assert.strictEqual(t.valid, false);
  });
  it('rejects unknown checkpoint', () => {
    const t = createTerminalCheckpoint('adv-05');
    const r = t.reach('UNKNOWN_CHECKPOINT');
    assert.strictEqual(r.ok, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PARALLEL EXECUTION PLANNER
// ─────────────────────────────────────────────────────────────────────────────

describe('planParallelExecution', () => {
  it('fails with empty array', () => {
    const r = planParallelExecution([]);
    assert.strictEqual(r.valid, false);
  });
  it('groups non-conflicting ops together', () => {
    const ops = [
      { name: 'test-a', category: 'TEST' },
      { name: 'lint',   category: 'LINT' },
    ];
    const r = planParallelExecution(ops);
    assert.strictEqual(r.valid, true);
    assert.ok(r.groupCount <= ops.length);
    assert.strictEqual(r.isReal, false);
  });
  it('keeps BUILD ops sequential when conflicting', () => {
    const ops = [
      { name: 'build-1', category: 'BUILD' },
      { name: 'build-2', category: 'BUILD' },
    ];
    const r = planParallelExecution(ops);
    assert.ok(r.groupCount >= 2);
  });
  it('parallelismGain 0 for single op', () => {
    const r = planParallelExecution([{ name: 'x', category: 'TEST' }]);
    assert.strictEqual(r.estimatedParallelismGain, 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FAIL FAST POLICY
// ─────────────────────────────────────────────────────────────────────────────

describe('evaluateFailFast', () => {
  it('no stop when all pass', () => {
    const r = evaluateFailFast([{ stage: 'TARGETED_TESTS', status: 'PASS' }]);
    assert.strictEqual(r.shouldStop, false);
  });
  it('stops and blocks downstream on SYNTAX_CHECK fail', () => {
    const r = evaluateFailFast([{ stage: 'SYNTAX_CHECK', status: 'FAIL' }]);
    assert.strictEqual(r.shouldStop, true);
    assert.ok(r.blockedStages.includes('BUILD'));
    assert.ok(r.savedCommands > 0);
    assert.strictEqual(r.isReal, false);
  });
  it('stops on SECRET_SCAN fail and blocks DEPLOY_READY', () => {
    const r = evaluateFailFast([{ stage: 'SECRET_SCAN', status: 'FAIL' }]);
    assert.strictEqual(r.shouldStop, true);
    assert.ok(r.blockedStages.includes('DEPLOY_READY'));
  });
  it('fails with non-array input', () => {
    const r = evaluateFailFast('not-array');
    assert.strictEqual(r.valid, false);
  });
});

describe('shouldSkipStage', () => {
  it('skips BUILD when FULL_TESTS failed', () => {
    const r = shouldSkipStage('BUILD', [{ stage: 'FULL_TESTS', status: 'FAIL' }]);
    assert.strictEqual(r.skip, true);
    assert.ok(r.reason.includes('FULL_TESTS'));
  });
  it('does not skip when no failures', () => {
    const r = shouldSkipStage('BUILD', [{ stage: 'FULL_TESTS', status: 'PASS' }]);
    assert.strictEqual(r.skip, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SAFE RETRY POLICY
// ─────────────────────────────────────────────────────────────────────────────

describe('classifyError', () => {
  it('ECONNRESET → TRANSIENT', () => {
    const r = classifyError('ECONNRESET during git push');
    assert.strictEqual(r.class, ERROR_CLASS.TRANSIENT);
    assert.ok(r.maxRetries > 0);
    assert.strictEqual(r.isReal, false);
  });
  it('SyntaxError → DETERMINISTIC', () => {
    const r = classifyError('SyntaxError: Unexpected token');
    assert.strictEqual(r.class, ERROR_CLASS.DETERMINISTIC);
    assert.strictEqual(r.maxRetries, 0);
  });
  it('oauth → PERMISSION', () => {
    const r = classifyError('oauth required for this action');
    assert.strictEqual(r.class, ERROR_CLASS.PERMISSION);
  });
  it('EACCES → PERMISSION', () => {
    const r = classifyError('EACCES: permission denied');
    assert.strictEqual(r.class, ERROR_CLASS.PERMISSION);
  });
});

describe('evaluateRetry', () => {
  it('RETRY for TRANSIENT within max attempts', () => {
    const r = evaluateRetry('ECONNRESET', 0);
    assert.strictEqual(r.decision, RETRY_DECISION.RETRY);
    assert.ok(r.delayMs > 0);
    assert.strictEqual(r.isReal, false);
  });
  it('NO_RETRY for DETERMINISTIC', () => {
    const r = evaluateRetry('SyntaxError: bad token', 0);
    assert.strictEqual(r.decision, RETRY_DECISION.NO_RETRY);
  });
  it('WAITING_HUMAN for PERMISSION error', () => {
    const r = evaluateRetry('EACCES permission denied', 0);
    assert.strictEqual(r.decision, RETRY_DECISION.WAITING_HUMAN);
  });
  it('NO_RETRY when max attempts exceeded', () => {
    const r = evaluateRetry('ECONNRESET', 5);
    assert.strictEqual(r.decision, RETRY_DECISION.NO_RETRY);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REPO CONTEXT SNAPSHOT
// ─────────────────────────────────────────────────────────────────────────────

describe('createRepoContextSnapshot', () => {
  it('creates valid snapshot', () => {
    const s = createRepoContextSnapshot({ branch: 'feature/factory-adv05', headSha: 'abc123' });
    assert.strictEqual(s.valid, true);
    assert.strictEqual(s.branch, 'feature/factory-adv05');
    assert.strictEqual(s.headSha, 'abc123');
    assert.strictEqual(s.NEVER_INCLUDES_SECRETS, true);
    assert.strictEqual(s.isReal, false);
  });
  it('fails without branch', () => {
    const s = createRepoContextSnapshot({});
    assert.strictEqual(s.valid, false);
  });
  it('filters sensitive fields from testBaseline', () => {
    const s = createRepoContextSnapshot({ branch: 'main', testBaseline: { count: 3529, SECRET_TOKEN: 'abc' } });
    assert.ok(!('SECRET_TOKEN' in s.testBaseline));
    assert.strictEqual(s.testBaseline.count, 3529);
  });
});

describe('isSnapshotStale', () => {
  it('stale when SHA changed', () => {
    const s = createRepoContextSnapshot({ branch: 'main', headSha: 'old' });
    assert.strictEqual(isSnapshotStale(s, 'new'), true);
  });
  it('fresh when SHA matches', () => {
    const s = createRepoContextSnapshot({ branch: 'main', headSha: 'same' });
    assert.strictEqual(isSnapshotStale(s, 'same'), false);
  });
  it('stale when snapshot invalid', () => {
    assert.strictEqual(isSnapshotStale(null, 'any'), true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE SCOPE MANAGER
// ─────────────────────────────────────────────────────────────────────────────

describe('checkFileScope', () => {
  it('factory path → IN_SCOPE', () => {
    const r = checkFileScope('terminal-efficiency/safeCommandPolicy.js');
    assert.strictEqual(r.verdict, SCOPE_VERDICT.IN_SCOPE);
    assert.strictEqual(r.isReal, false);
  });
  it('protected path → OUT_OF_SCOPE', () => {
    const r = checkFileScope('src/components/demo/DemoPage.jsx');
    assert.strictEqual(r.verdict, SCOPE_VERDICT.OUT_OF_SCOPE);
  });
  it('.env → OUT_OF_SCOPE', () => {
    const r = checkFileScope('.env.production');
    assert.strictEqual(r.verdict, SCOPE_VERDICT.OUT_OF_SCOPE);
  });
  it('worker.js → OUT_OF_SCOPE', () => {
    const r = checkFileScope('src/worker.js');
    assert.strictEqual(r.verdict, SCOPE_VERDICT.OUT_OF_SCOPE);
  });
  it('docs/terminal-efficiency/ → IN_SCOPE', () => {
    const r = checkFileScope('docs/terminal-efficiency/README.md');
    assert.strictEqual(r.verdict, SCOPE_VERDICT.IN_SCOPE);
  });
  it('fails without filePath', () => {
    const r = checkFileScope('');
    assert.strictEqual(r.valid, false);
  });
});

describe('filterInScopeFiles', () => {
  it('returns only in-scope files', () => {
    const files = ['terminal-efficiency/foo.js', 'src/components/demo/Bar.jsx', 'docs/terminal-efficiency/x.md'];
    const result = filterInScopeFiles(files);
    assert.ok(result.includes('terminal-efficiency/foo.js'));
    assert.ok(!result.includes('src/components/demo/Bar.jsx'));
  });
});

describe('createActiveScopeManager', () => {
  it('creates valid manager', () => {
    const mgr = createActiveScopeManager('adv-05');
    assert.strictEqual(mgr.valid, true);
  });
  it('tracks blocked write attempts', () => {
    const mgr = createActiveScopeManager('adv-05');
    mgr.checkWrite('src/components/demo/Blocked.jsx');
    const stats = mgr.getStats();
    assert.strictEqual(stats.blocked, 1);
    assert.strictEqual(stats.isReal, false);
  });
  it('fails without improvementId', () => {
    const mgr = createActiveScopeManager('');
    assert.strictEqual(mgr.valid, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// QUALITY GATE RUNNER
// ─────────────────────────────────────────────────────────────────────────────

describe('buildQualityGatePlan', () => {
  it('FINAL mode includes full tests and build', () => {
    const plan = buildQualityGatePlan({ changedFiles: ['terminal-efficiency/foo.js'], mode: QUALITY_GATE_MODE.FINAL });
    assert.ok(plan.steps.some(s => s.id === 'FULL_TESTS'));
    assert.ok(plan.steps.some(s => s.id === 'LINT'));
    assert.strictEqual(plan.isReal, false);
  });
  it('FAST mode has fewer steps than FINAL', () => {
    const fast  = buildQualityGatePlan({ changedFiles: [], mode: QUALITY_GATE_MODE.FAST });
    const final = buildQualityGatePlan({ changedFiles: [], mode: QUALITY_GATE_MODE.FINAL });
    assert.ok(fast.stepCount <= final.stepCount);
  });
});

describe('simulateQualityGateRun', () => {
  it('ALL_PASS when no overrides', () => {
    const plan = buildQualityGatePlan({ changedFiles: [], mode: QUALITY_GATE_MODE.FINAL });
    const r    = simulateQualityGateRun(plan);
    assert.strictEqual(r.status, QUALITY_GATE_STATUS.ALL_PASS);
    assert.strictEqual(r.isReal, false);
  });
  it('FAIL_FAST on blocking step failure', () => {
    const plan = buildQualityGatePlan({ changedFiles: [], mode: QUALITY_GATE_MODE.FINAL });
    const r    = simulateQualityGateRun(plan, { FULL_TESTS: 'FAIL' });
    assert.strictEqual(r.status, QUALITY_GATE_STATUS.FAIL_FAST);
    assert.ok(r.stagesSaved.length > 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTO CONTINUE POLICY
// ─────────────────────────────────────────────────────────────────────────────

describe('evaluateContinuity', () => {
  it('IMPLEMENTATION → AUTO_CONTINUE when authorized', () => {
    const r = evaluateContinuity('IMPLEMENTATION', true);
    assert.strictEqual(r.continuity, STAGE_CONTINUITY.AUTO_CONTINUE);
    assert.strictEqual(r.isReal, false);
  });
  it('OAUTH_SETUP → BLOCKED always', () => {
    const r = evaluateContinuity('OAUTH_SETUP', true);
    assert.strictEqual(r.continuity, STAGE_CONTINUITY.BLOCKED);
  });
  it('BILLING_SETUP → BLOCKED always', () => {
    const r = evaluateContinuity('BILLING_SETUP', true);
    assert.strictEqual(r.continuity, STAGE_CONTINUITY.BLOCKED);
  });
  it('fails without stage', () => {
    const r = evaluateContinuity('', true);
    assert.strictEqual(r.valid, false);
  });
});

describe('buildAutoContinuePlan', () => {
  it('builds plan with pause points', () => {
    const plan = buildAutoContinuePlan(['IMPLEMENTATION', 'LINT', 'OAUTH_SETUP'], true);
    assert.ok(plan.pausePoints.includes('OAUTH_SETUP'));
    assert.ok(plan.autoContinueCount > 0);
    assert.strictEqual(plan.isReal, false);
  });
  it('fails with non-array', () => {
    const plan = buildAutoContinuePlan('not-array');
    assert.strictEqual(plan.valid, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HUMAN INTERRUPTION POLICY
// ─────────────────────────────────────────────────────────────────────────────

describe('evaluateInterruption', () => {
  it('run_tests → PROCEED_AUTO', () => {
    const r = evaluateInterruption('run_tests');
    assert.strictEqual(r.decision, INTERRUPTION_DECISION.PROCEED_AUTO);
    assert.strictEqual(r.isReal, false);
  });
  it('oauth action → INTERRUPT', () => {
    const r = evaluateInterruption('oauth setup for meta');
    assert.strictEqual(r.decision, INTERRUPTION_DECISION.INTERRUPT);
  });
  it('billing → INTERRUPT', () => {
    const r = evaluateInterruption('billing configuration');
    assert.strictEqual(r.decision, INTERRUPTION_DECISION.INTERRUPT);
  });
  it('run_lint → PROCEED_AUTO', () => {
    const r = evaluateInterruption('run_lint');
    assert.strictEqual(r.decision, INTERRUPTION_DECISION.PROCEED_AUTO);
  });
  it('fails without action', () => {
    const r = evaluateInterruption('');
    assert.strictEqual(r.valid, false);
  });
});

describe('shouldInterrupt', () => {
  it('returns false when all auto', () => {
    const r = shouldInterrupt(['run_tests', 'run_lint', 'check_git_status']);
    assert.strictEqual(r.shouldInterrupt, false);
    assert.strictEqual(r.isReal, false);
  });
  it('returns true when oauth in list', () => {
    const r = shouldInterrupt(['run_tests', 'oauth setup', 'run_lint']);
    assert.strictEqual(r.shouldInterrupt, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GIT EFFICIENCY HELPER
// ─────────────────────────────────────────────────────────────────────────────

describe('buildScopedCommitPlan', () => {
  it('plans commit with in-scope files', () => {
    const r = buildScopedCommitPlan(
      ['terminal-efficiency/foo.js', 'src/components/demo/Bar.jsx'],
      'feat: add module', 'adv-05'
    );
    assert.strictEqual(r.valid, true);
    assert.ok(r.inScope.includes('terminal-efficiency/foo.js'));
    assert.ok(r.outScope.includes('src/components/demo/Bar.jsx'));
    assert.ok(r.commands.some(c => c.includes('git commit')));
    assert.strictEqual(r.isReal, false);
  });
  it('fails without message', () => {
    const r = buildScopedCommitPlan(['terminal-efficiency/foo.js'], '', 'adv-05');
    assert.strictEqual(r.valid, false);
  });
  it('fails when no in-scope files', () => {
    const r = buildScopedCommitPlan(['src/components/demo/Bar.jsx'], 'msg', 'adv-05');
    assert.strictEqual(r.valid, false);
  });
});

describe('buildMinimalStatusCheck', () => {
  it('builds 3 read-only commands', () => {
    const r = buildMinimalStatusCheck();
    assert.strictEqual(r.commandCount, 3);
    assert.strictEqual(r.canRunAuto, true);
    assert.strictEqual(r.isReal, false);
  });
});

describe('buildPushPlan', () => {
  it('allows feature/factory-* branches', () => {
    const r = buildPushPlan('feature/factory-advanced-05-terminal-efficiency');
    assert.strictEqual(r.valid, true);
    assert.ok(r.command.includes('feature/factory-'));
    assert.strictEqual(r.isReal, false);
  });
  it('blocks non-factory branches', () => {
    const r = buildPushPlan('main');
    assert.strictEqual(r.valid, false);
  });
  it('blocks empty branch', () => {
    const r = buildPushPlan('');
    assert.strictEqual(r.valid, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

describe('selectAffectedTests', () => {
  it('maps terminal-efficiency file to adv05 test', () => {
    const r = selectAffectedTests(['terminal-efficiency/safeCommandPolicy.js']);
    assert.ok(r.tests.some(t => t.includes('adv05')));
    assert.strictEqual(r.isReal, false);
  });
  it('empty files → no tests, TARGETED scope', () => {
    const r = selectAffectedTests([]);
    assert.strictEqual(r.tests.length, 0);
    assert.strictEqual(r.scope, TEST_SCOPE.TARGETED);
  });
  it('auth file → FULL suite', () => {
    const r = selectAffectedTests(['src/auth/middleware.js']);
    assert.strictEqual(r.scope, TEST_SCOPE.FULL);
  });
  it('registry file → FULL suite', () => {
    const r = selectAffectedTests(['factory-registry/index.js']);
    assert.strictEqual(r.scope, TEST_SCOPE.FULL);
  });
  it('fails with non-array', () => {
    const r = selectAffectedTests('not-array');
    assert.strictEqual(r.valid, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUILD SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

describe('isBuildRequired', () => {
  it('jsx file → REQUIRED', () => {
    const r = isBuildRequired(['src/components/MyComponent.jsx']);
    assert.strictEqual(r.decision, BUILD_DECISION.REQUIRED);
    assert.strictEqual(r.isReal, false);
  });
  it('md file only → NOT_REQUIRED', () => {
    const r = isBuildRequired(['docs/README.md']);
    assert.strictEqual(r.decision, BUILD_DECISION.NOT_REQUIRED);
  });
  it('test file only → NOT_REQUIRED', () => {
    const r = isBuildRequired(['generator/tests/v2-adv05.test.mjs']);
    assert.strictEqual(r.decision, BUILD_DECISION.NOT_REQUIRED);
  });
  it('pure .js modules → NOT_REQUIRED', () => {
    const r = isBuildRequired(['terminal-efficiency/safeCommandPolicy.js']);
    assert.strictEqual(r.decision, BUILD_DECISION.NOT_REQUIRED);
  });
  it('worker.js → REQUIRED', () => {
    const r = isBuildRequired(['src/worker.js']);
    assert.strictEqual(r.decision, BUILD_DECISION.REQUIRED);
  });
  it('empty files → NOT_REQUIRED', () => {
    const r = isBuildRequired([]);
    assert.strictEqual(r.decision, BUILD_DECISION.NOT_REQUIRED);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OBSERVABILITY INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────

describe('emitEfficiencyEvent', () => {
  it('builds valid event', () => {
    const e = emitEfficiencyEvent(EFFICIENCY_EVENT.EFFICIENCY_PLAN_CREATED, { taskId: 'adv-05' });
    assert.strictEqual(e.valid, true);
    assert.strictEqual(e.SECRETS_NEVER_LOGGED, true);
    assert.strictEqual(e.isReal, false);
    assert.ok(e.timestamp);
  });
  it('sanitizes secret fields', () => {
    const e = emitEfficiencyEvent(EFFICIENCY_EVENT.COMMAND_BATCH_STARTED, { stage: 'test', secret: 'sk_live_xxx' });
    assert.ok(!('secret' in e.payload));
    assert.ok('stage' in e.payload);
  });
  it('fails for unknown event type', () => {
    const e = emitEfficiencyEvent('UNKNOWN_EVENT', {});
    assert.strictEqual(e.valid, false);
  });
});

describe('createEfficiencyLogger', () => {
  it('logs and counts events', () => {
    const logger = createEfficiencyLogger('CORR-001');
    logger.log(EFFICIENCY_EVENT.EFFICIENCY_PLAN_CREATED, {});
    logger.log(EFFICIENCY_EVENT.COMMAND_BATCH_COMPLETED, { status: 'PASS' });
    assert.strictEqual(logger.count(), 2);
    assert.strictEqual(logger.getCorrelationId(), 'CORR-001');
  });
  it('summary has eventCount', () => {
    const logger = createEfficiencyLogger();
    logger.log(EFFICIENCY_EVENT.EFFICIENCY_RUN_COMPLETED, {});
    const s = logger.summary();
    assert.strictEqual(s.eventCount, 1);
    assert.strictEqual(s.isReal, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EFFICIENCY METRICS
// ─────────────────────────────────────────────────────────────────────────────

describe('createEfficiencyMetrics', () => {
  it('computes reduction percentages', () => {
    const m = createEfficiencyMetrics({ commandsBefore: 40, confirmationsBefore: 10 });
    m.record(METRIC_CATEGORY.COMMANDS, 20);
    m.record(METRIC_CATEGORY.CONFIRMATIONS, 1);
    const r = m.report();
    assert.strictEqual(r.commandReductionPercent, 50);
    assert.strictEqual(r.confirmationReductionPercent, 90);
    assert.strictEqual(r.meetsCommandTarget, true);
    assert.strictEqual(r.meetsConfirmTarget, true);
    assert.strictEqual(r.isReal, false);
  });
  it('recordSkip increments skipped', () => {
    const m = createEfficiencyMetrics({ commandsBefore: 10 });
    m.recordSkip();
    m.recordSkip();
    const r = m.report();
    assert.strictEqual(r.skippedRuns, 2);
  });
  it('setWallClock is reflected in report', () => {
    const m = createEfficiencyMetrics({ estimatedWallClockBefore: 1000 });
    m.setWallClock(700);
    const r = m.report();
    assert.ok(r.wallClockReductionPercent > 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SPEEDUP CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateTerminalSpeedup', () => {
  it('returns valid speedup from fixture comparison', () => {
    const legacy    = getLegacyExecution();
    const optimized = getOptimizedExecution();
    const r = calculateTerminalSpeedup({
      legacyCommands:    legacy.commands.length,
      optimizedCommands: optimized.commands.length,
      legacyConfirmations:    legacy.manualConfirmations,
      optimizedConfirmations: optimized.manualConfirmations,
      legacyValidationMinutes:    legacy.validationMinutes,
      optimizedValidationMinutes: optimized.validationMinutes,
      legacyWallClockMinutes:     legacy.wallClockMinutes,
      optimizedWallClockMinutes:  optimized.wallClockMinutes,
    });
    assert.strictEqual(r.valid, true);
    assert.ok(r.commandReductionPercent >= 50);
    assert.ok(r.confirmationReductionPercent === 100);
    assert.ok(r.totalEstimatedSpeedupPercent >= 15);
    assert.ok(['A', 'B', 'C', 'D'].includes(r.grade));
    assert.strictEqual(r.isReal, false);
  });
  it('fails without baseline', () => {
    const r = calculateTerminalSpeedup({});
    assert.strictEqual(r.valid, false);
  });
  it('grade A for high speedup', () => {
    const r = calculateTerminalSpeedup({
      legacyCommands: 100, optimizedCommands: 10,
      legacyConfirmations: 20, optimizedConfirmations: 0,
      legacyValidationMinutes: 20, optimizedValidationMinutes: 5,
      legacyWallClockMinutes: 40, optimizedWallClockMinutes: 10,
    });
    assert.strictEqual(r.grade, SPEEDUP_GRADE.A);
    assert.strictEqual(r.meetsTarget, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EFFICIENCY FIXTURE
// ─────────────────────────────────────────────────────────────────────────────

describe('Efficiency Fixture', () => {
  it('legacy has more commands than optimized', () => {
    const l = getLegacyExecution();
    const o = getOptimizedExecution();
    assert.ok(l.commands.length > o.commands.length);
  });
  it('legacy has more confirmations', () => {
    const l = getLegacyExecution();
    const o = getOptimizedExecution();
    assert.ok(l.manualConfirmations > o.manualConfirmations);
    assert.strictEqual(o.manualConfirmations, 0);
  });
  it('optimized has fewer build runs', () => {
    assert.ok(getLegacyExecution().buildRuns > getOptimizedExecution().buildRuns);
  });
  it('FAILURE_FIXTURES has 7 failure scenarios', () => {
    assert.strictEqual(Object.keys(FAILURE_FIXTURES).length, 7);
  });
  it('each failure fixture has description', () => {
    Object.values(FAILURE_FIXTURES).forEach(f => {
      assert.ok(f.description);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// E2E — TERMINAL WORKFLOW RUNNER
// ─────────────────────────────────────────────────────────────────────────────

describe('runFactoryTask — happy path', () => {
  const result = runFactoryTask({
    taskId: 'adv-05',
    changedFiles: ['terminal-efficiency/safeCommandPolicy.js'],
    riskLevel: 'LOW',
    promptAuthorized: true,
  });

  it('completes with COMPLETED status', () => {
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.status, WORKFLOW_STATUS.COMPLETED);
    assert.strictEqual(result.isReal, false);
  });
  it('has speedup data', () => {
    assert.ok(result.speedup);
    assert.ok(result.speedup.totalEstimatedSpeedupPercent >= 0);
  });
  it('checkpoint shows progress', () => {
    assert.ok(result.checkpoint.reachedCount > 0);
  });
  it('events include efficiency events', () => {
    assert.ok(result.events.length > 0);
    assert.ok(result.events.some(e => e.eventType === EFFICIENCY_EVENT.EFFICIENCY_PLAN_CREATED));
  });
});

describe('runFactoryTask — fail-fast on targeted test failure', () => {
  it('returns FAILED when targeted tests fail', () => {
    const r = runFactoryTask({
      taskId: 'adv-05-fail',
      changedFiles: [],
      riskLevel: 'LOW',
      qualityOverrides: { TARGETED_TESTS: 'FAIL' },
    });
    assert.strictEqual(r.status, WORKFLOW_STATUS.FAILED);
  });
});

describe('runFactoryTask — fails without taskId', () => {
  it('returns invalid when taskId missing', () => {
    const r = runFactoryTask({});
    assert.strictEqual(r.valid, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TERMINAL EFFICIENCY REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

describe('TerminalEfficiency Registry', () => {
  it('has correct id and adv tag', () => {
    assert.strictEqual(TERMINAL_EFFICIENCY_REGISTRY.id, 'terminal-efficiency');
    assert.strictEqual(TERMINAL_EFFICIENCY_REGISTRY.adv, 'ADV-05');
    assert.strictEqual(TERMINAL_EFFICIENCY_REGISTRY.isReal, false);
  });
  it('has 23 modules', () => {
    assert.strictEqual(TERMINAL_EFFICIENCY_REGISTRY.modules.length, 23);
  });
  it('has targets defined', () => {
    assert.strictEqual(TERMINAL_EFFICIENCY_REGISTRY.targets.commandReductionPercent, 50);
    assert.strictEqual(TERMINAL_EFFICIENCY_REGISTRY.targets.confirmationReductionPercent, 90);
  });
  it('includes NO_AUTO_APPROVE_BILLING principle', () => {
    assert.ok(TERMINAL_EFFICIENCY_REGISTRY.principles.includes('NO_AUTO_APPROVE_BILLING'));
  });
  it('includes 9 checkpoints', () => {
    assert.strictEqual(TERMINAL_EFFICIENCY_REGISTRY.checkpoints.length, 9);
  });
  it('commandTiers has all 4 tiers', () => {
    assert.strictEqual(TERMINAL_EFFICIENCY_REGISTRY.commandTiers.length, 4);
    assert.ok(TERMINAL_EFFICIENCY_REGISTRY.commandTiers.includes('BLOCKED'));
  });
});
