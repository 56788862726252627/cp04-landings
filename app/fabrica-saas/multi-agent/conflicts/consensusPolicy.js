// Consensus Policy — ADV-17
// Only use multi-agent consensus for high-value decisions. Never for trivial ones.

export const CONSENSUS_METHOD = Object.freeze({
  MAJORITY:        'MAJORITY',
  UNANIMOUS:       'UNANIMOUS',
  WEIGHTED:        'WEIGHTED',
  SUPERVISOR_CAST: 'SUPERVISOR_CAST', // supervisor breaks tie
});

export function createAgentConsensusPolicy(config = {}) {
  const {
    method      = CONSENSUS_METHOD.MAJORITY,
    minVoters   = 2,
    maxCycles   = 3,   // prevent infinite debate
    useForTrivial = false,
  } = config;

  return Object.freeze({
    method,
    minVoters,
    maxCycles,
    useForTrivial,

    shouldUseConsensus(decisionComplexity = 'LOW') {
      if (!useForTrivial && decisionComplexity === 'LOW') return false;
      return decisionComplexity === 'HIGH' || decisionComplexity === 'CRITICAL';
    },

    evaluate(votes = []) {
      if (votes.length < minVoters) {
        return Object.freeze({ consensus: false, reason: 'INSUFFICIENT_VOTERS', isReal: false });
      }

      const counts = {};
      for (const v of votes) counts[v] = (counts[v] ?? 0) + 1;
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const [top, topCount] = sorted[0];

      if (method === CONSENSUS_METHOD.UNANIMOUS && topCount < votes.length) {
        return Object.freeze({ consensus: false, winner: null, reason: 'NOT_UNANIMOUS', isReal: false });
      }

      const majority = votes.length > 1 && topCount > votes.length / 2;
      if (method === CONSENSUS_METHOD.MAJORITY && !majority) {
        return Object.freeze({ consensus: false, winner: null, reason: 'NO_MAJORITY', isReal: false });
      }

      return Object.freeze({ consensus: true, winner: top, votes: Object.freeze([...votes]), isReal: false });
    },

    isReal: false,
  });
}

export const CONSENSUS_POLICY_VERSION = '1.0.0';
