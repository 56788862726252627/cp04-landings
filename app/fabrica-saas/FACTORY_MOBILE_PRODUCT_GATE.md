# Factory Mobile Product Gate

Version 1.0.0 · 2026-08-31 · Paso A Closure

## Purpose

Desktop-only UX is not acceptable for a professional SaaS product.

This gate validates that component specs meet mobile product requirements at all three standard breakpoints.

## Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | 390px | Sidebar must be overlay, dialogs full-width, role selector as `<select>` |
| Tablet | 768px | Sidebar may still be overlay or collapsible |
| Desktop | 1440px | Full sidebar, pill-button role switcher, wide dialogs |

## Touch Target Minimum

**44px × 44px** (WCAG 2.5.5 / Apple HIG / Material Design)

## Component Requirements

### Sidebar
- `mobileHamburger: true` — hamburger trigger visible on mobile
- `mobileOverlay: true` — sidebar renders as fixed overlay (not inline) below 768px
- `onClose` — close handler for backdrop click and X button

### Dialog / Modal
- `mobileFullWidth: true` — uses `width: min(540px, calc(100vw - 32px))`
- `onClose` — visible close button + Escape key
- `scrollable: true` — content scrolls when taller than viewport

### Role Switcher
- `mobileCompact: true` — renders as native `<select>` on mobile

### Navigation
- `mobilePattern` — declares mobile variant (overlay | bottom-tab | hamburger)
- `touchTargetHeight: 44` — minimum 44px per nav item

## API

```js
import { validateMobileComponent, auditMobileProduct, auditTouchTargets } from './core/gates/mobileProductGate.js';

// Single component
const result = validateMobileComponent('sidebar', {
  mobileHamburger: true,
  mobileOverlay: true,
  onClose: 'closeSidebar',
});
// result.pass === true

// Touch targets
const touchResult = auditTouchTargets([
  { label: 'nav item', height: 48 },
  { label: 'button', height: 44 },
]);
// touchResult.pass === true

// Full page
const pageResult = auditMobileProduct({
  mobileAware: true,
  components: [
    { type: 'sidebar', spec: { mobileHamburger: true, mobileOverlay: true, onClose: 'fn' } },
    { type: 'dialog',  spec: { mobileFullWidth: true, onClose: 'fn', scrollable: true } },
  ],
});
// pageResult.pass === true
```

## Known Component Types

`sidebar`, `dialog`, `roleSwitcher`, `navigation`, `form`, `bookingFlow`, `table`, `chart`, `card`

## Origin

Derived from FisioNova Premium V2 Pilot audit (2026-08-30):
- Sidebar was 220px on a 390px screen → no mobile handling at all
- Role switcher was 4 pill buttons → overflowed on 390px
- Fix: hamburger + overlay sidebar, `<select>` role switcher on mobile, responsive dialog widths
