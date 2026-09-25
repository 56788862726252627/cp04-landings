# AGENCY_ROLLBACK — Paso G

**Modelo de Rollback para Deployments de Agencia**

Todo deploy a PRODUCTION debe tener un plan de rollback definido **antes** de ejecutar.

---

## createRollbackPlan

```js
import { createRollbackPlan } from '../deploy/rollbackModel.js';

const { plan } = createRollbackPlan({
  deploymentId:    'DEP-nexo-001',
  previousVersion: 'v1.2.3',
  targetId:        'nexo-prod',
  previousDeploymentId: 'DEP-nexo-000',
  estimatedTimeMinutes: 10,
});
```

---

## Condiciones de Trigger (ROLLBACK_TRIGGER_CONDITIONS)

| Condición | Descripción |
|---|---|
| `HEALTH_CHECK_FAIL` | Health checks críticos fallan post-deploy |
| `POST_DEPLOY_QA_FAIL` | QA post-deploy con críticos fallados |
| `RUNTIME_BLANK_SCREEN` | Blank screen detectado en runtime gate |
| `AUTH_BROKEN` | Flujo de login no funciona |
| `DATA_CORRUPTION` | Datos corruptos o pérdida detectada |
| `SECURITY_INCIDENT` | Incidente de seguridad detectado |
| `MANUAL_REQUEST` | Solicitud manual del cliente o del equipo |

---

## evaluateRollbackNeed

```js
import { evaluateRollbackNeed } from '../deploy/rollbackModel.js';

const r = evaluateRollbackNeed(
  healthResult,  // { status: 'FAIL' | 'PASS' | ... }
  qaResult,      // { status: 'FAIL' | 'PASS' | ... }
  renderResult,  // { status: 'FAIL' | 'PASS' | ... }
);

// r.rollbackRequired → true | false
// r.urgency          → 'IMMEDIATE' | 'URGENT' | 'NONE'
// r.triggers         → array de condiciones activadas
```

---

## Proceso de Rollback en Cloudflare Pages

1. Identificar el deployment ID previo en Cloudflare Dashboard
2. En Cloudflare Pages → Deployments → "Retry deployment" del anterior
3. Esperar confirmación de URL activa
4. Ejecutar health checks en versión rolled back
5. Notificar al cliente: "revertido a versión anterior, ETA fix: X horas"

---

## Risks de Data

- `COMPATIBLE` — Sin cambios de schema, rollback seguro
- `MIGRATION_NEEDED` — Hay cambios de DB que requieren rollback de datos también
- `HIGH` — Datos pueden quedar inconsistentes — evaluar antes de proceder

---

## Regla de Oro

> El rollback siempre requiere aprobación humana (`humanApproval: true`). Nunca automático.

> NO_REAL_ROLLBACK en Paso G — Plan documental, no ejecución automática.
