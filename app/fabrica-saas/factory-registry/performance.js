/**
 * Factory Registry — Performance Registry V2
 * Budget thresholds per preset category and device tier.
 */

export const PERF_REGISTRY = Object.freeze({
  budgets: {
    minimal: {
      maxJsKb:         80,
      maxCssKb:        20,
      maxImagesAboveFold: 1,
      maxConcurrentAnimations: 2,
      targetFCP:       1200,
      targetLCP:       2000,
      targetCLS:       0.05,
    },
    standard: {
      maxJsKb:         200,
      maxCssKb:        40,
      maxImagesAboveFold: 3,
      maxConcurrentAnimations: 5,
      targetFCP:       1500,
      targetLCP:       2500,
      targetCLS:       0.1,
    },
    rich: {
      maxJsKb:         400,
      maxCssKb:        60,
      maxImagesAboveFold: 4,
      maxConcurrentAnimations: 8,
      targetFCP:       2000,
      targetLCP:       3000,
      targetCLS:       0.1,
    },
    immersive: {
      maxJsKb:         600,
      maxCssKb:        80,
      maxImagesAboveFold: 5,
      maxConcurrentAnimations: 12,
      targetFCP:       2500,
      targetLCP:       3500,
      targetCLS:       0.15,
    },
  },
  presetBudgetMap: {
    'minimal-premium':        'minimal',
    'professional-authority': 'minimal',
    'data-heavy-saas':        'standard',
    'clinical-premium':       'standard',
    'friendly-human':         'standard',
    'education-interactive':  'standard',
    'tech-futuristic':        'rich',
    'sports-dynamic':         'rich',
    'luxury-editorial':       'rich',
    'immersive-showcase':     'immersive',
  },
  mobilePenalties: {
    maxConcurrentAnimations: 0.4,
    maxJsKb:                 0.7,
  },
});

export function getBudgetForPreset(presetId, isMobile = false) {
  const budgetKey = PERF_REGISTRY.presetBudgetMap[presetId] ?? 'standard';
  const base = PERF_REGISTRY.budgets[budgetKey];
  if (!isMobile) return base;
  return {
    ...base,
    maxConcurrentAnimations: Math.floor(base.maxConcurrentAnimations * PERF_REGISTRY.mobilePenalties.maxConcurrentAnimations),
    maxJsKb:                 Math.floor(base.maxJsKb * PERF_REGISTRY.mobilePenalties.maxJsKb),
  };
}
