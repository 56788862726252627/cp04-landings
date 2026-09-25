// Lip Sync Quality Evaluator — ADV-13

export const LIP_SYNC_QUALITY = Object.freeze({
  EXCELLENT: 'EXCELLENT',
  GOOD:      'GOOD',
  WARNING:   'WARNING',
  FAIL:      'FAIL',
});

export function evaluateLipSync(lipSyncResult) {
  if (!lipSyncResult) return Object.freeze({ quality: LIP_SYNC_QUALITY.FAIL, score: 0, isReal: false });
  const syncQuality = lipSyncResult.syncQuality ?? 'UNKNOWN';
  const qualityMap = {
    EXCELLENT: { quality: LIP_SYNC_QUALITY.EXCELLENT, score: 95 },
    GOOD:      { quality: LIP_SYNC_QUALITY.GOOD,      score: 80 },
    SIMULATED: { quality: LIP_SYNC_QUALITY.GOOD,      score: 75 },
    WARNING:   { quality: LIP_SYNC_QUALITY.WARNING,   score: 50 },
    FAIL:      { quality: LIP_SYNC_QUALITY.FAIL,      score: 0  },
    UNKNOWN:   { quality: LIP_SYNC_QUALITY.WARNING,   score: 40 },
  };
  const result = qualityMap[syncQuality] ?? qualityMap.UNKNOWN;
  return Object.freeze({ ...result, isReal: false });
}

export const LIP_SYNC_QUALITY_EVALUATOR_VERSION = '1.0.0';
