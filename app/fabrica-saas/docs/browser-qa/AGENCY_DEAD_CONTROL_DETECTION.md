# Dead Control Detection — ADV-06

## What Is a Dead Control?

A UI element that appears interactive but does nothing — no real action, no real navigation. Common in scaffolded or placeholder UIs.

## Classification

### Dead Buttons (by `data-action` or `onClick` source)

Classified as `DEAD_ACTION` when the action value is:
```
'', 'todo', '#', 'javascript:void(0)', 'noop', 'NOOP', 'TBD', 'tbd', 'TODO', 'PLACEHOLDER'
```

### Dead Links (by `href`)

Two subtypes:

| Type | `href` values | Meaning |
|------|--------------|---------|
| `PLACEHOLDER_HREF` | `'#'` | Intentional no-op anchor — warn only |
| `DEAD_LINK` | `''`, `'javascript:void(0)'`, `'javascript:;'`, `'#todo'`, `'#tbd'`, `'#placeholder'` | Unfinished link |

**Order matters**: `href === '#'` is checked first and returns `PLACEHOLDER_HREF`, not `DEAD_LINK`.

## Verdict Logic

| Finding | Result |
|---------|--------|
| Any DEAD_ACTION | `FAIL` (blocking) |
| Any DEAD_LINK | `FAIL` (blocking) |
| Only PLACEHOLDER_HREF | `WARN` (non-blocking) |
| None | `PASS` |

## Reuse vs Extension

`deadControlDetector.js` extends `core/gates/deadControlGate.js` from the deploy system. The gate file's internal arrays are not exported, so `deadControlDetector.js` defines its own local `DEAD_ACTION_VALUES` and `DEAD_HREF_VALUES` — same values, independently declared.

Only `DEAD_CONTROL_GATE_VERSION` is imported from the original gate.

## In Practice (Nexo Vet Fixture)

```
playwright test: "no dead placeholder hrefs"
→ All 7 nav + CTA links checked
→ result: PASS (0 dead, 0 placeholder)
```

The fixture was built specifically to have no dead controls — all buttons use real JS handlers, all links point to real anchors or valid routes.
