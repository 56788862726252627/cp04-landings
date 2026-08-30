# Factory Premium Experience Stack V2

Version 2.0.0 · 2026-08-30 · Branch: feature/factory-premium-experience-v2

## What's New

Premium Experience Stack V2 adds a full motion foundation, design system tokens, premium component registry, and deterministic experience engine on top of V1.7.

## Architecture

```
fabrica-saas/
  core/
    designSystemV2/          ← Design System V2 (Phase 3-5)
      tokens.js              ← Motion/depth/glass/gradient/density tokens
      FactoryMotion.jsx      ← 13 motion wrappers (motion/react)
      primitives.jsx         ← 9 headless accessible UI primitives
      index.js               ← Central export
    dynamicExperience/
      presetsV2.js           ← 10 V2 presets (extends V1.7)
    experienceDecisionEngine.js  ← Deterministic sector→preset mapper
    antiTemplateEngine.js    ← Prevents cookie-cutter layouts
    performanceBudgetV2.js   ← Budget enforcement for V2 stack
    aiRouterV2.js            ← Tier 0-4 AI generation router
    contextProfiles.js       ← 9 token-saving context profiles
    accessibilityGate.js     ← WCAG 2.1 AA compliance checker
    backwardCompat.js        ← V1 API shim (no breaking changes)
  factory-registry/          ← Component + Recipe metadata (Phase 6-7)
    index.js                 ← 12 sub-registry exports
    components.js            ← 21 component entries
    recipes/                 ← 42 recipes across 6 sections
    presetRegistry.js, typography.js, interactions.js
    layouts.js, sectors.js, tokenRegistry.js
    aiProfiles.js, accessibility.js, performance.js, compatibility.js
  generator/tests/
    v2-premium-experience.test.mjs  ← 109 tests, 14 suites
```

## V2 Presets (10)

| ID | Vertical | Density | Motion | Glass |
|----|----------|---------|--------|-------|
| minimal-premium | Any | Airy | Low | No |
| clinical-premium | Dental/Salud | Comfortable | Low | No |
| luxury-editorial | Estética/Spa | Airy | Medium | Yes |
| sports-dynamic | Pádel/Fitness | Comfortable | High | Yes |
| tech-futuristic | SaaS/Tech | Compact | High | Yes |
| education-interactive | Educación | Comfortable | Medium | No |
| professional-authority | Legal/Consultoría | Spacious | Low | No |
| friendly-human | Restaurante/Local | Comfortable | Medium | No |
| immersive-showcase | Portfolio/Agencia | Airy | High | Yes |
| data-heavy-saas | Analytics/ERP | Compact | Low | No |

## Motion Foundation (13 wrappers)

All wrappers respect `prefers-reduced-motion` automatically.

- `FactoryMotion` — generic motion div/span
- `MotionButton` — hover scale + spring tap feedback
- `MotionCard` — hover lift + shadow elevation
- `Reveal` — scroll-triggered fade+direction entrance
- `Stagger` — sequential children entrance
- `AnimatedMetric` — number counter on scroll
- `PageTransition` — route-level fade/slide/rise
- `LayoutTransition` — smooth layout reflow
- `AnimatedPresence` — re-export from motion/react
- `MotionProgress` — animated progress bar
- `MotionTabs` — animated tab indicator
- `MotionDrawer` — spring slide-in side panel
- `MotionToast` — animated toast notifications

## Headless Primitives (9)

No external UI library — pure React hooks + browser APIs.

- `Drawer` — side panel with focus trap
- `Dialog` — modal with aria-modal
- `Popover` — positioned overlay
- `Tooltip` — hover/focus tooltip with delay
- `NavigationMenu` — nav with dropdown children
- `Combobox` — searchable select
- `Autocomplete` — type-ahead input
- `useToast` — toast hook (returns toasts, addToast, removeToast)
- `ScrollArea` — custom scrollbar overflow container

## Factory Registry (42 recipes)

| Section | Count | IDs |
|---------|-------|-----|
| hero | 8 | centered-text, split-content, video-background, mesh-gradient, editorial-bold, split-stats, product-showcase, local-community |
| features | 8 | 3col-icons, alternating, tabs, numbered, grid-glass, comparison, map, accordion |
| social-proof | 5 | testimonials-grid, carousel, logos, metrics, case-study |
| conversion | 6 | cta-band, pricing-cards, booking-teaser, lead-capture, faq, urgency-banner |
| appShell | 7 | sidebar-fixed, sidebar-collapsible, topbar, landing, dashboard-grid, tabs-main, split-panel |
| dashboard | 8 | metrics-row, chart-area, activity-feed, data-table, status-grid, progress-overview, calendar-mini, profile-card |

## Decision Engine

```js
import { resolveExperience } from 'fabrica-saas/core/experienceDecisionEngine.js';

const decision = resolveExperience({
  vertical: 'dental',
  brand: { name: 'MiClínica' },
  audience: 'professional',
  isMobile: false,
});
// → { presetId: 'clinical-premium', heroRecipe, sectionOrder, typography, ... }
```

## Backward Compatibility

All V1.7 exports remain available unchanged. V1 preset IDs are auto-migrated to V2 equivalents via `resolvePreset()`.

## Security

- No real client data in any registry or token file
- Demo values only in recipe examples
- motion/react: no external calls, pure animation
- Accessibility gate validates palette contrast ratios
