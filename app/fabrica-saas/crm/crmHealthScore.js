// CRM Health Score — ADV-09 CRM

export const HEALTH_BAND = Object.freeze({
  EXCELLENT: 'EXCELLENT',
  GOOD:      'GOOD',
  FAIR:      'FAIR',
  AT_RISK:   'AT_RISK',
  CRITICAL:  'CRITICAL',
});

export function computeOpportunityHealthScore(opportunity = {}) {
  let score = 100;
  const issues = [];

  // Data quality
  const dq = opportunity.dataQualityScore ?? 50;
  if (dq < 40) { score -= 20; issues.push('Low data quality'); }
  else if (dq < 60) { score -= 10; issues.push('Moderate data quality'); }

  // Staleness
  const staleStatus = opportunity.staleStatus;
  if (staleStatus === 'CRITICAL_STALE') { score -= 25; issues.push('Critically stale — no activity'); }
  else if (staleStatus === 'STALE') { score -= 15; issues.push('Stale opportunity'); }
  else if (staleStatus === 'AGING') { score -= 5; }

  // Qualification
  const qualScore = opportunity.qualificationScore ?? 0;
  if (qualScore < 30) { score -= 15; issues.push('Poorly qualified'); }
  else if (qualScore < 55) { score -= 8; }

  // Activity
  const daysSinceActivity = opportunity.daysSinceActivity ?? 999;
  if (daysSinceActivity > 30) { score -= 10; issues.push('No recent activity'); }

  // Next action
  if (!opportunity.nextAction) { score -= 10; issues.push('No next action defined'); }

  score = Math.max(0, score);
  let band;
  if (score >= 85)      band = HEALTH_BAND.EXCELLENT;
  else if (score >= 70) band = HEALTH_BAND.GOOD;
  else if (score >= 50) band = HEALTH_BAND.FAIR;
  else if (score >= 30) band = HEALTH_BAND.AT_RISK;
  else                  band = HEALTH_BAND.CRITICAL;

  return Object.freeze({ score, band, issues: Object.freeze(issues), isReal: false });
}

export const CRM_HEALTH_SCORE_VERSION = '1.0.0';
