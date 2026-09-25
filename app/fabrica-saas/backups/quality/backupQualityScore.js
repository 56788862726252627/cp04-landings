// Backup Quality Score — ADV-18
// Factors: 0-100 percentages each.

export const BACKUP_QUALITY_FACTOR = Object.freeze({
  COMPLETENESS:      'completeness',
  INTEGRITY:         'integrity',
  SECURITY:          'security',
  RESTORABILITY:     'restorability',
  FRESHNESS:         'freshness',
  CLIENT_ISOLATION:  'clientIsolation',
  POLICY_COMPLIANCE: 'policyCompliance',
  MANIFEST_QUALITY:  'manifestQuality',
});

const WEIGHTS = Object.freeze({
  completeness:     0.20,
  integrity:        0.20,
  security:         0.20,
  restorability:    0.15,
  freshness:        0.10,
  clientIsolation:  0.05,
  policyCompliance: 0.05,
  manifestQuality:  0.05,
});

export function computeBackupQualityScore(metrics = {}) {
  const scores = {};
  let overall  = 0;

  for (const [factor, weight] of Object.entries(WEIGHTS)) {
    const value = metrics[factor] ?? 100;
    const clamped = Math.max(0, Math.min(100, value));
    scores[factor] = clamped;
    overall += clamped * weight;
  }

  return Object.freeze({
    overall:   Math.round(overall * 100) / 100,
    scores:    Object.freeze({ ...scores }),
    grade:     overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : 'F',
    isReal:    false,
  });
}

export const BACKUP_QUALITY_SCORE_VERSION = '1.0.0';
