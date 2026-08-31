# Factory Registry V2

Central metadata registry at `fabrica-saas/factory-registry/`.

## 12 Sub-registries

1. **components** — 21 UI component entries with motionCost, performanceCost, a11y requirements
2. **recipes** — 42 layout recipes across 6 sections
3. **presets** — V1 + V2 preset catalog (unified)
4. **typography** — Font pairings per preset mood
5. **interactions** — hover/tap/focus settings per preset
6. **layouts** — 7 layout personalities (centered, editorial, grid, etc.)
7. **sectors** — 15 business verticals with icon, color, preset mapping
8. **tokens** — Re-exports V2 tokens for registry consumers
9. **aiProfiles** — 9 context profiles for AI generation (nano → full)
10. **accessibility** — WCAG requirements per component type
11. **performance** — Budget thresholds per preset category + mobile penalties
12. **compatibility** — V1→V2 migration map, non-breaking change guarantees

## Quick Lookups

```js
import { getRecipeById, getSectorById, getAIProfile } from 'fabrica-saas/factory-registry';

// Recipe lookup
const hero = getRecipeById('hero-split-content');

// Sector → preset
const dental = getSectorById('dental');
// → { id: 'dental', preset: 'clinical-premium', icon: '🦷', ... }

// AI context profile
const profile = getAIProfile('standard');
// → { contextBudget: 2048, includes: [...], outputFormat: 'structured' }
```
