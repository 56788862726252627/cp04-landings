// Lead Engine Bridge — ADV-17 ↔ ADV-08
// LEAD agent hands off qualified leads to SALES agent via this bridge.

export const LEAD_ACTION = Object.freeze({
  QUALIFY:    'QUALIFY',
  ENRICH:     'ENRICH',
  SCORE:      'SCORE',
  HANDOFF:    'HANDOFF',
  DISQUALIFY: 'DISQUALIFY',
});

export function createMultiAgentLeadEngineBridge(config = {}) {
  const { minScore = 60 } = config;

  return Object.freeze({
    minScore,

    buildLeadContext(specialist, task = {}) {
      return Object.freeze({
        agentId:      specialist.id,
        objective:    task.description ?? 'LEAD_QUALIFICATION',
        allowedTools: Object.freeze(specialist.allowedTools ?? []),
        isReal:       false,
      });
    },

    // Determines if a lead qualifies for sales handoff
    shouldHandoff(score) {
      return score >= minScore;
    },

    buildHandoffPayload(lead = {}, score) {
      return Object.freeze({
        lead:         Object.freeze({ ...lead }),
        score,
        qualified:    score >= minScore,
        nextAgent:    'SALES',
        action:       LEAD_ACTION.HANDOFF,
        isReal:       false,
      });
    },

    isReal: false,
  });
}

export const MULTIAGENT_LEAD_ENGINE_BRIDGE_VERSION = '1.0.0';
