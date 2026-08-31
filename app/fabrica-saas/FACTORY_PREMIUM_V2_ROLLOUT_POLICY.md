# Factory Premium Experience V2 — Rollout Policy

Version 1.0.0 · 2026-08-31 · Paso A Closure

---

## Standard Declaration

**BASIC_PROFESSIONAL_STANDARD = Premium Experience V2**

A Factory output meeting Premium V2 standard (≥8.5/10) is:

- Commercially presentable as a professional SaaS prototype
- Suitable for pilot client demonstrations
- Ready to be delivered as Agencia IA Básica output

**ADVANCED_POLISH_10_10 = Future optional enhancement**

The 9.5–10/10 level requires:
- Playwright-verified E2E flows
- Real analytics instrumentation
- Multi-device tested in real browsers
- Advanced motion choreography

This is a separate effort, not required for basic commercial readiness.

---

## Default Policy for New Projects

```yaml
premiumExperience:
  enabled: true
  defaultIntensity: medium
```

Premium V2 is the default for ALL new Factory-generated projects.

The Experience Decision Engine selects the appropriate intensity — it does NOT mean maximum animation/motion at all times.

---

## Intensity Matrix

| Sector | Default Intensity |
|--------|-------------------|
| fisioterapia | medium |
| dental | medium |
| estetica | medium |
| educacion | medium |
| abogados | low |
| tech | high |
| padel | medium |
| inmobiliaria | low |
| restauracion | high |
| moda | high |
| default | medium |

Audience overrides:
- `senior` → caps at `low`
- `professional` → caps at `low`
- `youth` → `high` allowed
- Mobile device → caps `high` to `medium`

---

## Required Gates (all new projects)

1. **Dead Control Gate** — 0 dead buttons/CTAs/links allowed
2. **Functional Experience Gate** — all patterns have valid handlers
3. **Mobile Product Gate** — sidebar, dialog, nav meet mobile specs
4. **Accessibility Gate** — WCAG 2.1 AA contrast minimum

---

## Required Components (all new projects)

- Error Boundary (class component, getDerivedStateFromError)
- useReducedMotion hook (correctly implemented — mq in useEffect)
- Loading skeletons (shimmer pattern with cancelled flag cleanup)
- Empty states (with actionable CTA when applicable)
- Error states (with onRetry handler)

---

## Migration Policy for Existing Demos

Existing demos are **NOT auto-migrated**. They remain on their current version.

| Demo | Current Version | Migration |
|------|----------------|-----------|
| FisioNova V1 | V1.7 | Optional opt-in |
| Aurora Dental | V1.7 | Optional opt-in |
| EducaArchidona | V1.8 | Optional opt-in |
| Club Pádel 04 | App (not factory) | N/A |

To migrate an existing demo to Premium V2 standard:
1. Apply gate audits (dead control, functional, mobile)
2. Update component specs to meet minimum requirements
3. Test at 390px, 768px, 1440px
4. Rebuild and deploy separately (don't overwrite production)

---

## Commercial Score Interpretation

| Score | Meaning |
|-------|---------|
| < 6/10 | Not commercially presentable |
| 6-7.9/10 | Internal demo only |
| 8-8.9/10 | Basic professional standard (V2 target) |
| 9-9.4/10 | Advanced polish (post-Paso A) |
| 9.5-10/10 | Production-ready premium product |

---

## Paso A Closure

**Validated by FisioNova Premium V2 Pilot (2026-08-30)**:

| Dimension | Pre-Pilot | Post-Pilot |
|-----------|-----------|------------|
| Visual premium | 8.5/10 | 8.5/10 |
| Functional interactions | 3/10 | 9/10 |
| Mobile UX | 2/10 | 8/10 |
| Booking flow | 0/10 | 9/10 |
| Dead controls | 12+ | 0 |
| **Overall** | **~5/10** | **8.5/10** |

This confirms that Premium V2 Factory standard is achievable and commercially viable.

**PASO_A_STATUS = 100_PERCENT**

Next: PASO B — One Prompt → SaaS Completo
