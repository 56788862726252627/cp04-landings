// Business Truth Conflict Resolver — ADV-10b

import { getSourcePriorityLevel } from './businessTruthSourcePriority.js';

export const CONFLICT_RESOLUTION_STATUS = Object.freeze({
  RESOLVED:      'RESOLVED',
  UNRESOLVABLE:  'UNRESOLVABLE',
  NO_CONFLICT:   'NO_CONFLICT',
});

export function resolveBusinessTruthConflict(factA = {}, factB = {}) {
  if (factA.value === factB.value || JSON.stringify(factA.value) === JSON.stringify(factB.value)) {
    return Object.freeze({
      status:   CONFLICT_RESOLUTION_STATUS.NO_CONFLICT,
      winner:   factA,
      loser:    null,
      reason:   'Values are identical — no conflict',
      isReal:   false,
    });
  }

  const prioA = getSourcePriorityLevel(factA.source ?? 'UNKNOWN');
  const prioB = getSourcePriorityLevel(factB.source ?? 'UNKNOWN');

  if (prioA === prioB) {
    return Object.freeze({
      status:   CONFLICT_RESOLUTION_STATUS.UNRESOLVABLE,
      winner:   null,
      loser:    null,
      reason:   `Equal priority (${factA.source}) — cannot auto-resolve`,
      conflict: Object.freeze({ factA, factB }),
      isReal:   false,
    });
  }

  const [winner, loser] = prioA < prioB ? [factA, factB] : [factB, factA];

  return Object.freeze({
    status: CONFLICT_RESOLUTION_STATUS.RESOLVED,
    winner,
    loser,
    reason: `${winner.source} (priority ${getSourcePriorityLevel(winner.source)}) beats ${loser.source} (priority ${getSourcePriorityLevel(loser.source)})`,
    isReal: false,
  });
}

export function resolveAllConflicts(facts = []) {
  const byKey = {};
  for (const f of facts) {
    if (!byKey[f.key]) byKey[f.key] = [];
    byKey[f.key].push(f);
  }

  const resolutions = [];
  for (const [key, group] of Object.entries(byKey)) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => getSourcePriorityLevel(a.source) - getSourcePriorityLevel(b.source));
    for (let i = 1; i < sorted.length; i++) {
      const r = resolveBusinessTruthConflict(sorted[0], sorted[i]);
      if (r.status !== CONFLICT_RESOLUTION_STATUS.NO_CONFLICT) {
        resolutions.push(Object.freeze({ key, ...r }));
      }
    }
  }

  return Object.freeze({ resolutions: Object.freeze(resolutions), isReal: false });
}

export const BUSINESS_TRUTH_CONFLICT_RESOLVER_VERSION = '1.0.0';
