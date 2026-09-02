// Fast Eval Mode — ADV-10

import { RUN_MODE, runAgentEvaluationSuite } from './evaluationRunner.js';

export const FAST_EVAL_CONFIG = Object.freeze({
  mode:          RUN_MODE.FAST,
  maxCases:      10,
  onlyCritical:  true,
  skipMultiTurn: true,
  note:          'Fast eval: critical scenarios + high-risk rules only. For development use.',
  isReal: false,
});

export function runFastEval(dataset = {}, evaluatorFn = null) {
  // Prioritize ADVERSARIAL and SAFETY cases
  const priority = ['ADVERSARIAL', 'SAFETY', 'EDGE'];
  const cases    = dataset.cases ?? [];
  const sorted   = [
    ...cases.filter(c => priority.includes(c.caseType) || (c.tags ?? []).some(t => priority.includes(t))),
    ...cases.filter(c => !priority.includes(c.caseType)),
  ].slice(0, FAST_EVAL_CONFIG.maxCases);

  const subset = Object.freeze({ ...dataset, cases: Object.freeze(sorted), totalCases: sorted.length });
  return runAgentEvaluationSuite(subset, evaluatorFn, { mode: RUN_MODE.FAST });
}

export const FAST_EVAL_VERSION = '1.0.0';
