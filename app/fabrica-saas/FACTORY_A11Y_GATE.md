# Factory Accessibility Gate V2

Source: `fabrica-saas/core/accessibilityGate.js`

## WCAG 2.1 AA Compliance

The gate checks palette contrast ratios and motion accessibility at generation time.

## Palette Contrast Check

```js
import { auditPaletteContrast, meetsContrastAA } from '...';

const audit = auditPaletteContrast({
  primary: '#1d4ed8',
  surface: '#ffffff',
  accent:  '#16a34a',
});
// → { results: [{pair, ratio, passesAA, passesAAA}], allPass: true, failCount: 0 }

meetsContrastAA('#1d4ed8', '#ffffff'); // → true (ratio ~7.2:1)
```

## Motion Accessibility

```js
import { auditMotionAccessibility } from '...';

const result = auditMotionAccessibility(preset);
// Checks: reducedMotionFallback for high motion, autoplay video, backgroundMotion
```

## Full Gate

```js
const gate = runAccessibilityGate(preset);
// → { score: 90, pass: true, level: 'AAA', recommendations: [...] }
```

Score: 100 - (20 × contrast failures) - (25 × error-level motion issues)

Level: AAA(≥90), AA(≥70), FAIL(<70)

## Component Requirements

Every registered component has `a11y: [...]` field listing required attributes.
See `factory-registry/accessibility.js` for full checklist per component type.
