# Factory Anti-Template Repetition Engine V2

Source: `fabrica-saas/core/antiTemplateEngine.js`

## Problem

"Hero + 3 feature cards + testimonials + FAQ" appears in 80% of generated sites.
Clients notice. This engine detects and diversifies repeating patterns.

## Usage

```js
import { detectTemplatePattern, diversifySections, scoreVariety } from '...';

// Detect
const result = detectTemplatePattern(['hero', 'features-3col-icons', 'social-proof-testimonials-grid', 'conversion-faq']);
// → { hasPattern: true, riskLevel: 'high', patterns: [{ label: 'Classic SaaS Clone', ... }] }

// Auto-fix
const { sections, changes } = diversifySections(desired);
// → sections: ['hero-split-stats', 'features-alternating', ...], changes: [...]

// Score
const score = scoreVariety(['hero-editorial-bold', 'features-accordion', 'social-proof-metrics']);
// → 100 (fully diverse)
```

## Patterns Detected

1. **Classic SaaS Clone** (high severity) — hero + 3col-icons + testimonials-grid + faq
2. **Pricing Page Clone** (medium) — centered-hero + pricing + faq + cta-band
3. **Trust Factory Clone** (medium) — centered-hero + logos + testimonials-grid + cta-band
4. **Generic Business Site** (high) — centered-hero + 3col-icons + cta-band
5. **Agency Template** (low) — video-hero + 3col-icons + testimonials-grid

## Scoring

`scoreVariety()` returns 0-100. High severity patterns penalize by 30 points each.
- 90-100: Highly differentiated
- 70-89: Good variety
- 50-69: Some pattern risk
- <50: Template-like, diversification recommended
