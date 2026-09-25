# QA Phases Reference — ADV-06

## The 20 Phases

### Core Runtime (Phases 1–4)

| Phase | Weight | Gate | Key Checks |
|-------|--------|------|-----------|
| RENDER | 20% | Blocking | Blank screen, DOM mount, no crash |
| CONSOLE | 15% | Blocking | Fatal JS errors, unhandled promise rejections, CORS in console |
| NETWORK | 10% | Blocking | 404 scripts, timeout failures, unexpected external calls |
| ROUTES | — | Non-blocking | All links resolve, no broken internal routes |

### Interaction Quality (Phases 5–6)

| Phase | Weight | Gate | Key Checks |
|-------|--------|------|-----------|
| CONTROLS | 10% | Blocking | Dead buttons (`todo`, `#`, `noop`), placeholder `href` values |
| FORMS | 8% | Non-blocking | Labels on all inputs, required fields, submit handler present |

### Responsive & Mobile (Phases 7–8)

| Phase | Weight | Gate | Key Checks |
|-------|--------|------|-----------|
| RESPONSIVE | 8% | Non-blocking | 5 viewports (320/390/768/1280/1920): no horizontal scroll |
| MOBILE_NAV | — | Non-blocking | Hamburger tap target ≥ 44px, aria-expanded toggle |

### Accessibility & Keyboard (Phases 9–10)

| Phase | Weight | Gate | Key Checks |
|-------|--------|------|-----------|
| ACCESSIBILITY | 8% | Non-blocking | 12 WCAG 2.1 AA checks: alt text, lang, labels, roles |
| KEYBOARD | 5% | Non-blocking | Tab order, focus visible, no keyboard trap (CRITICAL), Escape/Enter |

### Visual (Phases 11–12)

| Phase | Weight | Gate | Key Checks |
|-------|--------|------|-----------|
| VISUAL | 5% | Non-blocking | 10 sanity checks: no overflow, empty containers, z-index clipping |
| SCREENSHOTS | — | Non-blocking | Manifested captures per viewport (max 50/run) |

### Business Flows (Phases 13–15)

| Phase | Weight | Gate | Key Checks |
|-------|--------|------|-----------|
| CRITICAL_FLOWS | 6% | Non-blocking | Homepage → CTA, form submit, nav navigation |
| ROLE_SURFACE | — | Non-blocking | Fixture-only role surfaces (VISITOR, STAFF), no real auth |
| AUTH_SURFACE | — | Non-blocking | Auth UI elements visible, login/error states — NO real OAuth |

### State QA (Phases 16–18)

| Phase | Weight | Gate | Key Checks |
|-------|--------|------|-----------|
| LOADING_STATES | — | Non-blocking | Load time < 2s GOOD, < 3s ACCEPTABLE, < 6s SLOW, ≥ 6s CRITICAL |
| ERROR_STATES | — | Non-blocking | 404, network error, form error UI present |
| EMPTY_STATES | — | Non-blocking | Empty list/inbox/data/search/onboarding states |

### Performance & Bundle (Phases 19–20)

| Phase | Weight | Gate | Key Checks |
|-------|--------|------|-----------|
| PERFORMANCE | 5% | Non-blocking | Core Web Vitals: LCP, INP, CLS thresholds |
| BUNDLE | — | Non-blocking | JS loads, CSS loads, no dev artifacts |

## Phase Selection

The `selectQaPhases` function accepts a mode:
- `SMOKE` — RENDER + CONSOLE only
- `STANDARD` — All except SCREENSHOTS, ROLE_SURFACE
- `FULL` — All 20 phases

In CI, `smartE2ESelector` maps changed files to relevant phases, avoiding running all 20 for every commit.
