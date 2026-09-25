# AGENCY_POST_DEPLOY_QA — Paso G

**22 Checks QA Post-Deploy**

`runPostDeployQA(checks, options)` valida que la app funciona correctamente tras el deploy.

---

## Checks

| ID | Check | Crítico |
|---|---|---|
| QA-01 | App responde HTTP 200 | ✅ |
| QA-02 | Retorna HTML válido | ✅ |
| QA-03 | Assets JS cargados correctamente | No |
| QA-04 | Assets CSS cargados correctamente | No |
| QA-05 | MIME types correctos | ✅ |
| QA-06 | Root element renderiza | No |
| QA-07 | Routing funciona (navegación entre rutas) | ✅ |
| QA-08 | Navegación sin errores | ✅ |
| QA-09 | Controles críticos funcionales (no dead) | No |
| QA-10 | Formularios envían correctamente | No |
| QA-11 | Responsive en mobile | No |
| QA-12 | Accesibilidad básica | No |
| QA-13 | 0 errores de consola | No |
| QA-14 | 0 errores de red críticos | No |
| QA-15 | Security headers presentes | No |
| QA-16 | PWA manifest válido (si aplica) | No |
| QA-17 | Favicon presente | No |
| QA-18 | 404 page funciona | ✅ |
| QA-19 | Auth boundary funciona (rutas protegidas) | ✅ |
| QA-20 | Role boundary funciona | No |
| QA-21 | Sin white screen en load | No |
| QA-22 | Sin deadlock de carga | No |

---

## Uso

```js
import { runPostDeployQA } from '../deploy/postDeployQA.js';

const checks = {
  'QA-01': true,
  'QA-02': true,
  // ...
};

const r = runPostDeployQA(checks, { deployedUrl: 'https://nexo.pages.dev' });
// r.status        → 'PASS' | 'WARNING' | 'FAIL' | 'BLOCKED'
// r.criticalFailed → número de checks críticos fallados
// r.score         → 0-100
```

---

## Sin URL ni Checks

Si se llama sin URL ni checks: `status: 'BLOCKED'` — requiere URL real de deploy.

---

## Score

- `≥ 80%` + `criticalFailed === 0` → `PASS`
- `< 80%` + `criticalFailed === 0` → `WARNING`
- `criticalFailed > 0` → `FAIL`

> QA post-deploy en Paso G usa fixture data. URL real requiere deploy real.
