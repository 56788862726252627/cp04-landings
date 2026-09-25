// Health Root Cause Analyzer — ADV-20 (heuristic, no fabricated causality)

export const ROOT_CAUSE_CONFIDENCE = Object.freeze({
  LIKELY:   'LIKELY',
  POSSIBLE: 'POSSIBLE',
  UNKNOWN:  'UNKNOWN',
});

export function createHealthRootCauseAnalyzer(config = {}) {
  const { dependencyMap = null } = config;

  function analyze(snapshot) {
    if (!snapshot || !snapshot.criticalIssues || snapshot.criticalIssues.length === 0) {
      return Object.freeze({ rootCauses: [], confidence: ROOT_CAUSE_CONFIDENCE.UNKNOWN, isReal: false });
    }

    const rootCauses = [];

    for (const issue of snapshot.criticalIssues) {
      const downstream = dependencyMap
        ? dependencyMap.propagateDegradation(issue.dimension).affected
        : [];

      const confidence = downstream.length > 0 ? ROOT_CAUSE_CONFIDENCE.LIKELY : ROOT_CAUSE_CONFIDENCE.POSSIBLE;

      rootCauses.push(Object.freeze({
        dimension: issue.dimension,
        status: issue.status,
        confidence,
        affectedDownstream: downstream,
        heuristic: true,
      }));
    }

    return Object.freeze({ rootCauses: Object.freeze(rootCauses), confidence: rootCauses[0]?.confidence ?? ROOT_CAUSE_CONFIDENCE.UNKNOWN, isReal: false });
  }

  return Object.freeze({ analyze, dependencyMapConnected: !!dependencyMap, isReal: false });
}

export const HEALTH_ROOT_CAUSE_ANALYZER_VERSION = '1.0.0';
