// Performance-Aware Experience — ADV-07

export const PERF_CONSTRAINT = Object.freeze({
  HERO_VIDEO:    'HERO_VIDEO',
  HEAVY_ANIM:    'HEAVY_ANIM',
  LARGE_IMAGES:  'LARGE_IMAGES',
  EXCESS_BLUR:   'EXCESS_BLUR',
  BUNDLE_BLOAT:  'BUNDLE_BLOAT',
});

export const PERF_BUDGET = Object.freeze({
  LCP_TARGET_MS:   2500,
  INP_TARGET_MS:   200,
  CLS_TARGET:      0.1,
  JS_BUDGET_KB:    500,
  CSS_BUDGET_KB:   100,
  IMAGE_BUDGET_KB: 400,
});

export function createPerformanceProfile(motionLevel = 'STANDARD', options = {}) {
  const useHeroVideo = motionLevel === 'RICH' && (options.allowVideo ?? false);
  const heavyAnim    = motionLevel === 'RICH';
  const constraints  = [];

  if (useHeroVideo) constraints.push({ type: PERF_CONSTRAINT.HERO_VIDEO, risk: 'HIGH', mitigation: 'lazy-load + preload-hint' });
  if (heavyAnim)    constraints.push({ type: PERF_CONSTRAINT.HEAVY_ANIM, risk: 'MEDIUM', mitigation: 'will-change, requestAnimationFrame' });

  return Object.freeze({
    motionLevel,
    useHeroVideo,
    useWebP:              true,
    lazyLoadImages:       true,
    criticalCSSInline:    true,
    deferNonCriticalJS:   true,
    constraints,
    budget:               PERF_BUDGET,
    isReal:               false,
  });
}

export function evaluatePerformanceRisks(profile = {}) {
  const risks = (profile.constraints ?? []).filter(c => c.risk === 'HIGH');
  return Object.freeze({
    highRisks: risks.length,
    risks,
    withinBudget: (profile.totalJsKb ?? 0) <= PERF_BUDGET.JS_BUDGET_KB,
    isReal: false,
  });
}

export const PERFORMANCE_AWARE_EXPERIENCE_VERSION = '1.0.0';
