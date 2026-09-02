// Evaluation Runner — ADV-10

import { createAgentEvaluationResult, deriveStatus } from './evaluationResult.js';
import { computeWeightedScore, DEFAULT_DIMENSION_WEIGHTS } from './evaluationDimensions.js';
import { runCriticalFailureChecks } from './criticalFailurePolicy.js';

export const RUN_MODE = Object.freeze({
  FAST:  'FAST',
  FINAL: 'FINAL',
  SINGLE:'SINGLE',
});

export function runSingleEvaluation(evalCase = {}, evaluatorFn = null, opts = {}) {
  const checks = runCriticalFailureChecks({ text: evalCase.agentResponse, context: evalCase.context });

  let scores = opts.scores ?? [];
  if (evaluatorFn) {
    try {
      const r = evaluatorFn({ text: evalCase.agentResponse, userInput: evalCase.userInput, ...evalCase });
      if (r.score !== undefined) {
        scores = [{ dimension: 'PRIMARY', score: r.score }];
      }
    } catch {
      scores = [{ dimension: 'PRIMARY', score: 50 }];
    }
  }

  const weightedScore = scores.length > 0 ? computeWeightedScore(scores, DEFAULT_DIMENSION_WEIGHTS) : 50;
  const status        = deriveStatus(weightedScore, checks, []);

  return createAgentEvaluationResult({
    agentId:         evalCase.agentType ?? '',
    scenarioId:      evalCase.id ?? '',
    agentType:       evalCase.agentType ?? '',
    vertical:        evalCase.vertical ?? '',
    scores,
    weightedScore,
    criticalFailures:checks,
    latencyMs:       evalCase.latencyMs ?? 0,
    status,
  });
}

export function runAgentEvaluationSuite(dataset = {}, evaluatorFn = null, opts = {}) {
  const cases   = dataset.cases ?? [];
  const mode    = opts.mode ?? RUN_MODE.FINAL;
  const subset  = mode === RUN_MODE.FAST ? cases.slice(0, Math.min(10, cases.length)) : cases;
  const results = subset.map(c => runSingleEvaluation(c, evaluatorFn, opts));

  const passed   = results.filter(r => r.status === 'PASS').length;
  const warned   = results.filter(r => r.status === 'WARNING').length;
  const failed   = results.filter(r => r.status === 'FAIL').length;
  const blocked  = results.filter(r => r.status === 'BLOCKED').length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.weightedScore, 0) / results.length)
    : 0;

  return Object.freeze({
    mode, totalCases: subset.length,
    passed, warned, failed, blocked,
    averageScore: avgScore,
    results: Object.freeze(results),
    isReal: false,
  });
}

export const EVALUATION_RUNNER_VERSION = '1.0.0';
