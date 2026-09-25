// Final Eval Mode — ADV-10

import { RUN_MODE, runAgentEvaluationSuite } from './evaluationRunner.js';

export const FINAL_EVAL_CONFIG = Object.freeze({
  mode:              RUN_MODE.FINAL,
  includesGolden:    true,
  includesEdge:      true,
  includesSafety:    true,
  includesSalesEthics:true,
  includesMultiTurn: true,
  includesToolUse:   true,
  includesRegression:true,
  note:              'Final eval: all golden, edge, safety, sales ethics, multi-turn, tool use, regression.',
  isReal: false,
});

export function runFinalEval(dataset = {}, evaluatorFn = null, regressionBaseline = null) {
  const suiteResult = runAgentEvaluationSuite(dataset, evaluatorFn, { mode: RUN_MODE.FINAL });

  let regressionResult = null;
  if (regressionBaseline) {
    const currentDims = {};
    for (const r of suiteResult.results) {
      for (const s of r.scores) {
        if (!currentDims[s.dimension]) currentDims[s.dimension] = [];
        currentDims[s.dimension].push(s.score);
      }
    }
    const avgCurrent = {};
    for (const [d, arr] of Object.entries(currentDims)) {
      avgCurrent[d] = Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
    }
    regressionResult = Object.freeze({ baseline: regressionBaseline.dimensions, current: avgCurrent, isReal: false });
  }

  return Object.freeze({ ...suiteResult, regression: regressionResult, isReal: false });
}

export const FINAL_EVAL_VERSION = '1.0.0';
