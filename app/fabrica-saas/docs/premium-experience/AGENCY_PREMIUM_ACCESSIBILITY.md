# Accesibilidad Premium — ADV-07

**isReal:** false | **Módulo:** accessibilityPremium | **Baseline:** ADV-06

## Niveles de Cumplimiento

`evaluatePremiumAccessibility(checks)` retorna `{ score, level, critical, errors, warnings, noCertificationClaim }`.

| Nivel | Score | Requerido para |
|-------|-------|----------------|
| BASELINE | < 60 | Desarrollo |
| ENHANCED | 60–89 | Pre-producción |
| FULL | ≥ 90 | Producción |

**`noCertificationClaim`** siempre es `true` — el motor no emite certificados WCAG.

## Checks PA-01 a PA-12

| Check | Descripción |
|-------|------------|
| PA01 | Skip link presente y funcional |
| PA02 | `lang` declarado en `<html>` |
| PA03 | Todos los `<img>` tienen `alt` |
| PA04 | Inputs con `<label for="...">` |
| PA05 | `<nav>` con `aria-label` |
| PA06 | `<h1>` único y visible |
| PA07 | Jerarquía de headings correcta |
| PA08 | Contraste ≥ 4.5:1 texto normal |
| PA09 | Contraste ≥ 3:1 texto grande |
| PA10 | Foco visible en todos los interactivos |
| PA11 | `aria-expanded` en hamburger/acordeón |
| PA12 | Tap targets ≥ 44×44px en mobile |

## Reglas Fijas

- NINGÚN elemento interactivo sin nombre accesible
- Modales con `role="dialog"` y `aria-label`
- Formularios: error inline con `aria-live="polite"`
- Motion: siempre soporte `prefers-reduced-motion`
- Color: nunca único vector de información (complementar con texto/icono)

## Integración con ADV-06

La base de checks de ADV-06 (`accessibilityBaseline`) se extiende con PA-01..PA-12. Todos los fixtures HTML de ADV-07 están diseñados para pasar PA-01..PA-11.
