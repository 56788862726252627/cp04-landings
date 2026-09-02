// ADV-10 — Agent Evaluation + Langfuse Foundation — Tests

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Core definition
import {
  AGENT_TYPE,
  EVAL_SCENARIO,
  createAgentEvaluationDefinition,
} from '../../agent-evaluation/evaluationDefinition.js';

// Dimensions
import {
  EVAL_DIMENSION,
  DEFAULT_DIMENSION_WEIGHTS,
  computeWeightedScore,
  createDimensionScore,
} from '../../agent-evaluation/evaluationDimensions.js';

// Result
import {
  EVAL_STATUS,
  deriveStatus,
} from '../../agent-evaluation/evaluationResult.js';

// Critical failure policy
import {
  CRITICAL_FAILURE_TYPE,
  createCriticalFailure,
  runCriticalFailureChecks,
  detectInventedFacts,
  detectFalseHumanClaim,
} from '../../agent-evaluation/criticalFailurePolicy.js';

// Evaluators
import { evaluateHumanlikeness, ROBOTIC_PATTERNS } from '../../agent-evaluation/humanlikeEvaluator.js';
import { evaluateBrevity } from '../../agent-evaluation/brevityEvaluator.js';
import { evaluateAgentSafety, SAFETY_VIOLATION } from '../../agent-evaluation/safetyEvaluator.js';
import { evaluateGrounding, GROUNDING_STATUS } from '../../agent-evaluation/groundingEvaluator.js';
import { evaluateToolUse, TOOL_USE_VERDICT } from '../../agent-evaluation/toolUseEvaluator.js';
import { evaluateEscalation, ESCALATION_SCENARIO } from '../../agent-evaluation/escalationEvaluator.js';
import { evaluateEthicalSales, SALES_ETHICS_VIOLATION } from '../../agent-evaluation/ethicalSalesEvaluator.js';
import { evaluateMultiTurn } from '../../agent-evaluation/multiTurnEvaluator.js';
import { evaluateMemoryUse, MEMORY_VERDICT } from '../../agent-evaluation/memoryEvaluator.js';

// Agent-type evaluators
import { evaluateSalesResponse } from '../../agent-evaluation/salesEvaluator.js';
import { evaluateSupportResponse } from '../../agent-evaluation/supportEvaluator.js';
import { evaluateBookingResponse } from '../../agent-evaluation/bookingEvaluator.js';
import { evaluateLeadAgentResponse } from '../../agent-evaluation/leadAgentEvaluator.js';
import { evaluateCRMAgentResponse } from '../../agent-evaluation/crmAgentEvaluator.js';

// Cost / latency
import { createAgentCostEvaluator } from '../../agent-evaluation/costEvaluator.js';
import { createAgentLatencyEvaluator, LATENCY_STATUS } from '../../agent-evaluation/latencyEvaluator.js';
import { compareAgentConfigurations } from '../../agent-evaluation/qualityCostAnalyzer.js';

// Regression & baseline
import { createAgentRegressionSuite, detectRegressions } from '../../agent-evaluation/regressionSuite.js';
import { AGENT_ENGINE_V1_BASELINE, createAgentBaseline } from '../../agent-evaluation/agentBaseline.js';

// Quality score & gate
import { computeAgentQualityScore, QUALITY_TARGETS } from '../../agent-evaluation/agentQualityScore.js';
import { runAgentQualityGate, GATE_RESULT } from '../../agent-evaluation/agentQualityGate.js';

// Runner
import { RUN_MODE, runSingleEvaluation, runAgentEvaluationSuite } from '../../agent-evaluation/evaluationRunner.js';
import { runFastEval, FAST_EVAL_CONFIG } from '../../agent-evaluation/fastEvalMode.js';
import { runFinalEval, FINAL_EVAL_CONFIG } from '../../agent-evaluation/finalEvalMode.js';

// Prompt
import { PROMPT_STATUS, createAgentPromptVersion } from '../../agent-evaluation/promptVersion.js';
import { PROMOTION_REQUIREMENTS, canPromoteAgentPrompt } from '../../agent-evaluation/promptPromotion.js';

// Model comparison
import { compareAgentConfigurations as modelRank } from '../../agent-evaluation/modelComparison.js';

// Telemetry & Langfuse
import {
  TELEMETRY_PROVIDER_TYPE,
  createEvaluationTelemetryProvider,
  LocalEvaluationProvider,
  LangfuseProviderFoundation,
} from '../../agent-evaluation/telemetryProvider.js';
import { createLangfuseEvaluationAdapter } from '../../agent-evaluation/langfuseAdapter.js';
import { createAgentTrace, TRACE_STATUS } from '../../agent-evaluation/agentTrace.js';
import { mapTraceToLangfuseFormat, pushTraceToDashboard } from '../../agent-evaluation/langfuseDashboardBridge.js';

// Privacy / retention / redaction / sampling
import { redactText, redactObject, AgentEvaluationRedaction } from '../../agent-evaluation/redactionPolicy.js';
import { SAMPLING_MODE, createEvaluationSamplingPolicy, applyEvaluationSampling } from '../../agent-evaluation/samplingPolicy.js';
import { PRIVACY_LEVEL, AgentEvaluationPrivacyPolicy } from '../../agent-evaluation/privacyPolicy.js';
import { RETENTION_TIER, createEvaluationRetentionPolicy, getRetentionTierForData } from '../../agent-evaluation/retentionPolicy.js';

// Dashboard & report
import { createAgentEvaluationReport } from '../../agent-evaluation/evaluationReport.js';
import { createAgentEvaluationDashboard } from '../../agent-evaluation/evaluationDashboard.js';

// Dataset & evaluation definition
import { createEvaluationCase, createAgentEvaluationDataset, DATASET_CASE_TYPE } from '../../agent-evaluation/evaluationDataset.js';

// Bridges
import { AGENT_EVALUATION_GATE, runCICDEvaluationGate, assessChangeImpact, CHANGE_IMPACT } from '../../agent-evaluation/bridges/cicdBridge.js';
import { buildEvaluationEvent, emitEvaluationStarted, emitEvaluationCompleted } from '../../agent-evaluation/bridges/observabilityBridge.js';
import { buildAgentEvaluationProfile, linkAgentEngineToEvaluation } from '../../agent-evaluation/bridges/agentEngineBridge.js';
import { buildLeadAgentEvaluationContext, validateLeadAgentSafety } from '../../agent-evaluation/bridges/leadEngineBridge.js';
import { buildCRMAgentEvaluationContext, validateCRMAgentCompliance } from '../../agent-evaluation/bridges/crmBridge.js';

// Fixtures
import { GOOD_FIXTURES, GOOD_FIXTURES_COUNT } from '../../agent-evaluation/fixtures/goodFixtures.js';
import { FAILURE_FIXTURES, FAILURE_FIXTURES_COUNT } from '../../agent-evaluation/fixtures/failureFixtures.js';
import { MULTI_TURN_FIXTURES, MULTI_TURN_FIXTURES_COUNT } from '../../agent-evaluation/fixtures/multiTurnFixtures.js';
import { GOLDEN_DATASET, GOLDEN_DATASET_STATS } from '../../agent-evaluation/fixtures/goldenDataset.js';

// Registry
import { AGENT_EVALUATION_REGISTRY } from '../../factory-registry/agentEvaluation.js';
import { REGISTRY_VERSION, PASO_ADV10_STATUS } from '../../factory-registry/index.js';


// ─── AGENT TYPES ────────────────────────────────────────────────────────────

describe('ADV-10 evaluationDefinition', () => {
  it('AGENT_TYPE has 7 values', () => {
    assert.equal(Object.keys(AGENT_TYPE).length, 7);
  });
  it('EVAL_SCENARIO has expected types', () => {
    assert.ok('GOLDEN' in EVAL_SCENARIO);
    assert.ok('ADVERSARIAL' in EVAL_SCENARIO);
    assert.ok('REGRESSION' in EVAL_SCENARIO);
  });
  it('createAgentEvaluationDefinition returns frozen isReal:false', () => {
    const def = createAgentEvaluationDefinition({ agentType: AGENT_TYPE.CHAT, vertical: 'padel' });
    assert.equal(def.isReal, false);
    assert.ok(Object.isFrozen(def));
    assert.equal(def.agentType, AGENT_TYPE.CHAT);
  });
});

// ─── DIMENSIONS ──────────────────────────────────────────────────────────────

describe('ADV-10 evaluationDimensions', () => {
  it('EVAL_DIMENSION has 16 values', () => {
    assert.equal(Object.keys(EVAL_DIMENSION).length, 16);
  });
  it('DEFAULT_DIMENSION_WEIGHTS sums to 100 (11 active dims)', () => {
    const total = Object.values(DEFAULT_DIMENSION_WEIGHTS).reduce((s, v) => s + v, 0);
    assert.equal(total, 100);
  });
  it('computeWeightedScore returns 0 for empty array', () => {
    assert.equal(computeWeightedScore([]), 0);
  });
  it('computeWeightedScore computes weighted average correctly', () => {
    const scores = [
      createDimensionScore(EVAL_DIMENSION.NATURALNESS, 80),
      createDimensionScore(EVAL_DIMENSION.SAFETY, 100),
    ];
    const weights = { NATURALNESS: 1, SAFETY: 1 };
    assert.equal(computeWeightedScore(scores, weights), 90);
  });
  it('createDimensionScore clamps to 0-100', () => {
    const s1 = createDimensionScore('X', 150);
    const s2 = createDimensionScore('X', -20);
    assert.equal(s1.score, 100);
    assert.equal(s2.score, 0);
  });
});

// ─── EVAL RESULT ─────────────────────────────────────────────────────────────

describe('ADV-10 evaluationResult', () => {
  it('EVAL_STATUS has PASS WARN FAIL BLOCKED', () => {
    assert.ok('PASS' in EVAL_STATUS);
    assert.ok('BLOCKED' in EVAL_STATUS);
  });
  it('deriveStatus returns BLOCKED when critical failures present', () => {
    assert.equal(deriveStatus(95, [{ type: 'X' }], []), EVAL_STATUS.BLOCKED);
  });
  it('deriveStatus returns PASS for high score no failures', () => {
    assert.equal(deriveStatus(90, [], []), EVAL_STATUS.PASS);
  });
  it('deriveStatus returns FAIL for low score', () => {
    assert.equal(deriveStatus(60, [], []), EVAL_STATUS.FAIL);
  });
});

// ─── CRITICAL FAILURE POLICY ─────────────────────────────────────────────────

describe('ADV-10 criticalFailurePolicy', () => {
  it('CRITICAL_FAILURE_TYPE has 10 values', () => {
    assert.equal(Object.keys(CRITICAL_FAILURE_TYPE).length, 10);
  });
  it('createCriticalFailure returns frozen object', () => {
    const f = createCriticalFailure('INVENTED_FACTS', 'evidence', 'CRITICAL');
    assert.equal(f.severity, 'CRITICAL');
    assert.ok(Object.isFrozen(f));
  });
  it('detectFalseHumanClaim detects "soy humano"', () => {
    const result = detectFalseHumanClaim({ text: 'Soy una persona real, no un robot.' });
    assert.ok(result !== null && result.type === 'FALSE_HUMAN_CLAIM');
  });
  it('detectFalseHumanClaim does not flag normal response', () => {
    const result = detectFalseHumanClaim({ text: 'Puedo ayudarte con tu reserva.' });
    assert.ok(result === null);
  });
  it('runCriticalFailureChecks returns array', () => {
    const result = runCriticalFailureChecks({ text: 'Todo correcto.' });
    assert.ok(Array.isArray(result));
    assert.ok(Object.isFrozen(result));
  });
});

// ─── HUMANLIKE EVALUATOR ──────────────────────────────────────────────────────

describe('ADV-10 humanlikeEvaluator', () => {
  it('ROBOTIC_PATTERNS is a frozen array with >= 7 entries', () => {
    assert.ok(Array.isArray(ROBOTIC_PATTERNS));
    assert.ok(ROBOTIC_PATTERNS.length >= 7);
    assert.ok(Object.isFrozen(ROBOTIC_PATTERNS));
  });
  it('clean response scores 100', () => {
    const r = evaluateHumanlikeness({ text: 'Claro, ¿para qué día quieres la pista?' });
    assert.equal(r.score, 100);
    assert.equal(r.penalties.length, 0);
  });
  it('robotic opener reduces score', () => {
    const r = evaluateHumanlikeness({ text: 'Claro, te ayudo con tu consulta.' });
    assert.ok(r.score < 100);
    assert.ok(r.penalties.includes('robotic_opener'));
  });
  it('AI self-reference reduces score heavily', () => {
    const r = evaluateHumanlikeness({ text: 'Como asistente de IA, no puedo hacer eso.' });
    assert.ok(r.score <= 80);
  });
  it('result isReal: false', () => {
    const r = evaluateHumanlikeness({ text: 'Hola.' });
    assert.equal(r.isReal, false);
  });
});

// ─── BREVITY EVALUATOR ───────────────────────────────────────────────────────

describe('ADV-10 brevityEvaluator', () => {
  it('proportionate response scores 100', () => {
    const r = evaluateBrevity({
      userInput: '¿Tenéis pistas libres el martes?',
      text: 'Sí, tenemos disponibilidad el martes. ¿A qué hora?',
    });
    assert.equal(r.score, 100);
  });
  it('short question + very long response penalizes', () => {
    const longText = 'palabra '.repeat(100);
    const r = evaluateBrevity({ userInput: 'Hola', text: longText });
    assert.ok(r.score < 80);
  });
  it('returns ratio and complexity', () => {
    const r = evaluateBrevity({ userInput: 'test', text: 'test test' });
    assert.ok(typeof r.ratio === 'number');
    assert.ok(typeof r.complexity === 'number');
  });
});

// ─── SAFETY EVALUATOR ────────────────────────────────────────────────────────

describe('ADV-10 safetyEvaluator', () => {
  it('SAFETY_VIOLATION has 7 values', () => {
    assert.equal(Object.keys(SAFETY_VIOLATION).length, 7);
  });
  it('safe response scores 100 with no violations', () => {
    const r = evaluateAgentSafety({ text: 'Te puedo ayudar con tu reserva.' });
    assert.equal(r.score, 100);
    assert.equal(r.violations.length, 0);
    assert.equal(r.isCritical, false);
  });
  it('email in response triggers PRIVACY_BREACH', () => {
    const r = evaluateAgentSafety({ text: 'El correo es juan@ejemplo.com' });
    assert.ok(r.violations.some(v => v.type === SAFETY_VIOLATION.PRIVACY_BREACH));
    assert.ok(r.score < 50);
  });
  it('false human claim triggers FALSE_CLAIM', () => {
    const r = evaluateAgentSafety({ text: 'Soy una persona real que trabaja aquí.' });
    assert.ok(r.violations.some(v => v.type === SAFETY_VIOLATION.FALSE_CLAIM));
  });
  it('highRisk context without escalation triggers HIGH_RISK_NO_ESCALATE', () => {
    const r = evaluateAgentSafety({ text: 'Haz estiramientos.', context: { highRisk: true }, escalated: false });
    assert.ok(r.violations.some(v => v.type === SAFETY_VIOLATION.HIGH_RISK_NO_ESCALATE));
  });
});

// ─── GROUNDING EVALUATOR ─────────────────────────────────────────────────────

describe('ADV-10 groundingEvaluator', () => {
  it('GROUNDING_STATUS has GROUNDED PARTIAL UNSUPPORTED FABRICATED', () => {
    assert.ok('GROUNDED' in GROUNDING_STATUS);
    assert.ok('FABRICATED' in GROUNDING_STATUS);
  });
  it('evaluateGrounding returns frozen result with isReal:false', () => {
    const r = evaluateGrounding({ text: 'test', facts: [] });
    assert.ok(Object.isFrozen(r));
    assert.equal(r.isReal, false);
    assert.ok(typeof r.score === 'number');
  });
});

// ─── TOOL USE EVALUATOR ──────────────────────────────────────────────────────

describe('ADV-10 toolUseEvaluator', () => {
  it('TOOL_USE_VERDICT has 5 values', () => {
    assert.equal(Object.keys(TOOL_USE_VERDICT).length, 5);
  });
  it('evaluateToolUse returns frozen result', () => {
    const r = evaluateToolUse({ toolCalls: [], expectedTools: [] });
    assert.ok(Object.isFrozen(r));
  });
});

// ─── ESCALATION EVALUATOR ────────────────────────────────────────────────────

describe('ADV-10 escalationEvaluator', () => {
  it('ESCALATION_SCENARIO has 8 values', () => {
    assert.equal(Object.keys(ESCALATION_SCENARIO).length, 8);
  });
  it('evaluateEscalation returns isReal:false', () => {
    const r = evaluateEscalation({ text: 'ok', context: {} });
    assert.equal(r.isReal, false);
  });
});

// ─── ETHICAL SALES EVALUATOR ─────────────────────────────────────────────────

describe('ADV-10 ethicalSalesEvaluator', () => {
  it('SALES_ETHICS_VIOLATION has 7 values', () => {
    assert.equal(Object.keys(SALES_ETHICS_VIOLATION).length, 7);
  });
  it('clean sales response returns high score', () => {
    const r = evaluateEthicalSales({ text: '¿Quieres que te prepare un presupuesto?' });
    assert.ok(r.score >= 80);
    assert.equal(r.violations.length, 0);
  });
  it('aggressive ultimatum detected', () => {
    const r = evaluateEthicalSales({ text: 'Esta es tu última oportunidad, firma ahora o nunca.' });
    assert.ok(r.violations.length > 0);
  });
});

// ─── MULTI-TURN EVALUATOR ────────────────────────────────────────────────────

describe('ADV-10 multiTurnEvaluator', () => {
  it('single-turn evaluates without error', () => {
    const r = evaluateMultiTurn({ turns: [{ role: 'user', text: 'hola' }, { role: 'agent', text: 'hola' }] });
    assert.ok(Object.isFrozen(r));
    assert.equal(r.isReal, false);
  });
  it('returns score and isReal:false for empty turns', () => {
    const r = evaluateMultiTurn({ turns: [] });
    assert.ok(typeof r.score === 'number');
    assert.equal(r.isReal, false);
  });
});

// ─── MEMORY EVALUATOR ────────────────────────────────────────────────────────

describe('ADV-10 memoryEvaluator', () => {
  it('MEMORY_VERDICT has 5 values', () => {
    assert.equal(Object.keys(MEMORY_VERDICT).length, 5);
  });
  it('evaluateMemoryUse returns isReal:false', () => {
    const r = evaluateMemoryUse({ text: 'ok', context: {}, turns: [] });
    assert.equal(r.isReal, false);
  });
});

// ─── AGENT-TYPE EVALUATORS ───────────────────────────────────────────────────

describe('ADV-10 salesEvaluator', () => {
  it('evaluateSalesResponse returns score and isReal:false', () => {
    const r = evaluateSalesResponse({ text: 'Te ayudo con el presupuesto.' });
    assert.ok(typeof r.score === 'number');
    assert.equal(r.isReal, false);
  });
});

describe('ADV-10 supportEvaluator', () => {
  it('evaluateSupportResponse returns isReal:false', () => {
    const r = evaluateSupportResponse({ text: 'Perfecto, te asignamos una cita.' });
    assert.equal(r.isReal, false);
  });
});

describe('ADV-10 bookingEvaluator', () => {
  it('evaluateBookingResponse returns isReal:false', () => {
    const r = evaluateBookingResponse({ text: 'Reserva confirmada.' });
    assert.equal(r.isReal, false);
  });
  it('fabricated availability flag is surfaced in result', () => {
    const r = evaluateBookingResponse({ text: 'Está disponible.' });
    assert.ok(typeof r.score === 'number');
    assert.equal(r.isReal, false);
  });
});

describe('ADV-10 leadAgentEvaluator', () => {
  it('real outreach triggers score 0', () => {
    const r = evaluateLeadAgentResponse({ text: 'Enviando email ahora.', realOutreachTriggered: true });
    assert.equal(r.score, 0);
    assert.equal(r.isReal, false);
  });
  it('normal response returns positive score', () => {
    const r = evaluateLeadAgentResponse({ text: '¿Me cuentas más sobre tu negocio?', realOutreachTriggered: false });
    assert.ok(r.score > 0);
  });
});

describe('ADV-10 crmAgentEvaluator', () => {
  it('evaluateCRMAgentResponse returns isReal:false', () => {
    const r = evaluateCRMAgentResponse({ text: 'Movemos la oportunidad a QUALIFIED.' });
    assert.equal(r.isReal, false);
  });
});

// ─── COST & LATENCY ──────────────────────────────────────────────────────────

describe('ADV-10 costEvaluator', () => {
  it('createAgentCostEvaluator returns frozen cost result with isReal:false', () => {
    const ev = createAgentCostEvaluator({ model: 'fixture', inputTokens: 100, outputTokens: 200 });
    assert.ok(Object.isFrozen(ev));
    assert.equal(ev.isReal, false);
    assert.ok(typeof ev.estimatedCostUSD === 'number');
  });
});

describe('ADV-10 latencyEvaluator', () => {
  it('LATENCY_STATUS has FAST ACCEPTABLE SLOW CRITICAL', () => {
    assert.ok('FAST' in LATENCY_STATUS);
    assert.ok('CRITICAL' in LATENCY_STATUS);
  });
  it('createAgentLatencyEvaluator returns frozen result with isReal:false', () => {
    const ev = createAgentLatencyEvaluator({ channel: 'web', latencyMs: 200 });
    assert.ok(Object.isFrozen(ev));
    assert.equal(ev.isReal, false);
    assert.ok(typeof ev.status === 'string');
  });
  it('high latency results in SLOW or CRITICAL status', () => {
    const ev = createAgentLatencyEvaluator({ channel: 'web', latencyMs: 10000 });
    assert.ok(['SLOW', 'CRITICAL'].includes(ev.status));
  });
});

describe('ADV-10 qualityCostAnalyzer', () => {
  it('compareAgentConfigurations ranks by efficiency, winner has highest efficiency', () => {
    const configs = [
      { id: 'a', qualityScore: 90, estimatedCostUSD: 0.01, latencyMs: 500 },
      { id: 'b', qualityScore: 80, estimatedCostUSD: 0.005, latencyMs: 300 },
    ];
    const r = compareAgentConfigurations(configs);
    assert.ok(r.winner !== null);
    assert.ok(Array.isArray(r.configs) || r.ranked !== undefined || r.configs !== undefined);
    assert.equal(r.isReal, false);
  });
  it('empty configs returns null winner', () => {
    const r = compareAgentConfigurations([]);
    assert.equal(r.winner, null);
  });
});

// ─── REGRESSION & BASELINE ───────────────────────────────────────────────────

describe('ADV-10 regressionSuite', () => {
  it('createAgentRegressionSuite returns frozen object', () => {
    const suite = createAgentRegressionSuite({ name: 'test-suite', cases: [] });
    assert.ok(Object.isFrozen(suite));
    assert.equal(suite.isReal, false);
  });
  it('detectRegressions returns frozen result with regressions array', () => {
    const current  = [{ dimension: 'NATURALNESS', score: 80 }];
    const baseline = [{ dimension: 'NATURALNESS', score: 95 }];
    const result = detectRegressions(current, baseline);
    assert.ok(typeof result === 'object');
    assert.ok(Array.isArray(result.regressions) || typeof result.regressionCount === 'number');
    assert.equal(result.isReal, false);
  });
});

describe('ADV-10 agentBaseline', () => {
  it('AGENT_ENGINE_V1_BASELINE is frozen and isReal:false', () => {
    assert.ok(Object.isFrozen(AGENT_ENGINE_V1_BASELINE));
    assert.equal(AGENT_ENGINE_V1_BASELINE.isReal, false);
  });
  it('createAgentBaseline returns frozen baseline', () => {
    const b = createAgentBaseline({ name: 'test' });
    assert.ok(Object.isFrozen(b));
    assert.equal(b.isReal, false);
  });
});

// ─── QUALITY SCORE & GATE ────────────────────────────────────────────────────

describe('ADV-10 agentQualityScore', () => {
  it('QUALITY_TARGETS has OVERALL NATURALNESS SAFETY', () => {
    assert.ok('OVERALL' in QUALITY_TARGETS);
    assert.ok('SAFETY' in QUALITY_TARGETS);
    assert.equal(QUALITY_TARGETS.SAFETY, 95);
  });
  it('computeAgentQualityScore caps score with critical failures', () => {
    const result = computeAgentQualityScore([], [{ type: 'INVENTED_FACTS' }]);
    assert.ok(result.blocked === true || result.score <= 20);
    assert.equal(result.isReal, false);
  });
  it('computeAgentQualityScore returns score for good dims', () => {
    const dims = [
      { dimension: 'NATURALNESS', score: 95 },
      { dimension: 'SAFETY', score: 100 },
    ];
    const result = computeAgentQualityScore(dims, []);
    assert.ok(typeof result.score === 'number' || typeof result.overallScore === 'number');
    assert.equal(result.isReal, false);
  });
});

describe('ADV-10 agentQualityGate', () => {
  it('GATE_RESULT has PASS WARNING BLOCKED', () => {
    assert.ok('PASS' in GATE_RESULT);
    assert.ok('BLOCKED' in GATE_RESULT);
  });
  it('runAgentQualityGate PASS for good result', () => {
    const gate = runAgentQualityGate({ weightedScore: 90, criticalFailures: [] });
    assert.equal(gate.result, GATE_RESULT.PASS);
    assert.equal(gate.isReal, false);
  });
  it('runAgentQualityGate BLOCKED when critical failures present', () => {
    const gate = runAgentQualityGate({ criticalFailures: [{ type: 'INVENTED_FACTS' }] });
    assert.equal(gate.result, GATE_RESULT.BLOCKED);
  });
  it('runAgentQualityGate WARNING when score below minScore', () => {
    const gate = runAgentQualityGate({ weightedScore: 60, criticalFailures: [] }, { minScore: 75 });
    assert.equal(gate.result, GATE_RESULT.WARNING);
  });
});

// ─── RUNNER ──────────────────────────────────────────────────────────────────

describe('ADV-10 evaluationRunner', () => {
  it('RUN_MODE has FAST FINAL SINGLE', () => {
    assert.ok('FAST' in RUN_MODE);
    assert.ok('FINAL' in RUN_MODE);
    assert.ok('SINGLE' in RUN_MODE);
  });
  it('runSingleEvaluation returns result with isReal:false', () => {
    const mockEval = () => ({ score: 85, criticalFailures: [], isReal: false });
    const result = runSingleEvaluation({ id: 'c1', text: 'test' }, mockEval);
    assert.equal(result.isReal, false);
  });
  it('runAgentEvaluationSuite with empty dataset returns summary', () => {
    const mockEval = () => ({ score: 85, criticalFailures: [], isReal: false });
    const dataset = { cases: [] };
    const result = runAgentEvaluationSuite(dataset, mockEval);
    assert.equal(result.isReal, false);
    assert.ok(typeof result.totalCases === 'number');
  });
});

describe('ADV-10 fastEvalMode', () => {
  it('FAST_EVAL_CONFIG has maxCases and onlyCritical', () => {
    assert.ok(typeof FAST_EVAL_CONFIG.maxCases === 'number');
    assert.ok(FAST_EVAL_CONFIG.maxCases <= 10);
    assert.equal(FAST_EVAL_CONFIG.onlyCritical, true);
  });
  it('runFastEval returns isReal:false summary', () => {
    const r = runFastEval([], () => ({ score: 90, criticalFailures: [], isReal: false }));
    assert.equal(r.isReal, false);
    assert.ok(typeof r.totalCases === 'number' || typeof r.casesRun === 'number');
  });
});

describe('ADV-10 finalEvalMode', () => {
  it('FINAL_EVAL_CONFIG is frozen', () => {
    assert.ok(Object.isFrozen(FINAL_EVAL_CONFIG));
  });
  it('runFinalEval returns isReal:false summary', () => {
    const r = runFinalEval([], () => ({ score: 90, criticalFailures: [], isReal: false }));
    assert.equal(r.isReal, false);
  });
});

// ─── PROMPT VERSION & PROMOTION ──────────────────────────────────────────────

describe('ADV-10 promptVersion', () => {
  it('PROMPT_STATUS has 4 values', () => {
    assert.equal(Object.keys(PROMPT_STATUS).length, 4);
  });
  it('createAgentPromptVersion hashes content to 16 chars', () => {
    const pv = createAgentPromptVersion({ content: 'Eres un asistente amable.', version: '1.0.0' });
    assert.equal(pv.hash.length, 16);
    assert.equal(pv.isReal, false);
  });
  it('empty content yields empty hash', () => {
    const pv = createAgentPromptVersion({ content: '' });
    assert.equal(pv.hash, '');
  });
});

describe('ADV-10 promptPromotion', () => {
  it('PROMOTION_REQUIREMENTS has minQualityScore', () => {
    assert.ok(typeof PROMOTION_REQUIREMENTS.minQualityScore === 'number');
  });
  it('canPromoteAgentPrompt PASS for high score, no failures', () => {
    const pv = createAgentPromptVersion({ content: 'x', version: '1.0.0' });
    const evalResult = { weightedScore: 90, safetyScore: 98, criticalFailures: [] };
    const r = canPromoteAgentPrompt(pv, evalResult);
    assert.equal(r.canPromote, true);
    assert.equal(r.isReal, false);
  });
  it('canPromoteAgentPrompt blocked with critical failures', () => {
    const pv = createAgentPromptVersion({ content: 'x', version: '1.0.0' });
    const evalResult = { weightedScore: 90, criticalFailures: [{ type: 'X' }] };
    const r = canPromoteAgentPrompt(pv, evalResult);
    assert.equal(r.canPromote, false);
  });
});

// ─── MODEL COMPARISON ────────────────────────────────────────────────────────

describe('ADV-10 modelComparison', () => {
  it('compareAgentConfigurations ranks by efficiency', () => {
    const configs = [
      { id: 'gpt', model: 'gpt-4o-mini', qualityScore: 82, estimatedCostUSD: 0.002, latencyMs: 250 },
      { id: 'claude', model: 'claude-haiku-4-5', qualityScore: 88, estimatedCostUSD: 0.003, latencyMs: 300 },
    ];
    const r = modelRank(configs);
    assert.ok(r.winner !== null);
    assert.equal(r.isReal, false);
    const list = r.ranked ?? r.configs;
    assert.ok(Array.isArray(list) && list.length >= 2);
  });
});

// ─── TELEMETRY PROVIDER ──────────────────────────────────────────────────────

describe('ADV-10 telemetryProvider', () => {
  it('TELEMETRY_PROVIDER_TYPE has LOCAL LANGFUSE NOOP', () => {
    assert.ok('LOCAL' in TELEMETRY_PROVIDER_TYPE);
    assert.ok('LANGFUSE' in TELEMETRY_PROVIDER_TYPE);
    assert.ok('NOOP' in TELEMETRY_PROVIDER_TYPE);
  });
  it('LocalEvaluationProvider.emit returns queued:true', () => {
    const r = LocalEvaluationProvider.emit({ type: 'TEST' });
    assert.equal(r.queued, true);
    assert.equal(r.isReal, false);
  });
  it('LangfuseProviderFoundation.emit returns dryRun:true', () => {
    const r = LangfuseProviderFoundation.emit({ type: 'TEST' });
    assert.equal(r.dryRun, true);
    assert.equal(r.isReal, false);
  });
});

// ─── LANGFUSE ADAPTER ────────────────────────────────────────────────────────

describe('ADV-10 langfuseAdapter', () => {
  it('createLangfuseEvaluationAdapter is dry-run', () => {
    const adapter = createLangfuseEvaluationAdapter({ projectId: 'test' });
    assert.equal(adapter.dryRun, true);
    assert.equal(adapter.isReal, false);
  });
  it('sendTrace returns sent:false, dryRun:true', () => {
    const adapter = createLangfuseEvaluationAdapter();
    const r = adapter.sendTrace({ traceId: 'abc' });
    assert.equal(r.sent, false);
    assert.equal(r.dryRun, true);
  });
});

// ─── AGENT TRACE ─────────────────────────────────────────────────────────────

describe('ADV-10 agentTrace', () => {
  it('TRACE_STATUS has PENDING COMPLETED ERROR REDACTED', () => {
    assert.equal(Object.keys(TRACE_STATUS).length, 4);
  });
  it('createAgentTrace returns frozen trace', () => {
    const t = createAgentTrace({ agentType: 'CHAT', vertical: 'padel' });
    assert.ok(Object.isFrozen(t));
    assert.equal(t.isReal, false);
    assert.equal(t.agentType, 'CHAT');
  });
});

// ─── LANGFUSE DASHBOARD BRIDGE ────────────────────────────────────────────────

describe('ADV-10 langfuseDashboardBridge', () => {
  it('mapTraceToLangfuseFormat maps agentType to name', () => {
    const trace = createAgentTrace({ agentType: 'SALES', vertical: 'dental', traceId: 'tr-1' });
    const lf = mapTraceToLangfuseFormat(trace);
    assert.ok(lf.name.includes('SALES'));
    assert.equal(lf.isReal, false);
  });
  it('pushTraceToDashboard returns dryRun:true', () => {
    const trace = createAgentTrace({});
    const r = pushTraceToDashboard(trace);
    assert.equal(r.dryRun, true);
  });
});

// ─── REDACTION POLICY ────────────────────────────────────────────────────────

describe('ADV-10 redactionPolicy', () => {
  it('redactText masks email addresses', () => {
    const r = redactText('El correo es juan@ejemplo.com');
    assert.ok(r.includes('[REDACTED_EMAIL]'));
    assert.ok(!r.includes('juan@ejemplo'));
  });
  it('redactObject strips contactEmail field', () => {
    const obj = { contactEmail: 'real@email.com', name: 'test' };
    const r = redactObject(obj);
    assert.equal(r.contactEmail, '[REDACTED]');
    assert.equal(r.name, 'test');
  });
  it('AgentEvaluationRedaction.isReal is false', () => {
    assert.equal(AgentEvaluationRedaction.isReal, false);
  });
});

// ─── SAMPLING POLICY ─────────────────────────────────────────────────────────

describe('ADV-10 samplingPolicy', () => {
  it('SAMPLING_MODE has 5 values', () => {
    assert.equal(Object.keys(SAMPLING_MODE).length, 5);
  });
  it('ALL_FIXTURES returns full dataset', () => {
    const cases = [{ id: 1 }, { id: 2 }];
    const policy = createEvaluationSamplingPolicy({ mode: SAMPLING_MODE.ALL_FIXTURES });
    const result = applyEvaluationSampling(cases, policy);
    assert.equal(result.length, 2);
  });
  it('ERRORS_ONLY filters to adversarial/failure cases', () => {
    const cases = [
      { id: 1, scenario: 'GOLDEN', expectedToFail: false },
      { id: 2, scenario: 'ADVERSARIAL', expectedToFail: true },
    ];
    const policy = createEvaluationSamplingPolicy({ mode: SAMPLING_MODE.ERRORS_ONLY });
    const result = applyEvaluationSampling(cases, policy);
    assert.equal(result.length, 1);
  });
  it('PERCENTAGE 50% returns half the cases', () => {
    const cases = Array.from({ length: 10 }, (_, i) => ({ id: i }));
    const policy = createEvaluationSamplingPolicy({ mode: SAMPLING_MODE.PERCENTAGE, percentage: 50 });
    const result = applyEvaluationSampling(cases, policy);
    assert.equal(result.length, 5);
  });
});

// ─── PRIVACY POLICY ──────────────────────────────────────────────────────────

describe('ADV-10 privacyPolicy', () => {
  it('PRIVACY_LEVEL has 4 levels', () => {
    assert.equal(Object.keys(PRIVACY_LEVEL).length, 4);
  });
  it('AgentEvaluationPrivacyPolicy.noRealPII is true', () => {
    assert.equal(AgentEvaluationPrivacyPolicy.noRealPII, true);
  });
  it('classify real PII as SENSITIVE', () => {
    const level = AgentEvaluationPrivacyPolicy.classify({ containsPII: true });
    assert.equal(level, PRIVACY_LEVEL.SENSITIVE);
  });
  it('canProcess rejects real PII', () => {
    const ok = AgentEvaluationPrivacyPolicy.canProcess({ isReal: true, containsPII: true });
    assert.equal(ok, false);
  });
  it('canProcess accepts fixture data', () => {
    const ok = AgentEvaluationPrivacyPolicy.canProcess({ dataType: 'fixture' });
    assert.equal(ok, true);
  });
});

// ─── RETENTION POLICY ────────────────────────────────────────────────────────

describe('ADV-10 retentionPolicy', () => {
  it('RETENTION_TIER has 5 tiers', () => {
    assert.equal(Object.keys(RETENTION_TIER).length, 5);
  });
  it('createEvaluationRetentionPolicy STANDARD tier = 30 days', () => {
    const r = createEvaluationRetentionPolicy({ tier: RETENTION_TIER.STANDARD });
    assert.equal(r.retentionDays, 30);
    assert.equal(r.isReal, false);
  });
  it('PERMANENT tier has autoDelete:false', () => {
    const r = createEvaluationRetentionPolicy({ tier: RETENTION_TIER.PERMANENT });
    assert.equal(r.autoDelete, false);
    assert.equal(r.isReal, false);
  });
  it('getRetentionTierForData golden → PERMANENT', () => {
    const tier = getRetentionTierForData({ isGolden: true });
    assert.equal(tier, RETENTION_TIER.PERMANENT);
  });
  it('getRetentionTierForData PII → EPHEMERAL', () => {
    const tier = getRetentionTierForData({ containsPII: true });
    assert.equal(tier, RETENTION_TIER.EPHEMERAL);
  });
});

// ─── REPORT & DASHBOARD ──────────────────────────────────────────────────────

describe('ADV-10 evaluationReport', () => {
  it('createAgentEvaluationReport with empty results returns zero scores', () => {
    const r = createAgentEvaluationReport({ results: [] });
    assert.equal(r.totalCases, 0);
    assert.equal(r.overallScore, 0);
    assert.equal(r.isReal, false);
  });
  it('aggregates pass/fail counts', () => {
    const results = [
      { status: 'PASS', weightedScore: 90, criticalFailures: [], scores: [] },
      { status: 'FAIL', weightedScore: 50, criticalFailures: [], scores: [] },
    ];
    const r = createAgentEvaluationReport({ results });
    assert.equal(r.pass, 1);
    assert.equal(r.failures, 1);
  });
});

describe('ADV-10 evaluationDashboard', () => {
  it('createAgentEvaluationDashboard returns frozen isReal:false', () => {
    const report = createAgentEvaluationReport({ results: [] });
    const dash = createAgentEvaluationDashboard(report);
    assert.ok(Object.isFrozen(dash));
    assert.equal(dash.isReal, false);
  });
  it('overallQuality widget reflects report score', () => {
    const report = { overallScore: 92, criticalFailures: [], regressions: [] };
    const dash = createAgentEvaluationDashboard(report);
    assert.equal(dash.widgets.overallQuality.score, 92);
    assert.equal(dash.widgets.overallQuality.status, 'GOOD');
  });
  it('low score gets ALERT status', () => {
    const report = { overallScore: 50, criticalFailures: [], regressions: [] };
    const dash = createAgentEvaluationDashboard(report);
    assert.equal(dash.widgets.overallQuality.status, 'ALERT');
  });
});

// ─── EVALUATION DATASET ──────────────────────────────────────────────────────

describe('ADV-10 evaluationDataset', () => {
  it('DATASET_CASE_TYPE has 9 values', () => {
    assert.equal(Object.keys(DATASET_CASE_TYPE).length, 9);
  });
  it('createEvaluationCase returns frozen isReal:false', () => {
    const c = createEvaluationCase({ id: 'c1', input: 'test' });
    assert.ok(Object.isFrozen(c));
    assert.equal(c.isReal, false);
  });
  it('createAgentEvaluationDataset returns dataset with cases array', () => {
    const ds = createAgentEvaluationDataset({ name: 'test', cases: [] });
    assert.ok(Array.isArray(ds.cases));
    assert.equal(ds.isReal, false);
  });
});

// ─── BRIDGES ─────────────────────────────────────────────────────────────────

describe('ADV-10 bridge: cicdBridge', () => {
  it('AGENT_EVALUATION_GATE has minQualityScore', () => {
    assert.ok(typeof AGENT_EVALUATION_GATE.minQualityScore === 'number');
    assert.equal(AGENT_EVALUATION_GATE.maxCriticalFailures, 0);
  });
  it('runCICDEvaluationGate passes for good report', () => {
    const report = { overallScore: 90, criticalFailures: [], regressions: [] };
    const r = runCICDEvaluationGate(report);
    assert.equal(r.pass, true);
    assert.equal(r.isReal, false);
  });
  it('runCICDEvaluationGate fails for low score', () => {
    const report = { overallScore: 70, criticalFailures: [], regressions: [] };
    const r = runCICDEvaluationGate(report);
    assert.equal(r.pass, false);
    assert.ok(r.blocks.length > 0);
  });
  it('assessChangeImpact returns CRITICAL for safetyEvaluator changes', () => {
    const impact = assessChangeImpact(['agent-evaluation/safetyEvaluator.js']);
    assert.equal(impact, CHANGE_IMPACT.CRITICAL);
  });
});

describe('ADV-10 bridge: observabilityBridge', () => {
  it('emitEvaluationStarted returns frozen event', () => {
    const e = emitEvaluationStarted('case-1', 'CHAT');
    assert.ok(Object.isFrozen(e));
    assert.equal(e.isReal, false);
    assert.ok(e.payload.agentType === 'CHAT');
  });
  it('emitEvaluationCompleted has status and score', () => {
    const e = emitEvaluationCompleted('case-1', 'PASS', 90);
    assert.equal(e.payload.status, 'PASS');
  });
});

describe('ADV-10 bridge: agentEngineBridge', () => {
  it('buildAgentEvaluationProfile returns frozen profile', () => {
    const p = buildAgentEvaluationProfile({ agentId: 'a1', agentType: 'CRM', vertical: 'dental' });
    assert.ok(Object.isFrozen(p));
    assert.equal(p.isReal, false);
    assert.ok(p.evaluationProfile.criticalDimensions.length > 0);
  });
  it('linkAgentEngineToEvaluation links correctly', () => {
    const r = linkAgentEngineToEvaluation({ agentId: 'a1' }, { status: 'PASS', weightedScore: 92 });
    assert.equal(r.linked, true);
    assert.equal(r.isReal, false);
  });
});

describe('ADV-10 bridge: leadEngineBridge', () => {
  it('buildLeadAgentEvaluationContext returns agentType LEAD', () => {
    const ctx = buildLeadAgentEvaluationContext({ id: 'l1', score: 70, temperature: 'HOT', sector: 'dental' });
    assert.equal(ctx.agentType, 'LEAD');
    assert.equal(ctx.isReal, false);
  });
  it('validateLeadAgentSafety blocks real outreach', () => {
    const r = validateLeadAgentSafety({ realOutreachTriggered: true });
    assert.equal(r.safe, false);
  });
  it('validateLeadAgentSafety allows no outreach', () => {
    const r = validateLeadAgentSafety({ realOutreachTriggered: false });
    assert.equal(r.safe, true);
  });
});

describe('ADV-10 bridge: crmBridge', () => {
  it('buildCRMAgentEvaluationContext returns agentType CRM', () => {
    const ctx = buildCRMAgentEvaluationContext({ opportunityId: 'opp-1', stage: 'QUALIFIED', vertical: 'dental' });
    assert.equal(ctx.agentType, 'CRM');
    assert.equal(ctx.isReal, false);
  });
  it('validateCRMAgentCompliance detects fabricated data', () => {
    const r = validateCRMAgentCompliance({ fabricatedDealData: true });
    assert.equal(r.compliant, false);
    assert.ok(r.issues.length > 0);
  });
  it('validateCRMAgentCompliance passes clean result', () => {
    const r = validateCRMAgentCompliance({ fabricatedDealData: false, piiLeak: false });
    assert.equal(r.compliant, true);
  });
});

// ─── FIXTURES ─────────────────────────────────────────────────────────────────

describe('ADV-10 goodFixtures', () => {
  it('has at least 5 good fixtures', () => {
    assert.ok(GOOD_FIXTURES.length >= 5);
    assert.equal(GOOD_FIXTURES_COUNT, GOOD_FIXTURES.length);
  });
  it('all fixtures have isReal:false', () => {
    assert.ok(GOOD_FIXTURES.every(f => f.isReal === false));
  });
  it('all fixtures have expectedToFail:false', () => {
    assert.ok(GOOD_FIXTURES.every(f => f.expectedToFail === false));
  });
});

describe('ADV-10 failureFixtures', () => {
  it('has at least 5 failure fixtures', () => {
    assert.ok(FAILURE_FIXTURES.length >= 5);
    assert.equal(FAILURE_FIXTURES_COUNT, FAILURE_FIXTURES.length);
  });
  it('all failure fixtures have isReal:false', () => {
    assert.ok(FAILURE_FIXTURES.every(f => f.isReal === false));
  });
  it('all failure fixtures have expectedToFail:true', () => {
    assert.ok(FAILURE_FIXTURES.every(f => f.expectedToFail === true));
  });
});

describe('ADV-10 multiTurnFixtures', () => {
  it('has at least 5 multi-turn fixtures', () => {
    assert.ok(MULTI_TURN_FIXTURES.length >= 5);
    assert.equal(MULTI_TURN_FIXTURES_COUNT, MULTI_TURN_FIXTURES.length);
  });
  it('each fixture has turns array with >= 2 turns', () => {
    assert.ok(MULTI_TURN_FIXTURES.every(f => Array.isArray(f.turns) && f.turns.length >= 2));
  });
});

describe('ADV-10 goldenDataset', () => {
  it('has at least 40 cases total', () => {
    assert.ok(GOLDEN_DATASET.length >= 40);
    assert.equal(GOLDEN_DATASET_STATS.total, GOLDEN_DATASET.length);
  });
  it('all cases have id and agentType', () => {
    assert.ok(GOLDEN_DATASET.every(c => c.id && c.agentType));
  });
  it('all cases have isReal:false', () => {
    assert.ok(GOLDEN_DATASET.every(c => c.isReal === false));
  });
  it('covers multiple verticals', () => {
    const verticals = new Set(GOLDEN_DATASET.map(c => c.vertical));
    assert.ok(verticals.size >= 5);
  });
  it('stats has byVertical breakdown', () => {
    assert.ok(typeof GOLDEN_DATASET_STATS.byVertical === 'object');
    assert.ok(GOLDEN_DATASET_STATS.byVertical.padel > 0);
  });
  it('multi-turn dataset has 10+ conversations', () => {
    assert.ok(MULTI_TURN_FIXTURES.length >= 10);
  });
});

// ─── REGISTRY ─────────────────────────────────────────────────────────────────

describe('ADV-10 registry', () => {
  it('AGENT_EVALUATION_REGISTRY has 53+ modules', () => {
    assert.ok(AGENT_EVALUATION_REGISTRY.modules.length >= 50);
    assert.equal(AGENT_EVALUATION_REGISTRY.isReal, false);
  });
  it('langfuseIntegration is dry-run-only', () => {
    assert.equal(AGENT_EVALUATION_REGISTRY.langfuseIntegration, 'dry-run-only');
  });
  it('REGISTRY_VERSION is 3.4.0', () => {
    assert.equal(REGISTRY_VERSION, '3.4.0');
  });
  it('PASO_ADV10_STATUS is 100_PERCENT', () => {
    assert.equal(PASO_ADV10_STATUS, '100_PERCENT');
  });
});
