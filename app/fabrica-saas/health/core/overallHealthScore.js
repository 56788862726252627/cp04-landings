// Overall Health Score — ADV-20
// Score 0-100 but ALWAYS accompanied by status.
// A high score with BLOCKED dimension → overallStatus=BLOCKED

import { HEALTH_STATUS } from './healthDimension.js';

export function computeOverallHealthScore(signals = [], weights = {}) {
  if (signals.length === 0) {
    return Object.freeze({ score: 0, overallStatus: HEALTH_STATUS.UNKNOWN, grade: 'UNKNOWN', isReal: false });
  }

  const applicable = signals.filter(s => s.status !== HEALTH_STATUS.NOT_APPLICABLE);

  let totalWeight = 0;
  let weightedScore = 0;

  for (const sig of applicable) {
    const w = weights[sig.dimension] ?? 1;
    const s = sig.score !== null ? sig.score : statusToScore(sig.status);
    weightedScore += s * w;
    totalWeight += w;
  }

  const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

  const hasBlocked  = applicable.some(s => s.status === HEALTH_STATUS.BLOCKED);
  const hasCritical = applicable.some(s => s.status === HEALTH_STATUS.CRITICAL);
  const hasUnknown  = applicable.some(s => s.status === HEALTH_STATUS.UNKNOWN);
  const hasDegraded = applicable.some(s => s.status === HEALTH_STATUS.DEGRADED || s.status === HEALTH_STATUS.WARNING);

  let overallStatus;
  if (hasBlocked)   overallStatus = HEALTH_STATUS.BLOCKED;
  else if (hasCritical) overallStatus = HEALTH_STATUS.CRITICAL;
  else if (hasUnknown)  overallStatus = HEALTH_STATUS.DEGRADED;
  else if (hasDegraded) overallStatus = HEALTH_STATUS.WARNING;
  else overallStatus = HEALTH_STATUS.HEALTHY;

  const grade = scoreToGrade(score, overallStatus);

  return Object.freeze({ score, overallStatus, grade, signalCount: applicable.length, isReal: false });
}

function statusToScore(status) {
  const map = {
    [HEALTH_STATUS.HEALTHY]:        100,
    [HEALTH_STATUS.WARNING]:        70,
    [HEALTH_STATUS.DEGRADED]:       50,
    [HEALTH_STATUS.CRITICAL]:       20,
    [HEALTH_STATUS.BLOCKED]:        0,
    [HEALTH_STATUS.UNKNOWN]:        40,
    [HEALTH_STATUS.NOT_APPLICABLE]: 100,
  };
  return map[status] ?? 40;
}

function scoreToGrade(score, status) {
  if (status === HEALTH_STATUS.BLOCKED)  return 'BLOCKED';
  if (status === HEALTH_STATUS.CRITICAL) return 'CRITICAL';
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  return 'F';
}

export const OVERALL_HEALTH_SCORE_VERSION = '1.0.0';
