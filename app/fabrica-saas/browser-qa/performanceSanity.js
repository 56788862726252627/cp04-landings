// Performance Sanity — ADV-06
// Defines performance thresholds and evaluates runtime perf metrics for browser QA.

export const PERF_METRIC = Object.freeze({
  LCP:     'LCP',    // Largest Contentful Paint
  FID:     'FID',    // First Input Delay (legacy)
  INP:     'INP',    // Interaction to Next Paint
  CLS:     'CLS',    // Cumulative Layout Shift
  FCP:     'FCP',    // First Contentful Paint
  TTFB:    'TTFB',   // Time to First Byte
  TTI:     'TTI',    // Time to Interactive
  TBT:     'TBT',    // Total Blocking Time
});

export const PERF_GRADE = Object.freeze({
  GOOD:    'GOOD',
  NEEDS_IMPROVEMENT: 'NEEDS_IMPROVEMENT',
  POOR:    'POOR',
});

// Thresholds aligned with Google Core Web Vitals
const THRESHOLDS = {
  [PERF_METRIC.LCP]:  { good: 2500, poor: 4000, unit: 'ms' },
  [PERF_METRIC.INP]:  { good: 200,  poor: 500,  unit: 'ms' },
  [PERF_METRIC.CLS]:  { good: 0.1,  poor: 0.25, unit: '' },
  [PERF_METRIC.FCP]:  { good: 1800, poor: 3000, unit: 'ms' },
  [PERF_METRIC.TTFB]: { good: 800,  poor: 1800, unit: 'ms' },
  [PERF_METRIC.TTI]:  { good: 3800, poor: 7300, unit: 'ms' },
  [PERF_METRIC.TBT]:  { good: 200,  poor: 600,  unit: 'ms' },
  [PERF_METRIC.FID]:  { good: 100,  poor: 300,  unit: 'ms' },
};

export function gradeMetric(metric, value) {
  const t = THRESHOLDS[metric];
  if (!t) return { valid: false, error: `unknown metric: ${metric}` };
  const grade = value <= t.good ? PERF_GRADE.GOOD
    : value <= t.poor           ? PERF_GRADE.NEEDS_IMPROVEMENT
    : PERF_GRADE.POOR;
  return Object.freeze({ valid: true, metric, value, grade, threshold: t, isReal: false });
}

export function evaluatePerformanceSanity(metrics = {}) {
  const results = [];
  for (const [metric, value] of Object.entries(metrics)) {
    if (PERF_METRIC[metric]) {
      results.push(gradeMetric(metric, value));
    }
  }

  const poor      = results.filter(r => r.valid && r.grade === PERF_GRADE.POOR);
  const needsWork = results.filter(r => r.valid && r.grade === PERF_GRADE.NEEDS_IMPROVEMENT);
  const good      = results.filter(r => r.valid && r.grade === PERF_GRADE.GOOD);

  // P0 metrics: LCP, INP, CLS — blocking if POOR
  const corePoor  = poor.filter(r => [PERF_METRIC.LCP, PERF_METRIC.INP, PERF_METRIC.CLS].includes(r.metric));

  const status = corePoor.length > 0  ? 'FAIL'
    : poor.length > 0                 ? 'WARN'
    : needsWork.length > 2            ? 'WARN'
    : 'PASS';

  return Object.freeze({
    valid:    true,
    status,
    results,
    good:     good.length,
    needsWork:needsWork.length,
    poor:     poor.length,
    coreVitals: results.filter(r => [PERF_METRIC.LCP, PERF_METRIC.INP, PERF_METRIC.CLS].includes(r.metric)),
    isReal:   false,
  });
}

export function buildPerformanceBudget(overrides = {}) {
  return Object.freeze({
    ...Object.fromEntries(Object.entries(THRESHOLDS).map(([k, v]) => [k, overrides[k] ?? v.good])),
    isReal: false,
  });
}

export const PERFORMANCE_SANITY_VERSION = '1.0.0';
