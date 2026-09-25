# Factory V2 Backward Compatibility Guarantee

V2 is a strictly additive update. No V1 APIs were removed or changed.

## Non-Breaking Changes

- All exports from `dynamicExperience/index.js` remain unchanged
- `checkPerformanceBudget()` still works — V2 extends via `checkPerformanceBudgetV2()`
- `EXPERIENCE_PRESETS` (V1 presets) still exported
- `INTERACTION_DEFINITIONS`, `VERTICAL_EXPERIENCE_MAP` untouched
- `motionConfig.js`, `videoEngine.js`, `interactionEngine.js` untouched

## Migration Path

```js
// V1 code — still works
import { resolvePreset } from 'fabrica-saas/core/backwardCompat.js';
const preset = resolvePreset('subtle'); // → V1 preset object

// V2 code
import { resolveExperience } from 'fabrica-saas/core/experienceDecisionEngine.js';
const decision = resolveExperience({ vertical: 'dental' }); // → full V2 decision
```

## V1 → V2 Preset ID Map

| V1 ID | V2 ID |
|-------|-------|
| subtle | minimal-premium |
| professional | professional-authority |
| clinical | clinical-premium |
| calm | clinical-premium |
| editorial | luxury-editorial |
| luxury | luxury-editorial |
| friendly | friendly-human |
| energetic | sports-dynamic |
| sports | sports-dynamic |
| tech-premium | tech-futuristic |
| immersive | immersive-showcase |
| fresh | education-interactive |
