// Handoff Quality Evaluator — ADV-17

export const HANDOFF_QUALITY_STATUS = Object.freeze({
  PASS:    'PASS',
  WARN:    'WARN',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export function createAgentHandoffQualityEvaluator() {
  return Object.freeze({
    evaluate(handoff) {
      const issues = [];

      if (!handoff.toAgent)          issues.push('MISSING_RECIPIENT');
      if (!handoff.fromAgent)        issues.push('MISSING_SENDER');
      if (!handoff.requiredAction)   issues.push('NO_NEXT_ACTION');
      if (handoff.facts.length === 0 && handoff.pendingQuestions.length === 0)
        issues.push('EMPTY_HANDOFF');

      // Check for sensitive leakage (placeholder — no PII in fixtures)
      const sensitivePatterns = [/password/i, /sk-/i, /api.key/i];
      const factStr = JSON.stringify(handoff.facts);
      if (sensitivePatterns.some(p => p.test(factStr))) {
        issues.push('SENSITIVE_DATA_LEAKED');
      }

      const scores = {
        contextCompleteness: handoff.facts.length > 0 ? 100 : 30,
        brevity:             handoff.facts.length <= 5 ? 100 : 60,
        correctRecipient:    handoff.toAgent ? 100 : 0,
        factPreservation:    100,
        noSensitiveLeakage:  issues.includes('SENSITIVE_DATA_LEAKED') ? 0 : 100,
        nextActionClarity:   handoff.requiredAction ? 100 : 20,
      };

      const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);

      const status = issues.includes('SENSITIVE_DATA_LEAKED') || issues.includes('MISSING_RECIPIENT')
        ? HANDOFF_QUALITY_STATUS.BLOCKED
        : issues.length > 1 ? HANDOFF_QUALITY_STATUS.FAIL
        : issues.length === 1 ? HANDOFF_QUALITY_STATUS.WARN
        : HANDOFF_QUALITY_STATUS.PASS;

      return Object.freeze({ status, overall, scores: Object.freeze(scores), issues: Object.freeze(issues), isReal: false });
    },

    isReal: false,
  });
}

export const HANDOFF_QUALITY_EVALUATOR_VERSION = '1.0.0';
