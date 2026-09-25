// Lead Qualification — ADV-03
// Score determinista: no ML, no LLM. Señales observables.

export const LEAD_TEMPERATURE = Object.freeze({
  HOT:         'HOT',
  WARM:        'WARM',
  COLD:        'COLD',
  UNQUALIFIED: 'UNQUALIFIED',
});

export const QUALIFICATION_ACTION = Object.freeze({
  BOOK_NOW:       'BOOK_NOW',
  NURTURE:        'NURTURE',
  EDUCATE:        'EDUCATE',
  QUALIFY_DEEPER: 'QUALIFY_DEEPER',
  DISQUALIFY:     'DISQUALIFY',
});

const TEMPERATURE_THRESHOLDS = Object.freeze({
  HOT:  70,
  WARM: 40,
  COLD: 20,
});

/**
 * Qualify a lead from observable conversation signals.
 *
 * params: {
 *   intent:            string
 *   turnCount:         number
 *   explicitBudget:    boolean
 *   priceAsked:        boolean
 *   bookingRequested:  boolean
 *   hasObjection:      boolean
 *   questionCount:     number
 *   engagementDepth:   'LOW' | 'MEDIUM' | 'HIGH'
 *   decisionMakerHint: boolean
 * }
 */
export function qualifyLead(params = {}) {
  const {
    intent            = 'UNKNOWN',
    turnCount         = 0,
    explicitBudget    = false,
    priceAsked        = false,
    bookingRequested  = false,
    hasObjection      = false,
    questionCount     = 0,
    engagementDepth   = 'LOW',
    decisionMakerHint = false,
  } = params;

  const fitScore        = scoreFit(intent, engagementDepth, questionCount);
  const intentScore     = scoreIntent(intent, bookingRequested, priceAsked);
  const urgencyScore    = scoreUrgency(intent, turnCount, bookingRequested);
  const budgetSignal    = scoreBudget(explicitBudget, priceAsked);
  const decisionMakerSignal = decisionMakerHint ? 25 : 5;
  const engagementScore = scoreEngagement(turnCount, questionCount, engagementDepth);
  const objectionPenalty = hasObjection ? -10 : 0;

  const totalScore = Math.max(0, Math.min(100,
    Math.round(
      fitScore * 0.2 +
      intentScore * 0.25 +
      urgencyScore * 0.15 +
      budgetSignal * 0.15 +
      decisionMakerSignal * 0.1 +
      engagementScore * 0.15 +
      objectionPenalty
    )
  ));

  const temperature  = resolveTemperature(totalScore);
  const recommendedAction = resolveAction(temperature, hasObjection, intent);

  return Object.freeze({
    fitScore,
    intentScore,
    urgencyScore,
    budgetSignal,
    decisionMakerSignal,
    engagementScore,
    totalScore,
    temperature,
    recommendedAction,
    isReal:  false,
    version: '1.0.0',
  });
}

function scoreFit(intent, engagementDepth, questionCount) {
  let score = 30;
  if (intent !== 'UNKNOWN') score += 20;
  if (engagementDepth === 'HIGH')   score += 30;
  if (engagementDepth === 'MEDIUM') score += 15;
  if (questionCount >= 3)           score += 20;
  return Math.min(100, score);
}

function scoreIntent(intent, bookingRequested, priceAsked) {
  if (bookingRequested)              return 90;
  if (intent === 'PURCHASE_INTENT')  return 85;
  if (priceAsked)                    return 65;
  if (intent === 'AVAILABILITY')     return 60;
  if (intent === 'INFORMATION')      return 35;
  return 15;
}

function scoreUrgency(intent, turnCount, bookingRequested) {
  if (bookingRequested && turnCount <= 3) return 90;
  if (intent === 'BOOKING')               return 75;
  if (turnCount >= 5)                     return 50;
  if (turnCount >= 2)                     return 30;
  return 10;
}

function scoreBudget(explicitBudget, priceAsked) {
  if (explicitBudget) return 80;
  if (priceAsked)     return 50;
  return 20;
}

function scoreEngagement(turnCount, questionCount, depth) {
  let score = 0;
  if (turnCount >= 4)    score += 30;
  else if (turnCount >= 2) score += 15;
  if (questionCount >= 2)  score += 30;
  if (depth === 'HIGH')    score += 40;
  if (depth === 'MEDIUM')  score += 20;
  return Math.min(100, score);
}

function resolveTemperature(score) {
  if (score >= TEMPERATURE_THRESHOLDS.HOT)  return LEAD_TEMPERATURE.HOT;
  if (score >= TEMPERATURE_THRESHOLDS.WARM) return LEAD_TEMPERATURE.WARM;
  if (score >= TEMPERATURE_THRESHOLDS.COLD) return LEAD_TEMPERATURE.COLD;
  return LEAD_TEMPERATURE.UNQUALIFIED;
}

function resolveAction(temperature, hasObjection, intent) {
  if (intent === 'CANCELLATION')           return QUALIFICATION_ACTION.DISQUALIFY;
  if (temperature === LEAD_TEMPERATURE.HOT && !hasObjection) return QUALIFICATION_ACTION.BOOK_NOW;
  if (temperature === LEAD_TEMPERATURE.WARM && hasObjection) return QUALIFICATION_ACTION.QUALIFY_DEEPER;
  if (temperature === LEAD_TEMPERATURE.WARM)                 return QUALIFICATION_ACTION.NURTURE;
  if (temperature === LEAD_TEMPERATURE.COLD)                 return QUALIFICATION_ACTION.EDUCATE;
  return QUALIFICATION_ACTION.QUALIFY_DEEPER;
}

export const LEAD_QUALIFICATION_VERSION = '1.0.0';
