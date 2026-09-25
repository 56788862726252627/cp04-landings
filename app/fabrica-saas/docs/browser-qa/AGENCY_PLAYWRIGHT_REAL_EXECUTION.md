# Playwright Real Execution Guide — ADV-06

## FASE 44: PLAYWRIGHT REAL

Playwright 1.62.1 runs real Chromium against the static Nexo Vet HTML fixture.

**Confirmed**: Chromium really opens (headless), navigates to `file://` URLs, executes JavaScript, and verifies DOM state.

## Test Suite: 25 Real Browser Tests

```
nexoVet.spec.mjs:
├── Runtime Render Gate (4 tests)
│   ├── RG-01: page body not blank
│   ├── RG-02: main content has children
│   ├── RG-03: no JS console errors
│   └── RG-04: title not empty, contains "Nexo"
├── Page Load Assertions (4 tests)
│   ├── h1 heading visible
│   ├── nav[role="navigation"] present
│   ├── html[lang] = "es"
│   └── footer attached
├── Critical User Flows (5 tests)
│   ├── FLOW-1: hero CTA links to #contacto
│   ├── FLOW-2: 6 service cards present
│   ├── FLOW-3: contact form fully labeled
│   ├── FLOW-4: form submits → shows success
│   └── FLOW-5: all nav links have valid hrefs
├── Dead Control Detection (2 tests)
│   ├── all buttons have working handlers
│   └── no dead placeholder hrefs
├── Accessibility Baseline (4 tests)
│   ├── A11Y-1: all imgs have alt text
│   ├── A11Y-2: skip link in DOM
│   ├── A11Y-3: all form inputs labeled
│   └── A11Y-4: nav has role + aria-label
├── Mobile Navigation (2 tests)
│   ├── hamburger visible at 390px
│   └── hamburger toggles menu open/close + aria-expanded
└── Responsive QA (4 tests)
    ├── no horizontal scroll at 390px
    ├── no horizontal scroll at 768px
    ├── no horizontal scroll at 1280px
    └── service cards stack on mobile
```

## Fixture App

- **File**: `browser-qa/fixtures/nexoVet.html`
- **App**: Clínica Veterinaria Nexo (veterinary, isReal: false)
- **Features**: Nav, Hero, 6 Services, Team, Contact Form (with submit success), Footer
- **Accessibility**: WCAG 2.1 AA — `lang="es"`, skip link, aria-labels, form labels
- **Mobile**: hamburger menu with aria-expanded, CSS-only responsive

## Config

```js
// playwright.config.mjs
use: {
  baseURL:  `file://${FIXTURE_PATH}`,
  headless: true,
  browser:  'chromium',
}
```

## What Is NOT Tested

- `localhost:5175` — PROHIBITED
- Real OAuth flows — PROHIBITED  
- Real credentials — PROHIBITED
- CP04 / Aurora / FisioNova / Educa — PROHIBITED
- External network calls — fixture is offline-only
