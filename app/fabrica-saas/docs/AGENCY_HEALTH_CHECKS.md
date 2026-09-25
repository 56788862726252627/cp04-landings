# AGENCY_HEALTH_CHECKS — Paso G

**12 Health Checks Post-Deploy por Área**

`runHealthChecks(checks)` valida que todos los sistemas críticos responden tras el deploy.

---

## Checks por Área

| ID | Área | Check | Crítico |
|---|---|---|---|
| HC-01 | FRONTEND | App carga sin error | ✅ |
| HC-02 | FRONTEND | CSS renderiza correctamente | No |
| HC-03 | API | Endpoint health responde | ✅ |
| HC-04 | API | Response time < 2s | No |
| HC-05 | AUTH | Flujo de login funcional | ✅ |
| HC-06 | AUTH | Token refresh funcionando | ✅ |
| HC-07 | DATABASE | Conexión DB saludable | ✅ |
| HC-08 | AUTOMATION | Escenarios Make activos | No |
| HC-09 | AI | Agentes IA respondiendo | No |
| HC-10 | INTEGRATIONS | Integraciones terceros alcanzables | No |
| HC-11 | STORAGE | Almacenamiento accesible | No |
| HC-12 | ROUTES | Rutas críticas retornan 200 | ✅ |

---

## Uso

```js
import { runHealthChecks, HEALTH_STATUS } from '../deploy/healthChecks.js';

const checks = {
  'HC-01': 'PASS',
  'HC-03': 'PASS',
  'HC-05': 'PASS',
  'HC-06': 'PASS',
  'HC-07': 'PASS',
  'HC-08': 'NOT_APPLICABLE',  // Make no configurado aún
  'HC-12': 'PASS',
};

const r = runHealthChecks(checks);
// r.status         → 'PASS' | 'WARNING' | 'FAIL' | 'UNKNOWN'
// r.criticalFailed → número de críticos fallados
// r.byArea         → { FRONTEND: { pass, fail, unknown }, ... }
```

---

## Estados por Check

- `PASS` — Sistema operativo
- `WARNING` — Funcional con degradación no crítica
- `FAIL` — Sistema no responde o con error
- `UNKNOWN` — No se ha verificado (equivale a sin datos)
- `NOT_APPLICABLE` — Servicio no incluido en este proyecto

---

## Integración con Rollback

`evaluateRollbackNeed(healthResult, qaResult, renderResult)`:
- Si `healthResult.status === 'FAIL'` → `ROLLBACK_TRIGGER_CONDITIONS.HEALTH_CHECK_FAIL`

> Health checks post-deploy son registros operacionales. No HTTP calls reales en Paso G.
