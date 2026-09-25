// Conflict Resolution Policy — ADV-17
// Priority: safety > business truth > human instruction > business policy > task > agent preference.

export const RESOLUTION_OUTCOME = Object.freeze({
  RESOLVED_BY_SAFETY:        'RESOLVED_BY_SAFETY',
  RESOLVED_BY_BUSINESS_TRUTH: 'RESOLVED_BY_BUSINESS_TRUTH',
  RESOLVED_BY_HUMAN:         'RESOLVED_BY_HUMAN',
  RESOLVED_BY_POLICY:        'RESOLVED_BY_POLICY',
  RESOLVED_BY_TASK:          'RESOLVED_BY_TASK',
  HUMAN_REQUIRED:            'HUMAN_REQUIRED',
  UNRESOLVABLE:              'UNRESOLVABLE',
});

export function createAgentConflictResolutionPolicy(config = {}) {
  const { humanFallback = true } = config;

  return Object.freeze({
    resolve(conflict, context = {}) {
      const { type } = conflict;

      // CLIENT_SCOPE: always safety block
      if (type === 'CLIENT_SCOPE_CONFLICT') {
        return Object.freeze({ outcome: RESOLUTION_OUTCOME.RESOLVED_BY_SAFETY, winner: 'SAFETY', isReal: false });
      }

      // FACT_CONFLICT: business truth wins
      if (type === 'FACT_CONFLICT' && context.businessTruthValue !== undefined) {
        return Object.freeze({ outcome: RESOLUTION_OUTCOME.RESOLVED_BY_BUSINESS_TRUTH, winner: context.businessTruthValue, isReal: false });
      }

      // RESOURCE_CONFLICT with explicit human decision
      if (context.humanDecision) {
        return Object.freeze({ outcome: RESOLUTION_OUTCOME.RESOLVED_BY_HUMAN, winner: context.humanDecision, isReal: false });
      }

      // ACTION_CONFLICT: serialize if possible
      if (type === 'ACTION_CONFLICT' && context.canSerialize) {
        return Object.freeze({ outcome: RESOLUTION_OUTCOME.RESOLVED_BY_POLICY, winner: 'SERIALIZE', isReal: false });
      }

      // Cannot resolve automatically → human required
      if (humanFallback) {
        return Object.freeze({ outcome: RESOLUTION_OUTCOME.HUMAN_REQUIRED, winner: null, isReal: false });
      }

      return Object.freeze({ outcome: RESOLUTION_OUTCOME.UNRESOLVABLE, winner: null, isReal: false });
    },

    isReal: false,
  });
}

export const CONFLICT_RESOLUTION_POLICY_VERSION = '1.0.0';
