# Factory Experience Decision Engine V2

Source: `fabrica-saas/core/experienceDecisionEngine.js`

## Purpose

Deterministic mapping from a client manifest to a complete visual experience configuration.
Same input → same output every time. No randomness, no side effects.

## Output Shape

```js
{
  presetId:    'clinical-premium',
  preset:      { ...presetObject },
  sector:      { id: 'dental', label: 'Clínica Dental', ... },
  layout:      { id: 'wide', maxWidth: '1100px', gap: 48 },
  typography:  { display: 'Inter', body: 'Inter', weight: { display: 600, body: 400 } },
  interactions:{ hover: { scale: 1.01, shadow: '...', translateY: -1 }, tap: ..., focus: 'ring' },
  budget:      { maxJsKb: 200, maxConcurrentAnimations: 5, targetLCP: 2500, ... },
  sectionOrder:['hero', 'trust-strip', 'features', 'testimonials', ...],
  heroRecipe:  { id: 'hero-split-content', name: '...', layout: 'split', ... },
  motion:      { library: 'motion', intensity: 'low', scrollEffects: [...] },
  colorMode:   'light',
  density:     'comfortable',
  glassEffect: false,
  resolvedAt:  '2026-08-30T...',
  engineVersion: '2.0.0',
}
```

## Audience Adjustments

```js
import { applyAudienceAdjustments } from '...';
const adjusted = applyAudienceAdjustments(decision, 'senior');
// → density: 'spacious', motion intensity: 'none'
```

Supported audiences: `senior`, `professional`, `youth`, `mobile-first`.

## Override System

Pass `overrides` in the manifest to override any field:

```js
resolveExperience({
  vertical: 'dental',
  overrides: { preset: 'luxury-editorial', colorMode: 'dark' }
});
```
