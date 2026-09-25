# Browser QA Engine — ADV-06 Overview

## What It Is

A reusable, real-browser E2E and QA infrastructure for Factory SaaS apps. Built on Playwright 1.62.1 + Chromium. Runs against isolated fixture apps — no real client data, no real credentials, no real payments.

## Architecture

```
browser-qa/
├── Engine modules (33)     — Pure JS, node:test compatible
├── fixtures/
│   ├── nexoVet.html        — Static fixture: Clínica Veterinaria Nexo
│   ├── nexoVetQAFixture.js — Fixture metadata and config
│   └── breakageFixtures.js — Known-broken scenarios for gate testing
├── e2e/
│   └── nexoVet.spec.mjs    — Real Playwright specs (25 tests, PASS)
├── playwright.config.mjs   — Playwright config (port 5180, Chromium)
└── index.js                — Barrel export
```

## 20 QA Phases

| Phase | Weight | What It Checks |
|-------|--------|----------------|
| RENDER | 20% | Blank screen, JS errors, DOM mount |
| CONSOLE | 15% | Fatal JS errors, unhandled promises |
| NETWORK | 10% | 404 scripts, timeouts |
| CONTROLS | 10% | Dead buttons, placeholder hrefs |
| FORMS | 8% | Labels, validation, submit |
| RESPONSIVE | 8% | Horizontal scroll, layout break |
| ACCESSIBILITY | 8% | WCAG 2.1 AA baseline |
| KEYBOARD | 5% | Tab order, focus, escape/enter |
| VISUAL | 5% | Overflow, clipping, empty containers |
| CRITICAL_FLOWS | 6% | Homepage, contact, navigation |
| PERFORMANCE | 5% | Core Web Vitals (LCP, INP, CLS) |

## Score → Release Channel

| Score | Grade | Channel |
|-------|-------|---------|
| 95–100 | A+ | Production |
| 90–94 | A | Production |
| 80–89 | B | Beta |
| 70–79 | C | Beta |
| 50–69 | D | Staging |
| < 50 | F | Internal only |

## Guardrails (Absolute)

- `NO_PRODUCTION_DEPLOY = true`
- `NO_REAL_CREDENTIALS = true`
- `NO_REAL_OAUTH = true`
- `FIXTURE_MODE_ONLY = true`
- `LOCALHOST_5175_NO_TOUCH = true`
- `NO_REAL_CLIENT_DATA = true`

## Run Commands

```bash
# Unit tests (190 tests)
node --test fabrica-saas/generator/tests/v2-adv06-browser-qa.test.mjs

# Real Playwright (25 tests, opens Chromium)
npx playwright test --config=fabrica-saas/browser-qa/playwright.config.mjs
```
