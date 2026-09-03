// Recovery Readiness Score — ADV-18
// Factors: 0-100 each.

export const RECOVERY_FACTOR = Object.freeze({
  BACKUP_FRESHNESS:    'backupFreshness',
  INTEGRITY:           'integrity',
  RESTORE_VALIDATION:  'restoreValidation',
  RETENTION:           'retention',
  ENCRYPTION:          'encryption',
  ROLLBACK:            'rollback',
  CLIENT_ISOLATION:    'clientIsolation',
  DOCUMENTATION:       'documentation',
});

const WEIGHTS = Object.freeze({
  backupFreshness:   0.25,
  integrity:         0.20,
  restoreValidation: 0.20,
  retention:         0.10,
  encryption:        0.10,
  rollback:          0.05,
  clientIsolation:   0.05,
  documentation:     0.05,
});

export function computeRecoveryReadinessScore(metrics = {}) {
  const scores = {};
  let overall  = 0;

  for (const [factor, weight] of Object.entries(WEIGHTS)) {
    const value   = metrics[factor] ?? 100;
    const clamped = Math.max(0, Math.min(100, value));
    scores[factor] = clamped;
    overall += clamped * weight;
  }

  return Object.freeze({
    overall:   Math.round(overall * 100) / 100,
    scores:    Object.freeze({ ...scores }),
    ready:     overall >= 90,
    grade:     overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : 'F',
    isReal:    false,
  });
}

export const RECOVERY_READINESS_SCORE_VERSION = '1.0.0';
