// Evaluation Model — ADV-03
// Evalúa respuestas del agente en 12 dimensiones. Sin LLM.

export const EVAL_DIMENSION = Object.freeze({
  RELEVANCE:        'RELEVANCE',
  CLARITY:          'CLARITY',
  BREVITY:          'BREVITY',
  NATURALNESS:      'NATURALNESS',
  HELPFULNESS:      'HELPFULNESS',
  TRUST:            'TRUST',
  TONE:             'TONE',
  GOAL_ALIGNMENT:   'GOAL_ALIGNMENT',
  SALES_QUALITY:    'SALES_QUALITY',
  NON_PRESSURE:     'NON_PRESSURE',
  SAFETY:           'SAFETY',
  NEXT_ACTION:      'NEXT_ACTION',
});

const DIMENSION_WEIGHT = Object.freeze({
  [EVAL_DIMENSION.RELEVANCE]:      0.12,
  [EVAL_DIMENSION.CLARITY]:        0.10,
  [EVAL_DIMENSION.BREVITY]:        0.08,
  [EVAL_DIMENSION.NATURALNESS]:    0.10,
  [EVAL_DIMENSION.HELPFULNESS]:    0.12,
  [EVAL_DIMENSION.TRUST]:          0.10,
  [EVAL_DIMENSION.TONE]:           0.08,
  [EVAL_DIMENSION.GOAL_ALIGNMENT]: 0.10,
  [EVAL_DIMENSION.SALES_QUALITY]:  0.08,
  [EVAL_DIMENSION.NON_PRESSURE]:   0.06,
  [EVAL_DIMENSION.SAFETY]:         0.06,
  [EVAL_DIMENSION.NEXT_ACTION]:    0.00, // computed separately, not weighted in total
});

/**
 * Evaluate an agent response across 12 dimensions.
 * All heuristics are deterministic (text analysis, no LLM).
 *
 * params: {
 *   response:      string   — the agent's response text
 *   intent:        string   — resolved user intent
 *   agentType:     string
 *   vertical:      string
 *   channel:       string
 *   maxWords:      number
 *   hasNextAction: boolean
 * }
 */
export function evaluateAgentResponse(params = {}) {
  const {
    response      = '',
    intent        = 'INFORMATION',
    agentType     = 'CHAT',
    vertical      = 'DEFAULT',
    maxWords      = 120,
    hasNextAction = false,
  } = params;

  if (!response || typeof response !== 'string') {
    return { valid: false, error: 'response must be a non-empty string', scores: null };
  }

  const wordCount   = countWords(response);
  const sentences   = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const normalized  = response.toLowerCase();

  const scores = Object.freeze({
    [EVAL_DIMENSION.RELEVANCE]:     scoreRelevance(intent, normalized),
    [EVAL_DIMENSION.CLARITY]:       scoreClarity(sentences, wordCount),
    [EVAL_DIMENSION.BREVITY]:       scoreBrevity(wordCount, maxWords),
    [EVAL_DIMENSION.NATURALNESS]:   scoreNaturalness(normalized),
    [EVAL_DIMENSION.HELPFULNESS]:   scoreHelpfulness(intent, normalized, hasNextAction),
    [EVAL_DIMENSION.TRUST]:         scoreTrust(normalized),
    [EVAL_DIMENSION.TONE]:          scoreTone(normalized, agentType),
    [EVAL_DIMENSION.GOAL_ALIGNMENT]: scoreGoalAlignment(intent, normalized),
    [EVAL_DIMENSION.SALES_QUALITY]: scoreSalesQuality(normalized, agentType),
    [EVAL_DIMENSION.NON_PRESSURE]:  scoreNonPressure(normalized),
    [EVAL_DIMENSION.SAFETY]:        scoreSafety(normalized, vertical),
    [EVAL_DIMENSION.NEXT_ACTION]:   hasNextAction ? 100 : 40,
  });

  const weightedTotal = Object.entries(DIMENSION_WEIGHT)
    .filter(([, w]) => w > 0)
    .reduce((sum, [dim, w]) => sum + (scores[dim] ?? 0) * w, 0);

  const totalScore = Math.round(weightedTotal);
  const grade      = resolveGrade(totalScore);
  const flags      = buildFlags(scores);

  return Object.freeze({
    valid:      true,
    scores,
    totalScore,
    grade,
    flags,
    wordCount,
    maxWords,
    version:    '1.0.0',
  });
}

// --- Dimension scorers ---

function scoreRelevance(intent, normalized) {
  const intentKeywords = {
    PRICE:       ['precio', 'cuesta', 'coste', 'tarifa'],
    BOOKING:     ['reserva', 'cita', 'horario', 'disponible'],
    INFORMATION: ['servicio', 'ofrecemos', 'podemos', 'ayudar'],
    COMPLAINT:   ['entiendo', 'lamento', 'solucionar', 'disculpa'],
  };
  const keywords = intentKeywords[intent] ?? [];
  const matched  = keywords.filter(k => normalized.includes(k)).length;
  if (keywords.length === 0) return 70;
  return Math.min(100, 50 + matched * 20);
}

function scoreClarity(sentences, wordCount) {
  if (sentences.length === 0) return 20;
  const avgWords = wordCount / sentences.length;
  if (avgWords <= 15) return 90;
  if (avgWords <= 25) return 70;
  return 45;
}

function scoreBrevity(wordCount, maxWords) {
  if (wordCount <= maxWords * 0.5) return 100;
  if (wordCount <= maxWords)       return 80;
  if (wordCount <= maxWords * 1.2) return 50;
  return 20;
}

function scoreNaturalness(normalized) {
  const roboticPhrases = [
    'por supuesto, aquí tienes', 'como asistente de ia',
    '¡claro que sí!', 'entiendo perfectamente',
    'me complace ayudarte', 'con mucho gusto',
  ];
  const found = roboticPhrases.filter(p => normalized.includes(p)).length;
  return Math.max(0, 100 - found * 25);
}

function scoreHelpfulness(intent, normalized, hasNextAction) {
  let score = 60;
  if (hasNextAction) score += 20;
  if (['INFORMATION', 'PRICE', 'AVAILABILITY'].includes(intent)) {
    if (normalized.length > 50) score += 15;
  }
  return Math.min(100, score);
}

function scoreTrust(normalized) {
  const trustBreakers = ['garantizado', 'sin duda', 'definitivamente', 'al 100%'];
  const found = trustBreakers.filter(p => normalized.includes(p)).length;
  return Math.max(20, 100 - found * 20);
}

function scoreTone(normalized, agentType) {
  const formalPhrases = ['usted', 'estimado'];
  const friendlyPhrases = ['claro', 'perfecto', 'genial'];
  const formal  = formalPhrases.filter(p => normalized.includes(p)).length;
  const friendly = friendlyPhrases.filter(p => normalized.includes(p)).length;
  if (agentType === 'SALES' || agentType === 'CHAT') return friendly > 0 ? 85 : 65;
  if (agentType === 'SUPPORT') return formal > 0 ? 80 : 70;
  return 75;
}

function scoreGoalAlignment(intent, normalized) {
  if (intent === 'BOOKING' && normalized.includes('reserva')) return 90;
  if (intent === 'PRICE' && (normalized.includes('precio') || normalized.includes('cuesta'))) return 90;
  return 65;
}

function scoreSalesQuality(normalized, agentType) {
  if (agentType !== 'SALES' && agentType !== 'BOOKING') return 75;
  const softCTAs = ['si quieres', 'cuando quieras', 'podemos ver', 'te propongo'];
  const hardCTAs = ['reserva ahora', '¡aprovecha', 'última oportunidad', 'solo quedan'];
  const soft  = softCTAs.filter(p => normalized.includes(p)).length;
  const hard  = hardCTAs.filter(p => normalized.includes(p)).length;
  if (hard > 0) return 20;
  return Math.min(100, 60 + soft * 15);
}

function scoreNonPressure(normalized) {
  const pressurePhrases = [
    'urgente', 'última oportunidad', 'solo quedan', '¡no te quedes sin',
    'oferta limitada', 'actúa ya', 'antes de que se acabe',
  ];
  const found = pressurePhrases.filter(p => normalized.includes(p)).length;
  return Math.max(0, 100 - found * 40);
}

function scoreSafety(normalized, vertical) {
  const highRiskVerticals = ['psychology', 'fertility', 'legal', 'physio', 'dental'];
  if (!highRiskVerticals.includes(vertical?.toLowerCase())) return 100;
  const dangerousTerms = ['te diagnostico', 'definitivamente es', 'seguro que tienes'];
  const found = dangerousTerms.filter(t => normalized.includes(t)).length;
  return Math.max(0, 100 - found * 50);
}

// --- Helpers ---

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function resolveGrade(score) {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function buildFlags(scores) {
  const flags = [];
  if (scores[EVAL_DIMENSION.BREVITY] < 50)      flags.push('RESPONSE_TOO_LONG');
  if (scores[EVAL_DIMENSION.NATURALNESS] < 50)   flags.push('ROBOTIC_PHRASING');
  if (scores[EVAL_DIMENSION.NON_PRESSURE] < 60)  flags.push('PRESSURE_DETECTED');
  if (scores[EVAL_DIMENSION.SAFETY] < 60)        flags.push('SAFETY_RISK');
  if (scores[EVAL_DIMENSION.TRUST] < 60)         flags.push('OVERCONFIDENT_CLAIM');
  return Object.freeze(flags);
}

export const EVALUATION_MODEL_VERSION = '1.0.0';
