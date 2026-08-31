/**
 * Qualification Engine
 * Deterministic scoring — no LLM. Returns QUALIFIED / NEEDS_MORE_INFO / HUMAN_REVIEW / NOT_A_FIT.
 */

export const QUALIFICATION_ENGINE_VERSION = '1.0.0';

export const QUALIFICATION_DECISIONS = Object.freeze({
  QUALIFIED:      'QUALIFIED',
  NEEDS_MORE_INFO:'NEEDS_MORE_INFO',
  HUMAN_REVIEW:   'HUMAN_REVIEW',
  NOT_A_FIT:      'NOT_A_FIT',
});

const BUDGET_RANGES = Object.freeze({
  'less_than_500':   0,
  '500_to_1000':     1,
  '1000_to_2500':    2,
  '2500_to_5000':    3,
  '5000_to_10000':   4,
  'more_than_10000': 5,
  'unknown':         1,
});

const TIMELINE_FIT = Object.freeze({
  'less_than_2_weeks':  0,
  '2_to_4_weeks':       1,
  '1_to_2_months':      2,
  '2_to_4_months':      3,
  'more_than_4_months': 3,
  'flexible':           3,
  'unknown':            2,
});

/**
 * @param {Object} onboarding - validated onboarding data (from validateOnboarding)
 * @returns {Object} QualificationResult
 */
export function qualifyLead(onboarding = {}) {
  const data     = onboarding.data ?? onboarding;
  const missing  = onboarding.missingRequired ?? [];
  const warnings = [];
  const flags    = [];

  // --- Fit Scores ---
  let fitScore       = 0;
  let complexityScore = 0;
  let riskScore      = 0;
  let missingCriticalInfo = false;

  // 1. Budget fit
  const budgetKey    = data.budgetRange ?? 'unknown';
  const budgetFit    = BUDGET_RANGES[budgetKey] ?? 1;
  fitScore += budgetFit >= 2 ? 2 : budgetFit === 1 ? 1 : 0;
  if (budgetFit === 0) {
    flags.push('budget_too_low');
    warnings.push('Budget declared is below minimum viable project threshold (€1.000)');
  }

  // 2. Timeline fit
  const timelineKey = data.desiredTimeline ?? 'unknown';
  const timelineFit = TIMELINE_FIT[timelineKey] ?? 2;
  fitScore += timelineFit >= 2 ? 2 : timelineFit === 1 ? 1 : 0;
  if (timelineFit === 0) {
    flags.push('timeline_unrealistic');
    warnings.push('Desired timeline is unrealistic for any package tier');
  }

  // 3. Decision maker present
  const hasDecisionMaker = !!data.decisionMaker;
  if (!hasDecisionMaker) {
    flags.push('missing_decision_maker');
    warnings.push('Decision maker not identified — cannot close proposal');
    missingCriticalInfo = true;
  } else {
    fitScore += 1;
  }

  // 4. Business goals defined
  const hasGoals = Array.isArray(data.businessGoals)
    ? data.businessGoals.length > 0
    : !!data.businessGoals;
  if (!hasGoals) {
    flags.push('missing_business_goals');
    warnings.push('Business goals not defined — qualification incomplete');
    missingCriticalInfo = true;
  } else {
    fitScore += 2;
  }

  // 5. Sector known
  const sector = data.sector ?? data._inferredSector ?? null;
  if (!sector) {
    flags.push('unknown_sector');
    warnings.push('Sector unknown — cannot apply vertical pricing or compliance rules');
  } else {
    fitScore += 1;
  }

  // 6. Technical fit — complex integrations with no budget
  const hasComplexIntegrations = (data.integrationNeeds ?? []).length > 3;
  if (hasComplexIntegrations && budgetFit < 3) {
    flags.push('integration_budget_mismatch');
    warnings.push('Complex integrations requested but budget is low');
    complexityScore += 2;
    riskScore += 1;
  }

  // 7. Privacy/legal risk
  const legalConstraints = data.legalConstraints ?? {};
  if (legalConstraints.healthData || legalConstraints.sensitiveData) {
    riskScore += 2;
    flags.push('high_privacy_risk');
    warnings.push('Health/sensitive data handling requires compliance review');
  }
  if (legalConstraints.minorsPolicy) {
    riskScore += 1;
    flags.push('minors_policy_required');
  }

  // 8. Missing required fields
  if (missing.length > 2) {
    missingCriticalInfo = true;
    flags.push('too_many_missing_fields');
  }

  // 9. Strategic fit — we work with this type of business?
  const strategicFit = sector ? 1 : 0;

  // --- Decision ---
  let decision;
  const totalFit = fitScore;

  if (flags.includes('budget_too_low') && budgetFit === 0) {
    decision = QUALIFICATION_DECISIONS.NOT_A_FIT;
  } else if (flags.includes('timeline_unrealistic') && timelineFit === 0) {
    decision = QUALIFICATION_DECISIONS.NOT_A_FIT;
  } else if (missingCriticalInfo) {
    decision = QUALIFICATION_DECISIONS.NEEDS_MORE_INFO;
  } else if (riskScore >= 3 || flags.includes('high_privacy_risk')) {
    decision = QUALIFICATION_DECISIONS.HUMAN_REVIEW;
  } else if (totalFit >= 6) {
    decision = QUALIFICATION_DECISIONS.QUALIFIED;
  } else if (totalFit >= 3) {
    decision = QUALIFICATION_DECISIONS.QUALIFIED;
  } else {
    decision = QUALIFICATION_DECISIONS.NEEDS_MORE_INFO;
  }

  return {
    decision,
    fitScore,
    complexityScore,
    budgetFit,
    timelineFit,
    technicalFit:   hasComplexIntegrations ? 'COMPLEX' : 'STANDARD',
    riskScore,
    strategicFit,
    missingCriticalInfo,
    flags,
    warnings,
    humanReviewRequired: decision === QUALIFICATION_DECISIONS.HUMAN_REVIEW || riskScore >= 3,
    version: QUALIFICATION_ENGINE_VERSION,
  };
}
