// Multi-Agent Decision Summary — ADV-17
// Structured explainability: what specialists, sources, actions, blocks. No chain-of-thought.

// eslint-disable-next-line no-unused-vars
export function createMultiAgentDecisionSummary(config = {}) {
  return Object.freeze({
    build(trace = {}) {
      const {
        specialists      = [],
        sources          = [],
        actionsTaken     = [],
        blocked          = [],
        conflicts        = [],
        checkpoints      = [],
      } = trace;

      return Object.freeze({
        specialistsInvolved: Object.freeze([...specialists]),
        sourcesUsed:         Object.freeze([...sources]),
        actionsTaken:        Object.freeze([...actionsTaken]),
        blockedItems:        Object.freeze([...blocked]),
        conflictsResolved:   Object.freeze([...conflicts]),
        checkpointCount:     checkpoints.length ?? 0,
        chainOfThought:      null,   // always null — never exposed
        isReal:              false,
      });
    },

    isReal: false,
  });
}

export const DECISION_SUMMARY_VERSION = '1.0.0';
