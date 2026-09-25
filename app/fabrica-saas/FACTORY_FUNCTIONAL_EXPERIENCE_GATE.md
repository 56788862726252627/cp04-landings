# Factory Functional Experience Gate

Version 1.0.0 · 2026-08-31 · Paso A Closure

## Purpose

A component that renders but does not respond is a dead prototype, not a product.

This gate validates that interactive patterns have proper **functional contracts** — defined handlers, prop requirements, and behavioral expectations — before a demo is considered commercially ready.

## Rule

All interactive patterns in a demo page must satisfy their minimum functional contract.

## Known Patterns (13)

| Pattern | Required Props |
|---------|---------------|
| `navigation` | `onNavigate` |
| `modal` | `onOpen`, `onClose` |
| `drawer` | `onClose` |
| `roleSwitcher` | `onRoleChange`, `roles` |
| `filter` | `onFilter`, `options` |
| `search` | `onSearch` |
| `tabs` | `onTabChange`, `tabs` |
| `bookingFlow` | `onComplete`, `steps` |
| `successState` | `message` |
| `errorState` | `message`, `onRetry` |
| `emptyState` | `message` |
| `actionFeedback` | `type` |
| `form` | `onSubmit` |
| `mobileNav` | `onOpen`, `onClose`, `isOpen` |

## API

```js
import { validatePattern, auditFunctionalExperience } from './core/gates/functionalExperienceGate.js';

// Single pattern
const result = validatePattern('bookingFlow', {
  onComplete: 'handleBookingComplete',
  steps: ['service', 'datetime', 'confirm', 'success'],
});
// result.pass === true

// Multi-pattern audit
const audit = auditFunctionalExperience([
  { pattern: 'navigation', spec: { onNavigate: 'nav' }, id: 'main-nav' },
  { pattern: 'modal', spec: { onOpen: 'open', onClose: 'close' }, id: 'booking-modal' },
  { pattern: 'roleSwitcher', spec: { onRoleChange: 'fn', roles: ['admin', 'fisio'] }, id: 'role-sw' },
]);
// audit.pass === true
// audit.counts.failed === 0

// Demo page baseline audit
const page = auditDemoPage({
  patterns: [
    { pattern: 'navigation', spec: { onNavigate: 'nav' } },
    { pattern: 'bookingFlow', spec: { onComplete: 'fn', steps: ['a', 'b', 'c'] } },
  ]
});
// page.pass === true
```

## Demo Page Baseline

A demo page must have at minimum:
1. A `navigation` pattern with `onNavigate`
2. At least one CTA pattern: `bookingFlow` | `modal` | `form`

## Origin

Derived from FisioNova Premium V2 Pilot audit (2026-08-30):
- Navigation views not receiving `onNavigate` prop → "Ver agenda" button visually clicked but nothing happened
- Role switcher changing nav but not triggering view transition
- Fix: Props passed from App shell down through `PageView` to all modules
