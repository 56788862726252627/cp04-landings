// Command Batcher — ADV-05
// Groups safe commands into minimal batches to reduce round-trips.

import { classifyCommand, COMMAND_CATEGORY } from './safeCommandPolicy.js';

export const BATCH_STRATEGY = Object.freeze({
  SEQUENTIAL: 'SEQUENTIAL',
  PARALLEL:   'PARALLEL',
  FAIL_FAST:  'FAIL_FAST',
});

export const BATCH_STATUS = Object.freeze({
  PENDING:   'PENDING',
  RUNNING:   'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED:    'FAILED',
  SKIPPED:   'SKIPPED',
});

export function createBatch(commands = [], options = {}) {
  if (!Array.isArray(commands) || commands.length === 0) {
    return { valid: false, error: 'commands array required' };
  }
  const classified = commands.map(c => classifyCommand(c));
  const blocked = classified.filter(c => c.isBlocked);
  if (blocked.length > 0) {
    return { valid: false, error: `Blocked commands: ${blocked.map(b => b.command).join(', ')}` };
  }
  const hasHuman = classified.filter(c => c.requiresHuman);
  return Object.freeze({
    valid:      true,
    batchId:    `BATCH-${Date.now()}`,
    commands:   classified,
    strategy:   options.strategy ?? BATCH_STRATEGY.FAIL_FAST,
    status:     BATCH_STATUS.PENDING,
    humanRequired: hasHuman.map(h => h.command),
    autoRunnable: classified.filter(c => c.canAutoRun).map(c => c.command),
    totalCommands: commands.length,
    autoCount:  classified.filter(c => c.canAutoRun).length,
    isReal:     false,
  });
}

export function groupIntoSafeBatches(commands = []) {
  if (!Array.isArray(commands)) return { valid: false, error: 'array required' };
  const classified = commands.map(c => ({ cmd: c, cls: classifyCommand(c) }));

  // Group: read-only batch, test/lint/build batch, git-write batch, human-required
  const groups = { readonly: [], validation: [], gitWrite: [], human: [], blocked: [] };
  for (const { cmd, cls } of classified) {
    if (cls.isBlocked) { groups.blocked.push(cmd); continue; }
    if (cls.requiresHuman) { groups.human.push(cmd); continue; }
    if ([COMMAND_CATEGORY.READ, COMMAND_CATEGORY.SEARCH, COMMAND_CATEGORY.GIT_READ].includes(cls.category)) {
      groups.readonly.push(cmd);
    } else if ([COMMAND_CATEGORY.TEST, COMMAND_CATEGORY.LINT, COMMAND_CATEGORY.BUILD].includes(cls.category)) {
      groups.validation.push(cmd);
    } else if (cls.category === COMMAND_CATEGORY.GIT_WRITE) {
      groups.gitWrite.push(cmd);
    }
  }

  const batches = [];
  if (groups.readonly.length)   batches.push({ name: 'READ_BATCH',       strategy: BATCH_STRATEGY.PARALLEL,   commands: groups.readonly });
  if (groups.validation.length) batches.push({ name: 'VALIDATION_BATCH', strategy: BATCH_STRATEGY.FAIL_FAST,  commands: groups.validation });
  if (groups.gitWrite.length)   batches.push({ name: 'GIT_WRITE_BATCH',  strategy: BATCH_STRATEGY.SEQUENTIAL, commands: groups.gitWrite });
  if (groups.human.length)      batches.push({ name: 'HUMAN_BATCH',      strategy: BATCH_STRATEGY.SEQUENTIAL, commands: groups.human, requiresHuman: true });

  return {
    valid:        groups.blocked.length === 0,
    batches,
    batchCount:   batches.length,
    blockedCount: groups.blocked.length,
    blocked:      groups.blocked,
    savedRoundTrips: Math.max(0, commands.length - batches.length),
    isReal:       false,
  };
}

export const COMMAND_BATCHER_VERSION = '1.0.0';
