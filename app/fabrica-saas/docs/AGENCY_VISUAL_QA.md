# AGENCY_VISUAL_QA — Paso G

**Plan de QA Visual por Breakpoint y Pantalla**

`buildVisualQAPlan(options)` genera el plan sin ejecutarlo — requiere navegador para ejecución real.

---

## Breakpoints

| Nombre | Ancho |
|---|---|
| MOBILE | 390px (iPhone 14) |
| TABLET | 768px (iPad) |
| DESKTOP | 1440px (MacBook) |

---

## Pantallas (VISUAL_SCREENS)

1. `HOME` — Página principal / landing
2. `DASHBOARD` — Panel de gestión
3. `LOGIN` — Formulario de autenticación
4. `BOOKING` — Flujo de reserva / formulario principal
5. `PROFILE` — Perfil de usuario
6. `ADMIN` — Panel de administración (si aplica)

---

## Checks por Pantalla (VISUAL_CHECKS conceptuales)

| ID | Check |
|---|---|
| VC-01 | Sin overflow horizontal |
| VC-02 | Sin elementos recortados |
| VC-03 | Sin controles ocultos accidentalmente |
| VC-04 | Touch targets ≥ 44px en mobile |
| VC-05 | Sin layout roto |
| VC-06 | Sin blank screen |
| VC-07 | Sin loading deadlock |
| VC-08 | Modales usables en mobile |

---

## Uso

```js
import { buildVisualQAPlan, recordVisualQAResults } from '../deploy/visualQA.js';

// Construir el plan
const plan = buildVisualQAPlan({
  projectName: 'Clínica Nexo',
  deployedUrl: 'https://nexo.pages.dev',
});
// plan.browserRequired → true (siempre)
// plan.screens         → pantallas a revisar
// plan.breakpoints     → MOBILE, TABLET, DESKTOP

// Registrar resultados (datos fixture o reales)
const results = recordVisualQAResults([
  { checkId: 'VC-01', breakpoint: 'MOBILE', status: 'PASS' },
  { checkId: 'VC-04', breakpoint: 'MOBILE', status: 'FAIL' },
]);
```

---

## Limitación

**QA visual requiere un navegador real.** En entornos sin browser (CI headless sin Playwright/Puppeteer), se genera el plan pero la ejecución es manual o se delega a Playwright.

> Paso G no incluye Playwright — el plan es el deliverable del factory.
