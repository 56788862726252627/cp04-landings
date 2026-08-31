# Factory Dead Control Gate

Version 1.0.0 · 2026-08-31 · Paso A Closure

## Purpose

A commercial demo CANNOT reach QA or deployment if it has dead controls.

**Dead controls** are buttons, links, CTAs, tabs, quick actions, or forms that are:
- Visually clickable
- But produce no functional response

They create false promise UX: the user believes the product works, but it does not.

## Rule

```
DEAD_CONTROLS > 0 → GATE FAIL
```

**Exception**: elements marked `{ placeholder: true }` are explicitly exempted and visually flagged.

## API

```js
import { auditDeadControls, DEAD_CONTROL_GATE } from './core/gates/deadControlGate.js';

// Single spec
const result = auditDeadControls({
  type: 'button',
  id: 'booking-cta',
  label: 'Pedir cita',
  action: 'openBookingModal',  // ← live
});
// result.pass === true

// Dead button
const result2 = auditDeadControls({
  type: 'button',
  id: 'dead-btn',
  label: 'Acciones',
  action: null,               // ← dead
});
// result2.pass === false
// result2.issues[0].type === 'DEAD_BUTTON'

// Multi-spec audit
const multi = DEAD_CONTROL_GATE.auditMulti([spec1, spec2, spec3]);
```

## Detected Types

| Type | Condition |
|------|-----------|
| `DEAD_BUTTON` | Button with no `action`, `onClick`, or `handler` |
| `DEAD_LINK` | Link with empty `href` and no `onClick` |
| `DEAD_CTA` | CTA with no `href`, `action`, or `onClick` |
| `DEAD_TAB` | Tab with no `action` and no panel content |
| `DEAD_QUICK_ACTION` | Quick action with no `handler`, `navigate`, or `action` |
| `DEAD_FORM_SUBMIT` | Form with no `onSubmit`, `action` URL, or `submitHandler` |

## Dead Sentinel Values

Actions that are considered dead: `null`, `undefined`, `''`, `'todo'`, `'#'`, `'javascript:void(0)'`, `'noop'`, `'TBD'`, `'TODO'`, `'PLACEHOLDER'`

## Placeholders

Elements expected to be inactive MUST be explicitly marked:

```js
const spec = {
  type: 'button',
  id: 'coming-soon',
  label: 'Módulo próximamente',
  action: null,
  placeholder: true,  // ← explicitly exempted
};
```

In the UI, placeholder controls must be visually distinguished (e.g., `opacity: 0.5`, tooltip "Próximamente").

## Origin

Derived from FisioNova Premium V2 Pilot audit (2026-08-30):
- 12+ dead controls in Dashboard Quick Actions, Agenda CTAs, Landing hero buttons
- Pattern: buttons rendered correctly but with no `onClick` attached
- Fix: `onOpenBooking`, `onNavigate` props propagated from App shell to all modules
