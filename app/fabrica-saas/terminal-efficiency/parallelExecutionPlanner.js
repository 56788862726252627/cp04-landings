// Parallel Execution Planner — ADV-05
// Identifies independent operations that can safely run concurrently.

export const PARALLELISM_DECISION = Object.freeze({
  SAFE_PARALLEL:       'SAFE_PARALLEL',
  MUST_SEQUENTIAL:     'MUST_SEQUENTIAL',
  CONDITIONAL_PARALLEL:'CONDITIONAL_PARALLEL',
});

const CONFLICT_RULES = [
  { a: 'GIT_WRITE', b: 'GIT_WRITE', reason: 'git mutations conflict' },
  { a: 'BUILD',     b: 'BUILD',     reason: 'concurrent builds collide on dist/' },
  { a: 'DEPLOY',    b: 'DEPLOY',    reason: 'parallel deploys unsafe' },
  { a: 'DEPLOY',    b: 'GIT_WRITE', reason: 'deploy and git-write order-dependent' },
];

function hasConflict(catA, catB) {
  return CONFLICT_RULES.some(r =>
    (r.a === catA && r.b === catB) || (r.a === catB && r.b === catA)
  );
}

export function planParallelExecution(operations = []) {
  if (!Array.isArray(operations) || operations.length === 0) {
    return { valid: false, error: 'operations array required' };
  }
  const groups = [];
  const remaining = [...operations];

  while (remaining.length > 0) {
    const group = [remaining.shift()];
    const toRemove = [];
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const conflicts = group.some(g => hasConflict(g.category ?? 'UNKNOWN', candidate.category ?? 'UNKNOWN'));
      if (!conflicts) {
        group.push(candidate);
        toRemove.push(i);
      }
    }
    for (let i = toRemove.length - 1; i >= 0; i--) remaining.splice(toRemove[i], 1);
    groups.push(group);
  }

  const parallelizable = operations.filter(op => {
    const others = operations.filter(o => o !== op);
    return others.some(o => !hasConflict(op.category ?? 'UNKNOWN', o.category ?? 'UNKNOWN'));
  });

  return {
    valid:          true,
    executionGroups: groups,
    groupCount:     groups.length,
    parallelizable: parallelizable.map(o => o.name ?? o.command ?? o.id),
    sequentialOnly: groups.filter(g => g.length === 1).flatMap(g => g.map(o => o.name ?? o.command)),
    estimatedParallelismGain: groups.length < operations.length
      ? Math.round((1 - groups.length / operations.length) * 100) : 0,
    isReal: false,
  };
}

export const PARALLEL_EXECUTION_PLANNER_VERSION = '1.0.0';
