// Visual Regression Foundation — ADV-07

export const REGRESSION_ISSUE = Object.freeze({
  LAYOUT_SHIFT:      'LAYOUT_SHIFT',
  MISSING_COMPONENT: 'MISSING_COMPONENT',
  BROKEN_SPACING:    'BROKEN_SPACING',
  WRONG_RESPONSIVE:  'WRONG_RESPONSIVE',
});

export const BASELINE_STATUS = Object.freeze({
  MATCH:       'MATCH',
  MINOR_DIFF:  'MINOR_DIFF',
  MAJOR_DIFF:  'MAJOR_DIFF',
  MISSING:     'MISSING',
});

export function createVisualBaseline(snapshot = {}) {
  return Object.freeze({
    id:         snapshot.id ?? `baseline-${Date.now()}`,
    url:        snapshot.url ?? '',
    viewport:   snapshot.viewport ?? { width: 1280, height: 800 },
    timestamp:  snapshot.timestamp ?? new Date().toISOString(),
    checksum:   snapshot.checksum ?? null,
    elements:   snapshot.elements ?? [],
    isReal:     false,
  });
}

export function compareVisualBaselines(baseline = {}, current = {}) {
  const issues = [];

  const elementsMissing = (baseline.elements ?? [])
    .filter(e => !(current.elements ?? []).some(c => c.id === e.id));

  if (elementsMissing.length > 0) {
    issues.push({ type: REGRESSION_ISSUE.MISSING_COMPONENT, count: elementsMissing.length });
  }

  const viewportMismatch = JSON.stringify(baseline.viewport) !== JSON.stringify(current.viewport);
  if (viewportMismatch) {
    issues.push({ type: REGRESSION_ISSUE.WRONG_RESPONSIVE });
  }

  const status = issues.length === 0 ? BASELINE_STATUS.MATCH
    : issues.some(i => i.type === REGRESSION_ISSUE.MISSING_COMPONENT) ? BASELINE_STATUS.MAJOR_DIFF
    : BASELINE_STATUS.MINOR_DIFF;

  return Object.freeze({ status, issues, isReal: false });
}

export function detectLayoutShift(measurements = []) {
  const shifts = measurements.filter(m => m.clsScore > 0.1);
  return Object.freeze({
    detected: shifts.length > 0,
    shifts:   shifts.length,
    type:     shifts.length > 0 ? REGRESSION_ISSUE.LAYOUT_SHIFT : null,
    isReal:   false,
  });
}

export const VISUAL_REGRESSION_FOUNDATION_VERSION = '1.0.0';
