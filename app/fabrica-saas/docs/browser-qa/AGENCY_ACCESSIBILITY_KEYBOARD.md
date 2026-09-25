# Accessibility & Keyboard QA — ADV-06

## WCAG 2.1 AA Baseline (12 Checks)

| ID | Rule | Severity | What It Checks |
|----|------|----------|----------------|
| A11Y-01 | LANG_ATTR | CRITICAL | `html[lang]` attribute present |
| A11Y-02 | IMG_ALT | CRITICAL | All `<img>` have non-empty `alt` |
| A11Y-03 | FORM_LABELS | CRITICAL | All form inputs have associated `<label>` or `aria-label` |
| A11Y-04 | BUTTON_TEXT | CRITICAL | All buttons have visible text or `aria-label` |
| A11Y-05 | LINK_TEXT | ERROR | Links have descriptive text (not just "click here") |
| A11Y-06 | HEADING_ORDER | WARNING | No heading level skips (h1→h3 without h2) |
| A11Y-07 | COLOR_CONTRAST | WARNING | Contrast flagged for review (not auto-measured) |
| A11Y-08 | SKIP_LINK | WARNING | Skip navigation link at page top |
| A11Y-09 | FOCUS_VISIBLE | ERROR | Interactive elements have visible focus indicator |
| A11Y-10 | ARIA_ROLES | WARNING | Landmarks: `nav`, `main`, `footer` present |
| A11Y-11 | LIST_STRUCTURE | INFO | Navigation uses `<ul>/<li>` structure |
| A11Y-12 | TABLE_HEADERS | INFO | Tables have `<th>` with `scope` if present |

Verdict: any CRITICAL fail → `FAIL`; any ERROR → `WARN`; WARNING-only → `WARN`; all pass → `PASS`

## Keyboard QA (9 Checks)

| ID | Severity | Rule |
|----|----------|------|
| KB-01 | CRITICAL | No keyboard trap (cannot escape any element) |
| KB-02 | ERROR | Tab order follows visual reading order |
| KB-03 | ERROR | All interactive elements focusable via Tab |
| KB-04 | ERROR | Focus indicator visible on all interactive elements |
| KB-05 | WARNING | Escape closes modals / dropdowns |
| KB-06 | WARNING | Enter / Space activates buttons |
| KB-07 | WARNING | Arrow keys navigate menus / carousels |
| KB-08 | INFO | Tab skips decorative elements |
| KB-09 | INFO | Shift+Tab reverses focus order |

KB-01 (NO_KEYBOARD_TRAP) is the only CRITICAL keyboard check — it is a hard blocker for WCAG 2.1 AA compliance.

## Fixture Compliance (Nexo Vet)

The `nexoVet.html` fixture was built to pass all 12 accessibility checks:
- `<html lang="es">`
- Skip link at top: `<a href="#main-content" class="skip-link">`
- All images: `alt="..."` populated
- All form inputs: matching `<label for="...">`
- Nav: `role="navigation"` + `aria-label="Navegación principal"`
- Hamburger: `aria-expanded="false/true"` toggles on click
- Footer: semantic `<footer>`
- All interactive buttons: have text content or aria-label

Playwright tests `A11Y-1` through `A11Y-4` run against the real fixture and pass.
