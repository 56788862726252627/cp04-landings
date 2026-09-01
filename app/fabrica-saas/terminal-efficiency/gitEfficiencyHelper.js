// Git Efficiency Helper — ADV-05
// Provides scoped, minimal git operations without redundant commands.

import { checkFileScope, SCOPE_VERDICT } from './activeScopeManager.js';
import { classifyCommand } from './safeCommandPolicy.js';

export function buildScopedCommitPlan(changedFiles = [], message = '', improvementId = '') {
  if (!message) return { valid: false, error: 'commit message required' };
  if (!improvementId) return { valid: false, error: 'improvementId required' };

  const inScope   = changedFiles.filter(f => checkFileScope(f).verdict === SCOPE_VERDICT.IN_SCOPE);
  const outScope  = changedFiles.filter(f => checkFileScope(f).verdict === SCOPE_VERDICT.OUT_OF_SCOPE);
  const borderline = changedFiles.filter(f => checkFileScope(f).verdict === SCOPE_VERDICT.BORDERLINE);

  if (inScope.length === 0) {
    return { valid: false, error: 'No in-scope files to commit', outScope, borderline };
  }

  const addCommands = inScope.map(f => `git add ${f}`);
  const commitCommand = `git commit -m "${message}"`;

  return {
    valid: true,
    inScope,
    outScope,
    borderline,
    commands: [...addCommands, commitCommand],
    commandCount: addCommands.length + 1,
    skippedFiles: outScope.length,
    isReal: false,
  };
}

export function buildMinimalStatusCheck() {
  const cmds = ['git status --short', 'git diff --stat --cached', 'git log --oneline -3'];
  return {
    valid: true,
    commands: cmds,
    commandCount: cmds.length,
    canRunAuto: cmds.every(c => classifyCommand(c).canAutoRun),
    isReal: false,
  };
}

export function buildPushPlan(branch = '') {
  if (!branch || !branch.startsWith('feature/factory-')) {
    return { valid: false, error: 'push only allowed to feature/factory-* branches' };
  }
  return {
    valid: true,
    command: `git push -u origin ${branch}`,
    branch,
    isReal: false,
  };
}

export const GIT_EFFICIENCY_HELPER_VERSION = '1.0.0';
