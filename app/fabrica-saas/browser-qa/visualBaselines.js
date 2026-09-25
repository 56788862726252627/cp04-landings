// Visual Baselines — ADV-06
// Manages visual baseline snapshots for regression detection.

export const BASELINE_STATUS = Object.freeze({
  NONE:      'NONE',
  RECORDED:  'RECORDED',
  STALE:     'STALE',
  APPROVED:  'APPROVED',
});

export const DIFF_RESULT = Object.freeze({
  IDENTICAL:     'IDENTICAL',
  MINOR_DIFF:    'MINOR_DIFF',
  MAJOR_DIFF:    'MAJOR_DIFF',
  NO_BASELINE:   'NO_BASELINE',
});

export const BASELINE_THRESHOLD = Object.freeze({
  STRICT:   { maxDiffPercent: 0.1,  label: 'STRICT' },
  MODERATE: { maxDiffPercent: 1.0,  label: 'MODERATE' },
  RELAXED:  { maxDiffPercent: 5.0,  label: 'RELAXED' },
});

export function createBaselineEntry(params = {}) {
  const { route, viewport, screenshotPath, checksum } = params;
  if (!route)    return { valid: false, error: 'route required' };
  if (!viewport) return { valid: false, error: 'viewport required' };

  return Object.freeze({
    valid:      true,
    baselineId: `BL-${route.replace(/\//g, '-')}-${viewport}-${Date.now()}`,
    route,
    viewport,
    screenshotPath: screenshotPath ?? null,
    checksum:       checksum ?? null,
    status:         BASELINE_STATUS.RECORDED,
    recordedAt:     new Date().toISOString(),
    isReal:         false,
  });
}

export function evaluateBaselineDiff(diffPercent = 0, threshold = BASELINE_THRESHOLD.MODERATE) {
  if (typeof diffPercent !== 'number') return { valid: false, error: 'diffPercent must be number' };

  let result;
  if (diffPercent === 0)                              result = DIFF_RESULT.IDENTICAL;
  else if (diffPercent <= threshold.maxDiffPercent)   result = DIFF_RESULT.MINOR_DIFF;
  else                                                result = DIFF_RESULT.MAJOR_DIFF;

  return Object.freeze({
    valid:       true,
    diffPercent,
    result,
    blocking:    result === DIFF_RESULT.MAJOR_DIFF,
    threshold:   threshold.label,
    isReal:      false,
  });
}

export function buildBaselineRegistry(entries = []) {
  if (!Array.isArray(entries)) return { valid: false, error: 'entries array required' };
  const byRoute = {};
  for (const e of entries.filter(e => e.valid)) {
    if (!byRoute[e.route]) byRoute[e.route] = [];
    byRoute[e.route].push(e);
  }
  return Object.freeze({
    valid:      true,
    routeCount: Object.keys(byRoute).length,
    totalEntries: entries.length,
    byRoute,
    isReal:     false,
  });
}

export function getBaselineForRoute(registry = {}, route, viewport) {
  if (!registry.valid) return null;
  const entries = registry.byRoute[route] ?? [];
  return entries.find(e => e.viewport === viewport && e.status === BASELINE_STATUS.APPROVED) ?? null;
}

export const VISUAL_BASELINES_VERSION = '1.0.0';
